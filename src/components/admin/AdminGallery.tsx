import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGallery, upsertGalleryItem, deleteGalleryItem, uploadMedia, type GalleryItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Upload, X } from "lucide-react";

export default function AdminGallery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: items = [] } = useQuery({ queryKey: ["gallery"], queryFn: fetchGallery });
  const [editing, setEditing] = useState<Partial<GalleryItem> | null>(null);

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Gallery</h2>
        <button onClick={() => setEditing({ image_url: "", caption: "", sort_order: 0 })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"><Plus className="w-4 h-4" /> Add</button>
      </div>

      {editing && (
        <div className="glass-card p-6 mb-6 space-y-4">
          <div className="flex justify-between"><h3 className="font-semibold text-sm">{editing.id ? "Edit" : "New"} Image</h3><button onClick={() => setEditing(null)}><X className="w-4 h-4 text-muted-foreground" /></button></div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Image URL</label>
            <div className="flex gap-2">
              <input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <label className="shrink-0 px-3 py-2 rounded-lg bg-secondary border border-border text-sm cursor-pointer hover:bg-muted flex items-center"><Upload className="w-3.5 h-3.5" /><input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} /></label>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Caption</label>
            <input value={editing.caption ?? ""} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          {editing.image_url && <img src={editing.image_url} alt="Preview" className="w-32 h-24 object-cover rounded-lg" />}
          <button onClick={() => saveMutation.mutate(editing as any)} disabled={saveMutation.isPending} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"><Save className="w-4 h-4" /> Save</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.id} className="glass-card overflow-hidden group relative">
            <img src={item.image_url} alt={item.caption ?? ""} className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => setEditing(item)} className="text-xs px-2 py-1 rounded bg-secondary">Edit</button>
              <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(item.id); }} className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive"><Trash2 className="w-3 h-3" /></button>
            </div>
            {item.caption && <p className="p-2 text-xs text-muted-foreground truncate">{item.caption}</p>}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No gallery images yet.</p>}
      </div>
    </div>
  );
}
