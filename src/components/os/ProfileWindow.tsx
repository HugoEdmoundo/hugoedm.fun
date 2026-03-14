import { Download, Store, ArrowUpRight, icons } from "lucide-react";
import { motion } from "framer-motion";
import type { SiteConfig } from "@/lib/api";
import { BentoCard, BentoGrid } from "./BentoGrid";
import { useGitHubRepos } from "@/lib/github";

interface ProfileWindowProps {
  config: SiteConfig | null;
  socialLinks?: { id: string; platform: string; url: string; icon: string }[];
}

export default function ProfileWindow({ config, socialLinks = [] }: ProfileWindowProps) {
  const { data: repos } = useGitHubRepos(config?.github_username ?? undefined);
  const marketplaceText = String((config as any)?.marketplace_cta_text ?? "Visit Marketplace").trim();
  const marketplaceUrl = String((config as any)?.marketplace_cta_url ?? "").trim();

  return (
    <div className="p-4 space-y-4">
      {/* Hero card */}
      <BentoCard delay={0} className="text-center py-8">
        {config?.hero_photo_url && (
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-primary/30 ring-4 ring-primary/10 mb-4">
            <img src={config.hero_photo_url} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
        <h2 className="text-2xl font-bold gradient-text">{config?.hero_name || "Your Name"}</h2>
        <p className="text-sm text-muted-foreground mt-1">{config?.hero_headline || "Developer"}</p>
        <p className="text-xs text-muted-foreground/60 mt-1 font-mono">{config?.description}</p>
      </BentoCard>

      {/* Actions grid */}
      <BentoGrid className="grid-cols-2">
        {/* Social links */}
        {socialLinks.map((link, i) => {
          const LucideIcon = (icons as any)[link.icon];
          return (
            <BentoCard key={link.id} delay={0.1 + i * 0.05} className="flex items-center gap-3">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  {LucideIcon ? <LucideIcon className="w-4 h-4 text-primary" /> : <span className="text-xs">{link.platform[0]}</span>}
                </div>
                <span className="text-xs font-medium truncate">{link.platform}</span>
              </a>
            </BentoCard>
          );
        })}

        {config?.cv_url && (
          <BentoCard delay={0.3}>
            <a href={config.cv_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium">Download CV</span>
            </a>
          </BentoCard>
        )}

        {marketplaceUrl && (
          <BentoCard delay={0.35} className="bg-primary/10 border-primary/20">
            <a href={marketplaceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary truncate">{marketplaceText}</span>
              <ArrowUpRight className="w-3 h-3 text-primary ml-auto shrink-0" />
            </a>
          </BentoCard>
        )}
      </BentoGrid>

      {/* About */}
      {config?.about_text && (
        <BentoCard delay={0.4}>
          <p className="text-[10px] font-mono text-primary tracking-widest uppercase mb-2">About</p>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{config.about_text}</p>
        </BentoCard>
      )}

      {/* GitHub Stats */}
      {repos && repos.length > 0 && (
        <BentoCard delay={0.45}>
          <p className="text-[10px] font-mono text-primary tracking-widest uppercase mb-3">Recent Repos</p>
          <div className="space-y-2">
            {repos.slice(0, 5).map((repo) => (
              <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-xs hover:text-primary transition-colors">
                <span className="truncate font-medium">{repo.name}</span>
                <span className="text-muted-foreground/60 font-mono text-[10px] shrink-0 ml-2">{repo.language}</span>
              </a>
            ))}
          </div>
        </BentoCard>
      )}
    </div>
  );
}
