import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchAllSources } from '../src/lib/fetcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const dataDir = path.join(projectRoot, 'data');
const baselinePath = path.join(dataDir, 'baseline.json');
const rawAnimalsPath = path.join(dataDir, 'raw-animals.json');
const rawSheltersPath = path.join(dataDir, 'raw-shelters.json');

async function main() {
  console.log('[fetch] 開始執行待認養動物與收容所資料擷取...');

  let baselineAnimals: number | undefined;
  let baselineShelters: number | undefined;
  if (fs.existsSync(baselinePath)) {
    try {
      const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
      baselineAnimals = baseline.animalRecords;
      baselineShelters = baseline.shelterRecords;
      console.log(`[fetch] 基準筆數: 動物 ${baselineAnimals} / 收容所 ${baselineShelters}`);
    } catch {
      console.warn('[fetch] 警告：無法解析 baseline.json，將不進行筆數下降檢查');
    }
  }

  try {
    const { animals, shelters } = await fetchAllSources({
      baselineAnimals,
      baselineShelters,
      onProgress: (label, count) => console.log(`[fetch] 抓取 ${label} 中...累積 ${count} 筆`),
    });

    console.log(`[fetch] 抓取完成並通過防呆驗證！動物 ${animals.length} 筆，收容所 ${shelters.length} 筆。`);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(rawAnimalsPath, JSON.stringify(animals), 'utf-8');
    fs.writeFileSync(rawSheltersPath, JSON.stringify(shelters), 'utf-8');
    console.log('[fetch] 已寫入 raw-animals.json 與 raw-shelters.json');
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[fetch] 錯誤：資料擷取流程失敗 - ${msg}`);
    process.exit(1);
  }
}

main();
