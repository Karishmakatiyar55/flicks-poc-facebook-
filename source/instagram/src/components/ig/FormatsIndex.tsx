import { useEffect, useRef, useState } from "react";
import { FLICK_SECTIONS, type FlickSection } from "@/data/feed";
import { Chevron } from "./Icons";

const W = 150, H = 34, NAV = 50, PAD = 8;

/** Floating draggable "Explore Flicks" dropdown button. Lives on the phone root so it stays put across tabs, stories and the in-app browser. */
export function FormatsIndex({ onGo }: { onGo: (s: FlickSection) => void }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ dx: number; dy: number; sx: number; sy: number; moved: boolean } | null>(null);
  const frame = () => btn.current?.parentElement?.getBoundingClientRect();
  const clamp = (x: number, y: number) => { const f = frame(); if (!f) return { x, y }; const w = btn.current?.offsetWidth ?? W; return { x: Math.min(Math.max(PAD, x), f.width - w - PAD), y: Math.min(Math.max(PAD, y), f.height - H - PAD) }; };
  useEffect(() => {
    const place = () => setPos((p) => { const f = frame(); if (!f) return p; return p ? clamp(p.x, p.y) : { x: 12, y: f.height - NAV - H - 14 }; });
    place(); window.addEventListener("resize", place); return () => window.removeEventListener("resize", place);
  }, []);
  const f = frame();
  const below = pos && f ? pos.y < f.height / 2 : false;
  return <>
    <button ref={btn} data-flicks-button aria-label="Explore Flicks" aria-expanded={open}
      onPointerDown={(e) => { if (!pos) return; e.currentTarget.setPointerCapture(e.pointerId); drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y, sx: e.clientX, sy: e.clientY, moved: false }; }}
      onPointerMove={(e) => { const d = drag.current; if (!d) return; if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return; d.moved = true; setPos(clamp(e.clientX - d.dx, e.clientY - d.dy)); }}
      onPointerUp={() => { const d = drag.current; drag.current = null; if (d && !d.moved) setOpen((o) => !o); }}
      onPointerCancel={() => { drag.current = null; }}
      style={{ left: pos?.x ?? 12, top: pos?.y ?? undefined, bottom: pos ? undefined : NAV + 14, minWidth: W, height: H, touchAction: "none" }}
      className="absolute z-[95] flex cursor-grab select-none items-center justify-center gap-1.5 rounded-full bg-ig-elev px-3 text-[13px] font-semibold text-ig-fg shadow-lg shadow-ig-bg/60 ring-1 ring-ig-sep active:cursor-grabbing">
      Explore Flicks<Chevron size={14} className={`shrink-0 text-ig-fg/75 transition-transform duration-200 ${open ? "-rotate-90" : "rotate-90"}`} />
    </button>
    {open && pos && f && <div className="absolute inset-0 z-[94]" onClick={() => setOpen(false)}>
      <div role="menu" aria-label="Flicks" onClick={(e) => e.stopPropagation()}
        style={{ left: Math.min(Math.max(PAD, pos.x), f.width - 188 - PAD), ...(below ? { top: pos.y + H + 6 } : { bottom: f.height - pos.y + 6 }) }}
        className="absolute w-[188px] overflow-hidden rounded-2xl bg-ig-elev py-1 shadow-xl ring-1 ring-ig-sep">
        {FLICK_SECTIONS.map((s) => <button key={s.label} role="menuitem" onClick={() => { setOpen(false); onGo(s); }} className="flex w-full items-center px-4 py-2.5 text-left text-[14px] hover:bg-ig-sep">
          {s.label}
        </button>)}
      </div>
    </div>}
  </>;
}
