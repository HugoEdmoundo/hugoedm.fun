import { motion } from "framer-motion";
import { ExternalLink, Github, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { Task } from "@/lib/api";

interface TasksSectionProps {
  tasks: Task[];
}

const statusIcons: Record<string, typeof CheckCircle> = {
  completed: CheckCircle,
  pending: Clock,
  "in-progress": AlertCircle,
};

const statusColors: Record<string, string> = {
  completed: "text-green-400",
  pending: "text-yellow-400",
  "in-progress": "text-blue-400",
};

export default function TasksSection({ tasks }: TasksSectionProps) {
  if (tasks.length === 0) return null;

  return (
    <section id="tasks" className="section-padding">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-sm font-mono text-primary tracking-widest uppercase mb-4">Assignments</h2>
          <p className="text-3xl font-bold mb-12">Task Tracker</p>
        </motion.div>

        <div className="space-y-3">
          {tasks.map((task, i) => {
            const StatusIcon = statusIcons[task.status ?? "pending"] ?? Clock;
            const statusColor = statusColors[task.status ?? "pending"] ?? "text-muted-foreground";

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                <StatusIcon className={`w-5 h-5 ${statusColor} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{task.title}</h3>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{task.description}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {task.url && (
                    <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {task.github_repo && (
                    <a href={task.github_repo} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
