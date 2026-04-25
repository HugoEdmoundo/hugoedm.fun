import { motion } from "framer-motion";

interface DesktopIconProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  delay?: number;
}

export default function DesktopIcon({ icon, label, onClick, delay = 0 }: DesktopIconProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: "spring", damping: 18, stiffness: 200 }}
      whileHover={{ scale: 1.12, x: 4 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      onDoubleClick={onClick}
      aria-label={label}
      title={label}
      className="relative group flex items-center justify-center cursor-pointer select-none"
      style={{ width: 52, height: 52 }}
    >
      {/* Icon circle — solid, no blur, high contrast */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
        style={{
          background: "rgba(0,0,0,0.45)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.92)",
        }}
      >
        {icon}
      </div>

      {/* Tooltip on hover — appears to the right */}
      <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
        <div
          className="px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap"
          style={{
            background: "rgba(0,0,0,0.75)",
            color: "rgba(255,255,255,0.95)",
            border: "0.5px solid rgba(255,255,255,0.15)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {label}
        </div>
        {/* Arrow */}
        <div
          className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-0 h-0"
          style={{
            borderTop: "4px solid transparent",
            borderBottom: "4px solid transparent",
            borderRight: "5px solid rgba(0,0,0,0.75)",
          }}
        />
      </div>
    </motion.button>
  );
}
