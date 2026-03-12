import { motion, useScroll, useTransform } from "framer-motion";
import { GraduationCap, Briefcase } from "lucide-react";
import type { Education, Experience } from "@/lib/api";
import { useRef } from "react";

interface ResumeSectionProps {
  education: Education[];
  experience: Experience[];
}

export default function ResumeSection({ education, experience }: ResumeSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  if (education.length === 0 && experience.length === 0) return null;

  return (
    <section id="resume" ref={ref} className="section-padding relative overflow-hidden">
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </motion.div>

      <div className="section-divider mb-24" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-sm font-mono text-primary tracking-[0.3em] uppercase mb-4">Resume</h2>
          <p className="text-3xl md:text-4xl font-bold mb-14">Education & Experience</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16">
          {education.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Education</h3>
              </div>
              <div className="space-y-6 border-l-2 border-primary/20 pl-7">
                {education.map((edu, i) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    className="relative"
                  >
                    {(edu as any).logo_url ? (
                      <img src={(edu as any).logo_url} alt={edu.institution} className="absolute -left-[39px] top-0 w-6 h-6 rounded-full object-cover border-2 border-background" />
                    ) : (
                      <div className="absolute -left-[33px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    )}
                    <p className="text-xs font-mono text-primary mb-1.5">{edu.year}</p>
                    <h4 className="font-medium">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {experience.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Experience</h3>
              </div>
              <div className="space-y-6 border-l-2 border-primary/20 pl-7">
                {experience.map((exp, i) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    className="relative"
                  >
                    {(exp as any).logo_url ? (
                      <img src={(exp as any).logo_url} alt={exp.company} className="absolute -left-[39px] top-0 w-6 h-6 rounded-full object-cover border-2 border-background" />
                    ) : (
                      <div className="absolute -left-[33px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    )}
                    <p className="text-xs font-mono text-primary mb-1.5">{exp.duration}</p>
                    <h4 className="font-medium">{exp.role}</h4>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    {exp.description && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
