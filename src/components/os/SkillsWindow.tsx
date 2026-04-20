import { icons } from "lucide-react";
import type { Skill } from "@/lib/api";
import { motion } from "framer-motion";
import { useBreakpoint } from "@/hooks/use-breakpoint";

interface SkillsWindowProps {
  skills: Skill[];
}

export default function SkillsWindow({ skills }: SkillsWindowProps) {
  const bp = useBreakpoint();
  const categories = [...new Set(skills.map((s) => s.category))];

  if (skills.length === 0) {
    return <div className="p-8 text-center text-muted-foreground text-sm">No skills yet.</div>;
  }

  // ─── MOBILE: compact tags, lebih kecil ────────────────────────────
  if (bp === "mobile") {
    return (
      <div className="p-3 space-y-4">
        {categories.map((cat) => (
          <div key={cat}>
            <p className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase mb-2">{cat}</p>
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
          </div>
        ))}
      </div>
    );
  }

  // ─── TABLET: 2-col category grid ───────────────────────────────────
  if (bp === "tablet") {
    return (
      <div className="p-4 grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat} className="rounded-xl bg-card/40 border border-border/30 p-3">
            <p className="text-[10px] font-mono text-primary tracking-widest uppercase mb-2">{cat}</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.filter((s) => s.category === cat).map((skill, i) => {
                const LucideIcon = skill.icon ? (icons as any)[skill.icon] : null;
                return (
                  <div key={skill.id} className="px-2.5 py-1 rounded-lg bg-secondary/50 border border-border/30 text-xs font-medium flex items-center gap-1.5">
                    {LucideIcon ? <LucideIcon className="w-3.5 h-3.5 text-primary" /> : skill.icon ? <span>{skill.icon}</span> : null}
                    {skill.name}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── DESKTOP: spacious dengan animation hover penuh ────────────────
  return (
    <div className="p-5 space-y-6">
      {categories.map((cat) => (
        <div key={cat}>
          <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-3">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {skills.filter((s) => s.category === cat).map((skill, i) => {
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
                  {LucideIcon ? <LucideIcon className="w-3.5 h-3.5 text-primary" /> : skill.icon ? <span className="text-sm">{skill.icon}</span> : null}
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
