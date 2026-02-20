import { motion } from "framer-motion";
import type { SiteConfig } from "@/lib/api";

interface AboutSectionProps {
  config: SiteConfig | null;
}

export default function AboutSection({ config }: AboutSectionProps) {
  if (!config?.about_text) return null;

  return (
    <section id="about" className="section-padding">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-sm font-mono text-primary tracking-widest uppercase mb-4">About Me</h2>
          <div className="glass-card p-8 md:p-12">
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {config.about_text}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
