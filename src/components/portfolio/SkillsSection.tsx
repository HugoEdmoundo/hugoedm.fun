import { motion, useScroll, useTransform } from "framer-motion";
import { icons } from "lucide-react";
import type { Skill } from "@/lib/api";
import { useRef } from "react";

interface SkillsSectionProps {
  skills: Skill[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const categories = [...new Set(skills.map((s) => s.category))];
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  if (skills.length === 0) return null;

  return (
    <section id="skills" ref={ref} className="section-padding relative overflow-hidden">
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </motion.div>

      <div className="section-divider mb-24" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-sm font-mono text-primary tracking-[0.3em] uppercase mb-4">Technical Skills</h2>
          <p className="text-3xl md:text-4xl font-bold mb-14">My Toolkit</p>
        </motion.div>

        <div className="space-y-12">
          {categories.map((cat, catIdx) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: catIdx * 0.1 }}
            >
              <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-5">{cat}</h3>
              <div className="flex flex-wrap gap-3">
                {skills
                  .filter((s) => s.category === cat)
                  .map((skill, i) => {
                    const LucideIcon = skill.icon ? icons[skill.icon as keyof typeof icons] : null;
                    return (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.04, type: "spring" }}
                        whileHover={{ scale: 1.08, y: -4 }}
                        className="glass-card px-4 py-2.5 text-sm font-medium flex items-center gap-2.5 cursor-default"
                      >
                        {LucideIcon ? (
                          <LucideIcon className="w-4 h-4 text-primary" />
                        ) : skill.icon ? (
                          <span className="text-base">{skill.icon}</span>
                        ) : null}
                        {skill.name}
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
