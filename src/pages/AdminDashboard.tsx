import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { checkIsAdmin } from "@/lib/api";
import { LogOut, Settings, FolderOpen, Palette, FileText, GraduationCap, Briefcase, Image, ListTodo, BookOpen, Home } from "lucide-react";
import AdminSiteConfig from "@/components/admin/AdminSiteConfig";
import AdminProjects from "@/components/admin/AdminProjects";
import AdminSkills from "@/components/admin/AdminSkills";
import AdminGallery from "@/components/admin/AdminGallery";
import AdminTasks from "@/components/admin/AdminTasks";
import AdminEducation from "@/components/admin/AdminEducation";
import AdminExperience from "@/components/admin/AdminExperience";
import AdminBlog from "@/components/admin/AdminBlog";

const tabs = [
  { id: "config", label: "Site Config", icon: Settings },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "skills", label: "Skills", icon: Palette },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "blog", label: "Blog", icon: BookOpen },
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
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="glass-card-strong border-b border-border/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-sm gradient-text">Admin CMS</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <button onClick={signOut} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 hidden md:block">
          <nav className="space-y-1 sticky top-20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden overflow-x-auto pb-2 -mx-4 px-4 flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {activeTab === "config" && <AdminSiteConfig />}
          {activeTab === "projects" && <AdminProjects />}
          {activeTab === "skills" && <AdminSkills />}
          {activeTab === "gallery" && <AdminGallery />}
          {activeTab === "tasks" && <AdminTasks />}
          {activeTab === "education" && <AdminEducation />}
          {activeTab === "experience" && <AdminExperience />}
          {activeTab === "blog" && <AdminBlog />}
        </main>
      </div>
    </div>
  );
}
