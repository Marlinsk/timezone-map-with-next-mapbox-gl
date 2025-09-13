const TZ_PALETTE = [
  "#3B82F6", // azul
  "#22D3EE", // ciano
  "#A855F7", // roxo
  "#EC4899", // rosa
  "#10B981", // verde-água
  "#F59E0B", // amarelo
  "#6366F1", // indigo
  "#F97316", // laranja
];

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
    hash = hash | 0; // força 32-bit
  }
  return Math.abs(hash);
}

export function getTimezoneColor(tzid: string): string {
  const h = djb2(tzid);
  return TZ_PALETTE[h % TZ_PALETTE.length];
}