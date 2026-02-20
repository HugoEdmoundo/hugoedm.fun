import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, upsertProject, deleteProject, uploadMedia, type Project } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Upload, X } from "lucide-react";

const emptyProject = { title: "", description: "", tech_stack: [] as string[], live_demo_url: "", github_url: "", screenshot_url: "", featured: false, sort_order: 0 };

export default function AdminProjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });
  const [editing, setEditing] = useState<(Partial<Project> & typeof emptyProject) | null>(null);
  const [techInput, setTechInput] = useState("");

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Projects</h2>
        <button onClick={() => setEditing(emptyProject)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {editing && (
        <div className="glass-card p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">{editing.id ? "Edit" : "New"} Project</h3>
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          {[
            { key: "title", label: "Title" },
            { key: "description", label: "Description", type: "textarea" },
            { key: "live_demo_url", label: "Live Demo URL" },
            { key: "github_url", label: "GitHub URL" },
            { key: "screenshot_url", label: "Screenshot URL", uploadable: true },
            { key: "sort_order", label: "Sort Order", type: "number" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
              <div className="flex gap-2">
                {f.type === "textarea" ? (
                  <textarea value={(editing as any)[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]" />
                ) : (
                  <input type={f.type || "text"} value={(editing as any)[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: f.type === "number" ? parseInt(e.target.value) || 0 : e.target.value })} className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                )}
                {f.uploadable && (
                  <label className="shrink-0 px-3 py-2 rounded-lg bg-secondary border border-border text-sm cursor-pointer hover:bg-muted transition-colors flex items-center">
                    <Upload className="w-3.5 h-3.5" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  </label>
                )}
              </div>
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Tech Stack</label>
            <div className="flex gap-2 mb-2">
              <input value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())} placeholder="Add tech..." className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <button onClick={addTech} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-1">
              {(editing.tech_stack ?? []).map((t, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded bg-secondary flex items-center gap-1">
                  {t}
                  <button onClick={() => setEditing({ ...editing, tech_stack: editing.tech_stack?.filter((_, j) => j !== i) ?? [] })} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.featured ?? false} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="accent-primary" />
            Featured
          </label>
          <button onClick={() => saveMutation.mutate(editing as any)} disabled={saveMutation.isPending} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            <Save className="w-4 h-4" /> {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {projects.map((p) => (
          <div key={p.id} className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {p.screenshot_url && <img src={p.screenshot_url} alt="" className="w-12 h-8 rounded object-cover shrink-0" />}
              <div className="min-w-0">
                <h3 className="font-medium text-sm truncate">{p.title}</h3>
                <p className="text-xs text-muted-foreground">{p.featured ? "⭐ Featured" : ""}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditing(p)} className="text-xs px-2 py-1 rounded bg-secondary hover:bg-muted">Edit</button>
              <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(p.id); }} className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
      </div>
    </div>
  );
}
