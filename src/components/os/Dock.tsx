import { motion } from "framer-motion";
import { useState } from "react";

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

export default function Dock({ items }: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8, type: "spring", damping: 20 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-end gap-1 px-3 py-2 rounded-2xl bg-card/70 backdrop-blur-2xl border border-border/40 shadow-2xl shadow-black/20">
        {items.map((item, i) => {
          const distance = hoveredIndex !== null ? Math.abs(i - hoveredIndex) : 999;
          const baseScale = 1;
          const hoverScale = distance === 0 ? 1.45 : distance === 1 ? 1.2 : distance === 2 ? 1.05 : 1;

          return (
            <motion.button
              key={item.id}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={item.onClick}
              animate={{
                scale: hoveredIndex !== null ? hoverScale : baseScale,
                y: hoveredIndex !== null && distance <= 1 ? -(distance === 0 ? 12 : 4) : 0,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="relative group"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                  item.active
                    ? "bg-primary/20 border border-primary/40 text-primary"
                    : "bg-secondary/60 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {item.icon}
              </div>
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="px-2 py-1 rounded-md bg-card/95 backdrop-blur-xl border border-border/50 text-[10px] font-medium whitespace-nowrap text-foreground shadow-lg">
                  {item.label}
                </div>
              </div>
              {/* Active dot */}
              {item.active && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
