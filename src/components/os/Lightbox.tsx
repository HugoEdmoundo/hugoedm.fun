import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface LightboxProps {
  src: string | null;
  alt?: string;
  caption?: string;
  onClose: () => void;
}

export default function Lightbox({ src, alt, caption, onClose }: LightboxProps) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [src, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[95vw] max-h-[90vh] flex flex-col items-center cursor-default"
          >
            <img
              src={src}
              alt={alt || "Preview"}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            {caption && (
              <p className="mt-3 text-sm text-white/80 text-center max-w-xl px-4">{caption}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
