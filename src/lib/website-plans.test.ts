import { describe, expect, it } from "vitest";
import { websitePlans } from "./website-plans";
describe("supplied packages", () => {
  it.each([
    ["1h", 20, 360], ["3h", 25, 720], ["24h", 30, 1440],
    ["48h", 55, 2880], ["7d", 50, 10080], ["30d", 900, 43200],
    ["home-monthly", 1300, 43200],
  ])("keeps the supplied price and duration for %s", (id, price, minutes) => {
    const plan = websitePlans.find(plan => plan.id === id);
    expect(plan?.price).toBe(price);
    expect(plan?.minutes).toBe(minutes);
  });
});