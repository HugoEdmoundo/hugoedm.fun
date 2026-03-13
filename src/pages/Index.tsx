import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/portfolio/Navbar";
import HeroSection from "@/components/portfolio/HeroSection";
import AboutSection from "@/components/portfolio/AboutSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import GitHubSection from "@/components/portfolio/GitHubSection";
import SkillsSection from "@/components/portfolio/SkillsSection";
import GallerySection from "@/components/portfolio/GallerySection";
import ResumeSection from "@/components/portfolio/ResumeSection";
import {
  fetchSiteConfig,
  fetchFeaturedProjects,
  fetchSkills,
  fetchGallery,
  fetchEducation,
  fetchExperience,
  fetchSocialLinks,
} from "@/lib/api";

const Index = () => {
  const { data: config } = useQuery({ queryKey: ["site-config"], queryFn: fetchSiteConfig });
  const { data: projects } = useQuery({ queryKey: ["featured-projects"], queryFn: fetchFeaturedProjects });
  const { data: skills } = useQuery({ queryKey: ["skills"], queryFn: fetchSkills });
  const { data: gallery } = useQuery({ queryKey: ["gallery"], queryFn: fetchGallery });
  const { data: education } = useQuery({ queryKey: ["education"], queryFn: fetchEducation });
  const { data: experience } = useQuery({ queryKey: ["experience"], queryFn: fetchExperience });
  const { data: socialLinks } = useQuery({ queryKey: ["social-links"], queryFn: fetchSocialLinks });

  return (
    <div className="min-h-screen bg-background relative noise-overlay overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none" />
      <Navbar />
      <HeroSection config={config ?? null} socialLinks={socialLinks ?? []} />
      <AboutSection config={config ?? null} />
      <ProjectsSection projects={projects ?? []} />
      <GitHubSection username={config?.github_username ?? undefined} />
      <SkillsSection skills={skills ?? []} />
      <GallerySection items={gallery ?? []} />
      <ResumeSection education={education ?? []} experience={experience ?? []} />

      <div className="section-divider" />
      <footer className="py-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {config?.site_name ?? "Portfolio"}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
