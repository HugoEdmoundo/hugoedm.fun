import { icons } from "lucide-react";
import type { Skill } from "@/lib/api";
import { BentoCard, BentoGrid } from "./BentoGrid";
import { motion } from "framer-motion";

interface SkillsWindowProps {
  skills: Skill[];
}

export default function SkillsWindow({ skills }: SkillsWindowProps) {
  const categories = [...new Set(skills.map((s) => s.category))];

  if (skills.length === 0) {
    return <div className="p-8 text-center text-muted-foreground text-sm">No skills yet.</div>;
  }

  return (
    <div className="p-4 space-y-5">
      {categories.map((cat, catIdx) => (
        <div key={cat}>
          <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-3">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {skills
              .filter((s) => s.category === cat)
              .map((skill, i) => {
                const LucideIcon = skill.icon ? (icons as any)[skill.icon] : null;
                return (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03, type: "spring" }}
                    whileHover={{ scale: 1.1, y: -3 }}
                    className="px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/30 text-xs font-medium flex items-center gap-2 cursor-default hover:border-primary/30 hover:bg-primary/10 transition-colors"
                  >
                    {LucideIcon ? (
                      <LucideIcon className="w-3.5 h-3.5 text-primary" />
                    ) : skill.icon ? (
                      <span className="text-sm">{skill.icon}</span>
                    ) : null}
                    {skill.name}
                  </motion.div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
