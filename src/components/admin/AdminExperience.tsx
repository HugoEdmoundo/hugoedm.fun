import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchExperience, upsertExperience, deleteExperience, type Experience, uploadMedia } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X, Upload, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminExperience() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: items = [] } = useQuery({ queryKey: ["experience"], queryFn: fetchExperience });
  const [editing, setEditing] = useState<Partial<Experience> | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail?.tab === "experience") setEditing({ company: "", role: "", duration: "", description: "", logo_url: "", sort_order: 0 });
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
        <button onClick={() => setEditing({ company: "", role: "", duration: "", description: "", logo_url: "", sort_order: 0 })} className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card p-5 md:p-6 space-y-4 border border-primary/15">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{editing.id ? "Edit" : "New"} Experience</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "company", label: "Company" },
                  { key: "role", label: "Role" },
                  { key: "duration", label: "Duration" },
                  { key: "sort_order", label: "Sort Order", type: "number" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{field.label}</label>
                    <input
                      type={field.type || "text"}
                      value={(editing as any)[field.key] ?? ""}
                      onChange={(e) => setEditing({ ...editing, [field.key]: field.type === "number" ? parseInt(e.target.value) || 0 : e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-y transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Logo</label>
                <div className="flex gap-2">
                  <input value={editing.logo_url ?? ""} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} className="flex-1 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                  <label className="shrink-0 px-4 py-2.5 rounded-xl bg-secondary/70 border border-border/50 text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadMedia(file, `experience/logo-${Date.now()}`);
                        setEditing({ ...editing, logo_url: url });
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
              <p className="text-sm font-semibold">{entry.role}</p>
              <p className="text-xs text-muted-foreground">{entry.company} • {entry.duration}</p>
              {entry.description && <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">{entry.description}</p>}
            </div>
            <div className="flex gap-1.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
