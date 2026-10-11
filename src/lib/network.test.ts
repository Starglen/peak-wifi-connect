import { describe, expect, it } from "vitest";
import { downloadMbps, formatBytes, SPEED_TEST_MAX_BYTES } from "./network";

describe("network measurements", () => {
  it("converts byte usage into KB, MB and GB", () => {
    expect(formatBytes(1250)).toBe("1.3 KB");
    expect(formatBytes(2_500_000)).toBe("2.50 MB");
    expect(formatBytes(1_500_000_000)).toBe("1.50 GB");
  });
  it("measures megabits per second from actual bytes and time", () => {
    expect(downloadMbps(1_000_000, 1000)).toBe(8);
    expect(downloadMbps(1000, 0)).toBe(0);
  });
  it("limits a download test to 8 MB", () => {
    expect(SPEED_TEST_MAX_BYTES).toBe(8_000_000);
  });
});