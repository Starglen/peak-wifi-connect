import { useEffect, useRef } from "react";

/** A quiet, full-bleed field of flowing signal lines. */
export function WaveBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let width = 0;
    let height = 0;
    let primary = "";
    let accent = "";
    function resize() {
      if (!element) return;
      width = element.clientWidth;
      height = element.clientHeight;
      const ratio = Math.min(window.devicePixelRatio, 2);
      element.width = width * ratio;
      element.height = height * ratio;
      context?.setTransform(ratio, 0, 0, ratio, 0, 0);
      const tokens = getComputedStyle(element);
      primary = tokens.getPropertyValue("--primary").trim();
      accent = tokens.getPropertyValue("--accent").trim();
    }
    function draw(now: number) {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      const time = reduced.matches ? 0 : now * 0.00013;
      for (let line = 0; line < 48; line++) {
        context.beginPath();
        context.strokeStyle = line < 24 ? primary : accent;
        context.globalAlpha = 0.1 + Math.sin(line / 48 * Math.PI) * 0.22;
        context.lineWidth = 0.8;
        for (let x = -10; x <= width + 10; x += 8) {
          const u = x / Math.max(width, 1);
          const envelope = Math.sin(u * Math.PI);
          const y = height * 0.6 + (line - 24) * 5 + envelope * (
            Math.sin(u * 6.5 + time + line * 0.07) * height * 0.21 +
            Math.cos(u * 3.8 - time * 0.7 + line * 0.035) * height * 0.15
          );
          if (x === -10) context.moveTo(x, y); else context.lineTo(x, y);
        }
        context.stroke();
      }
      if (!reduced.matches && !document.hidden) frame = requestAnimationFrame(draw);
    }
    function restart() { cancelAnimationFrame(frame); draw(performance.now()); }
    resize(); restart();
    const observer = new ResizeObserver(() => { resize(); restart(); });
    observer.observe(element);
    reduced.addEventListener("change", restart);
    document.addEventListener("visibilitychange", restart);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      reduced.removeEventListener("change", restart);
      document.removeEventListener("visibilitychange", restart);
    };
  }, []);
  return <canvas ref={canvas} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}