import * as React from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

const TABLET_MIN = 768;
const DESKTOP_MIN = 1024;

function getBp(width: number): Breakpoint {
  if (width < TABLET_MIN) return "mobile";
  if (width < DESKTOP_MIN) return "tablet";
  return "desktop";
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = React.useState<Breakpoint>(() =>
    typeof window !== "undefined" ? getBp(window.innerWidth) : "desktop"
  );

  React.useEffect(() => {
    const onResize = () => setBp(getBp(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return bp;
}

export function useIsTouchDevice(): boolean {
  const [touch, setTouch] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    setTouch(mq.matches);
    const onChange = () => setTouch(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return touch;
}
