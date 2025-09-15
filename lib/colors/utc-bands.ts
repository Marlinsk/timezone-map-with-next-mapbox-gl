const UTC_BAND_COLORS = {
  "-12": "#7e6b8a",
  "-11": "#6aa0ff",
  "-10": "#50c2f8",
  "-9": "#7bd1b9",
  "-8": "#7ed957",
  "-7": "#c3de4a",
  "-6": "#ffd166",
  "-5": "#f4a261",
  "-4": "#f28482",
  "-3": "#e07a5f",
  "-2": "#d977a8",
  "-1": "#b38add",
  "0": "#8ab4f8",
  "1": "#5ec8e5",
  "2": "#4fd1c5",
  "3": "#4ade80",
  "4": "#a3e635",
  "5": "#facc15",
  "6": "#f59e0b",
  "7": "#fb7185",
  "8": "#f472b6",
  "9": "#c084fc",
  "10": "#a78bfa",
  "11": "#93c5fd",
  "12": "#60a5fa",
  "13": "#38bdf8",
  "14": "#22d3ee",
} as const;

export function colorForOffset(offset: number): string {
  const k = String(Math.max(-12, Math.min(14, Math.round(offset))));
  // @ts-ignore
  return UTC_BAND_COLORS[k] ?? UTC_BAND_COLORS["0"];
}
