import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/alfie-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkspaceStatusBadge } from "@/components/workspace-badges";
import {
  commonFields,
  dataSources,
  sourceAudit,
  sourceCategories,
  type DataSource,
} from "@/lib/workspace-data";

export const Route = createFileRoute("/data-sources")({ component: DataSourcesPage });

const card = "rounded-2xl border border-border bg-card p-5";
const connectSteps = [
  "Select the system or integration type",
  "Provide connection information",
  "Authenticate (OAuth, API key, service account or secure database credentials)",
  "Select datasets, tables or endpoints",
  "Define what Alfie is permitted to access",
  "Configure synchronization",
  "Test the connection",
  "Validate the returned data",
  "Save and activate",
];

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-xs"
    >
      <span className="font-medium">{label}</span>
      <span className={`relative h-5 w-9 rounded-full ${on ? "bg-primary" : "bg-border"}`}>
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow ${on ? "left-[18px]" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

function DataSourcesPage() {
  const [sources, setSources] = useState<DataSource[]>(dataSources);
  const [selectedId, setSelectedId] = useState(dataSources[0]!.id);
  const [category, setCategory] = useState("All categories");
  const [search, setSearch] = useState("");
  const [testNote, setTestNote] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [tested, setTested] = useState(false);
  const [usage, setUsage] = useState<
    Record<string, { chat: boolean; reporting: boolean; automation: boolean }>
  >({});

  const selected = sources.find((s) => s.id === selectedId) ?? sources[0]!;
  const usageFor = (s: DataSource) =>
    usage[s.id] ?? { chat: s.chatAvailable, reporting: s.reporting, automation: s.automation };

  const filtered = useMemo(
    () =>
      sources.filter((s) => {
        if (category !== "All categories" && s.category !== category) return false;
        if (search && !`${s.name} ${s.vendor}`.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      }),
    [sources, category, search],
  );

  const attention = sources.filter((s) =>
    ["Needs Attention", "Authentication Expired", "Connection Failed"].includes(s.status),
  );

  function testConnection() {
    if (selected.status === "Authentication Expired") {
      setTestNote(
        "Test failed: the credential for this source has expired. An administrator must refresh it before Alfie can retrieve current data. Alfie will not claim information from this source is current.",
      );
    } else if (selected.status === "Disabled") {
      setTestNote(
        "This source is disabled. Testing is unavailable until an administrator re-enables it.",
      );
    } else {
      setTestNote(
        `Connection test passed for ${selected.name}. Authentication valid, ${selected.datasets.length} datasets reachable, sample records validated against the common field mapping.`,
      );
    }
  }

  function addSource() {
    const name = newName.trim() || "New data source";
    const source: DataSource = {
      id: `ds-${Date.now()}`,
      name,
      category: "Core Insurance Systems",
      vendor: "Pending configuration",
      status: "Connected",
      access: "Read only",
      lastSync: "Just now, test connection",
      nextSync: "To be scheduled",
      records: "Validated in test",
      freshness: "Current",
      datasets: ["To be selected"],
      departments: ["Administrators"],
      agents: ["None assigned yet"],
      chatAvailable: false,
      reporting: false,
      automation: false,
    };
    setSources((prev) => [source, ...prev]);
    setSelectedId(source.id);
    setAddOpen(false);
    setNewName("");
    setTested(false);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <PageHeader title="Data Sources" description="The integration layer for Alfie Insurance. Administrators connect systems, define exactly what Alfie may access, and monitor connection health. Connecting a system never grants every employee or agent unrestricted access: least privilege applies per dataset, department, role and agent." actions={<>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add data source
          </Button>
        </>} />

        {attention.length ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
            <p className="leading-6">
              <span className="font-semibold">{attention.length} sources need attention.</span>{" "}
              {attention.map((s) => `${s.name} (${s.status.toLowerCase()})`).join(", ")}. Alfie
              treats data from these sources as stale or unavailable and says so, rather than
              presenting it as current.
            </p>
          </div>
        ) : null}

        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            [
              "Connected sources",
              String(
                sources.filter((s) => s.status === "Connected" || s.status === "Synchronizing")
                  .length,
              ),
              "of " + sources.length + " configured",
            ],
            ["Records reachable", "4.9M+", "Within configured permissions only"],
            [
              "Write capable",
              String(sources.filter((s) => s.access !== "Read only").length),
              "Separately approved, validated and audited",
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

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className={card}>
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-44 flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search sources or vendors"
                  className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-xs outline-none focus:border-ring"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring"
              >
                {sourceCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 space-y-2">
              {filtered.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(s.id);
                    setTestNote(null);
                  }}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl border px-3.5 py-3 text-left ${s.id === selected.id ? "border-primary/40 bg-primary/5" : "border-border hover:bg-secondary/40"}`}
                >
                  <span className="flex items-start gap-2.5">
                    <Database className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span>
                      <span className="block text-xs font-semibold">{s.name}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {s.vendor} · {s.category} · {s.records}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        Last sync {s.lastSync} · {s.freshness}
                      </span>
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <WorkspaceStatusBadge status={s.status} />
                    <span className="text-[10px] text-muted-foreground">{s.access}</span>
                  </span>
                </button>
              ))}
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No sources match.</p>
              ) : null}
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold">Which agents can use which sources</h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Agents retrieve data only through sources they are authorized for. Alfie coordinates
                access through the agent, never around it.
              </p>
              <div className="mt-2.5 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">Agent</th>
                      <th className="py-2 font-medium">Authorized sources</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(new Set(sources.flatMap((s) => s.agents)))
                      .filter((a) => !a.startsWith("All") && a !== "None assigned yet")
                      .map((agent) => (
                        <tr key={agent} className="border-b border-border/60 last:border-0">
                          <td className="py-2 pr-3 font-medium">{agent}</td>
                          <td className="py-2 text-muted-foreground">
                            {sources
                              .filter((s) => s.agents.includes(agent))
                              .map((s) => s.name)
                              .join(", ")}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className={card}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold">{selected.name}</h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {selected.vendor} · {selected.category}
                  </p>
                </div>
                <WorkspaceStatusBadge status={selected.status} />
              </div>
              {selected.error ? (
                <p className="mt-3 rounded-xl bg-destructive/5 p-3 text-xs leading-5 text-destructive">
                  {selected.error}
                </p>
              ) : null}
              <dl className="mt-3 space-y-1.5 text-xs">
                {[
                  ["Access level", selected.access],
                  ["Last successful sync", selected.lastSync],
                  ["Next sync", selected.nextSync],
                  ["Records", selected.records],
                  ["Data freshness", selected.freshness],
                  ["Departments", selected.departments.join(", ")],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3">
                <p className="text-xs font-semibold">Datasets Alfie may access</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {selected.datasets.map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Field level access is configured per dataset. Anything not listed here is out of
                  scope for every agent.
                </p>
              </div>
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-semibold">Where this source may be used</p>
                <Toggle
                  label="Available in general Chat"
                  on={usageFor(selected).chat}
                  onClick={() =>
                    setUsage((p) => ({
                      ...p,
                      [selected.id]: { ...usageFor(selected), chat: !usageFor(selected).chat },
                    }))
                  }
                />
                <Toggle
                  label="Available for reporting"
                  on={usageFor(selected).reporting}
                  onClick={() =>
                    setUsage((p) => ({
                      ...p,
                      [selected.id]: {
                        ...usageFor(selected),
                        reporting: !usageFor(selected).reporting,
                      },
                    }))
                  }
                />
                <Toggle
                  label="Available to automations"
                  on={usageFor(selected).automation}
                  onClick={() =>
                    setUsage((p) => ({
                      ...p,
                      [selected.id]: {
                        ...usageFor(selected),
                        automation: !usageFor(selected).automation,
                      },
                    }))
                  }
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={testConnection}>
                  <RefreshCw className="size-3.5" /> Test connection
                </Button>
                <Button size="sm" variant="outline">
                  <KeyRound className="size-3.5" /> Refresh credentials
                </Button>
              </div>
              {testNote ? (
                <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-positive" /> {testNote}
                </p>
              ) : null}
            </section>

            <section className={card}>
              <h2 className="text-sm font-semibold">Field mapping</h2>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                Source fields are mapped to common definitions so agents can reconcile records
                across systems. Original source identifiers and the source of record are always
                preserved, and similar records are never assumed to be identical.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {commonFields.map((f) => (
                  <span
                    key={f}
                    className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </section>

            <section className={card}>
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4" /> Governance and audit
              </h2>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-muted-foreground">
                <li>
                  Credentials are encrypted, never shown to ordinary users, and never included in
                  conversation responses. Rotation and revocation are administrator actions.
                </li>
                <li>
                  Read access and write access are configured separately. Write capable sources
                  require validation, approval rules and audit logging.
                </li>
              </ul>
              <ul className="mt-3 space-y-2 border-t border-border pt-3">
                {sourceAudit.map((a) => (
                  <li key={a.time + a.action} className="text-xs leading-5">
                    <span className="font-medium">{a.action}</span>{" "}
                    <span className="text-muted-foreground">· {a.detail}</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {a.time} · {a.actor}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a data source</DialogTitle>
            <DialogDescription>
              Only approved systems with an available connector, API or authorized integration
              process can be connected. The source stays inactive until the connection is tested and
              the returned data is validated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block text-xs font-medium">
              System name
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Policy administration system"
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:border-ring"
              />
            </label>
            <ol className="space-y-1.5">
              {connectSteps.map((s, i) => (
                <li key={s} className="flex items-center gap-2 text-xs">
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${tested || i < 2 ? "bg-positive/10 text-positive" : "bg-secondary text-muted-foreground"}`}
                  >
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            {!tested ? (
              <Button variant="outline" size="sm" onClick={() => setTested(true)}>
                Test connection
              </Button>
            ) : (
              <p className="flex items-center gap-1.5 text-xs font-medium text-positive">
                <CheckCircle2 className="size-4" /> Test passed and sample data validated. Access
                defaults to read only with no agents assigned, until an administrator configures it.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!tested} onClick={addSource}>
              Save and activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
