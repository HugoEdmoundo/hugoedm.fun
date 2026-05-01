import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useDragControls, useMotionValue } from "framer-motion";
import { X, Minus, Maximize2, Minimize2 } from "lucide-react";

export interface WindowState {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
}

interface DraggableWindowProps {
  win: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

function DraggableWindow({ win, onClose, onMinimize, onMaximize, onFocus, onDragEnd }: DraggableWindowProps) {
  const dragControls = useDragControls();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isFullscreen = isMobile || win.maximized;

  // Controlled motion values — single source of truth for position.
  // We initialize them at win.x/win.y; framer-motion drag will mutate them
  // directly, then onDragEnd we read them back into React state. No fighting.
  const mx = useMotionValue(win.x);
  const my = useMotionValue(win.y);

  // Sync motion values when committed position changes externally
  // (e.g. window first opens, or after maximize toggles back)
  useEffect(() => {
    mx.set(win.x);
    my.set(win.y);
  }, [win.x, win.y, mx, my]);

  return (
    <motion.div
      key={win.id}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{
        opacity: win.minimized ? 0 : 1,
        scale: win.minimized ? 0.9 : 1,
      }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
      drag={!isFullscreen}
      dragControls={dragControls}
      dragMomentum={false}
      dragListener={false}
      dragElastic={0}
      dragTransition={{ power: 0, timeConstant: 0, bounceStiffness: 0, bounceDamping: 0 }}
      style={{
        // x/y motion values drive transform — framer owns position during drag
        x: isFullscreen ? 0 : mx,
        y: isFullscreen ? 0 : my,
        position: "absolute",
        left: isFullscreen ? 0 : 0,
        top: isFullscreen ? 0 : 0,
        width: isFullscreen ? "100vw" : win.width,
        height: isFullscreen ? "100vh" : win.height,
        zIndex: win.zIndex,
        display: win.minimized ? "none" : "flex",
        pointerEvents: "auto",
      }}
      onDragEnd={() => {
        if (!isFullscreen) {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          // Allow window to extend slightly off-screen but keep title bar reachable
          const minX = -(win.width - 120);
          const maxX = vw - 120;
          const minY = 32; // below menu bar
          const maxY = vh - 60; // keep title bar visible above dock
          const clampedX = Math.min(Math.max(mx.get(), minX), maxX);
          const clampedY = Math.min(Math.max(my.get(), minY), maxY);
          // Snap motion values back to clamped position (no animation = no fling)
          mx.set(clampedX);
          my.set(clampedY);
          onDragEnd(win.id, clampedX, clampedY);
        }
      }}
      onPointerDown={() => onFocus(win.id)}
      className="os-window"
    >
      <div
        className="flex flex-col h-full w-full overflow-hidden bg-card shadow-2xl shadow-black/40 window-content"
        style={{
          borderRadius: isFullscreen ? 0 : 12,
          border: isFullscreen ? "none" : "1px solid hsl(var(--border) / 0.6)",
        }}
      >
        {/* Title bar — drag handle */}
        <div
          className="h-10 flex items-center justify-between px-3 bg-secondary border-b border-border/40 select-none shrink-0 window-titlebar"
          style={{
            cursor: isFullscreen ? "default" : "grab",
            touchAction: isFullscreen ? "auto" : "none",
          }}
          onPointerDown={(e) => {
            if (!isFullscreen) {
              e.stopPropagation();
              onFocus(win.id);
              dragControls.start(e);
            }
          }}
          onDoubleClick={(e) => {
            if (!isMobile) {
              e.stopPropagation();
              onMaximize(win.id);
            }
          }}
        >
          <div className="flex items-center gap-2 min-w-0 pointer-events-none">
            <div className="w-5 h-5 flex items-center justify-center text-primary shrink-0">
              {win.icon}
            </div>
            <span className="text-xs font-medium truncate text-foreground/90">{win.title}</span>
          </div>
          <div className="flex items-center gap-1">
            {!isMobile && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onMinimize(win.id); }}
                className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Minimize"
              >
                <Minus className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            {!isMobile && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onMaximize(win.id); }}
                className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                aria-label={win.maximized ? "Restore" : "Maximize"}
              >
                {win.maximized
                  ? <Minimize2 className="w-3 h-3 text-muted-foreground" />
                  : <Maximize2 className="w-3 h-3 text-muted-foreground" />
                }
              </button>
            )}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onClose(win.id); }}
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-destructive/20 transition-colors"
              aria-label="Close"
            >
              <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-card">
          {win.content}
        </div>
      </div>
    </motion.div>
  );
}

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const topZ = useRef(10);

  const openWindow = useCallback((config: Omit<WindowState, "minimized" | "maximized" | "zIndex">) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === config.id);
      if (existing) {
        topZ.current += 1;
        return prev.map((w) =>
          w.id === config.id ? { ...w, minimized: false, zIndex: topZ.current } : w
        );
      }
      topZ.current += 1;
      return [...prev, { ...config, minimized: false, maximized: false, zIndex: topZ.current }];
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w))
    );
  }, []);

  const focusWindow = useCallback((id: string) => {
    topZ.current += 1;
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: topZ.current } : w)));
  }, []);

  const updatePosition = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  return { windows, openWindow, closeWindow, minimizeWindow, maximizeWindow, focusWindow, updatePosition };
}

interface WindowLayerProps {
  windows: WindowState[];
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

export function WindowLayer({ windows, onClose, onMinimize, onMaximize, onFocus, onDragEnd }: WindowLayerProps) {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      <AnimatePresence>
        {windows.map((win) => (
          <DraggableWindow
            key={win.id}
            win={win}
            onClose={onClose}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            onFocus={onFocus}
            onDragEnd={onDragEnd}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
