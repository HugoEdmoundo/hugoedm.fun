import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, upsertTask, deleteTask, type Task } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X } from "lucide-react";

export default function AdminTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });
  const [editing, setEditing] = useState<Partial<Task> | null>(null);

  const saveMutation = useMutation({
    mutationFn: (t: any) => upsertTask(t),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tasks"] }); setEditing(null); toast({ title: "Saved!" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tasks"] }); toast({ title: "Deleted" }); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Tasks</h2>
        <button onClick={() => setEditing({ title: "", description: "", url: "", github_repo: "", status: "pending" })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"><Plus className="w-4 h-4" /> Add</button>
      </div>

      {editing && (
        <div className="glass-card p-6 mb-6 space-y-4">
          <div className="flex justify-between"><h3 className="font-semibold text-sm">{editing.id ? "Edit" : "New"} Task</h3><button onClick={() => setEditing(null)}><X className="w-4 h-4 text-muted-foreground" /></button></div>
          {[{ key: "title", label: "Title" }, { key: "description", label: "Description", type: "textarea" }, { key: "url", label: "URL" }, { key: "github_repo", label: "GitHub Repo URL" }].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea value={(editing as any)[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]" />
              ) : (
                <input value={(editing as any)[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              )}
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
            <select value={editing.status ?? "pending"} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button onClick={() => saveMutation.mutate(editing as any)} disabled={saveMutation.isPending} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"><Save className="w-4 h-4" /> Save</button>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="glass-card p-3 flex items-center justify-between">
            <div><span className="text-sm font-medium">{t.title}</span><span className="text-xs text-muted-foreground ml-2">({t.status})</span></div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(t)} className="text-xs px-2 py-1 rounded bg-secondary hover:bg-muted">Edit</button>
              <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(t.id); }} className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet.</p>}
      </div>
    </div>
  );
}
