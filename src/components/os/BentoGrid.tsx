import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
}

export function BentoCard({ children, className = "", delay = 0, hoverEffect = true }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", damping: 20 }}
      whileHover={hoverEffect ? { scale: 1.02, y: -4 } : undefined}
      className={`rounded-xl bg-card/50 backdrop-blur-xl border border-border/30 p-4 overflow-hidden relative group transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div className={`grid gap-3 ${className}`}>
      {children}
    </div>
  );
}
