import type { DocSection } from "@/components/document-view";

/**
 * Billing for the organization's own Alfie subscription: plan, module
 * seats, usage, payment method and invoices. This is platform billing
 * (what Northstar pays Alfie), not policyholder premium billing, which
 * lives in Finance. Figures follow the published module pricing and are
 * sample records until the payment provider is connected.
 */

export const plan = {
  name: "Alfie Platform",
  term: "Annual contract, billed monthly",
  planYear: "Nov 1, 2026 to Oct 31, 2027",
  renews: "Nov 1, 2027",
  platformFeeMonthly: 2000,
  platformFeeNote: "Platform fee $24,000 per year, premium band under $250M DWP",
  nextInvoiceDate: "Dec 1, 2026",
  nextInvoiceEstimate: 18237,
};

export type ModuleSeat = {
  module: string;
  pricePerSeat: number | null; // null = bundled
  active: number;
  licensed: number;
};

export const moduleSeats: ModuleSeat[] = [
  { module: "Underwriting", pricePerSeat: 299, active: 14, licensed: 16 },
  { module: "Claims", pricePerSeat: 249, active: 22, licensed: 25 },
  { module: "Policy", pricePerSeat: 149, active: 12, licensed: 12 },
  { module: "Pricing & Actuarial", pricePerSeat: 499, active: 6, licensed: 8 },
  { module: "Finance", pricePerSeat: 199, active: 9, licensed: 10 },
  { module: "Reports", pricePerSeat: null, active: 31, licensed: 71 },
];

export const moduleMonthly = (m: ModuleSeat) =>
  m.pricePerSeat === null ? 0 : m.pricePerSeat * m.active;

export const modulesMonthlyTotal = moduleSeats.reduce((sum, m) => sum + moduleMonthly(m), 0);
export const monthlyTotal = modulesMonthlyTotal + plan.platformFeeMonthly;
export const activeSeats = moduleSeats
  .filter((m) => m.pricePerSeat !== null)
  .reduce((sum, m) => sum + m.active, 0);
export const licensedSeats = moduleSeats
  .filter((m) => m.pricePerSeat !== null)
  .reduce((sum, m) => sum + m.licensed, 0);

export type UsageItem = {
  label: string;
  used: string;
  detail: string;
  pct: number; // share of the included allowance, for the bar
};

export const usageThisPeriod: UsageItem[] = [
  {
    label: "Alfie analyses",
    used: "6,214",
    detail: "Analyses run Nov 1 to Nov 15 across Claims, Underwriting and Pricing. No per-analysis charge on this plan.",
    pct: 100,
  },
  {
    label: "Documents processed",
    used: "1,642",
    detail: "Of 3,000 documents included each month. Processing beyond the allowance is billed at $1.50 per document on the next invoice.",
    pct: 55,
  },
  {
    label: "Automation runs",
    used: "948",
    detail: "Scheduled and triggered automations executed this period, including intake triage and renewal preparation.",
    pct: 100,
  },
];

export const paymentMethod = {
  brand: "Visa",
  last4: "4471",
  expiry: "08 / 2028",
  holder: "Northstar Mutual Insurance Company",
  contactName: "Sofia Martin",
  contactRole: "Finance Manager",
  contactEmail: "billing@northstarmutual.com",
  address: "200 Bay Street, Suite 2400, Toronto, ON M5J 2J1",
};

export type Invoice = {
  id: string;
  date: string;
  period: string;
  amount: number;
  status: "Paid" | "Scheduled";
  note: string;
};

export const invoices: Invoice[] = [
  {
    id: "INV-2026-0118",
    date: "Nov 1, 2026",
    period: "November 2026",
    amount: 18237,
    status: "Paid",
    note: "Paid Nov 3, 2026 on the card ending 4471.",
  },
  {
    id: "INV-2026-0104",
    date: "Oct 1, 2026",
    period: "October 2026",
    amount: 18549,
    status: "Paid",
    note: "Includes $312 of document processing above the included allowance (208 documents at $1.50). Paid Oct 3, 2026.",
  },
  {
    id: "INV-2026-0091",
    date: "Sep 1, 2026",
    period: "September 2026",
    amount: 18237,
    status: "Paid",
    note: "Paid Sep 3, 2026 on the card ending 4471.",
  },
  {
    id: "INV-2026-0077",
    date: "Aug 1, 2026",
    period: "August 2026",
    amount: 17640,
    status: "Paid",
    note: "Lower than the standard month: Finance ran 6 active seats in August, increased to 9 from September. Paid Aug 4, 2026.",
  },
];

export const invoiceSummary = (inv: Invoice) =>
  `Invoice ${inv.id} for the ${inv.period} billing period. Total $${inv.amount.toLocaleString()} USD, status ${inv.status.toLowerCase()}. ${inv.note}`;

export const invoiceSections = (inv: Invoice): DocSection[] => [
  {
    heading: "Charges",
    body: `Platform fee $${plan.platformFeeMonthly.toLocaleString()}. Module seats $${modulesMonthlyTotal.toLocaleString()} at the seat counts and rates on the Billing page (Underwriting $299, Claims $249, Policy $149, Pricing & Actuarial $499, Finance $199 per user per month; Reports bundled).${inv.id === "INV-2026-0104" ? " Document processing overage $312." : ""}${inv.id === "INV-2026-0077" ? " Module seats reflect August counts, before the Finance seat increase." : ""} Total $${inv.amount.toLocaleString()}.`,
  },
  {
    heading: "Bill to",
    body: `${paymentMethod.holder}, ${paymentMethod.address}. Billing contact: ${paymentMethod.contactName}, ${paymentMethod.contactRole}, ${paymentMethod.contactEmail}. All amounts in USD. Taxes, where applicable, are calculated by the payment provider and shown on the remittance copy.`,
  },
  {
    heading: "Payment",
    body:
      inv.status === "Paid"
        ? `Paid on the ${paymentMethod.brand} card ending ${paymentMethod.last4}. The charge appears as ALFIE PLATFORM on the card statement.`
        : `Scheduled to charge the ${paymentMethod.brand} card ending ${paymentMethod.last4} on ${inv.date}.`,
  },
];
