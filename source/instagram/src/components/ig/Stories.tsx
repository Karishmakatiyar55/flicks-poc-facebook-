import { useEffect, useRef, useState } from "react";
import { ME, STORIES, type Story } from "@/data/feed";
import { Avatar } from "./Avatar";
import { Close, Heart, More, Share, Verified } from "./Icons";
import { FlickEmbed } from "./FlickEmbed";
import { FlickCta } from "./FlickCta";
import { Button } from "@/components/ui/button";
import { storyGestureRegions, type StoryPickerBounds } from "./story-gestures";

export function StoriesTray({ onOpen }: { onOpen: (index: number) => void }) {
  return (
    <div data-placement="stories" className="no-scrollbar flex gap-3.5 overflow-x-auto px-2.5 pb-2.5 pt-1">
      <div className="flex w-[74px] shrink-0 flex-col items-center gap-1">
        <div className="relative p-[4px]">
          <Avatar src={ME.avatar} size={66} />
          <span className="absolute bottom-1 right-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-[3px] border-ig-bg bg-ig-fg text-[16px] font-bold leading-none text-ig-bg">+</span>
        </div>
        <span className="w-full truncate text-center text-[12px] text-ig-muted">Your story</span>
      </div>
      {STORIES.map((s, i) => (
        <button key={s.username} onClick={() => onOpen(i)} className="flex w-[74px] shrink-0 flex-col items-center gap-1">
          <Avatar src={s.avatar} logo={s.logo} monogram={s.monogram} size={66} ring seen={s.seen} />
          <span className="w-full truncate text-center text-[12px]">{s.username}</span>
        </button>
      ))}
    </div>
  );
}

const still = (s: Story) => s.flick ? `/flick-thumbs/story-${s.flick.flickId}.jpg` : s.image;

/** Static face used for the neighbouring story while dragging (keeps live iframes at the two-player limit). */
function Face({ story }: { story: Story }) {
  return <div className="absolute inset-0 overflow-hidden bg-ig-bg">
    {still(story) && <img src={still(story)} alt="" className="h-full w-full object-cover" />}
    <div className="absolute inset-x-3 top-5 flex items-center gap-2">
      <Avatar src={story.avatar} logo={story.logo} monogram={story.monogram} size={32} />
      <span className="text-[13.5px] font-semibold">{story.username}</span>
    </div>
  </div>;
}

/** Full-screen story. Sponsored stories are Flicks with our single CTA pill; tap the edges or swipe left/right
 *  (3D cube) to move between stories. A full-screen gesture layer handles both; on Flicks it leaves a hole over the switcher column. */
export function StoryViewer({ index, onIndex, onClose }: { index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const story = STORIES[index] as Story;
  const ad = story.flick ?? null;
  const root = useRef<HTMLDivElement>(null);
  const [picker, setPicker] = useState<StoryPickerBounds | null>(null);
  const [size, setSize] = useState({ width: 390, height: 844 });
  useEffect(() => {
    setPicker(null);
    if (!ad) return;
    const measure = () => {
      const el = root.current;
      const frame = el?.querySelector("iframe");
      if (!el || !frame) return;
      const screen = el.getBoundingClientRect();
      setSize(s => s.width === screen.width && s.height === screen.height ? s : { width: screen.width, height: screen.height });
      try {
        const swatches = frame.contentDocument?.querySelector("vertex-player")?.shadowRoot?.querySelectorAll(".vx-swatch");
        if (!swatches?.length) return;
        const origin = frame.getBoundingClientRect();
        const rects = [...swatches].map(s => s.getBoundingClientRect()).filter(r => r.width && r.height);
        if (!rects.length) return;
        const next = {
          left: origin.left - screen.left + Math.min(...rects.map(r => r.left)),
          top: origin.top - screen.top + Math.min(...rects.map(r => r.top)),
          right: origin.left - screen.left + Math.max(...rects.map(r => r.right)),
          bottom: origin.top - screen.top + Math.max(...rects.map(r => r.bottom)),
        };
        setPicker(prev => prev && Object.keys(next).every(k => prev[k as keyof StoryPickerBounds] === next[k as keyof StoryPickerBounds]) ? prev : next);
      } catch { /* The isolated player may still be loading. */ }
    };
    measure();
    const timer = setInterval(measure, 150);
    return () => clearInterval(timer);
  }, [ad, index]);
  const [dx, setDx] = useState(0);
  const [anim, setAnim] = useState(false);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const swallow = useRef(false);
  const step = (d: number) => { const n = index + d; if (n < 0) return; if (n >= STORIES.length) onClose(); else onIndex(n); };
  useEffect(() => {
    if (ad || dx) return;
    const t = setTimeout(() => { if (index + 1 >= STORIES.length) onClose(); else onIndex(index + 1); }, 5000);
    return () => clearTimeout(t);
  }, [ad, index, onIndex, onClose, dx]);
  const w = () => root.current?.offsetWidth ?? 390;
  const release = () => {
    const d = drag.current; drag.current = null;
    if (!d?.moved) return;
    swallow.current = true; setTimeout(() => { swallow.current = false; }, 50);
    const dir = dx < 0 ? 1 : -1;
    const ok = Math.abs(dx) > w() * 0.22 && (dir === 1 || index > 0);
    setAnim(true);
    if (!ok) { setDx(0); setTimeout(() => setAnim(false), 260); return; }
    setDx(-dir * w());
    setTimeout(() => { setAnim(false); setDx(0); step(dir); }, 260);
  };
  const tap = (e: React.MouseEvent) => { const r = root.current?.getBoundingClientRect(); if (!r) return; step(e.clientX - r.left < r.width / 2 ? -1 : 1); };
  const W = w();
  const a = (dx / W) * 90;
  const nb = dx < 0 ? STORIES[index + 1] : dx > 0 ? STORIES[index - 1] : undefined;
  const tr = anim ? "transform 260ms ease-out" : "none";
  return <div ref={root} data-placement={ad ? `story-${index}` : undefined} className="fixed inset-0 z-50 select-none overflow-hidden bg-ig-bg" style={{ perspective: 1200, touchAction: "none" }}
    onPointerDown={(e) => { if (!anim) drag.current = { x: e.clientX, moved: false }; }}
    onPointerMove={(e) => { const d = drag.current; if (!d) return; const m = e.clientX - d.x; if (!d.moved && Math.abs(m) < 8) return; if (!d.moved) { d.moved = true; e.currentTarget.setPointerCapture(e.pointerId); } setDx(index === 0 && m > 0 ? m * 0.25 : m); }}
    onPointerUp={release} onPointerCancel={release}
    onClickCapture={(e) => { if (swallow.current) { e.stopPropagation(); e.preventDefault(); } }}>
    {nb && <div className="absolute inset-0" style={{ transformOrigin: dx < 0 ? "0% 50%" : "100% 50%", transform: `translateX(${dx < 0 ? W + dx : dx - W}px) rotateY(${dx < 0 ? a + 90 : a - 90}deg)`, transition: tr, backfaceVisibility: "hidden" }}><Face story={nb} /></div>}
    <div className="absolute inset-0 overflow-hidden" style={{ transformOrigin: dx < 0 ? "100% 50%" : "0% 50%", transform: dx ? `translateX(${dx}px) rotateY(${a}deg)` : undefined, transition: tr, backfaceVisibility: "hidden" }}>
      {ad ? <FlickEmbed key={index} id={ad.flickId} aspect={ad.aspect} fill priority={10} slot="reel" /> : <img src={story.image} alt="" className="h-full w-full object-cover" />}
      {dx !== 0 && <div className="absolute inset-0" />}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ig-bg/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ig-bg/70 to-transparent" />
      {/* The creative can be shorter than the screen: use its actual thumbnail bounds,
          never screen-relative estimates that can intercept the first variant. */}
      {ad ? storyGestureRegions(size.width, size.height, picker ?? { left: 0, top: 0, right: 100, bottom: size.height }).map((region, i) =>
        <div key={i} aria-hidden className="absolute" style={region} onClick={tap} />)
        : <div aria-hidden className="absolute inset-0" onClick={tap} />}
      <div className="pointer-events-none absolute inset-x-3 top-5 flex items-center gap-2">
        <Avatar src={story.avatar} logo={story.logo} monogram={story.monogram} size={32} />
        <div className="flex-1 leading-tight"><div className="flex items-center gap-1 text-[13.5px] font-semibold">{story.username}{ad && <Verified />}<span className="ml-1 font-normal text-ig-fg/70">{ad ? "" : "2h"}</span></div>{ad && <div className="text-[12px]">Sponsored</div>}</div>
        <More size={22} /><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="pointer-events-auto hover:bg-ig-sep"><Close size={24} /></Button>
      </div>
      {ad ? <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center"><FlickCta flick={ad} chevron={false} className="pointer-events-auto h-10 rounded-full bg-ig-fg px-6 text-[14px] font-semibold text-ig-bg hover:bg-ig-fg/90" /></div>
        : <div className="absolute inset-x-3 bottom-4 flex items-center gap-3"><div className="flex-1 rounded-full border border-ig-fg/60 px-4 py-2.5 text-[14px] text-ig-fg/80">Send message</div><Heart size={26} /><Share size={24} /></div>}
    </div>
  </div>;
}
