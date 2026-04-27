import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  Sparkles,
  Rocket,
  MapPin,
  Calendar,
  Award,
  Users,
  ExternalLink,
  Target,
  Wrench,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Education, Experience, SiteConfig } from "@/lib/api";
import { useBreakpoint } from "@/hooks/use-breakpoint";

interface JourneyWindowProps {
  config: SiteConfig | null;
  education: Education[];
  experience: Experience[];
}

type Slide =
  | { kind: "intro"; title: string; subtitle: string; content: string; accent: string }
  | { kind: "future"; title: string; subtitle: string; content: string; accent: string }
  | { kind: "education"; data: Education; accent: string }
  | { kind: "experience"; data: Experience; accent: string };

function formatDateRange(start?: string | null, end?: string | null, fallback?: string | null, ongoing = false) {
  if (start || end || ongoing) {
    const s = start || "";
    const e = ongoing ? "Present" : (end || "Present");
    return `${s}${s ? " — " : ""}${e}`;
  }
  return fallback || "";
}

function OngoingBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-[11px] text-primary font-medium uppercase tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      {label}
    </span>
  );
}

function normalizeUrl(url: string) {
  return /^(https?:|mailto:|tel:)/i.test(url) ? url : "https://" + url;
}

// ───────── Section atoms ─────────
function MetaPill({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/40 border border-border/30 text-[11px] text-muted-foreground">
      <Icon className="w-3 h-3 text-primary/70" />
      {children}
    </div>
  );
}

function Section({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-primary/80">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{children}</div>
    </div>
  );
}

function TechChips({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span
          key={t}
          className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-primary/10 text-primary border border-primary/20"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

// ───────── Card body (shared content for an edu/exp slide) ─────────
function EducationBody({ edu, compact = false }: { edu: Education; compact?: boolean }) {
  const range = formatDateRange(edu.start_date, edu.end_date, edu.year);
  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
      <div className="flex flex-wrap gap-2">
        {range && <MetaPill icon={Calendar}>{range}</MetaPill>}
        {edu.location && <MetaPill icon={MapPin}>{edu.location}</MetaPill>}
        {edu.field_of_study && <MetaPill icon={GraduationCap}>{edu.field_of_study}</MetaPill>}
      </div>
      {edu.achievements && (
        <Section icon={Award} label="Achievements">
          {edu.achievements}
        </Section>
      )}
      {edu.activities && (
        <Section icon={Users} label="Activities">
          {edu.activities}
        </Section>
      )}
      {edu.certificate_url && (
        <a
          href={normalizeUrl(edu.certificate_url)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 border border-primary/20 text-primary text-xs font-medium transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> View Certificate
        </a>
      )}
    </div>
  );
}

function ExperienceBody({ exp, compact = false }: { exp: Experience; compact?: boolean }) {
  const range = formatDateRange(exp.start_date, exp.end_date, exp.duration);
  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
      <div className="flex flex-wrap gap-2">
        {exp.employment_type && <MetaPill icon={Briefcase}>{exp.employment_type}</MetaPill>}
        {range && <MetaPill icon={Calendar}>{range}</MetaPill>}
        {exp.location && <MetaPill icon={MapPin}>{exp.location}</MetaPill>}
      </div>
      {exp.description && (
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{exp.description}</p>
      )}
      {exp.responsibilities && (
        <Section icon={Target} label="Key Responsibilities">
          {exp.responsibilities}
        </Section>
      )}
      {exp.achievements && (
        <Section icon={Award} label="Impact & Achievements">
          {exp.achievements}
        </Section>
      )}
      {exp.technologies && exp.technologies.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-primary/80">
            <Wrench className="w-3 h-3" /> Stack
          </div>
          <TechChips items={exp.technologies} />
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {exp.attachment_url && (
          <a
            href={normalizeUrl(exp.attachment_url)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 border border-primary/20 text-primary text-xs font-medium transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> Portfolio / Repo
          </a>
        )}
        {exp.reference_contact && (
          <a
            href={
              exp.reference_contact.includes("@")
                ? `mailto:${exp.reference_contact}`
                : normalizeUrl(exp.reference_contact)
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/40 text-xs font-medium transition-colors"
          >
            <Mail className="w-3 h-3" /> Reference
          </a>
        )}
      </div>
    </div>
  );
}

// ───────── Slide header (logo + titles) ─────────
function SlideHeader({
  icon: Icon,
  subtitle,
  title,
  caption,
  logoUrl,
  size = "md",
}: {
  icon: any;
  subtitle: string;
  title: string;
  caption?: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const logoBox = size === "lg" ? "w-16 h-16" : size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const iconSize = size === "lg" ? "w-7 h-7" : size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const titleCls = size === "lg" ? "text-4xl md:text-5xl" : size === "sm" ? "text-xl" : "text-2xl";
  return (
    <div className="flex items-start gap-3 md:gap-4">
      <div
        className={`${logoBox} shrink-0 rounded-xl bg-secondary/50 border border-border/40 overflow-hidden flex items-center justify-center`}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Icon className={`${iconSize} text-primary`} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-primary font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase">{subtitle}</p>
        <h2 className={`${titleCls} font-bold tracking-tight leading-tight mt-1 gradient-text`}>{title}</h2>
        {caption && <p className="text-xs md:text-sm text-muted-foreground/80 mt-1">{caption}</p>}
      </div>
    </div>
  );
}

// ───────── Slide renderer ─────────
function SlideContent({ slide, compact = false }: { slide: Slide; compact?: boolean }) {
  if (slide.kind === "intro" || slide.kind === "future") {
    const Icon = slide.kind === "intro" ? Sparkles : Rocket;
    return (
      <div className="space-y-5">
        <SlideHeader icon={Icon} subtitle={slide.subtitle} title={slide.title} size={compact ? "md" : "lg"} />
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {slide.content}
        </p>
      </div>
    );
  }
  if (slide.kind === "education") {
    const e = slide.data;
    return (
      <div className="space-y-5">
        <SlideHeader
          icon={GraduationCap}
          subtitle="Education"
          title={e.institution}
          caption={[e.degree, e.field_of_study].filter(Boolean).join(" · ")}
          logoUrl={e.logo_url}
          size={compact ? "md" : "lg"}
        />
        <EducationBody edu={e} compact={compact} />
      </div>
    );
  }
  const x = slide.data;
  return (
    <div className="space-y-5">
      <SlideHeader
        icon={Briefcase}
        subtitle="Experience"
        title={x.company}
        caption={x.role || ""}
        logoUrl={x.logo_url}
        size={compact ? "md" : "lg"}
      />
      <ExperienceBody exp={x} compact={compact} />
    </div>
  );
}

export default function JourneyWindow({ config, education, experience }: JourneyWindowProps) {
  const bp = useBreakpoint();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  const slides: Slide[] = [
    {
      kind: "intro",
      title: "Who I Am",
      subtitle: "The Beginning",
      content: config?.about_text || "A passionate developer building the future.",
      accent: "from-primary to-cyan-500",
    },
    ...education.map((edu) => ({ kind: "education" as const, data: edu, accent: "from-blue-500 to-primary" })),
    ...experience.map((exp) => ({ kind: "experience" as const, data: exp, accent: "from-emerald-500 to-primary" })),
    {
      kind: "future",
      title: "What's Next",
      subtitle: "The Future",
      content: config?.hero_headline || "Building something extraordinary.",
      accent: "from-primary to-purple-500",
    },
  ];

  // Desktop horizontal-scroll wheel binding
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

  // ─── MOBILE: vertical scroll feed (best for long content) ───
  if (bp === "mobile") {
    return (
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="px-4 py-5 space-y-4">
          {slides.map((slide, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35 }}
              className="relative rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-[0.04] pointer-events-none`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono text-muted-foreground/50">
                    {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                  </span>
                  <div className="flex-1 h-px bg-border/30" />
                </div>
                <SlideContent slide={slide} compact />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    );
  }

  // ─── TABLET: vertical timeline w/ rail ───
  if (bp === "tablet") {
    return (
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="px-6 py-6 relative">
          <div className="absolute left-[34px] top-8 bottom-8 w-px bg-gradient-to-b from-primary/40 via-border/40 to-transparent" />
          <div className="space-y-5">
            {slides.map((slide, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.04 }}
                className="relative pl-16"
              >
                <div className="absolute left-[26px] top-5 w-4 h-4 rounded-full bg-primary border-4 border-background ring-2 ring-primary/30" />
                <div className="relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-[0.04]`} />
                  <div className="relative">
                    <SlideContent slide={slide} compact />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── DESKTOP: horizontal cinematic deck ───
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIdx(Math.max(0, Math.min(slides.length - 1, idx)));
  };

  const goTo = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
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
          <div
            key={i}
            className="min-w-full h-full snap-center flex items-center justify-center px-12 lg:px-20 py-10 relative"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-[0.05] pointer-events-none`} />
            <motion.div
              key={`anim-${i}-${activeIdx === i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl w-full max-h-full overflow-y-auto custom-scrollbar pr-2 relative"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground/50 font-mono">
                  {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
                <div className="flex-1 h-px bg-border/30" />
              </div>
              <SlideContent slide={slide} />
            </motion.div>
          </div>
        ))}
      </div>

      {/* Nav controls */}
      <div className="shrink-0 border-t border-border/30 bg-background/40 backdrop-blur-sm">
        <div className="h-1 bg-secondary/20 relative">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-emerald-400 to-cyan-400"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 gap-3">
          <button
            onClick={() => goTo(Math.max(0, activeIdx - 1))}
            disabled={activeIdx === 0}
            className="p-1.5 rounded-lg hover:bg-secondary/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIdx ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-1.5"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => goTo(Math.min(slides.length - 1, activeIdx + 1))}
            disabled={activeIdx === slides.length - 1}
            className="p-1.5 rounded-lg hover:bg-secondary/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
