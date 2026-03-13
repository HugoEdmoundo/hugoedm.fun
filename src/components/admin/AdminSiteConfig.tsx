import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSiteConfig, updateSiteConfig, uploadMedia } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, Sparkles } from "lucide-react";

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
    marketplace_cta_text: form.marketplace_cta_text ?? (config as any)?.marketplace_cta_text ?? "Visit Marketplace",
    marketplace_cta_url: form.marketplace_cta_url ?? (config as any)?.marketplace_cta_url ?? "",
  };

  const mutation = useMutation({
    mutationFn: () => updateSiteConfig(values as any),
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

  const sections: {
    title: string;
    description: string;
    fields: { key: string; label: string; type?: string; uploadable?: boolean; placeholder?: string }[];
  }[] = [
    {
      title: "Brand Identity",
      description: "Atur nama situs, deskripsi, dan visual utama.",
      fields: [
        { key: "site_name", label: "Site Name" },
        { key: "description", label: "Tagline / Description", placeholder: "Short intro on hero section" },
        { key: "favicon_url", label: "Favicon URL", uploadable: true },
      ],
    },
    {
      title: "Hero Content",
      description: "Konten utama yang muncul pertama kali di landing page.",
      fields: [
        { key: "hero_name", label: "Hero Name" },
        { key: "hero_headline", label: "Hero Headline" },
        { key: "hero_photo_url", label: "Hero Photo URL", uploadable: true },
        { key: "about_text", label: "About Text", type: "textarea" },
      ],
    },
    {
      title: "Links & CTA",
      description: "Tautan penting termasuk tombol marketplace.",
      fields: [
        { key: "github_username", label: "GitHub Username" },
        { key: "cv_url", label: "CV / Resume URL", uploadable: true },
        { key: "marketplace_cta_text", label: "Marketplace CTA Text", placeholder: "Visit Marketplace" },
        { key: "marketplace_cta_url", label: "Marketplace CTA URL", placeholder: "https://..." },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-5 md:p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Site Configuration</h2>
        </div>
        <p className="text-sm text-muted-foreground">Semua update di sini langsung memengaruhi landing page dan elemen branding.</p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="glass-card p-5 md:p-6 space-y-5">
          <div>
            <h3 className="font-semibold text-base">{section.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{field.label}</label>
                <div className="flex gap-2">
                  {field.type === "textarea" ? (
                    <textarea
                      value={(values as any)[field.key]}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-secondary/70 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[120px] resize-y"
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      value={(values as any)[field.key]}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg bg-secondary/70 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder={field.placeholder}
                    />
                  )}

                  {field.uploadable && (
                    <label className="shrink-0 px-3 py-2 rounded-lg bg-secondary border border-border text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span className="text-xs">Upload</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleUpload(field.key, e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {mutation.isPending ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
