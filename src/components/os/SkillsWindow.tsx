import { icons } from "lucide-react";
import type { Skill } from "@/lib/api";
import { motion } from "framer-motion";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { BentoCard, BentoGrid } from "./BentoGrid";

interface SkillsWindowProps {
  skills: Skill[];
}

export default function SkillsWindow({ skills }: SkillsWindowProps) {
  const bp = useBreakpoint();
  const categories = [...new Set(skills.map((s) => s.category))];

  if (skills.length === 0) {
    return <div className="p-8 text-center text-muted-foreground text-sm">No skills yet.</div>;
  }

  // ─── MOBILE: compact tags, single column ──────────────────────────
  if (bp === "mobile") {
    return (
      <div className="p-3 space-y-3">
        {categories.map((cat, idx) => (
          <BentoCard key={cat} delay={idx * 0.04} className="p-3">
            <p className="text-[9px] font-mono text-primary tracking-widest uppercase mb-2">{cat}</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.filter((s) => s.category === cat).map((skill, i) => {
                const LucideIcon = skill.icon ? (icons as any)[skill.icon] : null;
                return (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="px-2 py-1 rounded-md bg-secondary/50 border border-border/30 text-[10px] font-medium flex items-center gap-1"
                  >
                    {LucideIcon ? <LucideIcon className="w-3 h-3 text-primary" /> : skill.icon ? <span>{skill.icon}</span> : null}
                    {skill.name}
                  </motion.div>
                );
              })}
            </div>
          </BentoCard>
        ))}
      </div>
    );
  }

  // ─── TABLET / DESKTOP: Bento grid widgets per category ────────────
  const cols = bp === "tablet" ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className="p-4">
      <BentoGrid className={cols}>
        {categories.map((cat, idx) => {
          const catSkills = skills.filter((s) => s.category === cat);
          return (
            <BentoCard key={cat} delay={idx * 0.06} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-mono text-primary tracking-widest uppercase">{cat}</p>
                <span className="text-[10px] font-mono text-muted-foreground/50">{catSkills.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {catSkills.map((skill, i) => {
                  const LucideIcon = skill.icon ? (icons as any)[skill.icon] : null;
                  return (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.06 + i * 0.025, type: "spring", stiffness: 260, damping: 20 }}
                      whileHover={{ scale: 1.08, y: -2 }}
                      className="px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/30 text-[11px] font-medium flex items-center gap-1.5 cursor-default hover:border-primary/40 hover:bg-primary/10 transition-colors"
                    >
                      {LucideIcon ? <LucideIcon className="w-3.5 h-3.5 text-primary" /> : skill.icon ? <span className="text-sm">{skill.icon}</span> : null}
                      {skill.name}
                    </motion.div>
                  );
                })}
              </div>
            </BentoCard>
          );
        })}
      </BentoGrid>
    </div>
  );
}
