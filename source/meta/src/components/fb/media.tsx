import { useEffect, useRef, useState, type RefObject } from "react";

export function useInView<T extends Element>(ref: RefObject<T | null>, threshold = 0.6) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setV(!!e?.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return v;
}

export function AutoVideo({ src, poster, active, className }: { src: string; poster?: string; active: boolean; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active]);
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="auto" className={className ?? "h-full w-full object-cover"} />;
}
