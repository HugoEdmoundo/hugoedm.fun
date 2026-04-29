import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEducation, upsertEducation, deleteEducation, type Education, uploadMedia } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X, Upload, GraduationCap, ExternalLink, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EMPTY: Partial<Education> = {
  education_type: "Formal",
  institution: "",
  degree: "",
  field_of_study: "",
  year: "",
  start_date: "",
  end_date: "",
  location: "",
  achievements: "",
  activities: "",
  certificate_url: "",
  logo_url: "",
  status: "",
  expected_graduation: "",
  program_name: "",
  provider: "",
  duration: "",
  credential_id: "",
  topics: "",
  projects_url: "",
  sort_order: 0,
} as any;

const EDU_STATUSES = ["Completed", "Current", "In Progress", "Expected Graduation", "On Hold"];

// Auto-compute "year" display from start_date/end_date (YYYY-MM strings)
function computeYearLabel(start?: string, end?: string, ongoing?: boolean, expected?: string) {
  const s = (start || "").slice(0, 4);
  const e = ongoing ? "Present" : (end || "").slice(0, 4);
  if (!s && !e) return "";
  const base = `${s || "?"} — ${e || "Present"}`;
  return expected ? `${base} (${expected})` : base;
}

export default function AdminEducation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: items = [] } = useQuery({ queryKey: ["education"], queryFn: fetchEducation });
  const [editing, setEditing] = useState<Partial<Education> | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail?.tab === "education") setEditing({ ...EMPTY });
    };
    window.addEventListener("admin-fab-add", handler);
    return () => window.removeEventListener("admin-fab-add", handler);
  }, []);

  const saveMutation = useMutation({
    mutationFn: (e: any) => {
      // Auto-generate year from dates
      const ongoing = ["Current", "In Progress", "Expected Graduation"].includes(e.status);
      const autoYear = computeYearLabel(e.start_date, e.end_date, ongoing, e.expected_graduation);
      return upsertEducation({ ...e, year: autoYear });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["education"] }); setEditing(null); toast({ title: "Saved!" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEducation,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["education"] }); toast({ title: "Deleted" }); },
  });

  const set = (k: string, v: any) => setEditing((p) => ({ ...(p ?? {}), [k]: v }));

  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1.5 block";

  const eduType = (editing as any)?.education_type || "Formal";
  const isFormal = eduType === "Formal";
  const ongoing = ["Current", "In Progress", "Expected Graduation"].includes((editing as any)?.status);
  const previewYear = computeYearLabel((editing as any)?.start_date, (editing as any)?.end_date, ongoing, (editing as any)?.expected_graduation);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Education</h2>
            <p className="text-xs text-muted-foreground">{items.length} entries · Formal & Non-Formal</p>
          </div>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card p-5 md:p-6 space-y-5 border border-primary/15">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{(editing as any).id ? "Edit" : "New"} Education</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>

              {/* Type switcher */}
              <div>
                <label className={labelCls}>Education Type</label>
                <div className="flex gap-2">
                  {(["Formal", "Non-Formal"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set("education_type", t)}
                      className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        eduType === t
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-secondary/30 border-border/40 text-muted-foreground hover:bg-secondary/60"
                      }`}
                    >
                      {t === "Formal" ? <GraduationCap className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                  {isFormal ? "School / University / Degree program" : "Bootcamp, online course, workshop, certification"}
                </p>
              </div>

              {/* Core */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isFormal ? (
                  <>
                    <div>
                      <label className={labelCls}>Institution Name *</label>
                      <input value={editing.institution ?? ""} onChange={(e) => set("institution", e.target.value)} className={inputCls} placeholder="e.g. Universitas Indonesia" />
                    </div>
                    <div>
                      <label className={labelCls}>Degree / Program</label>
                      <input value={editing.degree ?? ""} onChange={(e) => set("degree", e.target.value)} className={inputCls} placeholder="e.g. Bachelor of Computer Science" />
                    </div>
                    <div>
                      <label className={labelCls}>Field of Study</label>
                      <input value={(editing as any).field_of_study ?? ""} onChange={(e) => set("field_of_study", e.target.value)} className={inputCls} placeholder="e.g. Software Engineering" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className={labelCls}>Program Name *</label>
                      <input value={(editing as any).program_name ?? ""} onChange={(e) => set("program_name", e.target.value)} className={inputCls} placeholder="e.g. Fullstack Web Development Bootcamp" />
                    </div>
                    <div>
                      <label className={labelCls}>Provider / Institution *</label>
                      <input value={(editing as any).provider ?? editing.institution ?? ""} onChange={(e) => { set("provider", e.target.value); set("institution", e.target.value); }} className={inputCls} placeholder="e.g. Hacktiv8, Udemy, Coursera" />
                    </div>
                    <div>
                      <label className={labelCls}>Duration</label>
                      <input value={(editing as any).duration ?? ""} onChange={(e) => set("duration", e.target.value)} className={inputCls} placeholder="e.g. 12 weeks" />
                    </div>
                  </>
                )}
                <div>
                  <label className={labelCls}>Location</label>
                  <input value={(editing as any).location ?? ""} onChange={(e) => set("location", e.target.value)} className={inputCls} placeholder="City, Country / Online" />
                </div>
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input type="month" value={(editing as any).start_date ?? ""} onChange={(e) => set("start_date", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>End Date</label>
                  <input type="month" value={(editing as any).end_date ?? ""} onChange={(e) => set("end_date", e.target.value)} className={inputCls} placeholder="Leave blank if ongoing" disabled={ongoing} />
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Disabled when status is ongoing — shows as "Present"</p>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={(editing as any).status ?? ""} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                    <option value="">Select…</option>
                    {EDU_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {isFormal && (
                  <div>
                    <label className={labelCls}>Expected Graduation</label>
                    <input value={(editing as any).expected_graduation ?? ""} onChange={(e) => set("expected_graduation", e.target.value)} className={inputCls} placeholder="e.g. Expected 2027" />
                  </div>
                )}
                <div>
                  <label className={labelCls}>Sort Order</label>
                  <input type="number" value={editing.sort_order ?? 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} className={inputCls} />
                </div>
              </div>

              {/* Auto year preview */}
              <div className="rounded-xl bg-primary/5 border border-primary/15 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-mono text-primary/80">Display year (auto): </span>
                {previewYear || <em className="text-muted-foreground/50">— fill start/end date to preview —</em>}
              </div>

              {/* Long fields */}
              {!isFormal && (
                <div>
                  <label className={labelCls}>Key Topics / Curriculum</label>
                  <textarea value={(editing as any).topics ?? ""} onChange={(e) => set("topics", e.target.value)} className={`${inputCls} min-h-[80px] resize-y`} placeholder="React, Node.js, MongoDB, REST APIs…" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Achievements</label>
                  <textarea value={(editing as any).achievements ?? ""} onChange={(e) => set("achievements", e.target.value)} className={`${inputCls} min-h-[90px] resize-y`} placeholder={isFormal ? "GPA 3.9, Dean's List, scholarships…" : "Graduated with Distinction, Top 10 Final Project…"} />
                </div>
                <div>
                  <label className={labelCls}>{isFormal ? "Activities" : "Notes / Activities"}</label>
                  <textarea value={(editing as any).activities ?? ""} onChange={(e) => set("activities", e.target.value)} className={`${inputCls} min-h-[90px] resize-y`} placeholder={isFormal ? "Organizations, clubs, committees…" : "Optional notes…"} />
                </div>
              </div>

              {!isFormal && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Credential ID</label>
                    <input value={(editing as any).credential_id ?? ""} onChange={(e) => set("credential_id", e.target.value)} className={inputCls} placeholder="e.g. UC-1a2b3c4d" />
                  </div>
                  <div>
                    <label className={labelCls}>Projects / Portfolio Link</label>
                    <input value={(editing as any).projects_url ?? ""} onChange={(e) => set("projects_url", e.target.value)} className={inputCls} placeholder="https://github.com/… or demo URL" />
                  </div>
                </div>
              )}

              {/* URLs / files */}
              <div>
                <label className={labelCls}>Certificate / Transcript Link</label>
                <div className="flex gap-2">
                  <input value={(editing as any).certificate_url ?? ""} onChange={(e) => set("certificate_url", e.target.value)} className={`${inputCls} flex-1`} placeholder="https://… or upload a file" />
                  <label className="shrink-0 px-4 py-2.5 rounded-xl bg-secondary/70 border border-border/50 text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <input type="file" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadMedia(file, `education/cert-${Date.now()}-${file.name}`);
                        set("certificate_url", url);
                      } catch (error: any) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); }
                    }} />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Logo</label>
                <div className="flex gap-2">
                  <input value={editing.logo_url ?? ""} onChange={(e) => set("logo_url", e.target.value)} className={`${inputCls} flex-1`} />
                  <label className="shrink-0 px-4 py-2.5 rounded-xl bg-secondary/70 border border-border/50 text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadMedia(file, `education/logo-${Date.now()}`);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((entry, i) => {
          const e = entry as any;
          const isNonFormal = e.education_type === "Non-Formal";
          const ongoingItem = ["Current", "In Progress", "Expected Graduation"].includes(e.status);
          const dateLabel = computeYearLabel(e.start_date, e.end_date, ongoingItem, e.expected_graduation);
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 flex items-center gap-4 hover:border-primary/15 transition-all group"
            >
              {entry.logo_url ? (
                <img src={entry.logo_url} alt={entry.institution} className="w-12 h-12 rounded-xl object-cover border border-border/50 shrink-0" loading="lazy" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  {isNonFormal ? <BookOpen className="w-5 h-5 text-primary" /> : <GraduationCap className="w-5 h-5 text-primary" />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold truncate">{isNonFormal ? (e.program_name || entry.degree) : (entry.degree || e.field_of_study)}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wide font-mono ${isNonFormal ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" : "bg-blue-500/10 border border-blue-500/30 text-blue-400"}`}>
                    {isNonFormal ? "Non-Formal" : "Formal"}
                  </span>
                  {e.status && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-wide">{e.status}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{isNonFormal ? (e.provider || entry.institution) : entry.institution}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5 truncate">
                  {dateLabel || entry.year}
                  {e.duration ? ` • ${e.duration}` : ""}
                  {e.location ? ` • ${e.location}` : ""}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {e.certificate_url && (
                  <a href={e.certificate_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-secondary/70 hover:bg-muted"><ExternalLink className="w-3.5 h-3.5" /></a>
                )}
                <button onClick={() => setEditing(entry)} className="text-xs px-3 py-1.5 rounded-lg bg-secondary/70 hover:bg-muted font-medium">Edit</button>
                <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(entry.id); }} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive/70" /></button>
              </div>
            </motion.div>
          );
        })}
      </div>
      {items.length === 0 && !editing && (
        <div className="text-center py-12">
          <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No education entries yet</p>
        </div>
      )}
    </div>
  );
}
