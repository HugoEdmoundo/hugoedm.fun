import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEducation, upsertEducation, deleteEducation, type Education, uploadMedia } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X, Upload, GraduationCap, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EMPTY: Partial<Education> = {
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
  sort_order: 0,
};

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
    mutationFn: (e: any) => upsertEducation(e),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["education"] }); setEditing(null); toast({ title: "Saved!" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEducation,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["education"] }); toast({ title: "Deleted" }); },
  });

  const set = (k: keyof Education, v: any) => setEditing((p) => ({ ...(p ?? {}), [k]: v }));

  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1.5 block";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Education</h2>
            <p className="text-xs text-muted-foreground">{items.length} entries</p>
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
                <h3 className="font-semibold text-sm">{editing.id ? "Edit" : "New"} Education</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>

              {/* Core */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <input value={(editing as any).field_of_study ?? ""} onChange={(e) => set("field_of_study" as any, e.target.value)} className={inputCls} placeholder="e.g. Software Engineering" />
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input value={(editing as any).location ?? ""} onChange={(e) => set("location" as any, e.target.value)} className={inputCls} placeholder="City, Country" />
                </div>
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input type="month" value={(editing as any).start_date ?? ""} onChange={(e) => set("start_date" as any, e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>End Date</label>
                  <input type="month" value={(editing as any).end_date ?? ""} onChange={(e) => set("end_date" as any, e.target.value)} className={inputCls} placeholder="Leave blank if ongoing" />
                </div>
                <div>
                  <label className={labelCls}>Year (display label)</label>
                  <input value={editing.year ?? ""} onChange={(e) => set("year", e.target.value)} className={inputCls} placeholder="e.g. 2020 — 2024" />
                </div>
                <div>
                  <label className={labelCls}>Sort Order</label>
                  <input type="number" value={editing.sort_order ?? 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} className={inputCls} />
                </div>
              </div>

              {/* Long fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Achievements</label>
                  <textarea value={(editing as any).achievements ?? ""} onChange={(e) => set("achievements" as any, e.target.value)} className={`${inputCls} min-h-[90px] resize-y`} placeholder="GPA 3.9 / 4.0, Dean's List, scholarships, key projects…" />
                </div>
                <div>
                  <label className={labelCls}>Activities</label>
                  <textarea value={(editing as any).activities ?? ""} onChange={(e) => set("activities" as any, e.target.value)} className={`${inputCls} min-h-[90px] resize-y`} placeholder="Organizations, clubs, committees…" />
                </div>
              </div>

              {/* URLs / files */}
              <div>
                <label className={labelCls}>Certificate / Transcript Link</label>
                <div className="flex gap-2">
                  <input value={(editing as any).certificate_url ?? ""} onChange={(e) => set("certificate_url" as any, e.target.value)} className={`${inputCls} flex-1`} placeholder="https://… or upload a file" />
                  <label className="shrink-0 px-4 py-2.5 rounded-xl bg-secondary/70 border border-border/50 text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <input type="file" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadMedia(file, `education/cert-${Date.now()}-${file.name}`);
                        set("certificate_url" as any, url);
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
        {items.map((entry, i) => (
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
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{entry.degree || (entry as any).field_of_study}</p>
              <p className="text-xs text-muted-foreground truncate">{entry.institution}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5 truncate">
                {entry.year || `${(entry as any).start_date || ""}${(entry as any).end_date ? ` — ${(entry as any).end_date}` : ""}`}
                {(entry as any).location ? ` • ${(entry as any).location}` : ""}
              </p>
            </div>
            <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {(entry as any).certificate_url && (
                <a href={(entry as any).certificate_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-secondary/70 hover:bg-muted"><ExternalLink className="w-3.5 h-3.5" /></a>
              )}
              <button onClick={() => setEditing(entry)} className="text-xs px-3 py-1.5 rounded-lg bg-secondary/70 hover:bg-muted font-medium">Edit</button>
              <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(entry.id); }} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive/70" /></button>
            </div>
          </motion.div>
        ))}
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
