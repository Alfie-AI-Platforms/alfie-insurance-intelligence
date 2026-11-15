import { useRef, useState, type DragEvent } from "react";
import { FileSpreadsheet, FileText, ImagePlus, Paperclip, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Attachment = { id: string; name: string; size: number; type: string; isImage: boolean; url?: string | undefined };

const ACCEPT = ".pdf,.docx,.xlsx,.csv,.txt,.jpg,.jpeg,.png";
const IMAGE_ACCEPT = ".jpg,.jpeg,.png";
export const formatSize = (bytes: number) => (bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`);
export const fileExt = (name: string) => (name.split(".").pop() ?? "file").toUpperCase();

export function FileGlyph({ name, className = "size-4" }: { name: string; className?: string }) {
  const ext = fileExt(name);
  return ext === "XLSX" || ext === "CSV" ? <FileSpreadsheet className={className} /> : <FileText className={className} />;
}

export function AttachmentChip({ file, onRemove }: { file: Attachment; onRemove?: (() => void) | undefined }) {
  return <div className="relative flex items-center gap-2 rounded-lg border border-border bg-background p-1.5 pr-3">
    {file.isImage && file.url ? <img src={file.url} alt={file.name} className="size-10 rounded-md object-cover" /> : <div className="flex size-10 items-center justify-center rounded-md bg-secondary text-muted-foreground"><FileGlyph name={file.name} /></div>}
    <div className="min-w-0"><p className="max-w-[140px] truncate text-xs font-medium">{file.name}</p><p className="text-[10px] text-muted-foreground">{fileExt(file.name)} · {formatSize(file.size)}</p></div>
    {onRemove ? <button type="button" onClick={onRemove} aria-label={`Remove ${file.name}`} className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border border-border bg-popover text-muted-foreground hover:text-foreground"><X className="size-3" /></button> : null}
  </div>;
}

export function AlfieComposer({ placeholder, onSend, value, onChange, pending }: { placeholder: string; onSend: (text: string, files: Attachment[]) => void; value: string; onChange: (value: string) => void; pending?: Attachment[] }) {
  const [files, setFiles] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const all = [...(pending ?? []), ...files];

  const add = (list: FileList | null) => {
    if (!list) return;
    const allowed = ACCEPT.split(",");
    const next = Array.from(list).filter((f) => allowed.some((ext) => f.name.toLowerCase().endsWith(ext))).map((f) => {
      const isImage = /\.(jpe?g|png)$/i.test(f.name);
      return { id: crypto.randomUUID(), name: f.name, size: f.size, type: f.type, isImage, url: isImage ? URL.createObjectURL(f) : undefined };
    });
    setFiles((current) => [...current, ...next]);
  };
  const submit = () => {
    if (!value.trim() && all.length === 0) return;
    onSend(value.trim(), all);
    setFiles([]);
    setTimeout(() => textRef.current?.focus(), 0);
  };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files); };

  return <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} className={`relative rounded-2xl border bg-card p-2 shadow-workspace transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-brand-cyan/25 ${dragging ? "border-primary bg-secondary" : "border-border"}`}>
    {dragging ? <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl text-sm font-medium text-primary">Drop files to use in this conversation</div> : null}
    {all.length ? <div className="flex flex-wrap gap-2 px-2 pb-2 pt-2">{all.map((f) => <AttachmentChip key={f.id} file={f} onRemove={files.some((x) => x.id === f.id) ? () => setFiles((c) => c.filter((x) => x.id !== f.id)) : undefined} />)}</div> : null}
    {all.length ? <p className="px-3 text-[10px] text-muted-foreground">{all.length} attachment{all.length > 1 ? "s" : ""} for this conversation only — not added to any permanent record.</p> : null}
    <textarea ref={textRef} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }} rows={2} placeholder={placeholder} className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
    <div className="flex items-center gap-1 px-1">
      <input ref={fileRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      <input ref={imageRef} type="file" multiple accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => fileRef.current?.click()} aria-label="Add attachment" title="Add attachment (PDF, DOCX, XLSX, CSV, TXT)"><Paperclip className="size-4" /></Button>
      <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => imageRef.current?.click()} aria-label="Upload image" title="Upload image (JPG, PNG)"><ImagePlus className="size-4" /></Button>
      <span className="ml-1 hidden text-[10px] text-muted-foreground sm:inline">Drag & drop files or images</span>
      <Button type="button" variant="ghost" size="icon" onClick={submit} disabled={!value.trim() && all.length === 0} className="alfie-gradient ml-auto size-8 rounded-full text-white hover:text-white hover:opacity-90" aria-label="Send"><Send className="size-3.5" /></Button>
    </div>
  </div>;
}
