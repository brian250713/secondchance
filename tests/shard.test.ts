import { describe, it, expect } from 'vitest';
import { fnv1a, shardIndex, SHARD_ANIMALS, SHARD_SHELTERS } from '../src/lib/shard.js';

describe('fnv1a sharding', () => {
  it('is stable and bounded', () => {
    expect(SHARD_ANIMALS).toBe(128);
    expect(SHARD_SHELTERS).toBe(64);
    const a = shardIndex('469888', 128);
    expect(shardIndex('469888', 128)).toBe(a);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(128);
  });

  it('distributes sample ids', () => {
    const idx = new Set([1, 2, 3, 100, 9999].map((n) => shardIndex(String(n), 128)));
    expect(idx.size).toBeGreaterThan(1);
  });
});
