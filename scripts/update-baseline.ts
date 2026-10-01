import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const rawAnimalsPath = path.join(projectRoot, 'data', 'raw-animals.json');
const rawSheltersPath = path.join(projectRoot, 'data', 'raw-shelters.json');
const baselinePath = path.join(projectRoot, 'data', 'baseline.json');

const animals = JSON.parse(fs.readFileSync(rawAnimalsPath, 'utf-8'));
const shelters = JSON.parse(fs.readFileSync(rawSheltersPath, 'utf-8'));

const baseline = {
  animalRecords: animals.length,
  shelterRecords: shelters.length,
  updatedAt: new Date().toISOString(),
};

fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + '\n', 'utf-8');
console.log(`[baseline] 已更新：動物 ${baseline.animalRecords} / 收容所 ${baseline.shelterRecords}`);
