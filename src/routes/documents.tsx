import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  GitCompareArrows,
  History,
  Lock,
  MessageSquare,
  Search,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkspaceStatusBadge } from "@/components/workspace-badges";
import {
  documentCategories,
  ingestionSteps,
  orgDocuments,
  type OrgDocument,
} from "@/lib/workspace-data";

export const Route = createFileRoute("/documents")({ component: DocumentsPage });

const card = "rounded-2xl border border-border bg-card p-5";
const workflowStages = [
  "Draft",
  "Submitted for Review",
  "Under Review",
  "Changes Requested",
  "Approved",
  "Published",
];

function stageIndex(status: OrgDocument["status"]) {
  if (status === "Draft") return 0;
  if (status === "Under Review") return 2;
  if (status === "Approved") return 4;
  if (status === "Published") return 5;
  return 5; // Archived sits after Published in the lifecycle
}

function suggestType(name: string) {
  const n = name.toLowerCase();
  if (n.includes("reinsurance") || n.includes("treaty"))
    return {
      type: "Reinsurance agreement",
      category: "Reinsurance",
      classification: "Restricted" as const,
    };
  if (n.includes("loss"))
    return { type: "Loss run", category: "Claims", classification: "Confidential" as const };
  if (n.includes("policy") || n.includes("wording"))
    return {
      type: "Policy wording",
      category: "Policy Documents",
      classification: "General Internal" as const,
    };
  if (n.includes("broker") || n.includes("agreement"))
    return {
      type: "Broker agreement",
      category: "Contracts",
      classification: "Confidential" as const,
    };
  if (n.includes("financial") || n.includes("statement"))
    return {
      type: "Financial statements",
      category: "Finance",
      classification: "Restricted" as const,
    };
  if (n.includes("submission") || n.includes("acord"))
    return {
      type: "Underwriting submission",
      category: "Underwriting",
      classification: "Confidential" as const,
    };
  return {
    type: "General document",
    category: "Procedures",
    classification: "General Internal" as const,
  };
}

function DocumentsPage() {
  const [docs, setDocs] = useState<OrgDocument[]>(orgDocuments);
  const [selectedId, setSelectedId] = useState(orgDocuments[0]!.id);
  const [category, setCategory] = useState("All categories");
  const [department, setDepartment] = useState("All departments");
  const [status, setStatus] = useState("All statuses");
  const [search, setSearch] = useState("");
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [uploadDone, setUploadDone] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = docs.find((d) => d.id === selectedId) ?? docs[0]!;
  const suggestion = uploadName ? suggestType(uploadName) : null;
  const duplicate = uploadName
    ? docs.find((d) =>
        d.name.toLowerCase().includes(
          uploadName
            .toLowerCase()
            .replace(/\.[a-z]+$/i, "")
            .slice(0, 14),
        ),
      )
    : undefined;

  const filtered = useMemo(
    () =>
      docs.filter((d) => {
        if (category !== "All categories" && d.category !== category) return false;
        if (department !== "All departments" && d.department !== department) return false;
        if (status !== "All statuses" && d.status !== status) return false;
        if (
          search &&
          !`${d.name} ${d.type} ${d.owner} ${d.association}`
            .toLowerCase()
            .includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [docs, category, department, status, search],
  );

  const departments = [
    "All departments",
    ...Array.from(new Set(orgDocuments.map((d) => d.department))),
  ];
  const major = parseFloat(selected.version);
  const previousVersions = [0.1, 0.2]
    .map((step) => (major - step).toFixed(1))
    .filter((v) => parseFloat(v) > 0);

  function confirmUpload() {
    if (!uploadName || !suggestion) return;
    const doc: OrgDocument = {
      id: `DOC-${1043 + docs.length}`,
      name: uploadName.replace(/\.[a-z]+$/i, "").replace(/[-_]/g, " "),
      type: suggestion.type,
      category: suggestion.category,
      department: "Policy",
      owner: "Jane Doe",
      uploaded: "Nov 04, 2026",
      modified: "Nov 04, 2026",
      version: "1.0",
      status: "Draft",
      classification: suggestion.classification,
      access: "Owner and reviewers",
      association: "To be confirmed",
      pages: 0,
    };
    setDocs((prev) => [doc, ...prev]);
    setSelectedId(doc.id);
    setUploadDone(true);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              The organization's permanent document repository. This is different from files
              attached to a chat: documents here are governed records with versions,
              classifications, approvals and retention. Alfie only retrieves documents your role is
              authorized to access.
            </p>
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.xlsx,.csv,.txt,.pptx,.png,.jpg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setUploadName(f.name);
                  setUploadDone(false);
                }
                e.target.value = "";
              }}
            />
            <Button onClick={() => fileRef.current?.click()}>
              <UploadCloud className="size-4" /> Upload document
            </Button>
          </div>
        </div>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Documents in repository",
              String(docs.length * 128),
              "Across all categories, sample index",
            ],
            [
              "Published",
              String(docs.filter((d) => d.status === "Published").length * 96),
              "Current official records",
            ],
            [
              "Under review",
              String(
                docs.filter((d) => d.status === "Under Review" || d.status === "Draft").length * 7,
              ),
              "Waiting on reviewers or owners",
            ],
            [
              "Restricted or higher",
              String(
                docs.filter(
                  (d) =>
                    d.classification === "Restricted" || d.classification === "Highly Restricted",
                ).length * 41,
              ),
              "Access controlled by role and document permissions",
            ],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="mt-1.5 text-xl font-semibold">{value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
            </div>
          ))}
        </section>

        {uploadName && suggestion ? (
          <section className={`${card} mt-4 border-primary/30`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="size-4 text-primary" /> Ingestion: {uploadName}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Alfie runs the governed ingestion process before anything is stored.
                  Classification stays a suggestion until you confirm it.
                </p>
              </div>
              {uploadDone ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-positive">
                  <CheckCircle2 className="size-4" /> Stored as Draft, version 1.0
                </span>
              ) : (
                <Button size="sm" onClick={confirmUpload}>
                  Confirm and store
                </Button>
              )}
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <ol className="space-y-1.5">
                {ingestionSteps.map((s, i) => (
                  <li key={s} className="flex items-center gap-2 text-xs">
                    <CheckCircle2
                      className={`size-3.5 ${i < 9 ? "text-positive" : "text-muted-foreground"}`}
                    />{" "}
                    <span className={i < 9 ? "" : "text-muted-foreground"}>
                      {s}
                      {i >= 9 ? " (waiting on you)" : ""}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
                <p className="font-semibold">Alfie classification suggestion</p>
                <p className="mt-1">Type: {suggestion.type}</p>
                <p>Category: {suggestion.category}</p>
                <p>Classification: {suggestion.classification}</p>
                <p className="mt-1 text-muted-foreground">
                  Entities found: Northstar Mutual, broker and policy references. You can correct
                  any of this before storing.
                </p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
                <p className="font-semibold">Duplicate check</p>
                <p className="mt-1">
                  {duplicate
                    ? `A similar document already exists: ${duplicate.name} (version ${duplicate.version}). Storing yours will create a new document, not overwrite it. Use Upload as new version on that document instead if this is an update.`
                    : "No potential duplicates found in the repository."}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className={card}>
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-44 flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, type, owner, record"
                  className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-xs outline-none focus:border-ring"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring"
              >
                {documentCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring"
              >
                {departments.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring"
              >
                {["All statuses", "Draft", "Under Review", "Approved", "Published", "Archived"].map(
                  (c) => (
                    <option key={c}>{c}</option>
                  ),
                )}
              </select>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Document</th>
                    <th className="py-2 pr-3 font-medium">Department</th>
                    <th className="py-2 pr-3 font-medium">Version</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 font-medium">Classification</th>
                    <th className="py-2 font-medium">Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedId(d.id)}
                      className={`cursor-pointer border-b border-border/60 last:border-0 hover:bg-secondary/40 ${d.id === selected.id ? "bg-primary/5" : ""}`}
                    >
                      <td className="py-2.5 pr-3">
                        <span className="flex items-start gap-2">
                          <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <span>
                            <span className="block font-medium">{d.name}</span>
                            <span className="text-muted-foreground">
                              {d.type} · {d.id} · Owner {d.owner}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">{d.department}</td>
                      <td className="py-2.5 pr-3">{d.version}</td>
                      <td className="py-2.5 pr-3">
                        <WorkspaceStatusBadge status={d.status} />
                      </td>
                      <td className="py-2.5 pr-3">
                        <WorkspaceStatusBadge status={d.classification} />
                      </td>
                      <td className="py-2.5">{d.modified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No documents match these filters, or your role cannot access them.
                </p>
              ) : null}
            </div>
          </section>

          <aside className="space-y-4">
            <section className={card}>
              <h2 className="text-sm font-semibold">{selected.name}</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {selected.id} · Uploaded {selected.uploaded} by {selected.owner}
              </p>
              <dl className="mt-3 space-y-1.5 text-xs">
                {[
                  ["Type", selected.type],
                  ["Category", selected.category],
                  ["Associated record", selected.association],
                  ["Access", selected.access],
                  ["Pages", selected.pages ? String(selected.pages) : "Processing"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  <History className="size-3.5" /> Version history
                </p>
                <ul className="mt-2 space-y-1.5 text-xs">
                  <li className="flex justify-between rounded-lg bg-primary/5 px-2.5 py-1.5">
                    <span>Version {selected.version}, current</span>
                    <span className="text-muted-foreground">{selected.modified}</span>
                  </li>
                  {previousVersions.map((v) => (
                    <li
                      key={v}
                      className="flex justify-between rounded-lg bg-secondary/50 px-2.5 py-1.5"
                    >
                      <span>Version {v}</span>
                      <span className="text-muted-foreground">Superseded, preserved</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                  Updates never silently overwrite an approved document. A new version is created
                  and the previous one is preserved and restorable by authorized users.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setCompareOpen(true)}
                >
                  <GitCompareArrows className="size-3.5" /> Compare versions
                </Button>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold">Approval workflow</p>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {workflowStages.map((s, i) => (
                    <span key={s} className="flex items-center gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${i < stageIndex(selected.status) ? "bg-positive/10 text-positive" : i === stageIndex(selected.status) ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}
                      >
                        {s}
                      </span>
                      {i < workflowStages.length - 1 ? (
                        <span className="text-muted-foreground">→</span>
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className={card}>
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Bot className="size-4 text-primary" /> Document intelligence
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setInsight(
                      `Summary of ${selected.name}: the document sets out its terms in ${selected.pages || "the extracted"} pages, is owned by ${selected.owner}, and is currently ${selected.status.toLowerCase()} at version ${selected.version}. Key dates, limits and obligations were extracted with page references, and nothing outside your access was used.`,
                    )
                  }
                >
                  Summarize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setInsight(
                      `Key dates and limits extracted from ${selected.name} with section references. Where a value appears in more than one place with different wording, both are shown rather than reconciled silently.`,
                    )
                  }
                >
                  Extract key dates and limits
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setInsight(
                      `Missing information check for ${selected.name}: all expected sections are present for its type. One item to confirm: the association (${selected.association}) should be verified by the owner before this is cited in a report.`,
                    )
                  }
                >
                  Check for missing sections
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/chats">
                    <MessageSquare className="size-3.5" /> Ask about this in Chat
                  </Link>
                </Button>
              </div>
              {insight ? (
                <p className="mt-3 rounded-xl bg-secondary/50 p-3 text-xs leading-5">{insight}</p>
              ) : null}
            </section>

            <section className={card}>
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Lock className="size-4" /> Access and retention
              </h2>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-muted-foreground">
                <li>
                  Classification: {selected.classification}. Access: {selected.access}.
                </li>
                <li>
                  Retention: kept under the insurance records schedule for its type. Documents under
                  legal, regulatory or contractual retention cannot be deleted outside the approved
                  process.
                </li>
                <li className="flex items-center gap-1.5">
                  <Clock3 className="size-3.5" /> Access history: viewed by {selected.owner} on{" "}
                  {selected.modified}, downloaded once this month, no external shares.
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compare versions of {selected.name}</DialogTitle>
            <DialogDescription>
              Version {selected.version} (current) against version {previousVersions[0] ?? "1.0"}.
              Differences are summarized by Alfie with section references. The authoritative text
              remains the document itself.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 text-sm leading-6">
            <li>· Two clauses reworded in the obligations section, with no change to limits.</li>
            <li>· One key date moved: the review date in the schedule.</li>
            <li>· A definitions paragraph added. No sections were removed.</li>
          </ul>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
