import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { shardIndex, SHARD_ANIMALS, SHARD_SHELTERS } from '../src/lib/shard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function fail(msg: string): never {
  console.error(`[verify] FAIL: ${msg}`);
  process.exit(1);
}

const indexPath = path.join(projectRoot, 'public', 'data', 'search-index.json');
if (!fs.existsSync(indexPath)) fail('search-index.json 不存在');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
console.log(`[verify] index count=${index.count}`);

const animalFiles = fs.readdirSync(path.join(projectRoot, 'public', 'data', 'animal'));
if (animalFiles.length !== SHARD_ANIMALS) fail(`animal 分片數 ${animalFiles.length} != ${SHARD_ANIMALS}`);
const shelterFiles = fs.readdirSync(path.join(projectRoot, 'public', 'data', 'shelter'));
if (shelterFiles.length !== SHARD_SHELTERS) fail(`shelter 分片數 ${shelterFiles.length} != ${SHARD_SHELTERS}`);

let total = 0;
for (const f of animalFiles) {
  total += (JSON.parse(fs.readFileSync(path.join(projectRoot, 'public', 'data', 'animal', f), 'utf-8')) as unknown[]).length;
}
if (total !== index.count) fail(`分片總數 ${total} != index ${index.count}`);

const sample = index.records[0];
const shard = shardIndex(String(sample.id), SHARD_ANIMALS);
const bucket = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'public', 'data', 'animal', `${shard}.json`), 'utf-8')
) as { animalId: number }[];
if (!bucket.some((a) => a.animalId === sample.id)) fail(`抽樣 ${sample.id} 在分片 ${shard} 找不到`);

for (const p of ['dist/index.html']) {
  if (!fs.existsSync(path.join(projectRoot, p))) fail(`${p} 不存在，先跑 pnpm build`);
}

console.log('[verify] OK');
