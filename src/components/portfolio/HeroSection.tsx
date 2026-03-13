import { motion, useScroll, useTransform } from "framer-motion";
import { Download, Store, ArrowUpRight, icons } from "lucide-react";
import type { SiteConfig } from "@/lib/api";
import { useRef } from "react";

interface HeroSectionProps {
  config: SiteConfig | null;
  socialLinks?: { id: string; platform: string; url: string; icon: string; sort_order: number }[];
}

export default function HeroSection({ config, socialLinks = [] }: HeroSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "55%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.82], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.82], [1, 0.92]);

  const marketplaceText = String((config as any)?.marketplace_cta_text ?? "Visit Marketplace").trim();
  const marketplaceUrl = String((config as any)?.marketplace_cta_url ?? "").trim();

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-mesh opacity-80" />
        <div className="absolute top-[10%] left-[8%] w-[580px] h-[580px] bg-primary/12 rounded-full blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-[5%] right-[10%] w-[460px] h-[460px] bg-primary/8 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-[35%] right-[28%] w-[300px] h-[300px] border border-primary/20 rounded-full animate-slow-spin" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10)_0%,transparent_68%)]" />
      </motion.div>

      <div className="absolute inset-0 grid-pattern opacity-50" />

      <motion.div className="relative z-10 max-w-5xl mx-auto text-center px-4" style={{ y: textY, opacity, scale }}>
        {config?.hero_photo_url && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
            className="mb-10"
          >
            <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-2 border-primary/30 ring-4 ring-primary/10 ring-offset-4 ring-offset-background animate-glow-pulse">
              <img src={config.hero_photo_url} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-primary font-mono text-sm mb-6 tracking-[0.3em] uppercase"
        >
          {config?.description || "Welcome to my portfolio"}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight leading-[0.88]"
        >
          <span className="gradient-text">{config?.hero_name || "Your Name"}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light"
        >
          {config?.hero_headline || "Full Stack Developer"}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex items-center justify-center gap-3 flex-wrap"
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
                transition={{ delay: 0.7 + i * 0.08, type: "spring" }}
                whileHover={{ scale: 1.12, y: -4 }}
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
              transition={{ delay: 0.75 + socialLinks.length * 0.08, type: "spring" }}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="glass-card px-6 py-3.5 text-sm font-semibold text-primary flex items-center gap-2 hover:border-primary/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download CV
            </motion.a>
          )}

          {marketplaceUrl && (
            <motion.a
              href={marketplaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + socialLinks.length * 0.08, type: "spring" }}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              <Store className="w-4 h-4" />
              {marketplaceText || "Visit Marketplace"}
              <ArrowUpRight className="w-4 h-4" />
            </motion.a>
          )}
        </motion.div>
      </motion.div>

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
