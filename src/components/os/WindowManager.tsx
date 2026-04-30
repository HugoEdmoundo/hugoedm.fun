import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
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
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Mobile is always fullscreen; desktop respects maximized state
  const isFullscreen = isMobile || win.maximized;

  return (
    <motion.div
      key={win.id}
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{
        opacity: win.minimized ? 0 : 1,
        scale: win.minimized ? 0.88 : 1,
        y: win.minimized ? 60 : 0,
        left: isFullscreen ? 0 : win.x,
        top: isFullscreen ? 32 : win.y,
        width: isFullscreen ? "100vw" : win.width,
        height: isFullscreen ? "calc(100vh - 32px)" : win.height,
      }}
      exit={{ opacity: 0, scale: 0.92, y: 16 }}
      transition={{ type: "spring", damping: 26, stiffness: 300 }}
      drag={!isFullscreen}
      dragControls={dragControls}
      dragMomentum={false}
      dragListener={false}
      dragConstraints={{
        left: 0,
        top: 32,
        right: typeof window !== "undefined" ? window.innerWidth - win.width : 800,
        bottom: typeof window !== "undefined" ? window.innerHeight - win.height : 600,
      }}
      onDragEnd={(_, info) => {
        if (!isFullscreen) {
          onDragEnd(
            win.id,
            Math.max(0, (win.x || 0) + info.offset.x),
            Math.max(32, (win.y || 0) + info.offset.y),
          );
        }
      }}
      onPointerDown={() => onFocus(win.id)}
      className="absolute os-window"
      style={{
        left: isFullscreen ? 0 : win.x,
        top: isFullscreen ? 32 : win.y,
        width: isFullscreen ? "100vw" : win.width,
        height: isFullscreen ? "calc(100vh - 32px)" : win.height,
        zIndex: win.zIndex,
        display: win.minimized ? "none" : "flex",
        pointerEvents: "auto",
      }}
    >
      <div
        className="flex flex-col h-full w-full overflow-hidden bg-card/92 backdrop-blur-2xl shadow-2xl shadow-black/30"
        style={{
          borderRadius: isFullscreen ? 0 : 12,
          border: isFullscreen ? "none" : "1px solid hsl(var(--border) / 0.4)",
        }}
      >
        {/* Title bar */}
        <div
          className="h-10 flex items-center justify-between px-3 bg-secondary/60 border-b border-border/30 select-none shrink-0"
          style={{ cursor: isFullscreen ? "default" : "grab" }}
          onPointerDown={(e) => {
            if (!isFullscreen) dragControls.start(e);
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 flex items-center justify-center text-primary shrink-0">
              {win.icon}
            </div>
            <span className="text-xs font-medium truncate text-foreground/80">{win.title}</span>
          </div>
          <div className="flex items-center gap-1">
            {!isMobile && (
              <button
                onClick={(e) => { e.stopPropagation(); onMinimize(win.id); }}
                className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Minimize"
              >
                <Minus className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onMaximize(win.id); }}
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
              aria-label={win.maximized ? "Restore" : "Maximize"}
            >
              {win.maximized
                ? <Minimize2 className="w-3 h-3 text-muted-foreground" />
                : <Maximize2 className="w-3 h-3 text-muted-foreground" />
              }
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(win.id); }}
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-destructive/20 transition-colors"
              aria-label="Close"
            >
              <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
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
