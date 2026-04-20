import { Download, Store, ArrowUpRight, FileText, icons } from "lucide-react";
import type { SiteConfig } from "@/lib/api";
import { BentoCard, BentoGrid } from "./BentoGrid";
import { useGitHubRepos } from "@/lib/github";
import { useBreakpoint } from "@/hooks/use-breakpoint";

interface ProfileWindowProps {
  config: SiteConfig | null;
  socialLinks?: { id: string; platform: string; url: string; icon: string }[];
}

export default function ProfileWindow({ config, socialLinks = [] }: ProfileWindowProps) {
  const bp = useBreakpoint();
  const { data: repos } = useGitHubRepos(config?.github_username ?? undefined);
  const marketplaceText = String((config as any)?.marketplace_cta_text ?? "Visit Marketplace").trim();
  const marketplaceUrl = String((config as any)?.marketplace_cta_url ?? "").trim();

  // Hero — selalu sama tapi dipadatkan di mobile
  const Hero = (
    <BentoCard delay={0} className={`${bp === "mobile" ? "py-5" : "py-8"} text-center relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        {config?.hero_photo_url && (
          <div className={`${bp === "mobile" ? "w-16 h-16" : "w-20 h-20"} mx-auto rounded-full overflow-hidden border-2 border-primary/30 ring-4 ring-primary/10 mb-3`}>
            <img src={config.hero_photo_url} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
        <h2 className={`${bp === "mobile" ? "text-xl" : "text-2xl"} font-bold gradient-text`}>
          {config?.hero_name || "Your Name"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{config?.hero_headline || "Developer"}</p>
        {config?.description && (
          <p className="text-[10px] text-muted-foreground/40 mt-2 font-mono max-w-xs mx-auto">{config.description}</p>
        )}
      </div>
    </BentoCard>
  );

  // CV button — prominent
  const CvButton = config?.cv_url ? (
    <a
      href={config.cv_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
    >
      <FileText className="w-4 h-4" />
      Show CV
      <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
    </a>
  ) : null;

  const About = config?.about_text && (
    <BentoCard delay={0.15}>
      <p className="text-[10px] font-mono text-primary tracking-widest uppercase mb-2">About</p>
      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{config.about_text}</p>
    </BentoCard>
  );

  const SocialActions = (
    <BentoGrid className={bp === "mobile" ? "grid-cols-2" : bp === "tablet" ? "grid-cols-3" : "grid-cols-2"}>
      {socialLinks.map((link, i) => {
        const LucideIcon = (icons as any)[link.icon];
        return (
          <BentoCard key={link.id} delay={0.2 + i * 0.04} className="flex items-center gap-3">
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full group">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                {LucideIcon ? <LucideIcon className="w-4 h-4 text-primary" /> : <span className="text-xs">{link.platform[0]}</span>}
              </div>
              <span className="text-xs font-medium truncate">{link.platform}</span>
            </a>
          </BentoCard>
        );
      })}

      {marketplaceUrl && (
        <BentoCard delay={0.4} className="bg-primary/5 border-primary/15">
          <a href={marketplaceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary truncate">{marketplaceText}</span>
            <ArrowUpRight className="w-3 h-3 text-primary ml-auto shrink-0" />
          </a>
        </BentoCard>
      )}
    </BentoGrid>
  );

  const ReposCard = repos && repos.length > 0 && (
    <BentoCard delay={0.45}>
      <p className="text-[10px] font-mono text-primary tracking-widest uppercase mb-3">Recent Repos</p>
      <div className="space-y-2">
        {repos.slice(0, bp === "mobile" ? 3 : 5).map((repo) => (
          <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs hover:text-primary transition-colors">
            <span className="truncate font-medium">{repo.name}</span>
            <span className="text-muted-foreground/60 font-mono text-[10px] shrink-0 ml-2">{repo.language}</span>
          </a>
        ))}
      </div>
    </BentoCard>
  );

  // ─── DESKTOP: 2-column layout ────────────────────────────────────
  if (bp === "desktop") {
    return (
      <div className="p-5 grid grid-cols-5 gap-4">
        <div className="col-span-2 space-y-4">
          {Hero}
          {CvButton}
        </div>
        <div className="col-span-3 space-y-4">
          {About}
          {SocialActions}
          {ReposCard}
        </div>
      </div>
    );
  }

  // ─── TABLET: hero atas full, then 2-col actions ─────────────────
  if (bp === "tablet") {
    return (
      <div className="p-4 space-y-4">
        {Hero}
        {CvButton}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">{About}</div>
          <div className="space-y-4">
            {SocialActions}
            {ReposCard}
          </div>
        </div>
      </div>
    );
  }

  // ─── MOBILE: stacked single column ───────────────────────────────
  return (
    <div className="p-3 space-y-3">
      {Hero}
      {CvButton}
      {About}
      {SocialActions}
      {ReposCard}
    </div>
  );
}
