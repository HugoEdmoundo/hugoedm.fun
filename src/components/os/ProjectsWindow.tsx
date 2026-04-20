import { ExternalLink, Github } from "lucide-react";
import type { Project } from "@/lib/api";
import { BentoCard, BentoGrid } from "./BentoGrid";
import { useBreakpoint } from "@/hooks/use-breakpoint";

interface ProjectsWindowProps {
  projects: Project[];
}

export default function ProjectsWindow({ projects }: ProjectsWindowProps) {
  const bp = useBreakpoint();

  if (projects.length === 0) {
    return <div className="p-8 text-center text-muted-foreground text-sm">No projects yet.</div>;
  }

  // ─── MOBILE: list view (compact, no large screenshots) ────────────
  if (bp === "mobile") {
    return (
      <div className="p-3 space-y-2">
        {projects.map((project, i) => (
          <a
            key={project.id}
            href={project.live_demo_url || project.github_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-xl border border-border/30 active:scale-[0.98] transition-transform"
          >
            {project.screenshot_url && (
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-secondary/50">
                <img src={project.screenshot_url} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{project.title}</h3>
              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{project.description}</p>
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex gap-1 mt-1.5 overflow-hidden">
                  {project.tech_stack.slice(0, 3).map((tech) => (
                    <span key={tech} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary/80 truncate">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5 shrink-0 self-start">
              {project.github_url && <Github className="w-3.5 h-3.5 text-muted-foreground" />}
              {project.live_demo_url && <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
          </a>
        ))}
      </div>
    );
  }

  // ─── TABLET: 2 columns / DESKTOP: 3 columns grid ──────────────────
  const cols = bp === "tablet" ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className="p-4">
      <BentoGrid className={cols}>
        {projects.map((project, i) => (
          <BentoCard key={project.id} delay={i * 0.05}>
            {project.screenshot_url && (
              <div className="aspect-video rounded-lg overflow-hidden mb-3 -mx-1 -mt-1">
                <img
                  src={project.screenshot_url}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            )}
            <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{project.title}</h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.tech_stack.map((tech) => (
                  <span key={tech} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">
                    {tech}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="w-3.5 h-3.5" />
                </a>
              )}
              {project.live_demo_url && (
                <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </BentoCard>
        ))}
      </BentoGrid>
    </div>
  );
}
