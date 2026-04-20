import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * ParallaxBackground — subtle, normal background with mouse parallax.
 * - Soft mesh grid
 * - 3 floating gradient orbs (parallax pakai mouse position)
 * - Light vignette
 */
export default function ParallaxBackground() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 40, damping: 20, mass: 0.6 });

  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
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

  // Different parallax depths
  const orb1X = useTransform(sx, (v) => v * 30);
  const orb1Y = useTransform(sy, (v) => v * 30);
  const orb2X = useTransform(sx, (v) => v * -45);
  const orb2Y = useTransform(sy, (v) => v * -45);
  const orb3X = useTransform(sx, (v) => v * 18);
  const orb3Y = useTransform(sy, (v) => v * 18);
  const gridX = useTransform(sx, (v) => v * -8);
  const gridY = useTransform(sy, (v) => v * -8);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Mesh grid */}
      <motion.div
        className="absolute -inset-10 opacity-[0.05] dark:opacity-[0.07]"
        style={{
          x: gridX,
          y: gridY,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Orb 1 — primary */}
      <motion.div
        className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full"
        style={{
          x: orb1X,
          y: orb1Y,
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Orb 2 — accent */}
      <motion.div
        className="absolute -bottom-40 -right-40 w-[620px] h-[620px] rounded-full"
        style={{
          x: orb2X,
          y: orb2Y,
          background:
            "radial-gradient(circle, hsl(260 70% 60% / 0.14) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* Orb 3 — soft cyan */}
      <motion.div
        className="absolute top-1/3 right-1/4 w-[360px] h-[360px] rounded-full"
        style={{
          x: orb3X,
          y: orb3Y,
          background:
            "radial-gradient(circle, hsl(200 80% 60% / 0.10) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, hsl(var(--background) / 0.6) 100%)",
        }}
      />
    </div>
  );
}
