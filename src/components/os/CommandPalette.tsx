import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, FolderOpen, Palette, Image, GraduationCap, ListTodo, Command } from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  items: CommandItem[];
}

export default function CommandPalette({ items }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = items.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
      }
      if (e.key === "Escape") setOpen(false);
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const select = (item: CommandItem) => {
    item.action();
    setOpen(false);
    setQuery("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg mx-4 rounded-xl bg-card/95 backdrop-blur-2xl border border-border/50 shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered.length > 0) {
                    select(filtered[0]);
                  }
                }}
              />
              <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-secondary/60 text-[10px] text-muted-foreground font-mono">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[280px] overflow-auto custom-scrollbar py-2">
              {filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 text-center py-6">No results found.</p>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => select(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                      {item.icon}
                    </div>
                    <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors">{item.label}</span>
                  </button>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-border/20 flex items-center gap-4 text-[10px] text-muted-foreground/40 font-mono">
              <span className="flex items-center gap-1"><Command className="w-3 h-3" />K to toggle</span>
              <span>↵ to select</span>
              <span>ESC to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
