import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSiteConfig, updateSiteConfig, uploadMedia } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, Sparkles, Globe, Type, Link2 } from "lucide-react";
import { motion } from "framer-motion";

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

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const sections = [
    {
      title: "Brand Identity",
      description: "Nama situs, deskripsi, dan visual utama.",
      icon: Globe,
      fields: [
        { key: "site_name", label: "Site Name" },
        { key: "description", label: "Tagline / Description", placeholder: "Short intro" },
        { key: "favicon_url", label: "Favicon URL", uploadable: true },
      ],
    },
    {
      title: "Hero Content",
      description: "Konten utama landing page.",
      icon: Type,
      fields: [
        { key: "hero_name", label: "Hero Name" },
        { key: "hero_headline", label: "Hero Headline" },
        { key: "hero_photo_url", label: "Hero Photo URL", uploadable: true },
        { key: "about_text", label: "About Text", type: "textarea" },
      ],
    },
    {
      title: "Links & CTA",
      description: "Tautan penting dan marketplace CTA.",
      icon: Link2,
      fields: [
        { key: "github_username", label: "GitHub Username" },
        { key: "cv_url", label: "CV / Resume URL", uploadable: true },
        { key: "marketplace_cta_text", label: "CTA Text", placeholder: "Visit Marketplace" },
        { key: "marketplace_cta_url", label: "CTA URL", placeholder: "https://..." },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section, sIdx) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sIdx * 0.08 }}
          className="glass-card p-5 md:p-6 space-y-5 border border-border/30 hover:border-primary/15 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <section.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{section.title}</h3>
              <p className="text-[11px] text-muted-foreground">{section.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{field.label}</label>
                <div className="flex gap-2">
                  {field.type === "textarea" ? (
                    <textarea
                      value={(values as any)[field.key]}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[120px] resize-y transition-all"
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      value={(values as any)[field.key]}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      placeholder={field.placeholder}
                    />
                  )}
                  {field.uploadable && (
                    <label className="shrink-0 px-3 py-2.5 rounded-xl bg-secondary/70 border border-border/50 text-sm cursor-pointer hover:bg-muted transition-colors flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-xs">Upload</span>
                      <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(field.key, e.target.files[0])} />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-primary/20"
      >
        <Save className="w-4 h-4" />
        {mutation.isPending ? "Saving..." : "Save All Settings"}
      </motion.button>
    </div>
  );
}
