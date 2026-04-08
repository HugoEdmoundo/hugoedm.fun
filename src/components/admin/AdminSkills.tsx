import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSkills, upsertSkill, deleteSkill, type Skill } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, X, Search, Check, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PREDEFINED_SKILLS = [
  { name: "JavaScript", category: "Languages", icon: "Code" },
  { name: "TypeScript", category: "Languages", icon: "Code" },
  { name: "Python", category: "Languages", icon: "Code" },
  { name: "Java", category: "Languages", icon: "Code" },
  { name: "C++", category: "Languages", icon: "Code" },
  { name: "C#", category: "Languages", icon: "Code" },
  { name: "C", category: "Languages", icon: "Code" },
  { name: "Go", category: "Languages", icon: "Code" },
  { name: "Rust", category: "Languages", icon: "Code" },
  { name: "PHP", category: "Languages", icon: "Code" },
  { name: "Ruby", category: "Languages", icon: "Code" },
  { name: "Swift", category: "Languages", icon: "Code" },
  { name: "Kotlin", category: "Languages", icon: "Code" },
  { name: "Dart", category: "Languages", icon: "Code" },
  { name: "Scala", category: "Languages", icon: "Code" },
  { name: "R", category: "Languages", icon: "Code" },
  { name: "Lua", category: "Languages", icon: "Code" },
  { name: "Perl", category: "Languages", icon: "Code" },
  { name: "Elixir", category: "Languages", icon: "Code" },
  { name: "Haskell", category: "Languages", icon: "Code" },
  { name: "SQL", category: "Languages", icon: "Database" },
  { name: "HTML", category: "Languages", icon: "Globe" },
  { name: "CSS", category: "Languages", icon: "Palette" },
  { name: "Sass/SCSS", category: "Languages", icon: "Palette" },
  { name: "Shell/Bash", category: "Languages", icon: "Terminal" },
  { name: "React", category: "Frameworks", icon: "Atom" },
  { name: "Next.js", category: "Frameworks", icon: "Globe" },
  { name: "Vue.js", category: "Frameworks", icon: "Globe" },
  { name: "Nuxt.js", category: "Frameworks", icon: "Globe" },
  { name: "Angular", category: "Frameworks", icon: "Globe" },
  { name: "Svelte", category: "Frameworks", icon: "Globe" },
  { name: "SvelteKit", category: "Frameworks", icon: "Globe" },
  { name: "Astro", category: "Frameworks", icon: "Globe" },
  { name: "Remix", category: "Frameworks", icon: "Globe" },
  { name: "Express.js", category: "Frameworks", icon: "Server" },
  { name: "Nest.js", category: "Frameworks", icon: "Server" },
  { name: "FastAPI", category: "Frameworks", icon: "Zap" },
  { name: "Django", category: "Frameworks", icon: "Server" },
  { name: "Flask", category: "Frameworks", icon: "Server" },
  { name: "Spring Boot", category: "Frameworks", icon: "Server" },
  { name: "Laravel", category: "Frameworks", icon: "Server" },
  { name: "Ruby on Rails", category: "Frameworks", icon: "Server" },
  { name: "Flutter", category: "Frameworks", icon: "Smartphone" },
  { name: "React Native", category: "Frameworks", icon: "Smartphone" },
  { name: "Electron", category: "Frameworks", icon: "Monitor" },
  { name: "Tailwind CSS", category: "Frameworks", icon: "Palette" },
  { name: "Bootstrap", category: "Frameworks", icon: "Layout" },
  { name: "Material UI", category: "Frameworks", icon: "Layout" },
  { name: "Chakra UI", category: "Frameworks", icon: "Layout" },
  { name: "Framer Motion", category: "Frameworks", icon: "Move" },
  { name: "Three.js", category: "Frameworks", icon: "Box" },
  { name: "PostgreSQL", category: "Databases", icon: "Database" },
  { name: "MySQL", category: "Databases", icon: "Database" },
  { name: "MongoDB", category: "Databases", icon: "Database" },
  { name: "Redis", category: "Databases", icon: "Database" },
  { name: "SQLite", category: "Databases", icon: "Database" },
  { name: "Firebase", category: "Databases", icon: "Flame" },
  { name: "Supabase", category: "Databases", icon: "Database" },
  { name: "Prisma", category: "Databases", icon: "Database" },
  { name: "DynamoDB", category: "Databases", icon: "Database" },
  { name: "Elasticsearch", category: "Databases", icon: "Search" },
  { name: "Docker", category: "DevOps & Tools", icon: "Container" },
  { name: "Kubernetes", category: "DevOps & Tools", icon: "Network" },
  { name: "AWS", category: "DevOps & Tools", icon: "Cloud" },
  { name: "Google Cloud", category: "DevOps & Tools", icon: "Cloud" },
  { name: "Azure", category: "DevOps & Tools", icon: "Cloud" },
  { name: "Vercel", category: "DevOps & Tools", icon: "Triangle" },
  { name: "Netlify", category: "DevOps & Tools", icon: "Globe" },
  { name: "Nginx", category: "DevOps & Tools", icon: "Server" },
  { name: "Git", category: "DevOps & Tools", icon: "GitBranch" },
  { name: "GitHub Actions", category: "DevOps & Tools", icon: "GitBranch" },
  { name: "CI/CD", category: "DevOps & Tools", icon: "RefreshCw" },
  { name: "Linux", category: "DevOps & Tools", icon: "Terminal" },
  { name: "Terraform", category: "DevOps & Tools", icon: "Blocks" },
  { name: "GraphQL", category: "Other", icon: "Share2" },
  { name: "REST API", category: "Other", icon: "Link" },
  { name: "WebSocket", category: "Other", icon: "Radio" },
  { name: "OAuth", category: "Other", icon: "Shield" },
  { name: "JWT", category: "Other", icon: "Key" },
  { name: "Stripe", category: "Other", icon: "CreditCard" },
  { name: "OpenAI API", category: "Other", icon: "Brain" },
  { name: "TensorFlow", category: "Other", icon: "Brain" },
  { name: "PyTorch", category: "Other", icon: "Brain" },
  { name: "Figma", category: "Other", icon: "Figma" },
  { name: "Webpack", category: "Other", icon: "Package" },
  { name: "Vite", category: "Other", icon: "Zap" },
  { name: "Jest", category: "Other", icon: "TestTube" },
  { name: "Vitest", category: "Other", icon: "TestTube" },
  { name: "Cypress", category: "Other", icon: "TestTube" },
];

export default function AdminSkills() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: skills = [] } = useQuery({ queryKey: ["skills"], queryFn: fetchSkills });
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail?.tab === "skills") setShowPicker(true);
    };
    window.addEventListener("admin-fab-add", handler);
    return () => window.removeEventListener("admin-fab-add", handler);
  }, []);

  const addMutation = useMutation({
    mutationFn: (s: { name: string; category: string; icon: string }) =>
      upsertSkill({ name: s.name, category: s.category, icon: s.icon, sort_order: skills.length }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["skills"] }); toast({ title: "Skill added!" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["skills"] }); toast({ title: "Deleted" }); },
  });

  const existingNames = useMemo(() => new Set(skills.map((s) => s.name.toLowerCase())), [skills]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PREDEFINED_SKILLS.filter(
      (s) => (s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
    );
  }, [search]);

  const categories = useMemo(() => {
    const cats: Record<string, typeof filtered> = {};
    filtered.forEach((s) => {
      if (!cats[s.category]) cats[s.category] = [];
      cats[s.category].push(s);
    });
    return cats;
  }, [filtered]);

  // Group existing skills by category
  const skillsByCategory = useMemo(() => {
    const cats: Record<string, Skill[]> = {};
    skills.forEach((s) => {
      const cat = s.category || "Other";
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(s);
    });
    return cats;
  }, [skills]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Skills</h2>
            <p className="text-xs text-muted-foreground">{skills.length} selected</p>
          </div>
        </div>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
        >
          {showPicker ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showPicker ? "Close" : "Add Skills"}
        </button>
      </div>

      <AnimatePresence>
        {showPicker && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card p-4 md:p-5 border border-primary/15">
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <div className="max-h-[350px] overflow-y-auto space-y-4 custom-scrollbar">
                {Object.entries(categories).map(([cat, items]) => (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((skill) => {
                        const added = existingNames.has(skill.name.toLowerCase());
                        return (
                          <button
                            key={skill.name}
                            disabled={added || addMutation.isPending}
                            onClick={() => addMutation.mutate(skill)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                              added
                                ? "bg-primary/10 border-primary/20 text-primary cursor-default"
                                : "bg-secondary/40 border-border/20 hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
                            }`}
                          >
                            {added && <Check className="w-3 h-3" />}
                            {skill.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No skills found</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Display skills by category as cards */}
      {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {catSkills.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card px-3 py-2 flex items-center gap-2 group hover:border-primary/15 transition-all"
              >
                <span className="text-sm font-medium">{s.name}</span>
                <button
                  onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(s.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10"
                >
                  <Trash2 className="w-3 h-3 text-destructive/70" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
      {skills.length === 0 && !showPicker && (
        <div className="text-center py-12">
          <Palette className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No skills yet. Click "Add Skills" to pick from the list.</p>
        </div>
      )}
    </div>
  );
}
