import { useState } from "react";
import { BentoCard, BentoGrid } from "./BentoGrid";
import type { GalleryItem } from "@/lib/api";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import Lightbox from "./Lightbox";

interface GalleryWindowProps {
  items: GalleryItem[];
}

export default function GalleryWindow({ items }: GalleryWindowProps) {
  const bp = useBreakpoint();
  const [active, setActive] = useState<GalleryItem | null>(null);

  if (items.length === 0) {
    return <div className="p-8 text-center text-muted-foreground text-sm">No gallery items.</div>;
  }

  const Tile = ({ item, className = "" }: { item: GalleryItem; className?: string }) => (
    <button
      type="button"
      onClick={() => setActive(item)}
      className={`block w-full text-left cursor-zoom-in ${className}`}
      aria-label={`Open ${item.caption || "image"}`}
    >
      <img
        src={item.image_url}
        alt={item.caption || "Gallery"}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        loading="lazy"
      />
    </button>
  );

  // ─── MOBILE: 2 columns, square ─────────────────────────────────────
  if (bp === "mobile") {
    return (
      <>
        <div className="p-2 grid grid-cols-2 gap-2">
          {items.map((item) => (
            <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-secondary/30 active:opacity-80">
              <Tile item={item} />
            </div>
          ))}
        </div>
        <Lightbox
          src={active?.image_url ?? null}
          alt={active?.caption ?? undefined}
          caption={active?.caption ?? undefined}
          onClose={() => setActive(null)}
        />
      </>
    );
  }

  // ─── TABLET: 3 columns ─────────────────────────────────────────────
  if (bp === "tablet") {
    return (
      <>
        <div className="p-3 grid grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl overflow-hidden bg-card/50 border border-border/30 group">
              <div className="aspect-square overflow-hidden">
                <Tile item={item} />
              </div>
              {item.caption && <p className="text-[10px] text-muted-foreground p-2 truncate">{item.caption}</p>}
            </div>
          ))}
        </div>
        <Lightbox
          src={active?.image_url ?? null}
          alt={active?.caption ?? undefined}
          caption={active?.caption ?? undefined}
          onClose={() => setActive(null)}
        />
      </>
    );
  }

  // ─── DESKTOP: masonry-style 4 cols dengan caption ─────────────────
  return (
    <>
      <div className="p-4">
        <BentoGrid className="grid-cols-4">
          {items.map((item, i) => (
            <BentoCard key={item.id} delay={i * 0.04} className="p-0 overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <Tile item={item} />
              </div>
              {item.caption && <p className="text-[10px] text-muted-foreground p-2 truncate">{item.caption}</p>}
            </BentoCard>
          ))}
        </BentoGrid>
      </div>
      <Lightbox
        src={active?.image_url ?? null}
        alt={active?.caption ?? undefined}
        caption={active?.caption ?? undefined}
        onClose={() => setActive(null)}
      />
    </>
  );
}
