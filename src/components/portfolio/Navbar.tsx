import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteConfig } from "@/lib/api";

export default function Navbar() {
  const { data: config } = useQuery({ queryKey: ["site-config"], queryFn: fetchSiteConfig });
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isAssignments = location.pathname === "/assignments";
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  if (typeof window !== "undefined") {
    document.documentElement.classList.toggle("dark", dark);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-card-strong border-b border-border/30 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="font-bold text-lg gradient-text tracking-tight whitespace-nowrap">
            {config?.site_name || "Portfolio"}
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/assignments"
              className={`px-4 py-2 text-sm rounded-xl transition-all duration-300 border ${
                isAssignments
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
              }`}
            >
              Assignments
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-300"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-secondary/60 text-foreground"
            >
              Menu
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card-strong border-b border-border/20 overflow-hidden"
          >
            <div className="px-4 py-3">
              <Link
                to="/assignments"
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isAssignments
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-muted-foreground"
                }`}
              >
                Assignments
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
