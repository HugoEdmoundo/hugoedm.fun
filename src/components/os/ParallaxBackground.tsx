import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

// Fallback images — railway station anime art
const FALLBACK_DAY = "https://res.cloudinary.com/dfwutfkbn/image/upload/v1775722200/1775722060311.png_image_xf3ncx.png";
const FALLBACK_NIGHT = "https://res.cloudinary.com/dfwutfkbn/image/upload/v1775722200/Gemini_Generated_Image_7tahg67tahg67tah_hulo3v.png";

interface ParallaxBackgroundProps {
  dayUrl?: string | null;
  nightUrl?: string | null;
  isNight: boolean;
}

export default function ParallaxBackground({ dayUrl, nightUrl, isNight }: ParallaxBackgroundProps) {
  const day = dayUrl || FALLBACK_DAY;
  const night = nightUrl || FALLBACK_NIGHT;

  // Mouse parallax
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 60, damping: 20 });

  // Parallax layers — deeper layers move more
  const bgX = useTransform(springX, (v) => `${v * 0.8}px`);
  const bgY = useTransform(springY, (v) => `${v * 0.8}px`);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      rawX.set((e.clientX - cx) / cx * 18);
      rawY.set((e.clientY - cy) / cy * 12);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [rawX, rawY]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* ── DAY image ── */}
      <motion.div
        className="absolute inset-[-4%]"
        style={{ x: bgX, y: bgY }}
        animate={{ opacity: isNight ? 0 : 1 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <img
          src={day}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </motion.div>

      {/* ── NIGHT image ── */}
      <motion.div
        className="absolute inset-[-4%]"
        style={{ x: bgX, y: bgY }}
        animate={{ opacity: isNight ? 1 : 0 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <img
          src={night}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </motion.div>

      {/* ── Cinematic vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* ── Center darkening — biar teks di tengah selalu terbaca ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,0,0,0.28) 0%, transparent 100%)",
        }}
      />

      {/* ── Bottom gradient fade — blends into UI ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none"
        animate={{ opacity: isNight ? 1 : 0.85 }}
        transition={{ duration: 1.2 }}
        style={{
          background: isNight
            ? "linear-gradient(to top, hsl(230 25% 6%) 0%, transparent 100%)"
            : "linear-gradient(to top, hsl(40 30% 94%) 0%, transparent 100%)",
        }}
      />

      {/* ── Top gradient fade — blends into menu bar ── */}
      <div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: isNight
            ? "linear-gradient(to bottom, rgba(10,12,28,0.75) 0%, transparent 100%)"
            : "linear-gradient(to bottom, rgba(255,252,245,0.70) 0%, transparent 100%)",
        }}
      />

      {/* ── Night ambient glow overlay ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isNight ? 1 : 0 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(ellipse at 30% 80%, rgba(60,40,160,0.22) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(20,50,110,0.18) 0%, transparent 50%)",
        }}
      />

      {/* ── Day warm glow overlay ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isNight ? 0 : 1 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, rgba(255,210,100,0.15) 0%, transparent 50%)",
        }}
      />
    </div>
  );
}
