import { describe, it, expect } from 'vitest';
import {
  mapBodytype,
  mapAge,
  mapSex,
  mapSterilization,
  trimVariety,
  isLongTermOpen,
  normalizeShelterName,
  joinAnimalsToShelters,
} from '../src/lib/normalize.js';

describe('enum mappings', () => {
  it('maps bodytype BIG/MEDIUM/SMALL + unknown', () => {
    expect(mapBodytype('BIG')).toBe('大型');
    expect(mapBodytype('MEDIUM')).toBe('中型');
    expect(mapBodytype('SMALL')).toBe('小型');
    expect(mapBodytype('')).toBe('未知');
    expect(mapBodytype('XL')).toBe('未知');
  });

  it('maps age ADULT/CHILD/empty', () => {
    expect(mapAge('ADULT')).toBe('成年');
    expect(mapAge('CHILD')).toBe('幼年');
    expect(mapAge('')).toBe('未知');
  });

  it('maps sex M/F/N', () => {
    expect(mapSex('M')).toBe('公');
    expect(mapSex('F')).toBe('母');
    expect(mapSex('N')).toBe('未知');
  });

  it('maps sterilization T/F/N', () => {
    expect(mapSterilization('T')).toBe('已絕育');
    expect(mapSterilization('F')).toBe('未絕育');
    expect(mapSterilization('N')).toBe('未輸入');
  });

  it('trims variety whitespace, empty stays empty', () => {
    expect(trimVariety('混種犬          ')).toBe('混種犬');
    expect(trimVariety('')).toBe('');
  });

  it('2999-12-31 is long-term open', () => {
    expect(isLongTermOpen('2999-12-31')).toBe(true);
    expect(isLongTermOpen('2026-12-31')).toBe(false);
  });
});

describe('normalizeShelterName', () => {
  it('strips whitespace, paren notes, unifies 台/臺', () => {
    expect(normalizeShelterName(' 臺北市動物之家 (內湖) ')).toBe('台北市動物之家');
    expect(normalizeShelterName('台北市動物之家')).toBe('台北市動物之家');
  });
});

describe('joinAnimalsToShelters', () => {
  const shelters = [
    {
      ID: 'PS01',
      ShelterName: '台北市動物之家',
      CityName: '台北市',
      Address: 'addr',
      Phone: 'tel',
      OpenTime: 'open',
      Url: '',
      Lon: '1',
      Lat: '2',
      Seq: 1,
    },
  ];
  const baseAnimal = {
    animal_id: 1,
    animal_subid: 'S1',
    animal_area_pkid: 1,
    animal_shelter_pkid: 1,
    animal_place: 'p',
    animal_kind: '狗',
    animal_Variety: '混種犬          ',
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
    shelter_name: '臺北市動物之家 (內湖)',
    album_file: 'https://x',
    album_update: '',
    cDate: '2026/10/01',
    shelter_address: 'inline-addr',
    shelter_tel: 'inline-tel',
  };

  it('hits normalized shelter and takes CityName as county', () => {
    const { animals, unmatched } = joinAnimalsToShelters([baseAnimal as any], shelters as any);
    expect(unmatched).toHaveLength(0);
    expect(animals[0].shelterId).toBe('PS01');
    expect(animals[0].county).toBe('台北市');
    expect(animals[0].shelterAddress).toBe('addr');
    expect(animals[0].variety).toBe('混種犬');
    expect(animals[0].bodytypeDisplay).toBe('中型');
    expect(animals[0].longTermOpen).toBe(true);
  });

  it('falls back to inline address on miss and lists unmatched', () => {
    const miss = { ...baseAnimal, shelter_name: '不存在收容所' };
    const { animals, unmatched } = joinAnimalsToShelters([miss as any], shelters as any);
    expect(animals[0].shelterId).toBeNull();
    expect(animals[0].shelterAddress).toBe('inline-addr');
    expect(animals[0].shelterTel).toBe('inline-tel');
    expect(unmatched).toEqual(['不存在收容所']);
  });
});
