import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
}

export function BentoCard({ children, className = "", delay = 0, hoverEffect = true }: BentoCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Physics-based motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Spring physics configuration for natural feel
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), springConfig);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !hoverEffect) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", damping: 20, stiffness: 200 }}
      whileHover={hoverEffect ? { 
        scale: 1.03,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: hoverEffect ? rotateX : 0,
        rotateY: hoverEffect ? rotateY : 0,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={`rounded-xl bg-card/50 backdrop-blur-xl border border-border/30 p-4 overflow-hidden relative group transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 bento-card ${className}`}
    >
      {/* Physics glow effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100"
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Magnetic shine effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: useTransform(
            [x, y],
            ([latestX, latestY]) => {
              const posX = 50 + (latestX as number) * 30;
              const posY = 50 + (latestY as number) * 30;
              return `radial-gradient(circle at ${posX}% ${posY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
            }
          ),
        }}
      />
      
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
