import { motion } from "framer-motion";
import { GraduationCap, Briefcase } from "lucide-react";
import type { Education, Experience } from "@/lib/api";

interface ResumeSectionProps {
  education: Education[];
  experience: Experience[];
}

export default function ResumeSection({ education, experience }: ResumeSectionProps) {
  if (education.length === 0 && experience.length === 0) return null;

  return (
    <section id="resume" className="section-padding">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-sm font-mono text-primary tracking-widest uppercase mb-4">Resume</h2>
          <p className="text-3xl font-bold mb-12">Education & Experience</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {education.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Education</h3>
              </div>
              <div className="space-y-4 border-l-2 border-border pl-6">
                {education.map((edu, i) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative"
                  >
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <p className="text-xs font-mono text-primary mb-1">{edu.year}</p>
                    <h4 className="font-medium text-sm">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {experience.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Experience</h3>
              </div>
              <div className="space-y-4 border-l-2 border-border pl-6">
                {experience.map((exp, i) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative"
                  >
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <p className="text-xs font-mono text-primary mb-1">{exp.duration}</p>
                    <h4 className="font-medium text-sm">{exp.role}</h4>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    {exp.description && (
                      <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>
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
