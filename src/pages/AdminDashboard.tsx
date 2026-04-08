import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { checkIsAdmin } from "@/lib/api";
import {
  LogOut,
  Settings,
  FolderOpen,
  Palette,
  BookOpen,
  GraduationCap,
  Briefcase,
  Image,
  ListTodo,
  Home,
  UserCog,
  Share2,
  Sparkles,
  Menu,
  X,
  Plus,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSiteConfig from "@/components/admin/AdminSiteConfig";
import AdminProjects from "@/components/admin/AdminProjects";
import AdminSkills from "@/components/admin/AdminSkills";
import AdminGallery from "@/components/admin/AdminGallery";
import AdminTasks from "@/components/admin/AdminTasks";
import AdminEducation from "@/components/admin/AdminEducation";
import AdminExperience from "@/components/admin/AdminExperience";
import AdminBlog from "@/components/admin/AdminBlog";
import AdminAccount from "@/components/admin/AdminAccount";
import AdminSocialLinks from "@/components/admin/AdminSocialLinks";
import { useIsMobile } from "@/hooks/use-mobile";

const tabs = [
  { id: "config", label: "Site Config", icon: Settings, description: "Brand & SEO" },
  { id: "projects", label: "Projects", icon: FolderOpen, description: "Portfolio work" },
  { id: "skills", label: "Skills", icon: Palette, description: "Tech stack" },
  { id: "gallery", label: "Gallery", icon: Image, description: "Media files" },
  { id: "tasks", label: "Tasks", icon: ListTodo, description: "Assignments" },
  { id: "education", label: "Education", icon: GraduationCap, description: "Academic" },
  { id: "experience", label: "Experience", icon: Briefcase, description: "Work history" },
  { id: "blog", label: "Blog", icon: BookOpen, description: "Articles" },
  { id: "social", label: "Social Links", icon: Share2, description: "Connect" },
  { id: "account", label: "Account", icon: UserCog, description: "Security" },
];

export default function AdminDashboard() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const activeTab = searchParams.get("tab") || "config";
  const activeTabInfo = tabs.find((t) => t.id === activeTab);

  useEffect(() => {
    if (!loading && !session) {
      navigate("/admin/login");
      return;
    }
    if (session) {
      checkIsAdmin().then((admin) => {
        setIsAdmin(admin);
        setChecking(false);
        if (!admin) navigate("/");
      });
    }
  }, [session, loading, navigate]);

  // Close sidebar on tab change (mobile)
  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
    if (isMobile) setSidebarOpen(false);
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-pattern opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || sidebarOpen) && (
          <motion.aside
            initial={isMobile ? { x: -280 } : false}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`
              ${isMobile ? "fixed left-0 top-0 bottom-0 z-50" : "sticky top-0 h-screen"}
              w-[260px] shrink-0 flex flex-col
              bg-card/80 backdrop-blur-2xl border-r border-border/30
            `}
          >
            {/* Sidebar header */}
            <div className="p-4 flex items-center gap-3 border-b border-border/20">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-sm gradient-text">Admin CMS</h1>
                <p className="text-[10px] text-muted-foreground truncate">Content Management</p>
              </div>
              {isMobile && (
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary/50 text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive ? "bg-primary/15" : "bg-secondary/50 group-hover:bg-secondary"
                    }`}>
                      <tab.icon className="w-4 h-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className={`block text-sm leading-tight ${isActive ? "font-semibold" : "font-medium"}`}>{tab.label}</span>
                      <span className="block text-[10px] text-muted-foreground/70 leading-tight">{tab.description}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary/60" />}
                  </motion.button>
                );
              })}
            </nav>

            {/* Sidebar footer */}
            <div className="p-3 border-t border-border/20 space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>View Site</span>
              </Link>
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 md:px-6 bg-card/60 backdrop-blur-xl border-b border-border/20">
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 rounded-lg hover:bg-secondary/50 text-muted-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            {activeTabInfo && <activeTabInfo.icon className="w-4 h-4 text-primary shrink-0" />}
            <h2 className="font-semibold text-sm truncate">{activeTabInfo?.label || "Dashboard"}</h2>
          </div>

          {/* Breadcrumb - desktop only */}
          {!isMobile && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
              <span>Admin</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium">{activeTabInfo?.label}</span>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "config" && <AdminSiteConfig />}
                {activeTab === "projects" && <AdminProjects />}
                {activeTab === "skills" && <AdminSkills />}
                {activeTab === "gallery" && <AdminGallery />}
                {activeTab === "tasks" && <AdminTasks />}
                {activeTab === "education" && <AdminEducation />}
                {activeTab === "experience" && <AdminExperience />}
                {activeTab === "blog" && <AdminBlog />}
                {activeTab === "social" && <AdminSocialLinks />}
                {activeTab === "account" && <AdminAccount />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile FAB for primary action */}
      {isMobile && ["projects", "skills", "gallery", "tasks", "education", "experience", "blog", "social"].includes(activeTab) && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center"
          onClick={() => {
            // Dispatch a custom event for each admin component to handle
            window.dispatchEvent(new CustomEvent("admin-fab-add", { detail: { tab: activeTab } }));
          }}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
}
