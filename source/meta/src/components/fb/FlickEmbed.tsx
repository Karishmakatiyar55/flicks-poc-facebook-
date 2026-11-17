import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { selectAudibleFlick, selectFlicks } from "./flick-policy";
import { useRememberFlickVariant } from "./InAppBrowser";

import { FlickAudioBlockContext } from "./FlickAudio";

type Registration = { element: HTMLDivElement; priority: number; notify: (audible: boolean) => void };
const FlickContext = createContext<{ active: string[]; register: (key: string, entry: Registration) => () => void } | null>(null);

export function FlickProvider({ children }: { children: ReactNode }) {
  const entries = useRef(new Map<string, Registration>());
  const current = useRef<string[]>([]);
  const [active, setActive] = useState<string[]>([]);
  const blockers = useRef(0);
  const updateRef = useRef(() => {});
  const block = useCallback(() => {
    blockers.current += 1;
    updateRef.current();
    return () => { blockers.current -= 1; updateRef.current(); };
  }, []);
  const register = useCallback((key: string, entry: Registration) => {
    entries.current.set(key, entry);
    return () => { entry.notify(false); entries.current.delete(key); updateRef.current(); };
  }, []);
  useEffect(() => {
    const update = () => {
      const candidates = [...entries.current].flatMap(([key, { element, priority }]) => {
        if (!element.getClientRects().length) return [];
        let top = 0, bottom = window.innerHeight, left = 0, right = window.innerWidth;
        for (let parent = element.parentElement; parent; parent = parent.parentElement) {
          if (/(auto|scroll|hidden)/.test(getComputedStyle(parent).overflowY)) {
            const r = parent.getBoundingClientRect();
            top = Math.max(top, r.top); bottom = Math.min(bottom, r.bottom);
            left = Math.max(left, r.left); right = Math.min(right, r.right);
          }
        }
        if (bottom <= top) return [];
        const r = element.getBoundingClientRect();
        const vt = Math.max(top, r.top), vb = Math.min(bottom, r.bottom), vl = Math.max(left, r.left), vr = Math.min(right, r.right);
        let uncovered = 0;
        if (vb > vt && vr > vl) {
          const placement = element.closest("[data-placement]") ?? element;
          for (const x of [0.2, 0.5, 0.8]) for (const y of [0.2, 0.5, 0.8]) {
            const front = document.elementFromPoint?.(vl + (vr - vl) * x, vt + (vb - vt) * y);
            if (front && placement.contains(front)) uncovered += 1;
          }
        }
        const visibility = r.width > 0 && r.height > 0 ? Math.max(0, vb - vt) * Math.max(0, vr - vl) / (r.width * r.height) * uncovered / 9 : 0;
        return [{ key, visibility, distance: Math.max(top - r.bottom, r.top - bottom, 0), viewport: bottom - top, retained: current.current.includes(key), priority }];
      });
      const next = selectFlicks(candidates);
      const audible = selectAudibleFlick(candidates.filter(c => next.includes(c.key)), document.hidden || blockers.current > 0);
      // Send revocations before granting the single foreground frame.
      entries.current.forEach((entry, key) => { if (key !== audible) entry.notify(false); });
      if (audible) entries.current.get(audible)?.notify(true);
      if (next.join() !== current.current.join()) { current.current = next; setActive(next); }
    };
    updateRef.current = update;
    const timer = setInterval(update, 50);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => { clearInterval(timer); window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); document.removeEventListener("visibilitychange", update); };
  }, []);
  return <FlickContext.Provider value={{ active, register }}><FlickAudioBlockContext.Provider value={block}>{children}</FlickAudioBlockContext.Provider></FlickContext.Provider>;
}

export function FlickEmbed({ id, aspect, enabled = true, fill = false, priority = 0, onEvent, surface, poster }: {
  id: string; aspect: string; enabled?: boolean; fill?: boolean; priority?: number;
  /** A still of the Flick. It covers the frame until the Flick is playing, then fades, so there is no loading flash. */
  poster?: string;
  onEvent?: (type: string, detail: unknown) => void;
  surface?: "reel" | "story";
}) {
  const pool = useContext(FlickContext);
  const rememberVariant = useRememberFlickVariant();
  const key = useId();
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const allowed = useRef(false);
  const notify = useCallback((audible: boolean) => {
    allowed.current = audible;
    frame.current?.contentWindow?.postMessage({ source: "flick-host", type: "flick-audibility", id, audible }, location.origin);
  }, [id]);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const eventCallback = useRef(onEvent);
  useEffect(() => { eventCallback.current = onEvent; }, [onEvent]);
  const register = pool?.register;
  useLayoutEffect(() => {
    const element = box.current;
    if (!enabled || !element || !register) return;
    return register(key, { element, priority, notify });
  }, [enabled, key, priority, register, notify]);
  const mounted = enabled && (pool?.active.includes(key) ?? false);
  useEffect(() => {
    if (!mounted) return;
    setState("loading");
    let ready = false;
    const timer = setTimeout(() => { if (!ready) setState("error"); }, 12000);
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== "flick" || data.id !== id) return;
      if (data.type === "flick-audio-request" || data.type === "vertex-ready") notify(allowed.current);
      if (data.type === "vertex-ready") { ready = true; clearTimeout(timer); setState("ready"); }
      if (data.type === "vertex-error" && data.detail?.severity !== "warning") { clearTimeout(timer); setState("error"); }
      if (data.type === "vertex-diff-change") rememberVariant(id, data.detail);
      eventCallback.current?.(data.type, data.detail);
    };
    window.addEventListener("message", receive);
    return () => { clearTimeout(timer); window.removeEventListener("message", receive); };
  }, [mounted, id, attempt, rememberVariant, notify]);
  // With a poster, hold it until the Flick has painted a moving frame, not just reported ready.
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    setRevealed(false);
    if (!poster || !mounted || state !== "ready") return;
    const since = performance.now();
    const timer = setInterval(() => {
      const waited = performance.now() - since;
      let playing = false, video = false;
      try {
        const media = frame.current?.contentDocument?.querySelector("vertex-player")?.shadowRoot?.querySelectorAll("video");
        media?.forEach(v => { video = true; if (v.readyState >= 2 && v.currentTime > 0.05) playing = true; });
      } catch { /* The player is isolated or still starting. */ }
      if (playing || (!video && waited > 250) || waited > 2000) { clearInterval(timer); setRevealed(true); }
    }, 50);
    return () => clearInterval(timer);
  }, [poster, mounted, state, attempt]);
  return <div ref={box} data-flick-id={id} data-flick-state={mounted ? state : "idle"} className={`relative w-full overflow-hidden bg-fb-elev ${fill ? "h-full" : ""}`} style={fill ? undefined : { aspectRatio: aspect }}>
    {mounted && <iframe key={attempt} ref={frame} onLoad={() => notify(allowed.current)} src={"/flick-frame.html?id=" + id + (surface ? "&surface=" + surface : "")} allow="autoplay; fullscreen" title="Flick" className="absolute inset-0 h-full w-full border-0" />}
    {poster
      ? <img data-flick-poster src={poster} alt="" draggable={false} aria-hidden={revealed} className="pointer-events-none absolute inset-0 h-full w-full object-contain object-top transition-opacity duration-300 ease-out motion-reduce:transition-none" style={{ opacity: revealed ? 0 : 1 }} />
      : (!mounted || state === "loading") && <div aria-label="Loading Flick" className="pointer-events-none absolute inset-0 flick-shimmer" />}
    {mounted && state === "error" && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div role="alert" className="pointer-events-auto flex items-center gap-3 rounded-md bg-fb-card px-3 py-2 text-[12px] text-fb-fg shadow-md"><span>Flick didn't load</span><Button variant="ghost" size="sm" onClick={() => setAttempt((n) => n + 1)} className="text-fb-blue hover:bg-fb-elev">Retry</Button></div></div>}
  </div>;
}
