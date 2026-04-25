import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Education, Experience, SiteConfig } from "@/lib/api";
import { useBreakpoint } from "@/hooks/use-breakpoint";

interface JourneyWindowProps {
  config: SiteConfig | null;
  education: Education[];
  experience: Experience[];
}

export default function JourneyWindow({ config, education, experience }: JourneyWindowProps) {
  const bp = useBreakpoint();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // Desktop horizontal-scroll wheel binding (must be top-level for hooks rules)
  useEffect(() => {
    if (bp !== "desktop") return;
    const el = scrollRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [bp]);

  const slides = [
    {
      type: "intro" as const,
      title: "Who I Am",
      subtitle: "The Beginning",
      content: config?.about_text || "A passionate developer building the future.",
      accent: "from-primary to-cyan-500",
    },
    ...education.map((edu) => ({
      type: "education" as const,
      title: edu.institution,
      subtitle: edu.degree || "Education",
      content: edu.year || "",
      accent: "from-blue-500 to-primary",
      logoUrl: edu.logo_url,
    })),
    ...experience.map((exp) => ({
      type: "experience" as const,
      title: exp.company,
      subtitle: exp.role || "Experience",
      content: exp.description || exp.duration || "",
      accent: "from-emerald-500 to-primary",
      logoUrl: exp.logo_url,
      duration: exp.duration,
    })),
    {
      type: "future" as const,
      title: "What's Next",
      subtitle: "The Future",
      content: config?.hero_headline || "Building something extraordinary.",
      accent: "from-primary to-purple-500",
    },
  ];

  // ─── MOBILE: horizontal swipe slides ─────────────────────────────
  if (bp === "mobile") {
    return (
      <div className="h-full flex flex-col">
        <div
          className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="min-w-full h-full snap-center flex flex-col justify-center px-6 py-8 relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-[0.05] pointer-events-none`} />
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.6 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="flex items-center gap-3 mb-4">
                  {"logoUrl" in slide && slide.logoUrl && (
                    <div className="w-12 h-12 rounded-xl bg-secondary/50 border border-border/30 overflow-hidden shrink-0">
                      <img src={slide.logoUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="text-primary font-mono text-[10px] tracking-[0.3em] uppercase">{slide.subtitle}</p>
                    {"duration" in slide && slide.duration && (
                      <p className="text-muted-foreground/50 font-mono text-[10px] mt-0.5">{slide.duration}</p>
                    )}
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-4 tracking-tight leading-tight gradient-text">{slide.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{slide.content}</p>
                <div className="mt-8 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground/40 font-mono">
                    {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                  </span>
                  <div className="flex-1 h-px bg-border/20" />
                  {i < slides.length - 1 && (
                    <span className="text-[10px] text-muted-foreground/30 font-mono">swipe →</span>
                  )}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 py-3 shrink-0">
          {slides.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          ))}
        </div>
      </div>
    );
  }

  // ─── TABLET: 2-column compact card grid ───────────────────────────
  if (bp === "tablet") {
    return (
      <div className="p-4 grid grid-cols-2 gap-3">
        {slides.map((slide, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-4 bg-card/50 border border-border/30 relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-[0.05]`} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                {"logoUrl" in slide && slide.logoUrl && (
                  <div className="w-8 h-8 rounded-lg bg-secondary/50 border border-border/30 overflow-hidden shrink-0">
                    <img src={slide.logoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-[10px] font-mono text-primary tracking-widest uppercase">{slide.subtitle}</p>
              </div>
              <h3 className="text-lg font-bold mb-1.5">{slide.title}</h3>
              {"duration" in slide && slide.duration && (
                <p className="text-[10px] text-muted-foreground/60 font-mono mb-1.5">{slide.duration}</p>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{slide.content}</p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // ─── DESKTOP: horizontal cinematic scroll ─────────────────────────
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
  };

  return (
    <div className="h-full flex flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory custom-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="min-w-full h-full snap-center flex items-center justify-center p-16 relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-[0.04] pointer-events-none`} />
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl w-full relative"
            >
              <div className="flex items-center gap-3 mb-6">
                {"logoUrl" in slide && slide.logoUrl && (
                  <div className="w-14 h-14 rounded-xl bg-secondary/50 border border-border/30 overflow-hidden shrink-0">
                    <img src={slide.logoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-primary font-mono text-xs tracking-[0.3em] uppercase">{slide.subtitle}</p>
                  {"duration" in slide && slide.duration && (
                    <p className="text-muted-foreground/50 font-mono text-[10px] mt-0.5">{slide.duration}</p>
                  )}
                </div>
              </div>
              <h2 className="text-5xl font-bold mb-6 tracking-tight leading-tight">{slide.title}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">{slide.content}</p>
              <div className="mt-10 flex items-center gap-3">
                <span className="text-xs text-muted-foreground/40 font-mono">
                  {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
                <div className="flex-1 h-px bg-border/20" />
                {i < slides.length - 1 && (
                  <span className="text-[10px] text-muted-foreground/30 font-mono">scroll →</span>
                )}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      <div className="h-1.5 bg-secondary/20 shrink-0 relative">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 rounded-full"
          style={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", damping: 30 }}
        />
        <div className="absolute inset-0 flex items-center justify-between px-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i / (slides.length - 1) <= progress ? "bg-primary" : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
