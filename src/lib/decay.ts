export interface DecayInput {
  decayEnabled: boolean;
  decayStartPoints: number;
  decayPointsPerInterval: number;
  decayIntervalSeconds: number;
  createdAt: Date | string;
}

export function computeDecayedPoints(c: DecayInput, now: Date = new Date()): number {
  if (!c.decayEnabled) return 0;
  const start = new Date(c.createdAt).getTime();
  const interval = Math.max(1, c.decayIntervalSeconds || 600);
  const elapsedSec = Math.max(0, (now.getTime() - start) / 1000);
  const ticks = Math.floor(elapsedSec / interval);
  const lost = ticks * c.decayPointsPerInterval;
  return Math.max(0, c.decayStartPoints - lost);
}

export function humanizeInterval(totalSeconds: number): string {
  const s = Math.max(1, Math.floor(totalSeconds));
  if (s % 3600 === 0) {
    const h = s / 3600;
    return `${h} hour${h === 1 ? "" : "s"}`;
  }
  if (s % 60 === 0) {
    const m = s / 60;
    return `${m} minute${m === 1 ? "" : "s"}`;
  }
  return `${s} second${s === 1 ? "" : "s"}`;
}

export function splitInterval(totalSeconds: number): { value: number; unit: "seconds" | "minutes" | "hours" } {
  const s = Math.max(1, Math.floor(totalSeconds));
  if (s % 3600 === 0) return { value: s / 3600, unit: "hours" };
  if (s % 60 === 0) return { value: s / 60, unit: "minutes" };
  return { value: s, unit: "seconds" };
}

export function toSeconds(value: number, unit: "seconds" | "minutes" | "hours"): number {
  if (unit === "hours") return value * 3600;
  if (unit === "minutes") return value * 60;
  return value;
}
