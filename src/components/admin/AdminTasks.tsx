import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, upsertTask, deleteTask, type Task } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X, ListTodo, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" },
  "in-progress": { icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
};

export default function AdminTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });
  const [editing, setEditing] = useState<Partial<Task> | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail?.tab === "tasks") setEditing({ title: "", description: "", url: "", github_repo: "", status: "pending" });
    };
    window.addEventListener("admin-fab-add", handler);
    return () => window.removeEventListener("admin-fab-add", handler);
  }, []);

  const saveMutation = useMutation({
    mutationFn: (t: any) => upsertTask(t),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tasks"] }); setEditing(null); toast({ title: "Saved!" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tasks"] }); toast({ title: "Deleted" }); },
  });

  const grouped = {
    pending: tasks.filter(t => t.status === "pending"),
    "in-progress": tasks.filter(t => t.status === "in-progress"),
    completed: tasks.filter(t => t.status === "completed"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ListTodo className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Tasks</h2>
            <p className="text-xs text-muted-foreground">{tasks.length} total</p>
          </div>
        </div>
        <button onClick={() => setEditing({ title: "", description: "", url: "", github_repo: "", status: "pending" })} className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(grouped).map(([status, items]) => {
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          return (
            <div key={status} className={`glass-card p-3 md:p-4 border ${cfg.bg} rounded-xl`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <span className="text-xs font-medium capitalize hidden sm:inline">{status.replace("-", " ")}</span>
              </div>
              <p className="text-xl md:text-2xl font-bold">{items.length}</p>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card p-5 md:p-6 space-y-4 border border-primary/15">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{editing.id ? "Edit" : "New"} Task</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{ key: "title", label: "Title" }, { key: "url", label: "URL" }, { key: "github_repo", label: "GitHub Repo" }].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
                    <input value={(editing as any)[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                  <select value={editing.status ?? "pending"} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px] resize-y transition-all" />
              </div>
              <button onClick={() => saveMutation.mutate(editing as any)} disabled={saveMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list as cards */}
      <div className="space-y-3">
        {tasks.map((t, i) => {
          const cfg = statusConfig[t.status ?? "pending"] ?? statusConfig.pending;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-primary/15 transition-all"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${cfg.bg}`}>
                <Icon className={`w-4 h-4 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{t.title}</p>
                {t.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{t.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${cfg.bg} ${cfg.color} font-medium`}>{(t.status ?? "pending").replace("-", " ")}</span>
                <button onClick={() => setEditing(t)} className="text-xs px-3 py-1.5 rounded-lg bg-secondary/70 hover:bg-muted transition-colors font-medium">Edit</button>
                <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(t.id); }} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-destructive/70" /></button>
              </div>
            </motion.div>
          );
        })}
      </div>
      {tasks.length === 0 && !editing && (
        <div className="text-center py-12">
          <ListTodo className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No tasks yet</p>
        </div>
      )}
    </div>
  );
}
