import { motion, useScroll, useTransform } from "framer-motion";
import type { GalleryItem } from "@/lib/api";
import { useRef } from "react";

interface GallerySectionProps {
  items: GalleryItem[];
}

export default function GallerySection({ items }: GallerySectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  if (items.length === 0) return null;

  return (
    <section id="gallery" ref={ref} className="section-padding relative overflow-hidden">
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[120px]" />
      </motion.div>

      <div className="section-divider mb-24" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-sm font-mono text-primary tracking-[0.3em] uppercase mb-4">Gallery</h2>
          <p className="text-3xl md:text-4xl font-bold mb-14">Visual Showcase</p>
        </motion.div>

        <div className="columns-2 md:columns-3 gap-5 space-y-5">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="break-inside-avoid glass-card overflow-hidden group cursor-default"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.caption || "Gallery image"}
                  className="w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              {item.caption && (
                <p className="p-4 text-xs text-muted-foreground">{item.caption}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
