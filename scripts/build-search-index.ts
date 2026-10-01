import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NormalizedAnimal } from '../src/lib/normalize.js';
import type { RawShelterRecord } from '../src/types/adopt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const animals = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'data', 'animals.json'), 'utf-8')
) as NormalizedAnimal[];

const cards = animals.map((a) => ({
  id: a.animalId,
  kind: a.kind,
  variety: a.variety,
  sex: a.sexDisplay,
  bodytype: a.bodytypeDisplay,
  age: a.ageDisplay,
  sterilization: a.sterilizationDisplay,
  colour: a.colour,
  county: a.county,
  shelter: a.shelterName,
  shelterId: a.shelterId,
  openDate: a.openDate,
  longTermOpen: a.longTermOpen,
  photo: a.albumFile,
  subId: a.subId,
  foundPlace: a.foundPlace,
  remark: a.remark,
}));

const out = {
  version: 1,
  count: cards.length,
  updatedAt: new Date().toISOString(),
  records: cards,
};

const outDir = path.join(projectRoot, 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'search-index.json'), JSON.stringify(out), 'utf-8');
console.log(`[index] search-index.json: ${cards.length} 筆`);
