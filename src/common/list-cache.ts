import { Cache } from 'cache-manager';

export async function cacheVersion(cache: Cache, scope: string): Promise<number> {
  try {
    return Number((await cache.get<number>(`${scope}:version`)) ?? 0) || 0;
  } catch {
    return 0;
  }
}

export async function bumpCacheVersion(cache: Cache, scope: string): Promise<void> {
  try {
    const next = (await cacheVersion(cache, scope)) + 1;
    await cache.set(`${scope}:version`, next, 24 * 60 * 60 * 1000);
  } catch {
    // Une panne de cache ne doit pas bloquer l'écriture.
  }
}

export async function remember<T>(
  cache: Cache,
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  try {
    const hit = await cache.get<T>(key);
    if (hit !== undefined && hit !== null) return hit;
  } catch {
    // Lecture cache ignorée.
  }

  const value = await loader();
  try {
    await cache.set(key, value, ttlMs);
  } catch {
    // Écriture cache ignorée.
  }
  return value;
}
