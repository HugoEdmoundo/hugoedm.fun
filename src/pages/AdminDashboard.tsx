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
} from "lucide-react";
import { motion } from "framer-motion";
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

const tabs = [
  { id: "config", label: "Site Config", icon: Settings },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "skills", label: "Skills", icon: Palette },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "blog", label: "Blog", icon: BookOpen },
  { id: "social", label: "Social Links", icon: Share2 },
  { id: "account", label: "Account", icon: UserCog },
];

export default function AdminDashboard() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const activeTab = searchParams.get("tab") || "config";

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

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-45 pointer-events-none" />
      <div className="absolute top-8 right-4 md:right-16 w-[360px] h-[360px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <header className="glass-card-strong border-b border-border/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-sm md:text-base gradient-text">Admin CMS</h1>
              <p className="text-[10px] md:text-xs text-muted-foreground">Manage portfolio content</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/" className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <button
              onClick={signOut}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-5 relative z-10">
        <aside className="w-full md:w-60 md:shrink-0">
          <nav className="glass-card p-2 md:p-3 space-y-1 md:sticky md:top-24">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
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
        </main>
      </div>
    </div>
  );
}
