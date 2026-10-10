import { describe, it, expect } from "vitest";
import { computeExpiry, normalizeKePhone } from "./wifi";

describe("wifi rules", () => {
  it("normalizes Kenyan numbers", () => {
    expect(normalizeKePhone("0798 091 838")).toBe("254798091838");
    expect(normalizeKePhone("+254798091838")).toBe("254798091838");
    expect(normalizeKePhone("12345")).toBeNull();
  });
  it("starts now when nothing active", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(computeExpiry(now, null, 60).expiresAt.toISOString()).toBe("2026-01-01T01:00:00.000Z");
  });
  it("stacks new time on remaining time", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const cur = new Date("2026-01-01T00:30:00Z");
    expect(computeExpiry(now, cur, 60).expiresAt.toISOString()).toBe("2026-01-01T01:30:00.000Z");
  });
});
