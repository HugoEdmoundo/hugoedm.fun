import { useState } from "react";
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

  const cols = bp === "mobile" ? 2 : bp === "tablet" ? 3 : 4;

  return (
    <>
      {/* Zero padding, zero gap — full bleed photos */}
      <div
        className="w-full h-full overflow-y-auto"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 0,
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            className="relative aspect-square overflow-hidden cursor-zoom-in group"
            aria-label={item.caption || "Open image"}
          >
            <img
              src={item.image_url}
              alt={item.caption || "Gallery"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Caption on hover */}
            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-[10px] text-white/90 truncate">{item.caption}</p>
              </div>
            )}
          </button>
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
