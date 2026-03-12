import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchSiteConfig } from "@/lib/api";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Gallery", href: "#gallery" },
  { label: "Resume", href: "#resume" },
];

export default function Navbar() {
  const { data: config } = useQuery({ queryKey: ["site-config"], queryFn: fetchSiteConfig });
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
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
      <div className="glass-card-strong border-b border-border/20 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg gradient-text tracking-tight">
            {config?.site_name || "Portfolio"}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {isHome && navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-300"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/assignments"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-300"
            >
              Assignments
            </Link>
            <button
              onClick={toggleTheme}
              className="ml-2 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-all duration-300"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card-strong border-b border-border/20 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {isHome && navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/assignments"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
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
