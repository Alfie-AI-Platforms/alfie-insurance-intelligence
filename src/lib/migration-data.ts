/**
 * Migration console data: the projects moving Northstar's data and
 * workload from its previous platforms onto Alfie, the phases each
 * project moves through, and the reconciliation evidence behind them.
 * Sample records, frontend only: batch execution and connectors are
 * backend work reserved for the engineering team.
 */

export type PhaseState = "Complete" | "In progress" | "Pending";

export type MigrationPhase = { name: string; detail: string; state: PhaseState };

export type MigrationObject = {
  object: string;
  total: number;
  moved: number;
  exceptions: number;
};

export type MigrationProject = {
  id: string;
  name: string;
  sourceSystem: string;
  scope: string;
  status: string;
  owner: string;
  started: string;
  targetCutover: string;
  phases: MigrationPhase[];
  objects: MigrationObject[];
  validation: string[];
};

const phaseNames = ["Assess", "Map", "Trial load", "Validate", "Cutover", "Hypercare"];
const phases = (states: PhaseState[], details: string[]): MigrationPhase[] =>
  phaseNames.map((name, i) => ({
    name,
    detail: details[i] ?? "",
    state: states[i] ?? "Pending",
  }));

export const migrationProjects: MigrationProject[] = [
  {
    id: "MIG-01",
    name: "Policy history migration",
    sourceSystem: "Legacy policy administration system (in-house PAS)",
    scope: "All in-force and historical policies, endorsements and billing accounts",
    status: "Validation",
    owner: "Northstar IT, data team",
    started: "Oct 13, 2026",
    targetCutover: "Dec 8, 2026",
    phases: phases(
      ["Complete", "Complete", "Complete", "In progress", "Pending", "Pending"],
      [
        "Inventory complete: 84,392 policies and 12,480 endorsements across 9 product lines.",
        "Field mapping signed off for 214 of 218 source fields; 4 legacy fields retired by agreement.",
        "Trial load of 8,000 policies reconciled on counts and premium totals.",
        "Full load complete. Exception review is under way with Underwriting and Policy teams.",
        "Final delta load and switch of the policy queue, planned for the Dec 8 window.",
        "30-day watch with daily reconciliation after cutover.",
      ],
    ),
    objects: [
      { object: "Policies", total: 84392, moved: 84392, exceptions: 214 },
      { object: "Endorsements", total: 12480, moved: 12480, exceptions: 36 },
      { object: "Billing accounts", total: 61207, moved: 61207, exceptions: 58 },
    ],
    validation: [
      "Premium totals tie to the legacy general ledger to the cent for 2024, 2025 and 2026.",
      "The 214 policy exceptions are address and postal code format differences. None affect coverage, limits or deductibles.",
      "Every migrated policy keeps its legacy policy number as a searchable reference.",
    ],
  },
  {
    id: "MIG-02",
    name: "Claims archive migration",
    sourceSystem: "Claims Management System",
    scope: "Closed and open claims from 2019 to 2026, with documents and reserve history",
    status: "Trial load",
    owner: "Northstar IT, data team",
    started: "Oct 27, 2026",
    targetCutover: "Jan 20, 2027",
    phases: phases(
      ["Complete", "Complete", "In progress", "Pending", "Pending", "Pending"],
      [
        "Inventory complete: 96,540 claims and about 388,000 documents.",
        "Mapping signed off, including reserve history and payment references.",
        "Trial batch of 9,800 claims loaded; reconciliation in progress.",
        "Full validation follows a clean trial reconciliation.",
        "Cutover planned after the policy migration hypercare ends.",
        "30-day watch with daily reconciliation after cutover.",
      ],
    ),
    objects: [
      { object: "Claims (trial batch)", total: 9800, moved: 9800, exceptions: 412 },
      { object: "Claim documents (trial batch)", total: 41000, moved: 40904, exceptions: 96 },
      { object: "Claims (full archive)", total: 96540, moved: 0, exceptions: 0 },
    ],
    validation: [
      "Trial batch reconciles on claim counts by year and line of business.",
      "Reserve totals differ by $1,240 across 3 claims. Under review with Claims before the full load proceeds.",
      "96 trial documents failed text extraction and are queued for reprocessing, not dropped.",
    ],
  },
  {
    id: "MIG-03",
    name: "Document library migration",
    sourceSystem: "SharePoint Document Library",
    scope: "The governed document library: underwriting guidelines, forms, wordings and board records",
    status: "Complete",
    owner: "Northstar IT, data team",
    started: "Sep 8, 2026",
    targetCutover: "Completed Oct 21, 2026",
    phases: phases(
      ["Complete", "Complete", "Complete", "Complete", "Complete", "Complete"],
      [
        "Inventory complete: 412,208 documents across 14 libraries.",
        "Metadata and retention labels mapped to the Alfie document categories.",
        "Trial load of 25,000 documents indexed and spot checked.",
        "Full load validated; the 128 extraction exceptions were reprocessed and cleared.",
        "Library switched to Alfie on Oct 21, 2026. SharePoint set to read-only.",
        "Hypercare closed Nov 11, 2026 with zero open exceptions.",
      ],
    ),
    objects: [
      { object: "Documents", total: 412208, moved: 412208, exceptions: 0 },
      { object: "Retention labels", total: 412208, moved: 412208, exceptions: 0 },
    ],
    validation: [
      "Document counts and checksums match SharePoint for every library.",
      "Retention labels carried over from SharePoint metadata; nothing was reclassified silently.",
      "Full text index rebuilt, so migrated documents are searchable and previewable in place.",
    ],
  },
];

export const migrationProcess: { step: string; detail: string }[] = [
  {
    step: "Assess",
    detail: "Inventory the source system: record counts, date ranges, document volumes and known data quality issues. Nothing moves yet.",
  },
  {
    step: "Map",
    detail: "Agree the field by field mapping into Alfie with the business owner of each record type. Retired fields are documented, never dropped quietly.",
  },
  {
    step: "Trial load",
    detail: "Load a representative batch and reconcile counts and money totals against the source before any full load is approved.",
  },
  {
    step: "Validate",
    detail: "Business teams review exceptions in Alfie. A migration does not proceed on unresolved money differences, however small.",
  },
  {
    step: "Cutover",
    detail: "Final delta load in an agreed window, then the workload switches: queues, documents and Alfie context all read from Alfie.",
  },
  {
    step: "Hypercare",
    detail: "30 days of daily reconciliation. The source stays read-only and available as a fallback for the full window.",
  },
];

export const migrationGuardrails: string[] = [
  "The source system is never written to or deleted from during a migration. It stays read-only until hypercare closes.",
  "Every batch reconciles on counts and money totals before the next batch starts.",
  "Exceptions are reviewed by the business owner of the record, not by the migration team alone.",
  "Migrated records keep their legacy identifiers, so anything referenced in email or paper files can still be found.",
];
