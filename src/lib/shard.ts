export const SHARD_ANIMALS = 128;
export const SHARD_SHELTERS = 64;

export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function shardIndex(id: string, shards: number): number {
  return fnv1a(id) % shards;
}
