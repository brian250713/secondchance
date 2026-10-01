import type { RawAnimalRecord, RawShelterRecord } from '../types/adopt.js';

export const ANIMAL_ENDPOINT =
  'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL';
export const SHELTER_ENDPOINT =
  'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=2thVboChxuKs';

export const EXPECTED_ANIMAL_FIELDS: (keyof RawAnimalRecord)[] = [
  'animal_id',
  'animal_subid',
  'animal_shelter_pkid',
  'animal_kind',
  'animal_sex',
  'animal_bodytype',
  'animal_colour',
  'animal_age',
  'animal_sterilization',
  'animal_status',
  'animal_opendate',
  'animal_closeddate',
  'shelter_name',
  'album_file',
];

export const EXPECTED_SHELTER_FIELDS: (keyof RawShelterRecord)[] = [
  'ID',
  'ShelterName',
  'CityName',
  'Address',
  'Phone',
];

export class FetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FetchError';
  }
}

export async function fetchWithRetry(
  url: string,
  maxRetries = 3,
  fetchFn: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
): Promise<unknown[]> {
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= maxRetries) {
    try {
      const res = await fetchFn(url);
      if (!res.ok) {
        throw new FetchError(`HTTP error! status: ${res.status} ${res.statusText}`);
      }
      const text = await res.text();
      const data = JSON.parse(text.replace(/^\uFEFF/, ''));
      if (!Array.isArray(data)) {
        throw new FetchError('Response is not a JSON array');
      }
      return data;
    } catch (err) {
      lastError = err;
      attempt++;
      if (attempt <= maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await sleep(delay);
      }
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError);
  throw new FetchError(`Failed to fetch from ${url} after ${maxRetries} retries. Last error: ${msg}`);
}

function checkFields(records: object[], expected: string[], label: string): void {
  for (let i = 0; i < records.length; i++) {
    const missing = expected.filter((f) => !(f in records[i]));
    if (missing.length > 0) {
      throw new FetchError(
        `Validation failed: ${label} record at index ${i} is missing expected fields: ${missing.join(', ')}`
      );
    }
  }
}

export interface SourceCheck {
  label: string;
  minAllowedDrop: number;
}

export function validateSource(
  records: unknown[],
  baselineCount: number | undefined,
  check: SourceCheck
): void {
  if (records.length === 0) {
    throw new FetchError(`Validation failed: No ${check.label} records fetched.`);
  }
  if (baselineCount !== undefined && baselineCount > 0) {
    const minAllowed = baselineCount * (1 - check.minAllowedDrop);
    if (records.length < minAllowed) {
      throw new FetchError(
        `Validation failed: ${check.label} records (${records.length}) dropped by more than ${check.minAllowedDrop * 100}% compared to baseline (${baselineCount}).`
      );
    }
  }
}

export interface FetchAllOptions {
  maxRetries?: number;
  baselineAnimals?: number;
  baselineShelters?: number;
  fetchFn?: typeof fetch;
  onProgress?: (label: string, count: number) => void;
}

export async function fetchAllSources(
  options: FetchAllOptions = {}
): Promise<{ animals: RawAnimalRecord[]; shelters: RawShelterRecord[] }> {
  const { maxRetries = 3, baselineAnimals, baselineShelters, fetchFn = fetch, onProgress } = options;

  if (onProgress) onProgress('animals', 0);
  const animals = (await fetchWithRetry(ANIMAL_ENDPOINT, maxRetries, fetchFn)) as RawAnimalRecord[];
  checkFields(animals, EXPECTED_ANIMAL_FIELDS as string[], 'animal');
  validateSource(animals, baselineAnimals, { label: 'animals', minAllowedDrop: 0.1 });
  if (onProgress) onProgress('animals', animals.length);

  if (onProgress) onProgress('shelters', 0);
  const shelters = (await fetchWithRetry(SHELTER_ENDPOINT, maxRetries, fetchFn)) as RawShelterRecord[];
  checkFields(shelters, EXPECTED_SHELTER_FIELDS as string[], 'shelter');
  validateSource(shelters, baselineShelters, { label: 'shelters', minAllowedDrop: 0.1 });
  if (onProgress) onProgress('shelters', shelters.length);

  return { animals, shelters };
}
