import { BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

export const DEFAULT_PAGE_LIMIT = 12;
export const MAX_PAGE_LIMIT = 100;

export type PaginationMode = 'page' | 'cursor';
export type CursorDirection = 'next' | 'prev';
export type ListSort = 'newest' | 'name' | 'price-asc' | 'price-desc';
export type ListProfile = 'product' | 'collection';

const PRODUCT_SORTS: ListSort[] = ['newest', 'name', 'price-asc', 'price-desc'];
const COLLECTION_SORTS: ListSort[] = ['newest', 'name'];

const SORT_FIELDS: Record<ListSort, Record<string, 1 | -1>> = {
  newest: { createdAt: -1, _id: -1 },
  name: { name: 1, _id: 1 },
  'price-asc': { 'sizes.0.price': 1, _id: 1 },
  'price-desc': { 'sizes.0.price': -1, _id: -1 },
};

export interface ListQuery {
  mode: PaginationMode;
  page: number;
  limit: number;
  cursor?: string;
  direction: CursorDirection;
  q?: string;
  sort: ListSort;
}

export interface PaginationMeta {
  mode: PaginationMode;
  limit: number;
  total: number;
  page: number | null;
  totalPages: number | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
  collection?: {
    _id: string;
    name: string;
    description?: string;
    image?: { url: string; public_id?: string };
  };
}

interface CursorPayload {
  t: number;
  i: string;
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function firstQueryValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

function readPositiveInt(value: unknown, fallback: number, max?: number): number {
  const raw = firstQueryValue(value);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  const floored = Math.floor(parsed);
  return max ? Math.min(floored, max) : floored;
}

export function parseListQuery(
  query: Record<string, unknown> = {},
  profile: ListProfile = 'product',
): ListQuery {
  const allowed = profile === 'collection' ? COLLECTION_SORTS : PRODUCT_SORTS;
  const sortRaw = String(firstQueryValue(query.sort) ?? 'newest');
  if (!allowed.includes(sortRaw as ListSort)) {
    throw new BadRequestException(`Tri invalide. Valeurs acceptées : ${allowed.join(', ')}`);
  }
  const sort = sortRaw as ListSort;

  const cursorRaw = firstQueryValue(query.cursor);
  const cursor = typeof cursorRaw === 'string' && cursorRaw.trim() ? cursorRaw.trim() : undefined;
  if (cursor && sort !== 'newest') {
    throw new BadRequestException('La pagination par curseur suit uniquement le tri newest');
  }

  const directionRaw = String(firstQueryValue(query.direction) ?? 'next');
  const direction: CursorDirection = directionRaw === 'prev' ? 'prev' : 'next';

  const qRaw = firstQueryValue(query.q);
  const q = typeof qRaw === 'string' ? qRaw.trim().slice(0, 80) : '';

  return {
    mode: cursor ? 'cursor' : 'page',
    page: readPositiveInt(query.page, 1),
    limit: readPositiveInt(query.limit, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT),
    cursor,
    direction,
    q: q || undefined,
    sort,
  };
}

export function encodeCursor(doc: { _id: unknown; createdAt?: Date | string | null }): string {
  const time = doc.createdAt ? new Date(doc.createdAt).getTime() : 0;
  const payload: CursorPayload = {
    t: Number.isFinite(time) ? time : 0,
    i: String(doc._id),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor(cursor: string): CursorPayload {
  try {
    const json = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as CursorPayload;
    if (
      !json ||
      typeof json.t !== 'number' ||
      !Number.isFinite(json.t) ||
      typeof json.i !== 'string' ||
      !Types.ObjectId.isValid(json.i)
    ) {
      throw new Error('invalid');
    }
    return json;
  } catch (error) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException('Curseur invalide');
  }
}

function cursorRange(cursor: string, direction: CursorDirection): Record<string, unknown> {
  const decoded = decodeCursor(cursor);
  const date = new Date(decoded.t);
  const id = new Types.ObjectId(decoded.i);
  if (direction === 'prev') {
    return {
      $or: [
        { createdAt: { $gt: date } },
        { createdAt: date, _id: { $gt: id } },
      ],
    };
  }
  return {
    $or: [
      { createdAt: { $lt: date } },
      { createdAt: date, _id: { $lt: id } },
    ],
  };
}

function combineFilters(
  base: Record<string, unknown>,
  extra?: Record<string, unknown> | null,
): Record<string, unknown> {
  const parts = [base, extra].filter(
    (part): part is Record<string, unknown> => !!part && Object.keys(part).length > 0,
  );
  if (parts.length === 0) return {};
  if (parts.length === 1) return parts[0];
  return { $and: parts };
}

function metaFromRows(
  rows: Array<{ _id: unknown; createdAt?: Date | string | null }>,
  options: {
    mode: PaginationMode;
    limit: number;
    total: number;
    page: number | null;
    totalPages: number | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    includeCursors: boolean;
  },
): PaginationMeta {
  const canCursor = options.includeCursors && rows.length > 0;
  return {
    mode: options.mode,
    limit: options.limit,
    total: options.total,
    page: options.page,
    totalPages: options.totalPages,
    hasNextPage: options.hasNextPage,
    hasPreviousPage: options.hasPreviousPage,
    nextCursor: canCursor && options.hasNextPage ? encodeCursor(rows[rows.length - 1]) : null,
    prevCursor: canCursor && options.hasPreviousPage ? encodeCursor(rows[0]) : null,
  };
}

export async function paginateModel<T>(
  model: Model<any>,
  baseFilter: Record<string, unknown>,
  query: ListQuery,
  options?: { populate?: string },
): Promise<PaginatedResponse<T>> {
  const total = await model.countDocuments(baseFilter);
  const limit = query.limit;

  if (query.mode === 'cursor') {
    const range = query.cursor ? cursorRange(query.cursor, query.direction) : null;
    const filter = combineFilters(baseFilter, range);
    const readingPrevious = query.direction === 'prev' && !!query.cursor;
    const sort = readingPrevious
      ? { createdAt: 1 as const, _id: 1 as const }
      : { createdAt: -1 as const, _id: -1 as const };

    let dbQuery = model.find(filter).sort(sort).limit(limit + 1);
    if (options?.populate) dbQuery = dbQuery.populate(options.populate);
    let rows = await dbQuery.lean();
    const hasMore = rows.length > limit;
    if (hasMore) rows = rows.slice(0, limit);
    if (readingPrevious) rows.reverse();

    if (query.cursor && rows.length === 0) {
      return {
        items: [] as T[],
        meta: {
          mode: 'cursor',
          limit,
          total,
          page: null,
          totalPages: null,
          hasNextPage: readingPrevious,
          hasPreviousPage: !readingPrevious,
          nextCursor: readingPrevious ? query.cursor : null,
          prevCursor: readingPrevious ? null : query.cursor,
        },
      };
    }

    const hasNextPage = readingPrevious ? true : hasMore;
    const hasPreviousPage = readingPrevious ? hasMore : Boolean(query.cursor);

    return {
      items: rows as T[],
      meta: metaFromRows(rows, {
        mode: 'cursor',
        limit,
        total,
        page: null,
        totalPages: null,
        hasNextPage: rows.length > 0 && hasNextPage,
        hasPreviousPage: rows.length > 0 && hasPreviousPage,
        includeCursors: true,
      }),
    };
  }

  const page = query.page;
  let dbQuery = model
    .find(baseFilter)
    .sort(SORT_FIELDS[query.sort])
    .skip((page - 1) * limit)
    .limit(limit);
  if (options?.populate) dbQuery = dbQuery.populate(options.populate);
  const items = await dbQuery.lean();
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    items: items as T[],
    meta: metaFromRows(items, {
      mode: 'page',
      limit,
      total,
      page,
      totalPages,
      hasNextPage: totalPages > 0 && page < totalPages,
      hasPreviousPage: totalPages > 0 && page > 1,
      includeCursors: query.sort === 'newest',
    }),
  };
}
