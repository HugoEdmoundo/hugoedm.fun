import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, upsertProject, deleteProject, uploadMedia, type Project } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Upload, X, FolderOpen, Star, ExternalLink, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const emptyProject = { title: "", description: "", tech_stack: [] as string[], live_demo_url: "", github_url: "", screenshot_url: "", featured: false, sort_order: 0 };

export default function AdminProjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const [editing, setEditing] = useState<(Partial<Project> & typeof emptyProject) | null>(null);
  const [techInput, setTechInput] = useState("");

  // Listen for mobile FAB
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail?.tab === "projects") setEditing(emptyProject);
    };
    window.addEventListener("admin-fab-add", handler);
    return () => window.removeEventListener("admin-fab-add", handler);
  }, []);

  const saveMutation = useMutation({
    mutationFn: (p: any) => upsertProject(p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); queryClient.invalidateQueries({ queryKey: ["featured-projects"] }); setEditing(null); toast({ title: "Saved!" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); queryClient.invalidateQueries({ queryKey: ["featured-projects"] }); toast({ title: "Deleted" }); },
  });

  const handleUpload = async (file: File) => {
    try {
      const url = await uploadMedia(file, `projects/${Date.now()}-${file.name}`);
      setEditing((e) => e ? { ...e, screenshot_url: url } : null);
      toast({ title: "Uploaded!" });
    } catch (err: any) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
  };

  const addTech = () => {
    if (techInput.trim() && editing) {
      setEditing({ ...editing, tech_stack: [...(editing.tech_stack ?? []), techInput.trim()] });
      setTechInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Projects</h2>
            <p className="text-xs text-muted-foreground">{projects.length} total</p>
          </div>
        </div>
        <button onClick={() => setEditing(emptyProject)} className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Editor form */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5 md:p-6 space-y-4 border border-primary/15">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{editing.id ? "Edit" : "New"} Project</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "title", label: "Title" },
                  { key: "live_demo_url", label: "Live Demo URL" },
                  { key: "github_url", label: "GitHub URL" },
                  { key: "sort_order", label: "Sort Order", type: "number" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
                    <input
                      type={f.type || "text"}
                      value={(editing as any)[f.key] ?? ""}
                      onChange={(e) => setEditing({ ...editing, [f.key]: f.type === "number" ? parseInt(e.target.value) || 0 : e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <textarea
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-y transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Screenshot</label>
                <div className="flex gap-2">
                  <input
                    value={editing.screenshot_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, screenshot_url: e.target.value })}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                  <label className="shrink-0 px-4 py-2.5 rounded-xl bg-secondary/70 border border-border/50 text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-xs">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tech Stack</label>
                <div className="flex gap-2 mb-2">
                  <input value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())} placeholder="Add tech..." className="flex-1 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                  <button onClick={addTech} className="px-4 py-2.5 rounded-xl bg-secondary/70 border border-border/50 text-sm hover:bg-muted transition-colors">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(editing.tech_stack ?? []).map((t, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center gap-1">
                      {t}
                      <button onClick={() => setEditing({ ...editing, tech_stack: editing.tech_stack?.filter((_, j) => j !== i) ?? [] })} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                <input type="checkbox" checked={editing.featured ?? false} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="accent-primary w-4 h-4" />
                <Star className="w-3.5 h-3.5 text-primary" /> Featured
              </label>

              <button onClick={() => saveMutation.mutate(editing as any)} disabled={saveMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                <Save className="w-4 h-4" /> {saveMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project cards - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card overflow-hidden group hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
          >
            {p.screenshot_url && (
              <div className="h-32 overflow-hidden">
                <img src={p.screenshot_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm line-clamp-1">{p.title}</h3>
                {p.featured && <Star className="w-3.5 h-3.5 text-primary shrink-0 fill-primary" />}
              </div>
              {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}
              {p.tech_stack && p.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.tech_stack.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/70 text-muted-foreground">{t}</span>
                  ))}
                  {p.tech_stack.length > 3 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/70 text-muted-foreground">+{p.tech_stack.length - 3}</span>}
                </div>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                <button onClick={() => setEditing(p)} className="text-xs px-3 py-1.5 rounded-lg bg-secondary/70 hover:bg-muted transition-colors font-medium">Edit</button>
                {p.live_demo_url && (
                  <a href={p.live_demo_url} target="_blank" rel="noopener" className="p-1.5 rounded-lg hover:bg-secondary/70 transition-colors"><ExternalLink className="w-3.5 h-3.5 text-muted-foreground" /></a>
                )}
                {p.github_url && (
                  <a href={p.github_url} target="_blank" rel="noopener" className="p-1.5 rounded-lg hover:bg-secondary/70 transition-colors"><Github className="w-3.5 h-3.5 text-muted-foreground" /></a>
                )}
                <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(p.id); }} className="ml-auto p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-destructive/70" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {projects.length === 0 && !editing && (
        <div className="text-center py-12">
          <FolderOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No projects yet</p>
        </div>
      )}
    </div>
  );
}
