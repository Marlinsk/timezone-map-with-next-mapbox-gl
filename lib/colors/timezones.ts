const TZ_PALETTE = [
  "#3B82F6",
  "#22D3EE",
  "#A855F7",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#6366F1",
  "#F97316",
];

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash | 0;
  }
  return Math.abs(hash);
}

export function getTimezoneColor(tzid: string): string {
  const h = djb2(tzid);
  return TZ_PALETTE[h % TZ_PALETTE.length];
}