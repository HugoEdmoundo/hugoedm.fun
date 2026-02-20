import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSiteConfig, updateSiteConfig, uploadMedia } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload } from "lucide-react";

export default function AdminSiteConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: config, isLoading } = useQuery({ queryKey: ["site-config"], queryFn: fetchSiteConfig });

  const [form, setForm] = useState<Record<string, string>>({});

  const values = {
    site_name: form.site_name ?? config?.site_name ?? "",
    description: form.description ?? config?.description ?? "",
    github_username: form.github_username ?? config?.github_username ?? "",
    favicon_url: form.favicon_url ?? config?.favicon_url ?? "",
    cv_url: form.cv_url ?? config?.cv_url ?? "",
    hero_name: form.hero_name ?? config?.hero_name ?? "",
    hero_headline: form.hero_headline ?? config?.hero_headline ?? "",
    hero_photo_url: form.hero_photo_url ?? config?.hero_photo_url ?? "",
    about_text: form.about_text ?? config?.about_text ?? "",
  };

  const mutation = useMutation({
    mutationFn: () => updateSiteConfig(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
      toast({ title: "Settings saved!" });
      setForm({});
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleUpload = async (field: string, file: File) => {
    try {
      const url = await uploadMedia(file, `config/${field}-${Date.now()}`);
      setForm((f) => ({ ...f, [field]: url }));
      toast({ title: "Uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="text-muted-foreground text-sm">Loading...</div>;

  const fields: { key: string; label: string; type?: string; uploadable?: boolean }[] = [
    { key: "site_name", label: "Site Name" },
    { key: "description", label: "Site Description" },
    { key: "github_username", label: "GitHub Username" },
    { key: "hero_name", label: "Hero Name" },
    { key: "hero_headline", label: "Hero Headline" },
    { key: "hero_photo_url", label: "Hero Photo URL", uploadable: true },
    { key: "favicon_url", label: "Favicon URL", uploadable: true },
    { key: "cv_url", label: "CV/Resume URL", uploadable: true },
    { key: "about_text", label: "About Text", type: "textarea" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Site Configuration</h2>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{field.label}</label>
            <div className="flex gap-2">
              {field.type === "textarea" ? (
                <textarea
                  value={(values as any)[field.key]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-y"
                />
              ) : (
                <input
                  value={(values as any)[field.key]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              )}
              {field.uploadable && (
                <label className="shrink-0 px-3 py-2 rounded-lg bg-secondary border border-border text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(field.key, e.target.files[0])} />
                </label>
              )}
            </div>
          </div>
        ))}
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {mutation.isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
