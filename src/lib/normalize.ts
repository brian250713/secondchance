import type { RawAnimalRecord, RawShelterRecord } from '../types/adopt.js';

export function mapBodytype(v: string): string {
  if (v === 'BIG') return '大型';
  if (v === 'MEDIUM') return '中型';
  if (v === 'SMALL') return '小型';
  return '未知';
}

export function mapAge(v: string): string {
  if (v === 'ADULT') return '成年';
  if (v === 'CHILD') return '幼年';
  return '未知';
}

export function mapSex(v: string): string {
  if (v === 'M') return '公';
  if (v === 'F') return '母';
  return '未知';
}

export function mapSterilization(v: string): string {
  if (v === 'T') return '已絕育';
  if (v === 'F') return '未絕育';
  return '未輸入';
}

export function trimVariety(v: string): string {
  return (v ?? '').trim();
}

export function isLongTermOpen(closeddate: string): boolean {
  return closeddate === '2999-12-31';
}

export function normalizeShelterName(name: string): string {
  let s = (name ?? '').trim();
  s = s.replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').trim();
  s = s.replace(/臺/g, '台');
  s = s.replace(/\s+/g, '');
  return s;
}

export interface NormalizedAnimal {
  animalId: number;
  subId: string;
  kind: string;
  variety: string;
  sex: string;
  sexDisplay: string;
  bodytypeDisplay: string;
  colour: string;
  ageDisplay: string;
  sterilizationDisplay: string;
  foundPlace: string;
  remark: string;
  openDate: string;
  closedDate: string;
  longTermOpen: boolean;
  update: string;
  createTime: string;
  shelterName: string;
  albumFile: string;
  shelterId: string | null;
  county: string;
  shelterAddress: string;
  shelterTel: string;
  shelterOpenTime: string;
  shelterLon: string;
  shelterLat: string;
  matched: boolean;
}

export function joinAnimalsToShelters(
  animals: RawAnimalRecord[],
  shelters: RawShelterRecord[]
): { animals: NormalizedAnimal[]; unmatched: string[] } {
  const byName = new Map<string, RawShelterRecord>();
  for (const s of shelters) {
    byName.set(normalizeShelterName(s.ShelterName), s);
  }

  const unmatchedSet = new Set<string>();
  const out: NormalizedAnimal[] = animals.map((a) => {
    const shelter = byName.get(normalizeShelterName(a.shelter_name));
    if (!shelter) {
      unmatchedSet.add((a.shelter_name ?? '').trim());
      return {
        animalId: a.animal_id,
        subId: (a.animal_subid ?? '').trim(),
        kind: a.animal_kind ?? '',
        variety: trimVariety(a.animal_Variety ?? ''),
        sex: a.animal_sex ?? '',
        sexDisplay: mapSex(a.animal_sex ?? ''),
        bodytypeDisplay: mapBodytype(a.animal_bodytype ?? ''),
        colour: (a.animal_colour ?? '').trim(),
        ageDisplay: mapAge(a.animal_age ?? ''),
        sterilizationDisplay: mapSterilization(a.animal_sterilization ?? ''),
        foundPlace: (a.animal_foundplace ?? '').trim(),
        remark: (a.animal_remark ?? '').trim(),
        openDate: a.animal_opendate ?? '',
        closedDate: a.animal_closeddate ?? '',
        longTermOpen: isLongTermOpen(a.animal_closeddate ?? ''),
        update: a.animal_update ?? '',
        createTime: a.animal_createtime ?? '',
        shelterName: (a.shelter_name ?? '').trim(),
        albumFile: (a.album_file ?? '').trim(),
        shelterId: null,
        county: '',
        shelterAddress: (a.shelter_address ?? '').trim(),
        shelterTel: (a.shelter_tel ?? '').trim(),
        shelterOpenTime: '',
        shelterLon: '',
        shelterLat: '',
        matched: false,
      };
    }
    return {
      animalId: a.animal_id,
      subId: (a.animal_subid ?? '').trim(),
      kind: a.animal_kind ?? '',
      variety: trimVariety(a.animal_Variety ?? ''),
      sex: a.animal_sex ?? '',
      sexDisplay: mapSex(a.animal_sex ?? ''),
      bodytypeDisplay: mapBodytype(a.animal_bodytype ?? ''),
      colour: (a.animal_colour ?? '').trim(),
      ageDisplay: mapAge(a.animal_age ?? ''),
      sterilizationDisplay: mapSterilization(a.animal_sterilization ?? ''),
      foundPlace: (a.animal_foundplace ?? '').trim(),
      remark: (a.animal_remark ?? '').trim(),
      openDate: a.animal_opendate ?? '',
      closedDate: a.animal_closeddate ?? '',
      longTermOpen: isLongTermOpen(a.animal_closeddate ?? ''),
      update: a.animal_update ?? '',
      createTime: a.animal_createtime ?? '',
      shelterName: shelter.ShelterName,
      albumFile: (a.album_file ?? '').trim(),
      shelterId: shelter.ID,
      county: shelter.CityName ?? '',
      shelterAddress: shelter.Address ?? '',
      shelterTel: shelter.Phone ?? '',
      shelterOpenTime: shelter.OpenTime ?? '',
      shelterLon: shelter.Lon ?? '',
      shelterLat: shelter.Lat ?? '',
      matched: true,
    };
  });

  return { animals: out, unmatched: [...unmatchedSet].sort() };
}
