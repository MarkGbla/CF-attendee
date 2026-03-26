import { randomBytes } from "crypto";

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = randomBytes(6).toString("hex");
  return `${base}-${suffix}`;
}
