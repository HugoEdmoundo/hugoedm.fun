import { motion, useScroll, useTransform } from "framer-motion";
import type { SiteConfig } from "@/lib/api";
import { useRef } from "react";

interface AboutSectionProps {
  config: SiteConfig | null;
}

export default function AboutSection({ config }: AboutSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  if (!config?.about_text) return null;

  return (
    <section id="about" ref={ref} className="section-padding relative overflow-hidden">
      {/* Parallax background accent */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </motion.div>

      <div className="section-divider mb-24" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div style={{ y }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-sm font-mono text-primary tracking-[0.3em] uppercase mb-4">About Me</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass-card p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {config.about_text}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
