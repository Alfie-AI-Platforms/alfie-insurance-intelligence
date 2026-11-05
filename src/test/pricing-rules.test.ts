import { describe, expect, it } from "vitest";
import { baseScenario, canApproveRate, canImplement, canPricing, runScenario } from "@/lib/pricing-data";

describe("pricing governance", () => {
  it("Pricing Analyst can create scenarios but cannot approve or implement", () => {
    expect(canPricing("Pricing Analyst", "createScenario")).toBe(true);
    expect(canApproveRate("Pricing Analyst", 3)).toBe(false);
    expect(canImplement("Pricing Analyst", "Filing Review")).toBe(false);
  });
  it("Pricing Manager approves within a 10% authority only", () => {
    expect(canApproveRate("Pricing Manager", 8)).toBe(true);
    expect(canApproveRate("Pricing Manager", 12)).toBe(false);
  });
  it("Only actuaries sign off reserves", () => {
    expect(canPricing("Actuary", "signOffReserve")).toBe(true);
    expect(canPricing("Pricing Manager", "signOffReserve")).toBe(false);
  });
  it("Production implementation requires filing review to be complete", () => {
    expect(canImplement("Pricing Manager", "Pending Approval")).toBe(false);
    expect(canImplement("Pricing Manager", "Filing Review")).toBe(true);
  });
});

describe("illustrative scenario arithmetic", () => {
  it("+5% matches the sample table", () => {
    const r = runScenario({ ...baseScenario, ratePct: 5 });
    expect(r.writtenPremium.toFixed(1)).toBe("19.3");
    expect(r.lossRatio.toFixed(1)).toBe("61.6");
    expect(Math.round(r.retention)).toBe(86);
  });
  it("+8% matches the sample table", () => {
    const r = runScenario({ ...baseScenario, ratePct: 8 });
    expect(r.writtenPremium.toFixed(1)).toBe("19.9");
    expect(r.lossRatio.toFixed(1)).toBe("59.9");
    expect(Math.round(r.retention)).toBe(84);
  });
});
