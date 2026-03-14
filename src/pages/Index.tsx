import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  User,
  FolderOpen,
  Palette,
  Image,
  GraduationCap,
  Store,
  Terminal,
  ListTodo,
  Github,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  fetchSiteConfig,
  fetchFeaturedProjects,
  fetchSkills,
  fetchGallery,
  fetchEducation,
  fetchExperience,
  fetchSocialLinks,
} from "@/lib/api";
import { useWindowManager, WindowLayer } from "@/components/os/WindowManager";
import Dock from "@/components/os/Dock";
import DesktopIcon from "@/components/os/DesktopIcon";
import ProfileWindow from "@/components/os/ProfileWindow";
import ProjectsWindow from "@/components/os/ProjectsWindow";
import SkillsWindow from "@/components/os/SkillsWindow";
import GalleryWindow from "@/components/os/GalleryWindow";
import JourneyWindow from "@/components/os/JourneyWindow";

const Index = () => {
  const { data: config } = useQuery({ queryKey: ["site-config"], queryFn: fetchSiteConfig });
  const { data: projects } = useQuery({ queryKey: ["featured-projects"], queryFn: fetchFeaturedProjects });
  const { data: skills } = useQuery({ queryKey: ["skills"], queryFn: fetchSkills });
  const { data: gallery } = useQuery({ queryKey: ["gallery"], queryFn: fetchGallery });
  const { data: education } = useQuery({ queryKey: ["education"], queryFn: fetchEducation });
  const { data: experience } = useQuery({ queryKey: ["experience"], queryFn: fetchExperience });
  const { data: socialLinks } = useQuery({ queryKey: ["social-links"], queryFn: fetchSocialLinks });

  const { windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updatePosition } = useWindowManager();

  const getCenter = useCallback((w: number, h: number) => ({
    x: Math.max(40, (window.innerWidth - w) / 2 + (Math.random() - 0.5) * 80),
    y: Math.max(40, (window.innerHeight - h) / 2 + (Math.random() - 0.5) * 60 - 40),
  }), []);

  const openProfile = useCallback(() => {
    const pos = getCenter(420, 560);
    openWindow({
      id: "profile", title: "Profile", icon: <User className="w-4 h-4" />,
      content: <ProfileWindow config={config ?? null} socialLinks={socialLinks ?? []} />,
      ...pos, width: 420, height: 560,
    });
  }, [config, socialLinks, openWindow, getCenter]);

  const openProjects = useCallback(() => {
    const pos = getCenter(640, 520);
    openWindow({
      id: "projects", title: "Projects", icon: <FolderOpen className="w-4 h-4" />,
      content: <ProjectsWindow projects={projects ?? []} />,
      ...pos, width: 640, height: 520,
    });
  }, [projects, openWindow, getCenter]);

  const openSkills = useCallback(() => {
    const pos = getCenter(500, 460);
    openWindow({
      id: "skills", title: "Tech Stack", icon: <Palette className="w-4 h-4" />,
      content: <SkillsWindow skills={skills ?? []} />,
      ...pos, width: 500, height: 460,
    });
  }, [skills, openWindow, getCenter]);

  const openGallery = useCallback(() => {
    const pos = getCenter(560, 480);
    openWindow({
      id: "gallery", title: "Gallery", icon: <Image className="w-4 h-4" />,
      content: <GalleryWindow items={gallery ?? []} />,
      ...pos, width: 560, height: 480,
    });
  }, [gallery, openWindow, getCenter]);

  const openJourney = useCallback(() => {
    openWindow({
      id: "journey", title: "My Journey", icon: <GraduationCap className="w-4 h-4" />,
      content: <JourneyWindow config={config ?? null} education={education ?? []} experience={experience ?? []} />,
      x: 40, y: 20, width: window.innerWidth - 80, height: window.innerHeight - 120,
    });
  }, [config, education, experience, openWindow]);

  const desktopIcons = useMemo(() => [
    { id: "profile", label: "Profile", icon: <User className="w-6 h-6" />, onClick: openProfile },
    { id: "projects", label: "Projects", icon: <FolderOpen className="w-6 h-6" />, onClick: openProjects },
    { id: "skills", label: "Tech Stack", icon: <Palette className="w-6 h-6" />, onClick: openSkills },
    { id: "gallery", label: "Gallery", icon: <Image className="w-6 h-6" />, onClick: openGallery },
    { id: "journey", label: "My Journey", icon: <GraduationCap className="w-6 h-6" />, onClick: openJourney },
  ], [openProfile, openProjects, openSkills, openGallery, openJourney]);

  const dockItems = useMemo(() => [
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" />, onClick: openProfile, active: windows.some(w => w.id === "profile" && !w.minimized) },
    { id: "projects", label: "Projects", icon: <FolderOpen className="w-5 h-5" />, onClick: openProjects, active: windows.some(w => w.id === "projects" && !w.minimized) },
    { id: "skills", label: "Tech Stack", icon: <Palette className="w-5 h-5" />, onClick: openSkills, active: windows.some(w => w.id === "skills" && !w.minimized) },
    { id: "gallery", label: "Gallery", icon: <Image className="w-5 h-5" />, onClick: openGallery, active: windows.some(w => w.id === "gallery" && !w.minimized) },
    { id: "journey", label: "My Journey", icon: <GraduationCap className="w-5 h-5" />, onClick: openJourney, active: windows.some(w => w.id === "journey" && !w.minimized) },
    { id: "assignments", label: "Assignments", icon: <ListTodo className="w-5 h-5" />, onClick: () => window.location.href = "/assignments", active: false },
  ], [openProfile, openProjects, openSkills, openGallery, openJourney, windows]);

  return (
    <div className="h-screen w-screen bg-background relative overflow-hidden select-none">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, -25, 20, 0], y: [0, 20, -10, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] bg-primary/6 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] right-[25%] w-[300px] h-[300px] border border-primary/10 rounded-full"
        />
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Menu bar */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-card/60 backdrop-blur-2xl border-b border-border/30 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold gradient-text">{config?.site_name || "Portfolio"}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
          <span>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          <span>{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>

      {/* Desktop icons */}
      <div className="absolute top-12 left-4 md:left-8 flex flex-col gap-1 z-[3]">
        {desktopIcons.map((icon, i) => (
          <DesktopIcon
            key={icon.id}
            icon={icon.icon}
            label={icon.label}
            onClick={icon.onClick}
            delay={0.3 + i * 0.08}
          />
        ))}
      </div>

      {/* Welcome text center */}
      {windows.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[2]"
        >
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold gradient-text tracking-tight mb-4"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {config?.hero_name || "Welcome"}
          </motion.h1>
          <p className="text-muted-foreground text-sm md:text-base font-mono">
            Click an icon or use the dock below to explore
          </p>
        </motion.div>
      )}

      {/* Windows */}
      <WindowLayer
        windows={windows}
        onClose={closeWindow}
        onMinimize={minimizeWindow}
        onMaximize={maximizeWindow}
        onFocus={focusWindow}
        onDragEnd={updatePosition}
      />

      {/* Dock */}
      <Dock items={dockItems} />
    </div>
  );
};

export default Index;
