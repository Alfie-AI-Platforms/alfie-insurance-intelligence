export type DocSection = { heading: string; body: string };

/**
 * The in-app document reader. Every file surface (Documents library, claim
 * evidence, submission documents, policy documents) renders its preview
 * through this sheet so a document is read inside the software, in the
 * serif document face, instead of being downloaded to be read elsewhere.
 * Downloads stay available as a secondary action on each surface; closing
 * a preview is the dialog's corner X, never a footer button.
 */
export function DocumentSheet({
  summary,
  sections,
  note,
}: {
  summary: string;
  sections: DocSection[];
  note?: string;
}) {
  return (
    <div className="max-h-[55vh] overflow-y-auto pr-1">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="font-display text-[15px] leading-7">{summary}</p>
        {sections.map((s) => (
          <div key={s.heading}>
            <h3 className="mt-5 font-display text-base font-semibold">{s.heading}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{s.body}</p>
          </div>
        ))}
        <p className="mt-6 border-t border-border pt-3 text-[12px] leading-4 text-muted-foreground">
          {note ??
            "Preview renders the document in place so it can be read without downloading. Sample content, shown until your systems are connected."}
        </p>
      </div>
    </div>
  );
}
