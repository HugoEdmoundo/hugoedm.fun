import { motion, useScroll, useTransform } from "framer-motion";
import { ExternalLink, Github, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { Task } from "@/lib/api";
import { useRef } from "react";

interface TasksSectionProps {
  tasks: Task[];
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  completed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
  "in-progress": { icon: AlertCircle, color: "text-blue-400", bg: "bg-blue-400/10" },
};

export default function TasksSection({ tasks }: TasksSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  if (tasks.length === 0) return null;

  return (
    <section id="tasks" ref={ref} className="section-padding relative overflow-hidden">
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/4 rounded-full blur-[100px]" />
      </motion.div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-sm font-mono text-primary tracking-[0.3em] uppercase mb-4">Assignments</h2>
          <p className="text-3xl md:text-4xl font-bold mb-14">Task Tracker</p>
        </motion.div>

        <div className="space-y-4">
          {tasks.map((task, i) => {
            const config = statusConfig[task.status ?? "pending"] ?? statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                whileHover={{ x: 6 }}
                className="glass-card p-5 flex items-center gap-4 group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                  <StatusIcon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{task.title}</h3>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{task.description}</p>
                  )}
                </div>
                <div className="flex gap-2.5 shrink-0">
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
