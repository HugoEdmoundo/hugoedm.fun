import { BentoCard, BentoGrid } from "./BentoGrid";
import type { GalleryItem } from "@/lib/api";

interface GalleryWindowProps {
  items: GalleryItem[];
}

export default function GalleryWindow({ items }: GalleryWindowProps) {
  if (items.length === 0) {
    return <div className="p-8 text-center text-muted-foreground text-sm">No gallery items.</div>;
  }

  return (
    <div className="p-4">
      <BentoGrid className="grid-cols-2 md:grid-cols-3">
        {items.map((item, i) => (
          <BentoCard key={item.id} delay={i * 0.04} className="p-0 overflow-hidden">
            <div className="aspect-square overflow-hidden">
              <img
                src={item.image_url}
                alt={item.caption || "Gallery"}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            {item.caption && (
              <p className="text-[10px] text-muted-foreground p-2 truncate">{item.caption}</p>
            )}
          </BentoCard>
        ))}
      </BentoGrid>
    </div>
  );
}
