import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
      title: "Who I Am",
      subtitle: "The Beginning",
      content: config?.about_text || "A passionate developer building the future.",
      accent: "from-primary/20 to-cyan-500/20",
    },
    ...education.map((edu) => ({
      title: edu.institution,
      subtitle: edu.degree || "Education",
      content: edu.year || "",
      accent: "from-blue-500/20 to-primary/20",
      logoUrl: edu.logo_url,
    })),
    ...experience.map((exp) => ({
      title: exp.company,
      subtitle: exp.role || "Experience",
      content: exp.description || exp.duration || "",
      accent: "from-emerald-500/20 to-primary/20",
      logoUrl: exp.logo_url,
    })),
    {
      title: "What's Next",
      subtitle: "The Future",
      content: config?.hero_headline || "Building something extraordinary.",
      accent: "from-primary/20 to-purple-500/20",
    },
  ];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0);
  };

  // Handle mouse wheel → horizontal scroll
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
            className="min-w-full h-full snap-center flex items-center justify-center p-8 md:p-16"
          >
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl w-full"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-20 rounded-xl pointer-events-none`} />
              
              {"logoUrl" in slide && slide.logoUrl && (
                <div className="w-16 h-16 rounded-xl bg-secondary/50 border border-border/30 overflow-hidden mb-6">
                  <img src={slide.logoUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              
              <p className="text-primary font-mono text-xs tracking-[0.3em] uppercase mb-3">
                {slide.subtitle}
              </p>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">{slide.title}</h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                {slide.content}
              </p>
              
              <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground/50 font-mono">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>/</span>
                <span>{String(slides.length).padStart(2, "0")}</span>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-secondary/30 shrink-0">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full"
          style={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", damping: 30 }}
        />
      </div>
    </div>
  );
}
