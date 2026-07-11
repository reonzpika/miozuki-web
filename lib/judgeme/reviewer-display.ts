/** Display overrides for Judge.me reviewer names (source data unchanged in Judge.me). */
const REVIEWER_DISPLAY_NAME: Record<string, string> = {
  'Ting Chou': 'Casey',
};

export function reviewerNameForDisplay(name: string): string {
  const trimmed = name.trim();
  return REVIEWER_DISPLAY_NAME[trimmed] ?? name;
}
