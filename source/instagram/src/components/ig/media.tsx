import { useEffect, useRef, useState, type RefObject } from "react";
import { Heart } from "./Icons";

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

/** Double-tap-to-like surface with the IG heart burst. */
export function useDoubleTap(onDouble: () => void) {
  const last = useRef(0);
  const [bursts, setBursts] = useState<number[]>([]);
  const onClick = () => {
    const now = Date.now();
    if (now - last.current < 300) {
      onDouble();
      const id = now;
      setBursts((b) => [...b, id]);
      setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 1000);
      last.current = 0;
    } else last.current = now;
  };
  const overlay = (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      {bursts.map((id) => (
        <Heart key={id} size={96} filled className="absolute text-ig-fg drop-shadow-[0_0_20px_rgba(0,0,0,.35)] animate-ig-heart" strokeWidth={0} />
      ))}
    </div>
  );
  return { onClick, overlay };
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

