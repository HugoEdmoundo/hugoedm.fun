import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSocialLinks, upsertSocialLink, deleteSocialLink } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X, Share2, icons } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTED_ICONS = [
  // Code & Dev
  "Github", "Gitlab", "Codepen", "Code", "Code2", "Terminal", "GitBranch",
  // Social
  "Linkedin", "Twitter", "Instagram", "Facebook", "Youtube", "Twitch",
  "Dribbble", "Figma", "Pinterest", "Snowflake",
  // Messaging
  "MessageCircle", "MessageSquare", "Send", "Mail", "Phone", "Smartphone",
  // Web & Generic
  "Globe", "Globe2", "Link", "Link2", "ExternalLink", "Rss", "Bookmark",
  "Chrome", "Compass",
  // Media & Music
  "Music", "Music2", "Headphones", "Mic", "Video", "Film", "Camera", "Image",
  "Podcast", "Radio",
  // Work & Productivity
  "Briefcase", "Building", "Building2", "Slack", "Trello", "Notebook",
  "BookOpen", "FileText", "GraduationCap",
  // Money & Commerce
  "DollarSign", "CreditCard", "Coffee", "Gift", "ShoppingBag", "Store",
  // Location & People
  "MapPin", "Map", "Users", "User", "UserPlus", "Heart", "Star",
  // Misc
  "Award", "Trophy", "Zap", "Sparkles", "Cloud", "Cpu", "Gamepad2",
];

export default function AdminSocialLinks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: links = [], isLoading } = useQuery({ queryKey: ["social-links"], queryFn: fetchSocialLinks });
  const [editing, setEditing] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail?.tab === "social") setEditing({ platform: "", url: "", icon: "Link", sort_order: 0 });
    };
    window.addEventListener("admin-fab-add", handler);
    return () => window.removeEventListener("admin-fab-add", handler);
  }, []);

  const saveMutation = useMutation({
    mutationFn: (link: any) => upsertSocialLink(link),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["social-links"] }); setEditing(null); toast({ title: "Saved!" }); },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSocialLink,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["social-links"] }); toast({ title: "Deleted!" }); },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const IconPreview = ({ name }: { name: string }) => {
    const LucideIcon = (icons as any)[name];
    return LucideIcon ? <LucideIcon className="w-4 h-4" /> : <span className="text-xs">?</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Social Links</h2>
            <p className="text-xs text-muted-foreground">{links.length} links</p>
          </div>
        </div>
        <button onClick={() => setEditing({ platform: "", url: "", icon: "Link", sort_order: 0 })} className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card p-5 md:p-6 space-y-4 border border-primary/15">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{editing.id ? "Edit" : "New"} Link</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Platform Name</label>
                  <input value={editing.platform} onChange={(e) => setEditing({ ...editing, platform: e.target.value })} placeholder="e.g. GitHub" className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">URL</label>
                  <input value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icon (Lucide)</label>
                <input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all mb-2" />
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setEditing({ ...editing, icon: ic })}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition-all ${
                        editing.icon === ic ? "bg-primary/15 text-primary border-primary/30 font-medium" : "bg-secondary/50 border-border/30 text-muted-foreground hover:text-foreground hover:border-primary/20"
                      }`}
                    >
                      <IconPreview name={ic} />
                      <span className="hidden sm:inline">{ic}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Sort Order</label>
                <input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} className="w-24 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveMutation.mutate(editing)} disabled={!editing.platform || !editing.url} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl bg-secondary/70 text-muted-foreground text-sm font-medium">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((link: any, i: number) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card p-4 flex items-center gap-3 hover:border-primary/15 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <IconPreview name={link.icon} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{link.platform}</p>
              <p className="text-xs text-muted-foreground truncate">{link.url}</p>
            </div>
            <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(link)} className="text-xs px-3 py-1.5 rounded-lg bg-secondary/70 hover:bg-muted font-medium">Edit</button>
              <button onClick={() => deleteMutation.mutate(link.id)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive/70" /></button>
            </div>
          </motion.div>
        ))}
      </div>
      {links.length === 0 && !editing && (
        <div className="text-center py-12">
          <Share2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No social links yet</p>
        </div>
      )}
    </div>
  );
}
