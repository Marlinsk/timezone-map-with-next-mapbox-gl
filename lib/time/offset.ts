export function getUtcOffsetHours(tzid: string, d = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tzid,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  }).formatToParts(d);

  const of = parts.find(p => p.type === "timeZoneName")?.value || "UTC";
  const m = of.match(/([+-])(\d{1,2})(?::?(\d{2}))?/);
  
  if (!m) return 0;
  
  const sign = m[1] === "-" ? -1 : 1;
  const hours = parseInt(m[2], 10);
  const mins = m[3] ? parseInt(m[3], 10) : 0;
  
  return sign * (hours + mins / 60);
}
