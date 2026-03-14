import { motion } from "framer-motion";
import { ExternalLink, Github, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { Task } from "@/lib/api";
import { BentoCard, BentoGrid } from "./BentoGrid";

interface TasksWindowProps {
  tasks: Task[];
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  completed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Done" },
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10", label: "Pending" },
  "in-progress": { icon: AlertCircle, color: "text-blue-400", bg: "bg-blue-400/10", label: "In Progress" },
};

export default function TasksWindow({ tasks }: TasksWindowProps) {
  if (tasks.length === 0) {
    return <div className="p-8 text-center text-muted-foreground text-sm">No assignments yet.</div>;
  }

  const grouped = {
    "in-progress": tasks.filter(t => t.status === "in-progress"),
    pending: tasks.filter(t => t.status === "pending" || !t.status),
    completed: tasks.filter(t => t.status === "completed"),
  };

  return (
    <div className="p-4 space-y-5">
      {Object.entries(grouped).map(([status, items]) => {
        if (items.length === 0) return null;
        const cfg = statusConfig[status] ?? statusConfig.pending;
        const StatusIcon = cfg.icon;

        return (
          <div key={status}>
            <div className="flex items-center gap-2 mb-3">
              <StatusIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
              <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                {cfg.label} ({items.length})
              </p>
            </div>
            <div className="space-y-2">
              {items.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, type: "spring" }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary/30 border border-border/20 hover:border-primary/20 hover:bg-secondary/50 transition-all group"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.color.replace("text-", "bg-")}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium group-hover:text-primary transition-colors truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{task.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {task.url && (
                      <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 hover:text-primary transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {task.github_repo && (
                      <a href={task.github_repo} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 hover:text-primary transition-colors">
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
