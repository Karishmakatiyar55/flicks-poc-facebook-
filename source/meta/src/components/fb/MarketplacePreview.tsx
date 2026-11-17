import { useEffect, useRef } from "react";
import type { Flick } from "@/data/feed";

export function MarketplacePreview({ flick }: { flick: Flick }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = video.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    let visible = false;
    const update = () => {
      element.muted = true;
      if (visible && !document.hidden) void element.play().catch(() => {});
      else element.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      element.pause();
    };
  }, [flick.previewVideo]);
  if (flick.previewVideo) return <>
    <video ref={video} src={flick.previewVideo} poster={flick.thumbnail} aria-label={`${flick.displayName} preview`} muted loop playsInline preload="auto" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
    <div className="pointer-events-none absolute bottom-2 left-1/2 flex w-3/5 -translate-x-1/2 items-center justify-center gap-1.5" aria-hidden="true">
      {flick.previewThumbnails?.map((thumbnail) => <span key={thumbnail} className="aspect-square min-w-0 flex-1 overflow-hidden rounded-full border-2 border-fb-card bg-fb-card shadow-sm"><img src={thumbnail} alt="" className="block h-full w-full scale-125 object-cover" /></span>)}
    </div>
  </>;
  return flick.thumbnail ? <img src={flick.thumbnail} alt={`${flick.displayName} Flick`} className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${flick.mock ? "mock-flick-image" : ""}`} /> : <span className="text-[56px] font-bold text-fb-muted">{flick.displayName?.charAt(0)}</span>;
}
