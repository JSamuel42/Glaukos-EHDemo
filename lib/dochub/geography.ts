// Maps the geography names from the Excel to ISO 3166-1 alpha-2 codes.
// "Global" is special — handled as the sentinel 'GLOBAL', which components
// render as a Lucide globe icon rather than a flag.
export const GEOGRAPHY_CODE: Record<string, string> = {
  Global: 'GLOBAL',
  Australia: 'AU',
  Canada: 'CA',
  England: 'GB', // ISO has no England code; use GB (Union flag)
  France: 'FR',
  Germany: 'DE',
};

export function getFlagCode(geography: string): string {
  return GEOGRAPHY_CODE[geography] ?? geography;
}
