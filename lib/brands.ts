export type BrandKey = 'istent-infinite';

export interface BrandDef {
  key: BrandKey;
  name: string;
  populated: boolean;
}

export const BRANDS: BrandDef[] = [
  { key: 'istent-infinite', name: 'iStent infinite', populated: true },
];

export const ACTIVE_BRAND_DEFAULT: BrandKey = 'istent-infinite';
