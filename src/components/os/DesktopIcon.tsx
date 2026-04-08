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
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", damping: 15 }}
      whileHover={{ scale: 1.08, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onDoubleClick={onClick}
      className="flex flex-col items-center gap-1.5 md:gap-2 p-2 md:p-3 rounded-xl hover:bg-card/40 backdrop-blur-sm transition-colors group cursor-pointer select-none"
      style={{ width: typeof window !== "undefined" && window.innerWidth < 768 ? 70 : 90 }}
    >
      <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl bg-card/60 backdrop-blur-xl border border-border/40 flex items-center justify-center text-primary group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300">
        {icon}
      </div>
      <span className="text-[10px] md:text-[11px] font-medium text-foreground/80 leading-tight text-center group-hover:text-foreground transition-colors line-clamp-1">
        {label}
      </span>
    </motion.button>
  );
}
