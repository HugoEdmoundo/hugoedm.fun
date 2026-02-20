import { motion } from "framer-motion";
import type { GalleryItem } from "@/lib/api";

interface GallerySectionProps {
  items: GalleryItem[];
}

export default function GallerySection({ items }: GallerySectionProps) {
  if (items.length === 0) return null;

  return (
    <section id="gallery" className="section-padding">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-sm font-mono text-primary tracking-widest uppercase mb-4">Gallery</h2>
          <p className="text-3xl font-bold mb-12">Visual Showcase</p>
        </motion.div>

        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="break-inside-avoid glass-card overflow-hidden hover-lift group"
            >
              <img
                src={item.image_url}
                alt={item.caption || "Gallery image"}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {item.caption && (
                <p className="p-3 text-xs text-muted-foreground">{item.caption}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
