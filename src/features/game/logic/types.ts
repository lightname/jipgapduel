export type Band = 'easy' | 'medium' | 'hard';

export type Sgg = {
  code: string;
  name: string;
  path: string;
};

export type Complex = {
  id: string;
  name: string;
  sggCode: string;
  umd: string;
  buildYear: number;
  lat: number;
  lng: number;
  coordSource: 'parcel' | 'road' | 'dong' | 'sgg';
};

export type PoolTrade = {
  id: string;
  complexId: string;
  areaM2: number;
  floor: number;
  dealYm: string;
  price: number;
};

export type Pool = {
  schemaVersion: 1;
  poolVersion: string;
  generatedAt: string;
  period: { from: string; to: string };
  sgg: Sgg[];
  complexes: Complex[];
  trades: PoolTrade[];
  pairs: Record<Band, [number, number][]>;
};

export type Question = {
  left: number;
  right: number;
  band: Band;
};
