import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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
}

// Liquid blob that flows to the active item
function LiquidBlob({ activeIndex, itemCount }: { activeIndex: number | null; itemCount: number }) {
  if (activeIndex === null) return null;
  // Each item is ~48px wide (40px icon + 8px padding)
  const itemW = 48;
  const blobX = activeIndex * itemW + itemW / 2;

  return (
    <motion.div
      className="absolute bottom-1 pointer-events-none"
      style={{ left: blobX - 22, width: 44, height: 44 }}
      layoutId="liquid-blob"
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-[14px] bg-primary/20 blur-[6px]" />
      {/* Glass fill */}
      <div
        className="absolute inset-0 rounded-[14px]"
        style={{
          background:
            "linear-gradient(135deg, hsl(174 72% 46% / 0.35) 0%, hsl(174 72% 60% / 0.18) 50%, hsl(210 70% 50% / 0.22) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.08), 0 4px 16px hsl(174 72% 46% / 0.25)",
          border: "0.5px solid rgba(255,255,255,0.3)",
        }}
      />
      {/* Mesh shimmer */}
      <motion.div
        className="absolute inset-0 rounded-[14px] opacity-60"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%), radial-gradient(circle at 70% 70%, hsl(174 72% 70% / 0.2) 0%, transparent 50%)",
        }}
      />
    </motion.div>
  );
}

export default function Dock({ items }: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isTouch = useIsTouchDevice();

  const mainItems = items.filter((i) => i.id !== "theme");
  const themeItem = items.find((i) => i.id === "theme");
  const allItems = themeItem ? [...mainItems, themeItem] : mainItems;

  const activeIndex = allItems.findIndex((i) => i.active);

  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 22 }}
      className="fixed bottom-5 left-0 right-0 flex justify-center z-50 pointer-events-none px-4"
    >
      {/* Floating island container */}
      <div
        className="liquid-glass-dock relative flex items-end gap-0 px-2 py-2 pointer-events-auto overflow-x-auto max-w-[calc(100vw-32px)]"
        style={{ borderRadius: 26, scrollbarWidth: "none" }}
      >
        {/* Liquid blob layer — sits behind icons */}
        <LiquidBlob activeIndex={activeIndex >= 0 ? activeIndex : null} itemCount={allItems.length} />

        {/* Separator before theme */}
        {allItems.map((item, i) => {
          const isTheme = item.id === "theme";
          const isFirstTheme = isTheme && mainItems.length > 0 && i === mainItems.length;
          const distance = !isTouch && hoveredIndex !== null ? Math.abs(i - hoveredIndex) : 999;
          const hoverScale =
            distance === 0 ? 1.38 : distance === 1 ? 1.16 : distance === 2 ? 1.05 : 1;
          const hoverY = distance === 0 ? -10 : distance === 1 ? -4 : 0;

          return (
            <div key={item.id} className="flex items-end">
              {isFirstTheme && (
                <div
                  className="self-center mx-1 w-px h-6 rounded-full"
                  style={{ background: "rgba(255,255,255,0.18)" }}
                />
              )}
              <motion.button
                onHoverStart={() => !isTouch && setHoveredIndex(i)}
                onHoverEnd={() => !isTouch && setHoveredIndex(null)}
                onPointerLeave={() => setHoveredIndex(null)}
                onPointerCancel={() => setHoveredIndex(null)}
                onTouchEnd={() => setHoveredIndex(null)}
                onClick={() => {
                  item.onClick();
                  if (isTouch) setHoveredIndex(null);
                }}
                animate={{
                  scale: !isTouch && hoveredIndex !== null ? hoverScale : 1,
                  y: !isTouch && hoveredIndex !== null ? hoverY : 0,
                }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 420, damping: 20 }}
                className="relative group"
                aria-label={item.label}
              >
                {/* Icon wrapper */}
                <div
                  className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-[13px] flex items-center justify-center relative z-10 transition-colors duration-200"
                  style={{
                    color: item.active
                      ? "hsl(174 72% 46%)"
                      : "hsl(var(--muted-foreground))",
                  }}
                >
                  {/* Outline-to-filled icon micro-interaction */}
                  <motion.span
                    animate={{ opacity: 1, scale: item.active ? 1.08 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="flex items-center justify-center"
                  >
                    {item.icon}
                  </motion.span>
                </div>

                {/* Active dot */}
                <AnimatePresence>
                  {item.active && (
                    <motion.div
                      key="dot"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                      style={{ boxShadow: "0 0 6px hsl(174 72% 46% / 0.8)" }}
                    />
                  )}
                </AnimatePresence>

                {/* Tooltip — disabled on touch */}
                {!isTouch && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                  <div
                    className="px-2 py-1 text-[10px] font-medium whitespace-nowrap text-foreground rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(12px)",
                      border: "0.5px solid rgba(255,255,255,0.25)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
                )}
              </motion.button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
