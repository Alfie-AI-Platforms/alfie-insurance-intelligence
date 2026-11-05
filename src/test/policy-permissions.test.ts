import { describe, expect, it } from "vitest";
import { can } from "@/lib/policy-data";

describe("policy role permissions", () => {
  it("Policy Administrator has full access", () => {
    expect(can("Policy Administrator", "issue")).toBe(true);
    expect(can("Policy Administrator", "cancel")).toBe(true);
  });
  it("Servicing Specialist can prepare endorsements but not approve them", () => {
    expect(can("Policy Servicing Specialist", "prepare")).toBe(true);
    expect(can("Policy Servicing Specialist", "approveEndorsement")).toBe(false);
  });
  it("Underwriter can approve endorsements but not issue or cancel", () => {
    expect(can("Underwriter", "approveEndorsement")).toBe(true);
    expect(can("Underwriter", "issue")).toBe(false);
    expect(can("Underwriter", "cancel")).toBe(false);
  });
  it("Finance can view financials but not prepare changes", () => {
    expect(can("Finance", "viewFinancials")).toBe(true);
    expect(can("Finance", "prepare")).toBe(false);
  });
});
