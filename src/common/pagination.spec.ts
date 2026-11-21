import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { decodeCursor, encodeCursor, parseListQuery } from './pagination';

describe('parseListQuery', () => {
  it('defaults to the first page of newest items', () => {
    expect(parseListQuery({})).toMatchObject({
      mode: 'page',
      page: 1,
      limit: 12,
      sort: 'newest',
      direction: 'next',
    });
  });

  it('clamps the limit and ignores an invalid page', () => {
    expect(parseListQuery({ page: '0', limit: '500' })).toMatchObject({
      page: 1,
      limit: 100,
    });
  });

  it('switches to cursor mode and rejects a sort other than newest', () => {
    expect(parseListQuery({ cursor: 'abc', direction: 'prev' })).toMatchObject({
      mode: 'cursor',
      cursor: 'abc',
      direction: 'prev',
      sort: 'newest',
    });

    expect(() => parseListQuery({ cursor: 'abc', sort: 'name' })).toThrow(BadRequestException);
  });

  it('rejects a sort that the collection list does not support', () => {
    expect(() => parseListQuery({ sort: 'price-asc' }, 'collection')).toThrow(BadRequestException);
    expect(parseListQuery({ sort: 'name' }, 'collection').sort).toBe('name');
  });
});

describe('cursor codec', () => {
  it('round-trips the document boundary', () => {
    const id = new Types.ObjectId().toString();
    const encoded = encodeCursor({ _id: id, createdAt: new Date('2026-01-02T03:04:05.000Z') });
    expect(decodeCursor(encoded)).toEqual({
      t: new Date('2026-01-02T03:04:05.000Z').getTime(),
      i: id,
    });
  });

  it('rejects a malformed cursor', () => {
    expect(() => decodeCursor('not-a-cursor')).toThrow(BadRequestException);
  });
});
