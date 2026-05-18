import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchSiteConfig } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function CVViewer() {
  const { data: config, isLoading } = useQuery({
    queryKey: ["site-config"],
    queryFn: fetchSiteConfig,
  });

  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!config?.cv_url) return;

    const url = config.cv_url.trim();
    if (!url) return;

    const normalized = /^(https?:\/\/)/i.test(url) ? url : `https://${url}`;

    // Convert any Google Drive/Docs link to preview mode (no download, viewer only)
    function toViewerUrl(u: string): string {
      // Drive file: https://drive.google.com/file/d/{id}/view
      const driveFileMatch = u.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
      if (driveFileMatch) return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;

      // Drive open: https://drive.google.com/open?id={id}
      const driveOpenMatch = u.match(/drive\.google\.com\/open\?id=([^&]+)/);
      if (driveOpenMatch) return `https://drive.google.com/file/d/${driveOpenMatch[1]}/preview`;

      // Google Docs: https://docs.google.com/document/d/{id}/edit
      const docsMatch = u.match(/docs\.google\.com\/document\/d\/([^/?]+)/);
      if (docsMatch) return `https://docs.google.com/document/d/${docsMatch[1]}/preview`;

      // Google Sheets: https://docs.google.com/spreadsheets/d/{id}/edit
      const sheetsMatch = u.match(/docs\.google\.com\/spreadsheets\/d\/([^/?]+)/);
      if (sheetsMatch) return `https://docs.google.com/spreadsheets/d/${sheetsMatch[1]}/preview`;

      // Google Slides: https://docs.google.com/presentation/d/{id}/edit
      const slidesMatch = u.match(/docs\.google\.com\/presentation\/d\/([^/?]+)/);
      if (slidesMatch) return `https://docs.google.com/presentation/d/${slidesMatch[1]}/preview`;

      // PDF direct - use native browser viewer
      if (u.toLowerCase().includes(".pdf") || u.includes("supabase.co/storage/v1/object/public/media/")) {
        return u;
      }

      // Already a preview link
      if (u.includes("/preview")) return u;

      // Already a Google Docs Viewer link
      if (u.includes("docs.google.com/viewer")) return u;

      // Fallback: Google Docs Viewer for any other URL
      return `https://docs.google.com/viewer?url=${encodeURIComponent(u)}&embedded=true`;
    }

    setEmbedUrl(toViewerUrl(normalized));
  }, [config?.cv_url]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading CV...</p>
        </div>
      </div>
    );
  }

  if (!config?.cv_url) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">CV Not Available</h1>
          <p className="text-muted-foreground text-sm">
            No CV/Resume has been uploaded yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>
          <h1 className="text-sm font-semibold truncate max-w-xs">
            {config.hero_name || "Curriculum Vitae"}
          </h1>
          <a
            href={config.cv_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Open Original
          </a>
        </div>
      </header>

      <main className="flex-1 w-full">
        {embedUrl && (
          <iframe
            src={embedUrl}
            className="w-full border-0"
            style={{ height: "calc(100vh - 3.5rem)" }}
            title="CV Viewer"
          />
        )}
      </main>
    </div>
  );
}
