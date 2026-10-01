import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { shardIndex, SHARD_ANIMALS, SHARD_SHELTERS } from '../src/lib/shard.js';
import type { NormalizedAnimal } from '../src/lib/normalize.js';
import type { RawShelterRecord } from '../src/types/adopt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const animals = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'data', 'animals.json'), 'utf-8')
) as NormalizedAnimal[];
const shelters = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'data', 'shelters.json'), 'utf-8')
) as RawShelterRecord[];

const animalDir = path.join(projectRoot, 'public', 'data', 'animal');
const shelterDir = path.join(projectRoot, 'public', 'data', 'shelter');
fs.mkdirSync(animalDir, { recursive: true });
fs.mkdirSync(shelterDir, { recursive: true });

const animalBuckets: NormalizedAnimal[][] = Array.from({ length: SHARD_ANIMALS }, () => []);
for (const a of animals) {
  animalBuckets[shardIndex(String(a.animalId), SHARD_ANIMALS)].push(a);
}
animalBuckets.forEach((bucket, i) => {
  fs.writeFileSync(path.join(animalDir, `${i}.json`), JSON.stringify(bucket), 'utf-8');
});

const shelterBuckets: RawShelterRecord[][] = Array.from({ length: SHARD_SHELTERS }, () => []);
for (const s of shelters) {
  shelterBuckets[shardIndex(s.ID, SHARD_SHELTERS)].push(s);
}
shelterBuckets.forEach((bucket, i) => {
  fs.writeFileSync(path.join(shelterDir, `${i}.json`), JSON.stringify(bucket), 'utf-8');
});

console.log(`[shards] animal ${SHARD_ANIMALS} 片 / shelter ${SHARD_SHELTERS} 片，動物 ${animals.length} 筆`);
fs.writeFileSync(path.join(projectRoot, 'public', 'data', 'shelters.json'), JSON.stringify(shelters), 'utf-8');
