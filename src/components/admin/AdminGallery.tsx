import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGallery, upsertGalleryItem, deleteGalleryItem, uploadMedia, type GalleryItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Upload, X, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminGallery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: items = [] } = useQuery({ queryKey: ["gallery"], queryFn: fetchGallery });
  const [editing, setEditing] = useState<Partial<GalleryItem> | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail?.tab === "gallery") setEditing({ image_url: "", caption: "", sort_order: 0 });
    };
    window.addEventListener("admin-fab-add", handler);
    return () => window.removeEventListener("admin-fab-add", handler);
  }, []);

  const saveMutation = useMutation({
    mutationFn: (i: any) => upsertGalleryItem(i),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["gallery"] }); setEditing(null); toast({ title: "Saved!" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGalleryItem,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["gallery"] }); toast({ title: "Deleted" }); },
  });

  const handleUpload = async (file: File) => {
    try {
      const url = await uploadMedia(file, `gallery/${Date.now()}-${file.name}`);
      setEditing((e) => e ? { ...e, image_url: url } : null);
      toast({ title: "Uploaded!" });
    } catch (err: any) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Image className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Gallery</h2>
            <p className="text-xs text-muted-foreground">{items.length} images</p>
          </div>
        </div>
        <button onClick={() => setEditing({ image_url: "", caption: "", sort_order: 0 })} className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card p-5 md:p-6 space-y-4 border border-primary/15">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{editing.id ? "Edit" : "New"} Image</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Image URL</label>
                <div className="flex gap-2">
                  <input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="flex-1 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                  <label className="shrink-0 px-4 py-2.5 rounded-xl bg-secondary/70 border border-border/50 text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-xs">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Caption</label>
                <input value={editing.caption ?? ""} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
              </div>
              {editing.image_url && <img src={editing.image_url} alt="Preview" className="w-32 h-24 object-cover rounded-xl border border-border/30" />}
              <button onClick={() => saveMutation.mutate(editing as any)} disabled={saveMutation.isPending} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"><Save className="w-4 h-4" /> Save</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card overflow-hidden group rounded-xl hover:border-primary/15 transition-all"
          >
            <div className="relative">
              <img src={item.image_url} alt={item.caption ?? ""} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => setEditing(item)} className="text-xs px-3 py-1.5 rounded-lg bg-card/90 border border-border/50 hover:bg-muted font-medium">Edit</button>
                <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(item.id); }} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {item.caption && <p className="p-2.5 text-xs text-muted-foreground truncate">{item.caption}</p>}
          </motion.div>
        ))}
      </div>
      {items.length === 0 && !editing && (
        <div className="text-center py-12">
          <Image className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No gallery images yet</p>
        </div>
      )}
    </div>
  );
}
