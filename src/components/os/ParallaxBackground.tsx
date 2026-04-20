import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";

/**
 * Professional ParallaxBackground — advanced parallax with multiple layers.
 * - Dynamic mesh grid with depth
 * - 5 floating gradient orbs with different parallax speeds
 * - Animated particles system
 * - Professional dark/light mode support
 * - Scroll-based parallax layers
 * - Enhanced vignette and atmosphere effects
 */
export default function ParallaxBackground() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 35, damping: 25, mass: 0.8 });
  const sy = useSpring(my, { stiffness: 35, damping: 25, mass: 0.8 });
  
  const { scrollY } = useScroll();
  const scrollYSpring = useSpring(scrollY, { stiffness: 100, damping: 15, mass: 1 });

  const [reduced, setReduced] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mx.set(x);
      my.set(y);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduced]);

  // Enhanced parallax depths with scroll effects
  const orb1X = useTransform(sx, (v) => v * 80);
  const orb1Y = useTransform(sy, (v) => v * 80);
  const orb1Scroll = useTransform(scrollYSpring, [0, 1000], [0, -150]);
  
  const orb2X = useTransform(sx, (v) => v * -100);
  const orb2Y = useTransform(sy, (v) => v * -100);
  const orb2Scroll = useTransform(scrollYSpring, [0, 1000], [0, 200]);
  
  const orb3X = useTransform(sx, (v) => v * 45);
  const orb3Y = useTransform(sy, (v) => v * 45);
  const orb3Scroll = useTransform(scrollYSpring, [0, 1000], [0, -100]);
  
  const orb4X = useTransform(sx, (v) => v * -35);
  const orb4Y = useTransform(sy, (v) => v * -35);
  const orb4Scroll = useTransform(scrollYSpring, [0, 1000], [0, 120]);
  
  const orb5X = useTransform(sx, (v) => v * 25);
  const orb5Y = useTransform(sy, (v) => v * 25);
  const orb5Scroll = useTransform(scrollYSpring, [0, 1000], [0, -80]);
  
  const gridX = useTransform(sx, (v) => v * -15);
  const gridY = useTransform(sy, (v) => v * -15);
  const gridScroll = useTransform(scrollYSpring, [0, 1000], [0, 50]);

  // Dynamic colors based on theme
  const getOrbColors = () => {
    if (isDark) {
      return {
        primary: "hsl(174 72% 46% / 0.25)",
        secondary: "hsl(260 70% 60% / 0.18)",
        tertiary: "hsl(200 80% 60% / 0.15)",
        quaternary: "hsl(280 70% 60% / 0.12)",
        quinary: "hsl(340 70% 50% / 0.10)",
        grid: "opacity-[0.08]"
      };
    } else {
      return {
        primary: "hsl(174 72% 46% / 0.15)",
        secondary: "hsl(260 70% 60% / 0.10)",
        tertiary: "hsl(200 80% 60% / 0.08)",
        quaternary: "hsl(280 70% 60% / 0.06)",
        quinary: "hsl(340 70% 50% / 0.05)",
        grid: "opacity-[0.03]"
      };
    }
  };

  const colors = getOrbColors();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Enhanced mesh grid with depth */}
      <motion.div
        className={`absolute -inset-10 ${colors.grid}`}
        style={{
          x: gridX,
          y: gridY,
          backgroundImage: isDark 
            ? "radial-gradient(circle at 1px 1px, hsl(var(--primary) / 0.3) 1px, transparent 0)"
            : "radial-gradient(circle at 1px 1px, hsl(var(--foreground) / 0.2) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Orb 1 — Primary with scroll parallax */}
      <motion.div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
        style={{
          x: orb1X,
          y: useTransform([orb1Y, orb1Scroll], (y, scroll) => y + scroll),
          background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Orb 2 — Secondary with scroll parallax */}
      <motion.div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full"
        style={{
          x: orb2X,
          y: useTransform([orb2Y, orb2Scroll], (y, scroll) => y + scroll),
          background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
          filter: "blur(90px)",
        }}
      />

      {/* Orb 3 — Tertiary with scroll parallax */}
      <motion.div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{
          x: orb3X,
          y: useTransform([orb3Y, orb3Scroll], (y, scroll) => y + scroll),
          background: `radial-gradient(circle, ${colors.tertiary} 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Orb 4 — Quaternary with scroll parallax */}
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-[320px] h-[320px] rounded-full"
        style={{
          x: orb4X,
          y: useTransform([orb4Y, orb4Scroll], (y, scroll) => y + scroll),
          background: `radial-gradient(circle, ${colors.quaternary} 0%, transparent 70%)`,
          filter: "blur(50px)",
        }}
      />

      {/* Orb 5 — Quinary with scroll parallax */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[240px] h-[240px] rounded-full"
        style={{
          x: orb5X,
          y: useTransform([orb5Y, orb5Scroll], (y, scroll) => y + scroll),
          background: `radial-gradient(circle, ${colors.quinary} 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />

      {/* Enhanced particle system */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full"
        style={{ backgroundColor: colors.primary }}
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -50, 25, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-3/4 right-1/3 w-1 h-1 rounded-full"
        style={{ backgroundColor: colors.secondary }}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 40, -20, 0],
          scale: [1, 0.7, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: colors.tertiary }}
        animate={{
          x: [0, 25, -15, 0],
          y: [0, -30, 15, 0],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Professional vignette with atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark 
            ? "radial-gradient(ellipse at center, transparent 40%, hsl(var(--background) / 0.4) 100%)"
            : "radial-gradient(ellipse at center, transparent 50%, hsl(var(--background) / 0.7) 100%)",
        }}
      />
      
      {/* Subtle atmosphere overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(135deg, transparent 0%, hsl(var(--primary) / 0.02) 50%, transparent 100%)"
            : "linear-gradient(135deg, transparent 0%, hsl(var(--primary) / 0.01) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
