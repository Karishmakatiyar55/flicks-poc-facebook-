import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { diffIdFromDetail, selectAudible, selectFlicks } from "./flick-policy";
import { setSelectedDiff } from "./flick-selection";

type Registration = { element: HTMLDivElement; priority: number };
const FlickContext = createContext<{ active: string[]; audible: string | null; register: (key: string, entry: Registration) => () => void } | null>(null);

export function FlickProvider({ children }: { children: ReactNode }) {
  const entries = useRef(new Map<string, Registration>());
  const current = useRef<string[]>([]);
  const [active, setActive] = useState<string[]>([]);
  const [audible, setAudible] = useState<string | null>(null);
  const audibleRef = useRef<string | null>(null);
  const register = useCallback((key: string, entry: Registration) => {
    entries.current.set(key, entry);
    return () => { entries.current.delete(key); };
  }, []);
  useEffect(() => {
    const update = () => {
      const candidates = [...entries.current].flatMap(([key, { element, priority }]) => {
        if (!element.getClientRects().length) return [];
        let top = 0, bottom = window.innerHeight;
        for (let parent = element.parentElement; parent; parent = parent.parentElement) {
          if (/(auto|scroll|hidden)/.test(getComputedStyle(parent).overflowY)) {
            const r = parent.getBoundingClientRect();
            top = Math.max(top, r.top); bottom = Math.min(bottom, r.bottom);
          }
        }
        if (bottom <= top) return [];
        const r = element.getBoundingClientRect();
        const visible = r.height > 0 ? Math.max(0, Math.min(r.bottom, bottom) - Math.max(r.top, top)) / r.height : 0;
        return [{ key, element, distance: Math.max(top - r.bottom, r.top - bottom, 0), viewport: bottom - top, retained: current.current.includes(key), priority, visible, top: Math.max(r.top, top), bottom: Math.min(r.bottom, bottom), r }];
      });
      const next = selectFlicks(candidates);
      if (next.join() !== current.current.join()) { current.current = next; setActive(next); }
      // Covered = no sample point of the visible part hits this Flick (in-app browser, sheets, story viewer sit on top).
      const loud = selectAudible(candidates.filter((c) => next.includes(c.key)).map((c) => {
        // Hits on our own placement chrome (story tap layer, tag overlays) still count as this Flick being seen.
        const surface = c.element.closest("[data-placement]") ?? c.element;
        let covered = true;
        if (c.visible > 0 && typeof document.elementFromPoint === "function") for (const fx of [0.3, 0.5, 0.7]) for (const fy of [0.3, 0.5, 0.7]) {
          const hit = document.elementFromPoint(c.r.left + c.r.width * fx, c.top + (c.bottom - c.top) * fy);
          if (hit && surface.contains(hit)) { covered = false; break; }
        }
        return { key: c.key, visible: c.visible, covered };
      }), document.hidden);
      if (loud !== audibleRef.current) { audibleRef.current = loud; setAudible(loud); }
    };
    const timer = setInterval(update, 100);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    update();
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", update); window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, []);
  return <FlickContext.Provider value={{ active, audible, register }}>{children}</FlickContext.Provider>;
}

export function FlickEmbed({ id, aspect, enabled = true, fill = false, priority = 0, onEvent, slot }: {
  id: string; aspect: string; enabled?: boolean; fill?: boolean; priority?: number; slot?: "reel";
  onEvent?: (type: string, detail: unknown) => void;
}) {
  const pool = useContext(FlickContext);
  const key = useId();
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const eventCallback = useRef(onEvent);
  useEffect(() => { eventCallback.current = onEvent; }, [onEvent]);
  const register = pool?.register;
  useEffect(() => {
    const element = box.current;
    if (!enabled || !element || !register) return;
    return register(key, { element, priority });
  }, [enabled, key, priority, register]);
  const mounted = enabled && (pool?.active.includes(key) ?? false);
  const audible = mounted && pool?.audible === key;
  // The frame starts silenced; the host re-asserts permission on change, on load, and every second.
  const tell = useCallback(() => { frame.current?.contentWindow?.postMessage({ source: "flick-host", type: "audible", audible }, location.origin); }, [audible]);
  useEffect(() => { if (!mounted) return; tell(); const t = setInterval(tell, 1000); return () => clearInterval(t); }, [mounted, tell, attempt]);
  useEffect(() => {
    if (!mounted) return;
    setState("loading");
    let ready = false;
    const timer = setTimeout(() => { if (!ready) setState("error"); }, 12000);
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== "flick" || data.id !== id) return;
      if (data.type === "vertex-ready") { ready = true; clearTimeout(timer); setState("ready"); }
      if (data.type === "vertex-error" && data.detail?.severity !== "warning") { clearTimeout(timer); setState("error"); }
      if (data.type === "vertex-diff-change") { const diff = diffIdFromDetail(data.detail); if (diff !== null) setSelectedDiff(id, diff); }
      eventCallback.current?.(data.type, data.detail);
    };
    window.addEventListener("message", receive);
    return () => { clearTimeout(timer); window.removeEventListener("message", receive); };
  }, [mounted, id, attempt]);
  return <div ref={box} data-flick-id={id} data-flick-state={mounted ? state : "idle"} data-flick-audible={audible ? "true" : "false"} className={`relative w-full overflow-hidden bg-ig-bg ${fill ? "h-full" : ""}`} style={fill ? undefined : { aspectRatio: aspect }}>
    {mounted && <iframe key={attempt} ref={frame} src={"/flick-frame.html?id=" + id + (slot ? "&slot=" + slot : "")} onLoad={tell} allow="autoplay; fullscreen" title="Flick" className="absolute inset-0 h-full w-full border-0" />}
    {(!mounted || state === "loading") && <div aria-label="Loading Flick" className="pointer-events-none absolute inset-0 flick-shimmer" />}
    {mounted && state === "error" && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div role="alert" className="pointer-events-auto flex items-center gap-3 rounded-md bg-ig-elev px-3 py-2 text-[12px] text-ig-fg"><span>Flick didn't load</span><Button variant="ghost" size="sm" onClick={() => setAttempt((n) => n + 1)} className="text-ig-blue hover:bg-ig-sep">Retry</Button></div></div>}
  </div>;
}