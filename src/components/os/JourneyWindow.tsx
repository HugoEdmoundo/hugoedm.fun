import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Education, Experience, SiteConfig } from "@/lib/api";

interface JourneyWindowProps {
  config: SiteConfig | null;
  education: Education[];
  experience: Experience[];
}

export default function JourneyWindow({ config, education, experience }: JourneyWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

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

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
  };

  useEffect(() => {
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
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory custom-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="min-w-full h-full snap-center flex items-center justify-center p-8 md:p-16 relative"
          >
            {/* Background accent */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-[0.04] pointer-events-none`} />

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl w-full relative"
            >
              {/* Type badge */}
              <div className="flex items-center gap-3 mb-6">
                {"logoUrl" in slide && slide.logoUrl && (
                  <div className="w-14 h-14 rounded-xl bg-secondary/50 border border-border/30 overflow-hidden shrink-0">
                    <img src={slide.logoUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-primary font-mono text-xs tracking-[0.3em] uppercase">
                    {slide.subtitle}
                  </p>
                  {"duration" in slide && slide.duration && (
                    <p className="text-muted-foreground/50 font-mono text-[10px] mt-0.5">{slide.duration}</p>
                  )}
                </div>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">{slide.title}</h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                {slide.content}
              </p>

              {/* Slide counter */}
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

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary/20 shrink-0 relative">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 rounded-full"
          style={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", damping: 30 }}
        />
        {/* Step dots */}
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
