import { describe, it, expect, vi } from 'vitest';
import {
  fetchWithRetry,
  validateSource,
  fetchAllSources,
  ANIMAL_ENDPOINT,
  SHELTER_ENDPOINT,
} from '../src/lib/fetcher.js';

describe('fetchWithRetry', () => {
  it('returns parsed array on success', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify([{ animal_id: 1 }]),
    });
    const data = await fetchWithRetry('http://x', 0, fetchFn as any);
    expect(data).toEqual([{ animal_id: 1 }]);
  });

  it('retries then throws FetchError', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'err' });
    await expect(
      fetchWithRetry('http://x', 1, fetchFn as any, async () => {})
    ).rejects.toThrow(/Failed to fetch/);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});

describe('validateSource', () => {
  it('rejects empty records', () => {
    expect(() => validateSource([], undefined, { label: 'animals', minAllowedDrop: 0.1 })).toThrow(
      /No animals records/
    );
  });

  it('rejects drop >10% vs baseline', () => {
    const records = new Array(80);
    expect(() => validateSource(records, 100, { label: 'animals', minAllowedDrop: 0.1 })).toThrow(
      /dropped by more than/
    );
  });

  it('accepts drop within 10%', () => {
    const records = new Array(95);
    expect(() =>
      validateSource(records, 100, { label: 'animals', minAllowedDrop: 0.1 })
    ).not.toThrow();
  });
});

describe('fetchAllSources', () => {
  it('fetches animals + shelters with field checks', async () => {
    const animal = {
      animal_id: 469888,
      animal_subid: 'S1',
      animal_area_pkid: 16,
      animal_shelter_pkid: 74,
      animal_place: 'p',
      animal_kind: '狗',
      animal_Variety: '混種犬',
      animal_sex: 'M',
      animal_bodytype: 'MEDIUM',
      animal_colour: '黑色',
      animal_age: 'ADULT',
      animal_sterilization: 'T',
      animal_bacterin: 'F',
      animal_foundplace: '',
      animal_title: '',
      animal_status: 'OPEN',
      animal_remark: '',
      animal_caption: '',
      animal_opendate: '2026-10-01',
      animal_closeddate: '2999-12-31',
      animal_update: '2026/10/01',
      animal_createtime: '2026/10/01',
      shelter_name: 's',
      album_file: 'https://x',
      album_update: '',
      cDate: '2026/10/01',
      shelter_address: 'a',
      shelter_tel: 't',
    };
    const shelter = {
      ID: 'PS00000033',
      ShelterName: 's',
      CityName: 'c',
      Address: 'a',
      Phone: 'p',
      OpenTime: 'o',
      Url: '',
      Lon: '1',
      Lat: '2',
      Seq: 1,
    };
    const fetchFn = vi.fn(async (url: string) => ({
      ok: true,
      text: async () =>
        JSON.stringify(String(url).includes('QcbUEzN6E6DL') ? [animal] : [shelter]),
    }));
    const { animals, shelters } = await fetchAllSources({ fetchFn: fetchFn as any });
    expect(animals).toHaveLength(1);
    expect(shelters).toHaveLength(1);
    expect(ANIMAL_ENDPOINT).toContain('QcbUEzN6E6DL');
    expect(SHELTER_ENDPOINT).toContain('2thVboChxuKs');
  });
});
