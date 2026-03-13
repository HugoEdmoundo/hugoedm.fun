import { motion, useScroll, useTransform } from "framer-motion";
import { GraduationCap, Briefcase, Sparkles } from "lucide-react";
import type { Education, Experience } from "@/lib/api";
import { useMemo, useRef } from "react";

interface ResumeSectionProps {
  education: Education[];
  experience: Experience[];
}

export default function ResumeSection({ education, experience }: ResumeSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  const hasContent = education.length > 0 || experience.length > 0;
  const totalItems = useMemo(() => education.length + experience.length, [education.length, experience.length]);

  if (!hasContent) return null;

  return (
    <section id="resume" ref={ref} className="section-padding relative overflow-hidden">
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div className="absolute top-1/4 right-0 w-[430px] h-[430px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[360px] h-[360px] border border-primary/15 rounded-full" />
      </motion.div>

      <div className="section-divider mb-20" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 md:p-8 border border-primary/20"
        >
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div>
              <h2 className="text-sm font-mono text-primary tracking-[0.3em] uppercase mb-3">Resume</h2>
              <p className="text-3xl md:text-4xl font-bold">Education & Experience</p>
              <p className="text-sm text-muted-foreground mt-3">Perjalanan belajar dan pengalaman profesional yang membentuk keahlian saya.</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-secondary/70 border border-border text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              {totalItems} highlights
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {education.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="glass-card p-6 md:p-7"
            >
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Education</h3>
              </div>

              <div className="space-y-4">
                {education.map((edu, i) => (
                  <motion.article
                    key={edu.id}
                    initial={{ opacity: 0, x: -22 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.45 }}
                    className="rounded-xl border border-border/70 bg-secondary/30 p-4"
                  >
                    <div className="flex items-start gap-3">
                      {(edu as any).logo_url ? (
                        <img
                          src={(edu as any).logo_url}
                          alt={edu.institution}
                          className="w-10 h-10 rounded-lg object-cover border border-border/60"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-primary" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs font-mono text-primary mb-1">{edu.year}</p>
                        <h4 className="font-semibold text-sm md:text-base">{edu.degree}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{edu.institution}</p>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          )}

          {experience.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="glass-card p-6 md:p-7"
            >
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Experience</h3>
              </div>

              <div className="space-y-4">
                {experience.map((exp, i) => (
                  <motion.article
                    key={exp.id}
                    initial={{ opacity: 0, x: 22 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.45 }}
                    className="rounded-xl border border-border/70 bg-secondary/30 p-4"
                  >
                    <div className="flex items-start gap-3">
                      {(exp as any).logo_url ? (
                        <img
                          src={(exp as any).logo_url}
                          alt={exp.company}
                          className="w-10 h-10 rounded-lg object-cover border border-border/60"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-primary" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs font-mono text-primary mb-1">{exp.duration}</p>
                        <h4 className="font-semibold text-sm md:text-base">{exp.role}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{exp.company}</p>
                        {exp.description && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
