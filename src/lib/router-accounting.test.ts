import { expect, it } from "vitest";
import { accountConsumedBytes } from "./router-accounting";
it("counts all account received and sent data, not page transfers", () => {
  expect(accountConsumedBytes({ receivedBytes: 2_000_000, sentBytes: 500_000, updatedAt: "2026-10-14T00:00:00Z", devices: [] })).toBe(2_500_000);
});