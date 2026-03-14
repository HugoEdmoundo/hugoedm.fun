import { motion } from "framer-motion";
import { ExternalLink, Github, Star, GitFork } from "lucide-react";
import type { Project } from "@/lib/api";
import { BentoCard, BentoGrid } from "./BentoGrid";

interface ProjectsWindowProps {
  projects: Project[];
}

export default function ProjectsWindow({ projects }: ProjectsWindowProps) {
  if (projects.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        No projects yet.
      </div>
    );
  }

  return (
    <div className="p-4">
      <BentoGrid className="grid-cols-1 md:grid-cols-2">
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
