import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBlogPosts, upsertBlogPost, deleteBlogPost, type BlogPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X } from "lucide-react";

export default function AdminBlog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: posts = [] } = useQuery({ queryKey: ["blog-posts-admin"], queryFn: () => fetchBlogPosts(false) });
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Blog Posts</h2>
        <button onClick={() => setEditing({ title: "", content: "", slug: "", published: false })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"><Plus className="w-4 h-4" /> Add</button>
      </div>

      {editing && (
        <div className="glass-card p-6 mb-6 space-y-4">
          <div className="flex justify-between"><h3 className="font-semibold text-sm">{editing.id ? "Edit" : "New"} Post</h3><button onClick={() => setEditing(null)}><X className="w-4 h-4 text-muted-foreground" /></button></div>
          {[{ key: "title", label: "Title" }, { key: "slug", label: "Slug" }].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
              <input value={(editing as any)[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Content (Markdown)</label>
            <textarea value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[200px] font-mono" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.published ?? false} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="accent-primary" />
            Published
          </label>
          <button onClick={() => saveMutation.mutate(editing as any)} disabled={saveMutation.isPending} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"><Save className="w-4 h-4" /> Save</button>
        </div>
      )}

      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="glass-card p-3 flex items-center justify-between">
            <div><span className="text-sm font-medium">{p.title}</span><span className="text-xs text-muted-foreground ml-2">{p.published ? "✅ Published" : "📝 Draft"}</span></div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(p)} className="text-xs px-2 py-1 rounded bg-secondary hover:bg-muted">Edit</button>
              <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(p.id); }} className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-sm text-muted-foreground">No blog posts yet.</p>}
      </div>
    </div>
  );
}
