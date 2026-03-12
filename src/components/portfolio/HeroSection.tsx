import { motion, useScroll, useTransform } from "framer-motion";
import { Download, icons } from "lucide-react";
import type { SiteConfig } from "@/lib/api";
import { useRef } from "react";

interface HeroSectionProps {
  config: SiteConfig | null;
  socialLinks?: { id: string; platform: string; url: string; icon: string; sort_order: number }[];
}

export default function HeroSection({ config, socialLinks = [] }: HeroSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.9]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax background layers */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/3 right-1/5 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06)_0%,transparent_70%)]" />
      </motion.div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* Content */}
      <motion.div className="relative z-10 max-w-5xl mx-auto text-center px-4" style={{ y: textY, opacity, scale }}>
        {config?.hero_photo_url && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
            className="mb-10"
          >
            <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-2 border-primary/30 animate-glow-pulse ring-4 ring-primary/10 ring-offset-4 ring-offset-background">
              <img src={config.hero_photo_url} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <p className="text-primary font-mono text-sm mb-6 tracking-[0.3em] uppercase">
            {config?.description || "Welcome to my portfolio"}
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight leading-[0.9]"
        >
          <span className="gradient-text">{config?.hero_name || "Your Name"}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light"
        >
          {config?.hero_headline || "Full Stack Developer"}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          {socialLinks.map((link, i) => {
            const LucideIcon = (icons as any)[link.icon];
            return (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="glass-card p-3.5 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                title={link.platform}
              >
                {LucideIcon ? <LucideIcon className="w-5 h-5" /> : <span className="text-xs font-medium">{link.platform}</span>}
              </motion.a>
            );
          })}
          {config?.cv_url && (
            <motion.a
              href={config.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + socialLinks.length * 0.1, type: "spring" }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="glass-card px-7 py-3.5 text-sm font-medium text-primary flex items-center gap-2 hover:border-primary/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download CV
            </motion.a>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-muted-foreground/20 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-primary rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}
