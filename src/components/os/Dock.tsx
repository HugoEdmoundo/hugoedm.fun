import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useState, useRef } from "react";
import { useIsTouchDevice } from "@/hooks/use-breakpoint";

export interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}

interface DockProps {
  items: DockItem[];
  hasWindows?: boolean;
}

// macOS-style magnification per icon
function DockIcon({ item, index, mouseX, isTouch }: {
  item: DockItem;
  index: number;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  isTouch: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  // Distance from mouse to this icon center → scale
  const distance = useTransform(mouseX, (val) => {
    if (isTouch || !ref.current) return 999;
    const rect = ref.current.getBoundingClientRect();
    return Math.abs(val - (rect.left + rect.width / 2));
  });

  const scaleRaw = useTransform(distance, [0, 50, 100], [1.25, 1.12, 1]);
  const scale = useSpring(scaleRaw, { stiffness: 350, damping: 25 });

  const yRaw = useTransform(distance, [0, 50, 100], [-6, -2, 0]);
  const y = useSpring(yRaw, { stiffness: 350, damping: 25 });

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.button
      ref={ref}
      style={{ scale, y }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onTouchEnd={() => setShowTooltip(false)}
      onClick={item.onClick}
      whileTap={{ scale: 0.88 }}
      className="relative flex flex-col items-center origin-bottom"
      aria-label={item.label}
    >
      {/* Tooltip */}
      {showTooltip && !isTouch && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-9 left-1/2 -translate-x-1/2 pointer-events-none z-50"
        >
          <div
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap"
            style={{
              background: "rgba(0,0,0,0.72)",
              color: "rgba(255,255,255,0.95)",
              border: "0.5px solid rgba(255,255,255,0.15)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            {item.label}
          </div>
        </motion.div>
      )}

      {/* Icon box — macOS style */}
      <div
        className="w-12 h-12 md:w-14 md:h-14 lg:w-[52px] lg:h-[52px] rounded-2xl flex items-center justify-center transition-colors duration-150"
        style={{
          background: item.active
            ? "rgba(255,255,255,0.20)"
            : "rgba(255,255,255,0.08)",
          border: "0.5px solid rgba(255,255,255,0.18)",
          boxShadow: item.active
            ? "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
            : "0 2px 10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.10)",
          color: item.active ? "hsl(var(--primary))" : "rgba(255,255,255,0.85)",
        }}
      >
        <span className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center">
          {item.icon}
        </span>
      </div>

      {/* Active dot */}
      {item.active && (
        <div
          className="absolute -bottom-1.5 w-1 h-1 rounded-full"
          style={{ background: "hsl(var(--primary))" }}
        />
      )}
    </motion.button>
  );
}

export default function Dock({ items, hasWindows = false }: DockProps) {
  const isTouch = useIsTouchDevice();
  const mouseX = useMotionValue(Infinity);

  const mainItems = items.filter((i) => i.id !== "theme");
  const themeItem = items.find((i) => i.id === "theme");
  const allItems = themeItem ? [...mainItems, themeItem] : mainItems;

  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: hasWindows ? 120 : 0, opacity: hasWindows ? 0 : 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 30, delay: hasWindows ? 0 : 0.8 }}
      className="fixed bottom-2 left-0 right-0 flex justify-center z-40 pointer-events-none"
      style={{ pointerEvents: hasWindows ? "none" : "auto" }}
    >
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="liquid-glass-dock flex items-end gap-1.5 md:gap-2 lg:gap-3 px-3 md:px-4 lg:px-5 py-2 lg:py-3 pointer-events-auto"
        style={{ borderRadius: 20 }}
      >
        {allItems.map((item, i) => (
          <DockIcon
            key={item.id}
            item={item}
            index={i}
            mouseX={mouseX}
            isTouch={isTouch}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
