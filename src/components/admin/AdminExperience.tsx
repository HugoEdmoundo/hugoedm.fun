import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchExperience, upsertExperience, deleteExperience, type Experience } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X } from "lucide-react";

export default function AdminExperience() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: items = [] } = useQuery({ queryKey: ["experience"], queryFn: fetchExperience });
  const [editing, setEditing] = useState<Partial<Experience> | null>(null);

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Experience</h2>
        <button onClick={() => setEditing({ company: "", role: "", duration: "", description: "", sort_order: 0 })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"><Plus className="w-4 h-4" /> Add</button>
      </div>

      {editing && (
        <div className="glass-card p-6 mb-6 space-y-4">
          <div className="flex justify-between"><h3 className="font-semibold text-sm">{editing.id ? "Edit" : "New"}</h3><button onClick={() => setEditing(null)}><X className="w-4 h-4 text-muted-foreground" /></button></div>
          {[{ key: "company", label: "Company" }, { key: "role", label: "Role" }, { key: "duration", label: "Duration" }, { key: "description", label: "Description", type: "textarea" }, { key: "sort_order", label: "Sort Order", type: "number" }].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea value={(editing as any)[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]" />
              ) : (
                <input type={f.type || "text"} value={(editing as any)[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: f.type === "number" ? parseInt(e.target.value) || 0 : e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              )}
            </div>
          ))}
          <button onClick={() => saveMutation.mutate(editing as any)} disabled={saveMutation.isPending} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"><Save className="w-4 h-4" /> Save</button>
        </div>
      )}

      <div className="space-y-2">
        {items.map((e) => (
          <div key={e.id} className="glass-card p-3 flex items-center justify-between">
            <div><span className="text-sm font-medium">{e.role}</span><span className="text-xs text-muted-foreground ml-2">at {e.company} ({e.duration})</span></div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(e)} className="text-xs px-2 py-1 rounded bg-secondary hover:bg-muted">Edit</button>
              <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(e.id); }} className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No experience entries yet.</p>}
      </div>
    </div>
  );
}
