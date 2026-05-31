export const BRAZIL_HOLIDAYS_2026: string[] = [
  "2026-01-01","2026-04-21","2026-05-01","2026-09-07",
  "2026-10-12","2026-11-02","2026-11-15","2026-12-25",
];

export function isHoliday(dateStr: string): boolean {
  return BRAZIL_HOLIDAYS_2026.includes(dateStr);
}
