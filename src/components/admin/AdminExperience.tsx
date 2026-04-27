import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchExperience, upsertExperience, deleteExperience, type Experience, uploadMedia } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X, Upload, Briefcase, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Internship", "Freelance", "Contract", "Volunteer"];
const EXP_STATUSES = ["Active", "Ongoing", "Completed", "Paused"];

const EMPTY: Partial<Experience> = {
  company: "",
  role: "",
  employment_type: "",
  location: "",
  duration: "",
  start_date: "",
  end_date: "",
  description: "",
  responsibilities: "",
  achievements: "",
  technologies: [],
  reference_contact: "",
  attachment_url: "",
  logo_url: "",
  status: "",
  is_current: false,
  sort_order: 0,
};

export default function AdminExperience() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: items = [] } = useQuery({ queryKey: ["experience"], queryFn: fetchExperience });
  const [editing, setEditing] = useState<Partial<Experience> | null>(null);
  const [techInput, setTechInput] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail?.tab === "experience") {
        setEditing({ ...EMPTY });
        setTechInput("");
      }
    };
    window.addEventListener("admin-fab-add", handler);
    return () => window.removeEventListener("admin-fab-add", handler);
  }, []);

  const saveMutation = useMutation({
    mutationFn: (e: any) => upsertExperience(e),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["experience"] }); setEditing(null); toast({ title: "Saved!" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["experience"] }); toast({ title: "Deleted" }); },
  });

  const set = (k: keyof Experience, v: any) => setEditing((p) => ({ ...(p ?? {}), [k]: v }));
  const techs: string[] = ((editing as any)?.technologies ?? []) as string[];

  const addTech = () => {
    const v = techInput.trim();
    if (!v) return;
    set("technologies" as any, [...techs, v]);
    setTechInput("");
  };
  const removeTech = (i: number) => set("technologies" as any, techs.filter((_, idx) => idx !== i));

  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1.5 block";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Experience</h2>
            <p className="text-xs text-muted-foreground">{items.length} entries</p>
          </div>
        </div>
        <button onClick={() => { setEditing({ ...EMPTY }); setTechInput(""); }} className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card p-5 md:p-6 space-y-5 border border-primary/15">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{editing.id ? "Edit" : "New"} Experience</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>

              {/* Core */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Company *</label>
                  <input value={editing.company ?? ""} onChange={(e) => set("company", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Role / Title</label>
                  <input value={editing.role ?? ""} onChange={(e) => set("role", e.target.value)} className={inputCls} placeholder="e.g. Frontend Engineer" />
                </div>
                <div>
                  <label className={labelCls}>Employment Type</label>
                  <select value={(editing as any).employment_type ?? ""} onChange={(e) => set("employment_type" as any, e.target.value)} className={inputCls}>
                    <option value="">Select…</option>
                    {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input value={(editing as any).location ?? ""} onChange={(e) => set("location" as any, e.target.value)} className={inputCls} placeholder="Remote / City, Country" />
                </div>
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input type="month" value={(editing as any).start_date ?? ""} onChange={(e) => set("start_date" as any, e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>End Date</label>
                  <input type="month" value={(editing as any).end_date ?? ""} onChange={(e) => set("end_date" as any, e.target.value)} className={inputCls} placeholder="Leave blank if present" disabled={!!(editing as any).is_current} />
                </div>
                <div>
                  <label className={labelCls}>Currently Working Here?</label>
                  <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 cursor-pointer">
                    <input type="checkbox" checked={!!(editing as any).is_current} onChange={(e) => { set("is_current" as any, e.target.checked); if (e.target.checked) set("end_date" as any, ""); }} className="w-4 h-4 accent-primary" />
                    <span className="text-sm">Yes, this is my current role</span>
                  </label>
                </div>
                <div>
                  <label className={labelCls}>Employment Status</label>
                  <select value={(editing as any).status ?? ""} onChange={(e) => set("status" as any, e.target.value)} className={inputCls}>
                    <option value="">Select…</option>
                    {EXP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Duration (display label)</label>
                  <input value={editing.duration ?? ""} onChange={(e) => set("duration", e.target.value)} className={inputCls} placeholder="e.g. Jan 2023 — Present" />
                </div>
                <div>
                  <label className={labelCls}>Sort Order</label>
                  <input type="number" value={editing.sort_order ?? 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} className={inputCls} />
                </div>
              </div>

              {/* Long fields */}
              <div>
                <label className={labelCls}>Short Description</label>
                <textarea value={editing.description ?? ""} onChange={(e) => set("description", e.target.value)} className={`${inputCls} min-h-[80px] resize-y`} placeholder="One-paragraph summary of the role" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Key Responsibilities</label>
                  <textarea value={(editing as any).responsibilities ?? ""} onChange={(e) => set("responsibilities" as any, e.target.value)} className={`${inputCls} min-h-[100px] resize-y`} placeholder="• Built …&#10;• Led …&#10;• Owned …" />
                </div>
                <div>
                  <label className={labelCls}>Achievements / Impact</label>
                  <textarea value={(editing as any).achievements ?? ""} onChange={(e) => set("achievements" as any, e.target.value)} className={`${inputCls} min-h-[100px] resize-y`} placeholder="e.g. Improved performance by 20%, shipped X to 10k users…" />
                </div>
              </div>

              {/* Technologies */}
              <div>
                <label className={labelCls}>Technologies / Skills Used</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }}
                    className={`${inputCls} flex-1`}
                    placeholder="Type and press Enter (e.g. React, TypeScript)"
                  />
                  <button type="button" onClick={addTech} className="shrink-0 px-4 py-2.5 rounded-xl bg-secondary/70 border border-border/50 text-sm hover:bg-muted">Add</button>
                </div>
                {techs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {techs.map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs">
                        {t}
                        <button type="button" onClick={() => removeTech(i)} className="opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Reference / Contact</label>
                  <input value={(editing as any).reference_contact ?? ""} onChange={(e) => set("reference_contact" as any, e.target.value)} className={inputCls} placeholder="Supervisor name, email, or LinkedIn" />
                </div>
                <div>
                  <label className={labelCls}>Attachment / Portfolio Link</label>
                  <div className="flex gap-2">
                    <input value={(editing as any).attachment_url ?? ""} onChange={(e) => set("attachment_url" as any, e.target.value)} className={`${inputCls} flex-1`} placeholder="https://github.com/… or demo URL" />
                    <label className="shrink-0 px-4 py-2.5 rounded-xl bg-secondary/70 border border-border/50 text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <input type="file" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadMedia(file, `experience/att-${Date.now()}-${file.name}`);
                          set("attachment_url" as any, url);
                        } catch (error: any) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); }
                      }} />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Company Logo</label>
                <div className="flex gap-2">
                  <input value={editing.logo_url ?? ""} onChange={(e) => set("logo_url", e.target.value)} className={`${inputCls} flex-1`} />
                  <label className="shrink-0 px-4 py-2.5 rounded-xl bg-secondary/70 border border-border/50 text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadMedia(file, `experience/logo-${Date.now()}`);
                        set("logo_url", url);
                      } catch (error: any) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); }
                    }} />
                  </label>
                </div>
              </div>

              <button onClick={() => saveMutation.mutate(editing as any)} disabled={saveMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {items.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/15 transition-all group"
          >
            {entry.logo_url ? (
              <img src={entry.logo_url} alt={entry.company} className="w-12 h-12 rounded-xl object-cover border border-border/50 shrink-0" loading="lazy" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{entry.role || entry.company}</p>
                {(entry as any).employment_type && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-wide">{(entry as any).employment_type}</span>
                )}
                {((entry as any).is_current || (entry as any).status === "Active" || (entry as any).status === "Ongoing") && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {(entry as any).status || "Current"}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {entry.company}
                {(entry as any).location ? ` • ${(entry as any).location}` : ""}
                {entry.duration
                  ? ` • ${entry.duration}`
                  : ((entry as any).start_date || (entry as any).end_date || (entry as any).is_current)
                    ? ` • ${(entry as any).start_date || ""} — ${(entry as any).is_current ? "Present" : ((entry as any).end_date || "")}`
                    : ""}
              </p>
              {entry.description && <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{entry.description}</p>}
              {((entry as any).technologies?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {((entry as any).technologies as string[]).slice(0, 6).map((t, idx) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/70 text-muted-foreground">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-1.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {(entry as any).attachment_url && (
                <a href={(entry as any).attachment_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-secondary/70 hover:bg-muted"><ExternalLink className="w-3.5 h-3.5" /></a>
              )}
              <button onClick={() => setEditing(entry)} className="text-xs px-3 py-1.5 rounded-lg bg-secondary/70 hover:bg-muted font-medium">Edit</button>
              <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(entry.id); }} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive/70" /></button>
            </div>
          </motion.div>
        ))}
      </div>
      {items.length === 0 && !editing && (
        <div className="text-center py-12">
          <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No experience entries yet</p>
        </div>
      )}
    </div>
  );
}
