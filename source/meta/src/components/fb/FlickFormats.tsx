import { useEffect, useRef, useState } from "react";
import { FLICK_SECTIONS, type FlickPlacement } from "@/data/feed";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { usePrototypeState } from "./PrototypeNavigation";

type Section = FlickPlacement["section"];
export function FlickFormats({ onSelect }: { onSelect: (section: Section) => void }) {
  const [open, setOpen] = usePrototypeState("flicks-menu", false);
  const [position, setPosition] = useState({ x: 12, y: 0 });
  const button = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; y: number; startX: number; startY: number; moved: boolean } | null>(null);
  useEffect(() => {
    const clamp = () => { const parent = button.current?.parentElement; if (!parent) return; const width = button.current?.offsetWidth ?? 144; setPosition(p => ({ x: Math.max(0, Math.min(p.x, parent.clientWidth - width)), y: Math.max(0, Math.min(p.y || parent.clientHeight - 56, parent.clientHeight - 44)) })); };
    clamp(); window.addEventListener("resize", clamp); return () => window.removeEventListener("resize", clamp);
  }, []);
  return <>
    <Button ref={button} aria-label="Explore Flicks" aria-expanded={open} aria-haspopup="menu" onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, startX: position.x, startY: position.y, moved: false }; }} onPointerMove={e => { const d = drag.current; const parent = e.currentTarget.parentElement; if (!d || !parent) return; const dx = e.clientX - d.x, dy = e.clientY - d.y; if (Math.hypot(dx, dy) > 6) d.moved = true; if (d.moved) { setOpen(false); setPosition({ x: Math.max(0, Math.min(d.startX + dx, parent.clientWidth - e.currentTarget.offsetWidth)), y: Math.max(0, Math.min(d.startY + dy, parent.clientHeight - e.currentTarget.offsetHeight)) }); } }} onPointerUp={() => { if (!drag.current?.moved) setOpen(v => !v); drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onClick={e => { if (e.detail === 0) setOpen(v => !v); }} style={{ left: position.x, top: position.y }} className="absolute z-[110] h-10 touch-none select-none gap-1.5 rounded-xl bg-fb-frame px-3 text-[13px] font-semibold text-fb-onvideo shadow-md hover:bg-fb-frame/90">
      Explore Flicks <ChevronDown aria-hidden="true" size={16} className="shrink-0" />
    </Button>
    {open && <div className="absolute inset-0 z-[109] bg-fb-video/25" onClick={() => setOpen(false, true)}><nav aria-label="Flicks menu" onClick={e => e.stopPropagation()} style={{ left: Math.min(position.x, (button.current?.parentElement?.clientWidth ?? 390) - 236), top: position.y > 220 ? position.y - 192 : position.y + 48 }} className="absolute w-[228px] overflow-hidden rounded-xl border border-fb-onvideo/10 bg-fb-frame py-1 text-fb-onvideo shadow-xl">{FLICK_SECTIONS.map(item => <Button key={item.section} variant="ghost" onClick={() => { setOpen(false, true); onSelect(item.section); }} className="h-11 w-full justify-between rounded-none px-4 text-fb-onvideo hover:bg-fb-onvideo/10 hover:text-fb-onvideo">{item.label}</Button>)}</nav></div>}
  </>;
}
