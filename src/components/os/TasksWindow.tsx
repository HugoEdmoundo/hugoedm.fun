import { motion } from "framer-motion";
import { ExternalLink, Github, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { Task } from "@/lib/api";
import { useBreakpoint } from "@/hooks/use-breakpoint";

interface TasksWindowProps {
  tasks: Task[];
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  completed: { icon: CheckCircle, color: "text-emerald-400", label: "Done" },
  pending: { icon: Clock, color: "text-amber-400", label: "Pending" },
  "in-progress": { icon: AlertCircle, color: "text-blue-400", label: "In Progress" },
};

export default function TasksWindow({ tasks }: TasksWindowProps) {
  const bp = useBreakpoint();

  if (tasks.length === 0) {
    return <div className="p-8 text-center text-muted-foreground text-sm">No assignments yet.</div>;
  }

  const grouped = {
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    pending: tasks.filter((t) => t.status === "pending" || !t.status),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  // ─── DESKTOP: kanban 3 columns ─────────────────────────────────────
  if (bp === "desktop") {
    return (
      <div className="p-4 grid grid-cols-3 gap-3 h-full">
        {Object.entries(grouped).map(([status, items]) => {
          const cfg = statusConfig[status] ?? statusConfig.pending;
          const StatusIcon = cfg.icon;
          return (
            <div key={status} className="rounded-xl bg-card/30 border border-border/30 flex flex-col min-h-0">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/20 sticky top-0">
                <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                  {cfg.label} ({items.length})
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {items.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-2.5 rounded-lg bg-secondary/40 border border-border/20 hover:border-primary/30 transition-colors group"
                  >
                    <p className="text-xs font-medium group-hover:text-primary transition-colors">{task.title}</p>
                    {task.description && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex gap-1.5 mt-2">
                      {task.url && (
                        <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 hover:text-primary">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {task.github_repo && (
                        <a href={task.github_repo} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 hover:text-primary">
                          <Github className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
                {items.length === 0 && (
                  <p className="text-[10px] text-muted-foreground/40 text-center py-4 font-mono">empty</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─── MOBILE / TABLET: stacked sections (mobile lebih padat) ───────
  const dense = bp === "mobile";
  return (
    <div className={`${dense ? "p-3 space-y-4" : "p-4 space-y-5"}`}>
      {Object.entries(grouped).map(([status, items]) => {
        if (items.length === 0) return null;
        const cfg = statusConfig[status] ?? statusConfig.pending;
        const StatusIcon = cfg.icon;
        return (
          <div key={status}>
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
              <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                {cfg.label} ({items.length})
              </p>
            </div>
            <div className={dense ? "space-y-1.5" : "grid grid-cols-2 gap-2"}>
              {items.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/30 border border-border/20"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.color.replace("text-", "bg-")}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{task.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {task.url && (
                      <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 hover:text-primary">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {task.github_repo && (
                      <a href={task.github_repo} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 hover:text-primary">
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
