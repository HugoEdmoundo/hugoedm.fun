import { useState, useCallback, useRef, useEffect } from "react";
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
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{
        opacity: win.minimized ? 0 : 1,
        scale: win.minimized ? 0.5 : 1,
        y: win.minimized ? 100 : 0,
        x: win.maximized ? 0 : undefined,
        width: win.maximized ? "100vw" : win.width,
        height: win.maximized ? "calc(100vh - 72px)" : win.height,
      }}
      exit={{ opacity: 0, scale: 0.7, y: 40 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      drag={!win.maximized}
      dragControls={dragControls}
      dragMomentum={false}
      dragListener={false}
      onDragEnd={(_, info) => {
        onDragEnd(win.id, (win.x || 0) + info.offset.x, (win.y || 0) + info.offset.y);
      }}
      onPointerDown={() => onFocus(win.id)}
      className="absolute os-window"
      style={{
        left: win.maximized ? 0 : win.x,
        top: win.maximized ? 0 : win.y,
        zIndex: win.zIndex,
        display: win.minimized ? "none" : "flex",
        pointerEvents: "auto",
      }}
    >
      <div className="flex flex-col h-full w-full rounded-xl overflow-hidden border border-border/40 bg-card/90 backdrop-blur-2xl shadow-2xl shadow-black/30">
        {/* Title bar */}
        <div
          className="h-10 flex items-center justify-between px-3 bg-secondary/60 border-b border-border/30 cursor-grab active:cursor-grabbing select-none shrink-0"
          onPointerDown={(e) => {
            if (!win.maximized) dragControls.start(e);
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 flex items-center justify-center text-primary shrink-0">
              {win.icon}
            </div>
            <span className="text-xs font-medium truncate text-foreground/80">{win.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onMinimize(win.id); }}
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Minus className="w-3 h-3 text-muted-foreground" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMaximize(win.id); }}
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
            >
              {win.maximized ? <Minimize2 className="w-3 h-3 text-muted-foreground" /> : <Maximize2 className="w-3 h-3 text-muted-foreground" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(win.id); }}
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-destructive/20 transition-colors"
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
