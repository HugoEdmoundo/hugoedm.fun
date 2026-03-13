import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchExperience, upsertExperience, deleteExperience, type Experience, uploadMedia } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, X, Upload, Briefcase } from "lucide-react";

export default function AdminExperience() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: items = [] } = useQuery({ queryKey: ["experience"], queryFn: fetchExperience });
  const [editing, setEditing] = useState<Partial<Experience> | null>(null);

  const saveMutation = useMutation({
    mutationFn: (e: any) => upsertExperience(e),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience"] });
      setEditing(null);
      toast({ title: "Saved!" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience"] });
      toast({ title: "Deleted" });
    },
  });

  const fields: { key: keyof Experience | "sort_order"; label: string; type?: string; uploadable?: boolean }[] = [
    { key: "company", label: "Company" },
    { key: "role", label: "Role" },
    { key: "duration", label: "Duration" },
    { key: "logo_url", label: "Logo URL", uploadable: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "sort_order", label: "Sort Order", type: "number" },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-5 md:p-6 flex items-center justify-between gap-3 border border-primary/20">
        <div>
          <h2 className="text-xl font-bold">Experience</h2>
          <p className="text-sm text-muted-foreground mt-1">Kelola pengalaman kerja supaya narasi profesional lebih kuat dan rapi.</p>
        </div>
        <button
          onClick={() => setEditing({ company: "", role: "", duration: "", description: "", logo_url: "", sort_order: 0 })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {editing && (
        <div className="glass-card p-5 md:p-6 space-y-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{editing.id ? "Edit Experience" : "New Experience"}</h3>
            <button onClick={() => setEditing(null)} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{field.label}</label>

                {field.type === "textarea" ? (
                  <textarea
                    value={(editing as any)[field.key] ?? ""}
                    onChange={(e) => setEditing({ ...editing, [field.key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/70 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[100px]"
                  />
                ) : (
                  <div className="flex gap-2">
                    <input
                      type={field.type || "text"}
                      value={(editing as any)[field.key] ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          [field.key]: field.type === "number" ? parseInt(e.target.value) || 0 : e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-lg bg-secondary/70 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />

                    {field.uploadable && (
                      <label className="shrink-0 px-3 py-2 rounded-lg bg-secondary border border-border text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const url = await uploadMedia(file, `experience/logo-${Date.now()}`);
                              setEditing({ ...editing, [field.key]: url });
                            } catch (error: any) {
                              toast({ title: "Upload failed", description: error.message, variant: "destructive" });
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => saveMutation.mutate(editing as any)}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      )}

      <div className="grid gap-3">
        {items.map((entry) => (
          <div key={entry.id} className="glass-card p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {entry.logo_url ? (
                <img src={entry.logo_url} alt={entry.company} className="w-10 h-10 rounded-lg object-cover border border-border/70" loading="lazy" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{entry.role}</p>
                <p className="text-xs text-muted-foreground truncate">{entry.company} • {entry.duration}</p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditing(entry)} className="text-xs px-3 py-1.5 rounded-lg bg-secondary hover:bg-muted">
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this entry?")) deleteMutation.mutate(entry.id);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && <p className="text-sm text-muted-foreground">No experience entries yet.</p>}
      </div>
    </div>
  );
}
