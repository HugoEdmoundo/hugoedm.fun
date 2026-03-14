import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  FolderOpen,
  Palette,
  Image,
  GraduationCap,
  ListTodo,
  Terminal,
  Moon,
  Sun,
} from "lucide-react";
import {
  fetchSiteConfig,
  fetchFeaturedProjects,
  fetchSkills,
  fetchGallery,
  fetchEducation,
  fetchExperience,
  fetchSocialLinks,
  fetchTasks,
} from "@/lib/api";
import { useWindowManager, WindowLayer } from "@/components/os/WindowManager";
import Dock from "@/components/os/Dock";
import DesktopIcon from "@/components/os/DesktopIcon";
import ProfileWindow from "@/components/os/ProfileWindow";
import ProjectsWindow from "@/components/os/ProjectsWindow";
import SkillsWindow from "@/components/os/SkillsWindow";
import GalleryWindow from "@/components/os/GalleryWindow";
import JourneyWindow from "@/components/os/JourneyWindow";
import TasksWindow from "@/components/os/TasksWindow";
import CommandPalette from "@/components/os/CommandPalette";
import FloatingCode from "@/components/os/FloatingCode";

const Index = () => {
  const { data: config } = useQuery({ queryKey: ["site-config"], queryFn: fetchSiteConfig });
  const { data: projects } = useQuery({ queryKey: ["featured-projects"], queryFn: fetchFeaturedProjects });
  const { data: skills } = useQuery({ queryKey: ["skills"], queryFn: fetchSkills });
  const { data: gallery } = useQuery({ queryKey: ["gallery"], queryFn: fetchGallery });
  const { data: education } = useQuery({ queryKey: ["education"], queryFn: fetchEducation });
  const { data: experience } = useQuery({ queryKey: ["experience"], queryFn: fetchExperience });
  const { data: socialLinks } = useQuery({ queryKey: ["social-links"], queryFn: fetchSocialLinks });
  const { data: tasks } = useQuery({ queryKey: ["tasks"], queryFn: fetchTasks });

  const { windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updatePosition } = useWindowManager();

  // Dark mode
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  // Easter egg: type "founder" to trigger corporate mode
  const [easterEgg, setEasterEgg] = useState(false);
  useEffect(() => {
    let buffer = "";
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      buffer += e.key.toLowerCase();
      if (buffer.length > 10) buffer = buffer.slice(-10);
      if (buffer.includes("founder")) {
        setEasterEgg((v) => !v);
        buffer = "";
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const getCenter = useCallback((w: number, h: number) => ({
    x: Math.max(40, (window.innerWidth - w) / 2 + (Math.random() - 0.5) * 80),
    y: Math.max(40, (window.innerHeight - h) / 2 + (Math.random() - 0.5) * 60 - 40),
  }), []);

  const openProfile = useCallback(() => {
    const pos = getCenter(420, 560);
    openWindow({
      id: "profile", title: "Profile.exe", icon: <User className="w-4 h-4" />,
      content: <ProfileWindow config={config ?? null} socialLinks={socialLinks ?? []} />,
      ...pos, width: 420, height: 560,
    });
  }, [config, socialLinks, openWindow, getCenter]);

  const openProjects = useCallback(() => {
    const pos = getCenter(640, 520);
    openWindow({
      id: "projects", title: "Terminal.exe", icon: <Terminal className="w-4 h-4" />,
      content: <ProjectsWindow projects={projects ?? []} />,
      ...pos, width: 640, height: 520,
    });
  }, [projects, openWindow, getCenter]);

  const openSkills = useCallback(() => {
    const pos = getCenter(500, 460);
    openWindow({
      id: "skills", title: "Stack.config", icon: <Palette className="w-4 h-4" />,
      content: <SkillsWindow skills={skills ?? []} />,
      ...pos, width: 500, height: 460,
    });
  }, [skills, openWindow, getCenter]);

  const openGallery = useCallback(() => {
    const pos = getCenter(560, 480);
    openWindow({
      id: "gallery", title: "Gallery.app", icon: <Image className="w-4 h-4" />,
      content: <GalleryWindow items={gallery ?? []} />,
      ...pos, width: 560, height: 480,
    });
  }, [gallery, openWindow, getCenter]);

  const openJourney = useCallback(() => {
    openWindow({
      id: "journey", title: "Journey.log", icon: <GraduationCap className="w-4 h-4" />,
      content: <JourneyWindow config={config ?? null} education={education ?? []} experience={experience ?? []} />,
      x: 40, y: 20, width: window.innerWidth - 80, height: window.innerHeight - 120,
    });
  }, [config, education, experience, openWindow]);

  const openTasks = useCallback(() => {
    const pos = getCenter(480, 500);
    openWindow({
      id: "tasks", title: "Assignments.todo", icon: <ListTodo className="w-4 h-4" />,
      content: <TasksWindow tasks={tasks ?? []} />,
      ...pos, width: 480, height: 500,
    });
  }, [tasks, openWindow, getCenter]);

  const desktopIcons = useMemo(() => [
    { id: "profile", label: "Profile.exe", icon: <User className="w-6 h-6" />, onClick: openProfile },
    { id: "projects", label: "Terminal.exe", icon: <Terminal className="w-6 h-6" />, onClick: openProjects },
    { id: "skills", label: "Stack.config", icon: <Palette className="w-6 h-6" />, onClick: openSkills },
    { id: "gallery", label: "Gallery.app", icon: <Image className="w-6 h-6" />, onClick: openGallery },
    { id: "journey", label: "Journey.log", icon: <GraduationCap className="w-6 h-6" />, onClick: openJourney },
    { id: "tasks", label: "Assignments", icon: <ListTodo className="w-6 h-6" />, onClick: openTasks },
  ], [openProfile, openProjects, openSkills, openGallery, openJourney, openTasks]);

  const dockItems = useMemo(() => [
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" />, onClick: openProfile, active: windows.some(w => w.id === "profile" && !w.minimized) },
    { id: "projects", label: "Terminal", icon: <Terminal className="w-5 h-5" />, onClick: openProjects, active: windows.some(w => w.id === "projects" && !w.minimized) },
    { id: "skills", label: "Stack", icon: <Palette className="w-5 h-5" />, onClick: openSkills, active: windows.some(w => w.id === "skills" && !w.minimized) },
    { id: "gallery", label: "Gallery", icon: <Image className="w-5 h-5" />, onClick: openGallery, active: windows.some(w => w.id === "gallery" && !w.minimized) },
    { id: "journey", label: "Journey", icon: <GraduationCap className="w-5 h-5" />, onClick: openJourney, active: windows.some(w => w.id === "journey" && !w.minimized) },
    { id: "tasks", label: "Assignments", icon: <ListTodo className="w-5 h-5" />, onClick: openTasks, active: windows.some(w => w.id === "tasks" && !w.minimized) },
    { id: "theme", label: dark ? "Light Mode" : "Dark Mode", icon: dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />, onClick: toggleTheme, active: false },
  ], [openProfile, openProjects, openSkills, openGallery, openJourney, openTasks, toggleTheme, dark, windows]);

  const commandItems = useMemo(() => [
    { id: "profile", label: "Open Profile", icon: <User className="w-4 h-4" />, action: openProfile, keywords: ["about", "me", "bio"] },
    { id: "projects", label: "Open Terminal (Projects)", icon: <Terminal className="w-4 h-4" />, action: openProjects, keywords: ["code", "work", "project"] },
    { id: "skills", label: "Open Tech Stack", icon: <Palette className="w-4 h-4" />, action: openSkills, keywords: ["technology", "framework", "stack"] },
    { id: "gallery", label: "Open Gallery", icon: <Image className="w-4 h-4" />, action: openGallery, keywords: ["photo", "image", "media"] },
    { id: "journey", label: "Open My Journey", icon: <GraduationCap className="w-4 h-4" />, action: openJourney, keywords: ["education", "experience", "story"] },
    { id: "tasks", label: "Open Assignments", icon: <ListTodo className="w-4 h-4" />, action: openTasks, keywords: ["task", "todo", "assignment"] },
    { id: "theme", label: dark ? "Switch to Light Mode" : "Switch to Dark Mode", icon: dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, action: toggleTheme, keywords: ["theme", "dark", "light", "mode"] },
  ], [openProfile, openProjects, openSkills, openGallery, openJourney, openTasks, toggleTheme, dark]);

  return (
    <div className={`h-screen w-screen relative overflow-hidden select-none transition-colors duration-700 ${easterEgg ? "bg-[hsl(220,20%,97%)] dark:bg-[hsl(220,20%,8%)]" : "bg-background"}`}>
      {/* Atmospheric background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-pattern opacity-[0.07]" />
        {/* Interactive mesh gradient blobs */}
        <motion.div
          animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[5%] left-[10%] w-[600px] h-[600px] bg-primary/[0.07] rounded-full blur-[180px]"
        />
        <motion.div
          animate={{ x: [0, -35, 25, 0], y: [0, 25, -15, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-[hsl(260,60%,50%)]/[0.05] rounded-full blur-[160px]"
        />
        <motion.div
          animate={{ x: [0, 20, -15, 0], y: [0, -15, 25, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-[hsl(210,70%,40%)]/[0.04] rounded-full blur-[140px]"
        />
        {/* Rotating ring */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-[25%] right-[20%] w-[350px] h-[350px] border border-primary/[0.06] rounded-full"
        />
        {/* Floating code snippets */}
        <FloatingCode />
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Menu bar */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-card/60 backdrop-blur-2xl border-b border-border/30 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold gradient-text">{config?.site_name || "Portfolio"}</span>
          <span className="text-[10px] text-muted-foreground/40 font-mono hidden sm:block">⌘K to search</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
          {easterEgg && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-primary font-semibold"
            >
              🏢 Corporate Mode
            </motion.span>
          )}
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
          <motion.p
            className="text-primary font-mono text-xs mb-4 tracking-[0.3em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {config?.description || "Welcome to my workspace"}
          </motion.p>
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold gradient-text tracking-tight mb-4"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {config?.hero_name || "Welcome"}
          </motion.h1>
          <p className="text-muted-foreground text-sm md:text-base font-light max-w-md text-center mb-2">
            {config?.hero_headline || "Architecting Code, Engineering Businesses."}
          </p>
          <p className="text-muted-foreground/40 text-xs font-mono mt-4">
            Click an icon or press ⌘K to explore
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

      {/* Command Palette */}
      <CommandPalette items={commandItems} />

      {/* Dock */}
      <Dock items={dockItems} />
    </div>
  );
};

export default Index;
