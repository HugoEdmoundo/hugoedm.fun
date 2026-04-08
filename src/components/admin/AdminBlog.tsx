import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBlogPosts, upsertBlogPost, deleteBlogPost, type BlogPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X, BookOpen, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminBlog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: posts = [] } = useQuery({ queryKey: ["blog-posts-admin"], queryFn: () => fetchBlogPosts(false) });
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail?.tab === "blog") setEditing({ title: "", content: "", slug: "", published: false });
    };
    window.addEventListener("admin-fab-add", handler);
    return () => window.removeEventListener("admin-fab-add", handler);
  }, []);

  const saveMutation = useMutation({
    mutationFn: (p: any) => upsertBlogPost(p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["blog-posts-admin"] }); setEditing(null); toast({ title: "Saved!" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["blog-posts-admin"] }); toast({ title: "Deleted" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Blog Posts</h2>
            <p className="text-xs text-muted-foreground">{posts.length} posts</p>
          </div>
        </div>
        <button onClick={() => setEditing({ title: "", content: "", slug: "", published: false })} className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card p-5 md:p-6 space-y-4 border border-primary/15">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{editing.id ? "Edit" : "New"} Post</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
                  <input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Slug</label>
                  <input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Content (Markdown)</label>
                <textarea value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[200px] font-mono resize-y transition-all" />
              </div>
              <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                <input type="checkbox" checked={editing.published ?? false} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="accent-primary w-4 h-4" />
                Published
              </label>
              <button onClick={() => saveMutation.mutate(editing as any)} disabled={saveMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {posts.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-primary/15 transition-all group"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${p.published ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-secondary border border-border/30"}`}>
              {p.published ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{p.title}</p>
              <p className="text-xs text-muted-foreground">/{p.slug} • {p.published ? "Published" : "Draft"}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => setEditing(p)} className="text-xs px-3 py-1.5 rounded-lg bg-secondary/70 hover:bg-muted font-medium">Edit</button>
              <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(p.id); }} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive/70" /></button>
            </div>
          </motion.div>
        ))}
      </div>
      {posts.length === 0 && !editing && (
        <div className="text-center py-12">
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No blog posts yet</p>
        </div>
      )}
    </div>
  );
}
