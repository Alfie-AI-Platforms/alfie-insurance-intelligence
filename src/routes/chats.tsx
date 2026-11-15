import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  FilePlus2,
  FolderOpen,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlfieMark, PageHeader } from "@/components/alfie-ui";
import { AlfieComposer, AttachmentChip, type Attachment } from "@/components/alfie-composer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { conversationFolders, seedConversations, type Conversation } from "@/lib/workspace-data";

export const Route = createFileRoute("/chats")({ component: ChatsPage });

type ActionState =
  "Draft" | "Awaiting Confirmation" | "Awaiting Approval" | "Executing" | "Completed";
type Reply = {
  agents: string[];
  retrieved: string;
  analysis: string;
  recommendation?: string;
  sources: string[];
  action?: { label: string; detail: string; approval: boolean };
};
type Msg = {
  id: number;
  role: "user" | "alfie";
  text?: string;
  files?: Attachment[];
  reply?: Reply;
  actionState?: ActionState;
};

const seedMessages: Msg[] = [
  { id: 1, role: "user", text: "How are claims performing this quarter?" },
  {
    id: 2,
    role: "alfie",
    reply: {
      agents: ["Claims Intelligence Agent"],
      retrieved:
        "Open claims, reserves and payment status from the Claims Management System, synced 9 minutes ago. 214 claims are open, 38 were opened this quarter.",
      analysis:
        "Severity is concentrated in Commercial Property water damage. 3 claims need attention this week: CL-45817 is awaiting settlement authorization, CL-45821 has a payment discrepancy, and CL-45813 is waiting on a coverage position.",
      recommendation:
        "Start with CL-45817. It is the largest open exposure and the only one blocked on an internal decision rather than external information.",
      sources: ["Claims Management System", "Documents: Claims Handling Manual, section 4.2"],
    },
  },
];

function routeReply(text: string, hasFiles: boolean): Reply {
  const t = text.toLowerCase();
  if (hasFiles)
    return {
      agents: ["Alfie, document analysis"],
      retrieved:
        "The files you attached to this conversation. They stay conversation attachments unless you choose to add them to Documents.",
      analysis:
        "I extracted the key parties, dates, amounts and obligations, and checked for missing information. Anything I could not verify from the file itself is flagged rather than assumed.",
      recommendation:
        "If this file should become part of the organization's permanent records, use Add to Documents and confirm the suggested category and classification.",
      sources: ["Conversation attachments"],
      action: {
        label: "Add attached file to Documents",
        detail:
          "Stores it in the Documents repository with the suggested category and classification, after your confirmation.",
        approval: false,
      },
    };
  if (t.includes("report") || t.includes("portfolio performance"))
    return {
      agents: [
        "Claims Intelligence Agent",
        "Underwriting Agent",
        "Pricing Analysis Agent",
        "Finance Reconciliation Agent",
      ],
      retrieved:
        "This spans departments, so I coordinated four agents. Each retrieved only the information its department permissions allow: claims, submissions, pricing and finance figures.",
      analysis:
        "Combined written premium is up 6.4% while claims expenses rose 9.1%, driven by Commercial Property. The full breakdown is in the draft, separated into what was retrieved, what I analyzed, and what I recommend.",
      recommendation:
        "Review the draft before it goes to management. Figures from the CRM are excluded because that source is stale, and the draft says so.",
      sources: [
        "Claims Management System",
        "Underwriting Platform",
        "Actuarial Data Warehouse",
        "General Ledger and ERP",
      ],
      action: {
        label: "Prepare the monthly portfolio report",
        detail:
          "Creates a draft report in Finance Reports. It is not distributed until you review and approve it.",
        approval: true,
      },
    };
  if (t.includes("claim"))
    return {
      agents: ["Claims Intelligence Agent"],
      retrieved:
        "Claims data from the Claims Management System, synced 9 minutes ago, limited to the claims your role can access.",
      analysis:
        "I compared open claims against reserve movement and the escalation rules in the Claims Handling Manual. The items needing attention are the ones blocked internally, not the largest files.",
      sources: ["Claims Management System", "Documents: Claims Handling Manual"],
    };
  if (t.includes("underwriting") || t.includes("appetite") || t.includes("submission"))
    return {
      agents: ["Underwriting Agent"],
      retrieved:
        "Appetite and guideline information from the Underwriting Platform and the Commercial Auto Underwriting Guidelines in Documents.",
      analysis:
        "The request sits inside current appetite. Where a guideline sets a referral threshold, I have flagged it rather than treating my assessment as a decision.",
      sources: ["Underwriting Platform", "Documents: Commercial Auto Underwriting Guidelines"],
    };
  if (t.includes("renewal") || t.includes("policy"))
    return {
      agents: ["Policy Review Agent"],
      retrieved:
        "Policy and renewal records from the Policy Administration System, which is current.",
      analysis:
        "I matched renewals against claims history and outstanding requirements. Anything that changes a policy record is proposed below, not applied.",
      sources: ["Policy Administration System"],
    };
  if (t.includes("loss ratio") || t.includes("pricing") || t.includes("rate"))
    return {
      agents: ["Pricing Analysis Agent"],
      retrieved: "Experience data from the Actuarial Data Warehouse, refreshed 41 minutes ago.",
      analysis:
        "The movement is concentrated in Commercial Property frequency, not severity. I have separated the data I retrieved from the interpretation, and the underlying figures are available in Pricing & Actuarial.",
      sources: ["Actuarial Data Warehouse"],
    };
  if (
    t.includes("premium") ||
    t.includes("revenue") ||
    t.includes("finance") ||
    t.includes("financial")
  )
    return {
      agents: ["Finance Reconciliation Agent"],
      retrieved:
        "Financial figures from the General Ledger and ERP, synced 12 minutes ago. These are the same figures shown in Finance.",
      analysis:
        "Premium revenue is tracking ahead of last quarter while receivables over 90 days need attention. Sample figures in this workspace are illustrative until your systems are connected.",
      sources: ["General Ledger and ERP", "Finance workspace"],
    };
  if (
    t.includes("procedure") ||
    t.includes("policy say") ||
    t.includes("manual") ||
    t.includes("guideline") ||
    t.includes("document")
  )
    return {
      agents: ["Alfie, document retrieval"],
      retrieved:
        "Internal documents you are authorized to access. I distinguish internal documents from general knowledge in every answer.",
      analysis:
        "The relevant passage is in the Claims Handling Manual, section 4.2, which covers escalation when a claim stays unassigned or a reserve crosses the review threshold. The full document is in Documents if you want the surrounding context.",
      sources: ["Documents: Claims Handling Manual, section 4.2"],
    };
  if (t.includes("automat"))
    return {
      agents: ["Alfie, automation design"],
      retrieved:
        "Your existing automations and the templates in the Automations library, so the suggestion does not duplicate something already running.",
      analysis:
        "This task repeats on a pattern that fits a scheduled automation with a human approval step. I can draft it, but a new recurring workflow stays inactive until it is configured, tested and approved.",
      sources: ["Automations library"],
      action: {
        label: "Draft this as an automation",
        detail: "Creates a draft in Automations. It does not run or activate anything.",
        approval: false,
      },
    };
  return {
    agents: ["Alfie"],
    retrieved:
      "I checked the Documents and Data Sources your role can access before answering, and I will cite them whenever an answer uses internal information.",
    analysis:
      "Ask me about claims, underwriting, policies, pricing, finance, documents or workflows. I coordinate the right specialist agent behind the scenes, so you do not need to pick one, and I will always separate what I retrieved, what I analyzed, what I recommend, and what I have only proposed.",
    sources: ["Authorized Documents and Data Sources"],
  };
}

const suggestions = [
  "Summarize claims performance this quarter",
  "What does our escalation procedure say?",
  "Prepare the monthly portfolio performance report",
  "Which renewals need attention in the next 60 days?",
  "Explain the loss ratio movement",
  "Turn this into an automation",
];

function ChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [activeId, setActiveId] = useState("conv-1");
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("All conversations");
  const [showArchived, setShowArchived] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [threads, setThreads] = useState<Record<string, Msg[]>>({ "conv-1": seedMessages });
  const [draft, setDraft] = useState("");

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const messages = (active && threads[active.id]) || [
    {
      id: 0,
      role: "alfie" as const,
      reply: {
        agents: ["Alfie"],
        retrieved: `Context restored from this conversation: ${active?.preview ?? ""}`,
        analysis:
          "Ask a follow up and I will continue from where this conversation left off, using only the information your role can access.",
        sources: ["Conversation history"],
      },
    },
  ];

  const visible = useMemo(
    () =>
      conversations.filter((c) => {
        if (!showArchived && c.archived && c.id !== activeId) return false;
        if (folder !== "All conversations" && c.folder !== folder) return false;
        if (search && !`${c.title} ${c.preview}`.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      }),
    [conversations, folder, search, showArchived, activeId],
  );

  function newConversation() {
    const id = `conv-${Date.now()}`;
    setConversations((prev) => [
      {
        id,
        title: "New conversation",
        folder: "General",
        updated: "Just now",
        preview: "No messages yet.",
      },
      ...prev,
    ]);
    setActiveId(id);
    setThreads((prev) => ({ ...prev, [id]: [] }));
  }

  function send(text: string, files: Attachment[]) {
    if (!active) return;
    const reply = routeReply(text, files.length > 0);
    const userMsg: Msg = { id: Date.now(), role: "user", text, files };
    const alfieMsg: Msg = {
      id: Date.now() + 1,
      role: "alfie",
      reply,
      ...(reply.action ? { actionState: "Awaiting Confirmation" as ActionState } : {}),
    };
    setDraft("");
    setThreads((prev) => ({
      ...prev,
      [active.id]: [...(prev[active.id] ?? messages.filter((m) => m.id !== 0)), userMsg, alfieMsg],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              title: c.title === "New conversation" ? text.slice(0, 44) : c.title,
              updated: "Just now",
              preview: reply.analysis.slice(0, 90),
            }
          : c,
      ),
    );
  }

  function advanceAction(msgId: number, state: ActionState) {
    if (!active) return;
    setThreads((prev) => ({
      ...prev,
      [active.id]: (prev[active.id] ?? []).map((m) =>
        m.id === msgId ? { ...m, actionState: state } : m,
      ),
    }));
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-8 lg:px-10">
        <PageHeader title="Chat" description="The general workspace for working with Alfie across every department. Unlike the conversations inside Claims, Underwriting, Policy, Pricing or Finance, a chat here is not tied to one record. Alfie coordinates the right specialist agents and uses only the Documents and Data Sources you are authorized to access." actions={<>
          <Button onClick={newConversation}>
            <Plus className="size-4" /> New conversation
          </Button>
        </>} />

        <div className="mt-5 grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Conversation list */}
          <aside className="rounded-2xl border border-border bg-card">
            <div className="space-y-2 border-b border-border p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations"
                  className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-xs outline-none focus:border-ring"
                />
              </div>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="select-chevron h-9 w-full rounded-lg border border-border bg-background pl-2.5 text-xs outline-none focus:border-ring"
              >
                {conversationFolders.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="size-3.5 accent-primary"
                />{" "}
                Show archived
              </label>
            </div>
            <div className="max-h-[560px] space-y-1 overflow-y-auto p-2">
              {visible.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-xl px-3 py-2.5 ${c.id === activeId ? "bg-primary/10" : "hover:bg-secondary/60"}`}
                >
                  {renaming === c.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setConversations((prev) =>
                          prev.map((x) =>
                            x.id === c.id ? { ...x, title: renameText || x.title } : x,
                          ),
                        );
                        setRenaming(null);
                      }}
                    >
                      <input
                        autoFocus
                        value={renameText}
                        onChange={(e) => setRenameText(e.target.value)}
                        className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs outline-none focus:border-ring"
                      />
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      className="w-full text-left"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-semibold">{c.title}</span>
                        {c.archived ? (
                          <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Archived
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        {c.preview}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <FolderOpen className="size-3" /> {c.folder} · {c.updated}
                      </span>
                    </button>
                  )}
                  {c.id === activeId && renaming !== c.id ? (
                    <div className="mt-1.5 flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRenaming(c.id);
                          setRenameText(c.title);
                        }}
                        className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-muted-foreground hover:bg-secondary"
                      >
                        <Pencil className="size-3" /> Rename
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConversations((prev) =>
                            prev.map((x) => (x.id === c.id ? { ...x, archived: !x.archived } : x)),
                          )
                        }
                        className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-muted-foreground hover:bg-secondary"
                      >
                        <Archive className="size-3" /> {c.archived ? "Unarchive" : "Archive"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3" /> Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
              {visible.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                  No conversations match.
                </p>
              ) : null}
            </div>
          </aside>

          {/* Conversation */}
          <section className="flex min-h-[640px] flex-col rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
              <div>
                <p className="text-sm font-semibold">{active?.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {active?.folder} · Context is kept inside this conversation only
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3.5 text-positive" /> Permissions checked on every
                request
              </span>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {messages.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Start the conversation below. You can attach files, ask across departments, or ask
                  Alfie to prepare work for your approval.
                </p>
              ) : null}
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex flex-col items-end">
                    <div className="flex max-w-[85%] items-start gap-2.5">
                      <div className="rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground">
                        {m.text}
                      </div>
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                        <User className="size-3.5" />
                      </div>
                    </div>
                    {m.files?.length ? (
                      <div className="mt-2 flex flex-wrap justify-end gap-2">
                        {m.files.map((f) => (
                          <AttachmentChip key={f.id} file={f} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : m.reply ? (
                  <div key={m.id} className="max-w-[94%]">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <AlfieMark className="size-6 rounded-md" />
                      <span className="text-xs font-semibold">Alfie</span>
                      <span className="text-[10px] text-muted-foreground">
                        via {m.reply.agents.join(", ")}
                      </span>
                    </div>
                    <div className="space-y-3 rounded-2xl rounded-bl-md border border-border bg-background px-4 py-3.5 text-sm leading-6">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Retrieved
                        </p>
                        <p className="mt-0.5">{m.reply.retrieved}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Analysis
                        </p>
                        <p className="mt-0.5">{m.reply.analysis}</p>
                      </div>
                      {m.reply.recommendation ? (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Recommendation
                          </p>
                          <p className="mt-0.5">{m.reply.recommendation}</p>
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-1.5">
                        {m.reply.sources.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            Source: {s}
                          </span>
                        ))}
                      </div>
                      {m.reply.action ? (
                        <div className="rounded-xl border border-border bg-card p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Proposed action, not executed
                          </p>
                          <p className="mt-1 text-sm font-semibold">{m.reply.action.label}</p>
                          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                            {m.reply.action.detail}{" "}
                            {m.reply.action.approval
                              ? "Approval is required because this affects records outside this conversation."
                              : "This stays inside your workspace."}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning-foreground">
                              State: {m.actionState}
                            </span>
                            {m.actionState === "Awaiting Confirmation" ? (
                              <Button
                                size="sm"
                                onClick={() =>
                                  advanceAction(
                                    m.id,
                                    m.reply!.action!.approval ? "Awaiting Approval" : "Executing",
                                  )
                                }
                              >
                                Confirm
                              </Button>
                            ) : null}
                            {m.actionState === "Awaiting Approval" ? (
                              <Button size="sm" onClick={() => advanceAction(m.id, "Executing")}>
                                Record approval
                              </Button>
                            ) : null}
                            {m.actionState === "Executing" ? (
                              <Button size="sm" onClick={() => advanceAction(m.id, "Completed")}>
                                Finish execution
                              </Button>
                            ) : null}
                            {m.actionState === "Completed" ? (
                              <span className="flex items-center gap-1 text-xs font-medium text-positive">
                                <CheckCircle2 className="size-3.5" /> Executed and written to the
                                audit history
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null,
              )}
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s, [])}
                    className="rounded-full border border-border px-3 py-1.5 text-[11px] font-medium hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-border px-5 py-4">
              <AlfieComposer
                onSend={send}
                value={draft}
                onChange={setDraft}
                placeholder="Ask Alfie anything across claims, underwriting, policy, pricing, finance or documents"
              />
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <FilePlus2 className="size-3.5" /> Files you attach stay in this conversation. Alfie
                will offer Add to Documents separately if a file should become a permanent record.
              </p>
            </div>
          </section>
        </div>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this conversation?</DialogTitle>
            <DialogDescription>
              Deletion follows the organization's retention policy. Conversations under a legal hold
              or linked to an open audit cannot be deleted, and deletions are recorded in the audit
              history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Keep conversation
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  setConversations((prev) => prev.filter((c) => c.id !== deleteTarget.id));
                  if (deleteTarget.id === activeId) setActiveId("conv-1");
                }
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
