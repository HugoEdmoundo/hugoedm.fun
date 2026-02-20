import { motion } from "framer-motion";
import type { Skill } from "@/lib/api";

interface SkillsSectionProps {
  skills: Skill[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  if (skills.length === 0) return null;

  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <section id="skills" className="section-padding">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-sm font-mono text-primary tracking-widest uppercase mb-4">Technical Skills</h2>
          <p className="text-3xl font-bold mb-12">My Toolkit</p>
        </motion.div>

        <div className="space-y-10">
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-sm font-mono text-muted-foreground mb-4">{cat}</h3>
              <div className="flex flex-wrap gap-3">
                {skills
                  .filter((s) => s.category === cat)
                  .map((skill, i) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.03 }}
                      className="glass-card px-4 py-2 text-sm font-medium hover-lift flex items-center gap-2"
                    >
                      {skill.icon && <span className="text-lg">{skill.icon}</span>}
                      {skill.name}
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
