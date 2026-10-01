import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { joinAnimalsToShelters } from '../src/lib/normalize.js';
import type { RawAnimalRecord, RawShelterRecord } from '../src/types/adopt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const rawAnimalsPath = path.join(projectRoot, 'data', 'raw-animals.json');
const rawSheltersPath = path.join(projectRoot, 'data', 'raw-shelters.json');
const outAnimalsPath = path.join(projectRoot, 'data', 'animals.json');
const outSheltersPath = path.join(projectRoot, 'data', 'shelters.json');

const animals = JSON.parse(fs.readFileSync(rawAnimalsPath, 'utf-8')) as RawAnimalRecord[];
const shelters = JSON.parse(fs.readFileSync(rawSheltersPath, 'utf-8')) as RawShelterRecord[];

const { animals: normalized, unmatched } = joinAnimalsToShelters(animals, shelters);

fs.writeFileSync(outAnimalsPath, JSON.stringify(normalized), 'utf-8');
fs.writeFileSync(outSheltersPath, JSON.stringify(shelters), 'utf-8');

const matched = normalized.filter((a) => a.matched).length;
console.log(`[normalize] 動物 ${normalized.length} 筆（命中收容所 ${matched}，未命中 ${normalized.length - matched}）`);
console.log(`[normalize] 收容所 ${shelters.length} 筆`);
if (unmatched.length > 0) {
  console.log(`[normalize] 未命中收容所名單 (${unmatched.length}):`);
  for (const name of unmatched) console.log(`  - ${name}`);
}
