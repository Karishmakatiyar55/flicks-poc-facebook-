import { useEffect, useRef, useState } from "react";
import { storySwipeDirection, storyTapDirection } from "./story-swipe";
import { ME, STORIES, type Story } from "@/data/feed";
import { Avatar } from "./Avatar";
import { Close, Globe, More, Plus, Verified } from "./Icons";
import { FlickEmbed } from "./FlickEmbed";
import { FlickCta } from "./FlickCta";
import { Button } from "@/components/ui/button";

function CreateStoryCard() {
  return (
    <div className="relative flex h-[190px] w-[110px] shrink-0 flex-col overflow-hidden rounded-xl border border-fb-sep bg-fb-card">
      <img src={ME.avatar} alt="" className="h-[128px] w-full object-cover" />
      <span className="absolute left-1/2 top-[112px] flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-4 border-fb-card bg-fb-blue text-fb-card"><Plus size={16} /></span>
      <span className="flex flex-1 items-end justify-center pb-2 text-[12px] font-semibold">Create story</span>
    </div>
  );
}

function StoryCard({ story, onOpen }: { story: Story; onOpen: (s: Story) => void }) {
  return (
    <button onClick={() => onOpen(story)} className="relative h-[190px] w-[110px] shrink-0 overflow-hidden rounded-xl bg-fb-elev text-left">
      {story.video
        ? <video src={story.video} poster={story.image} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
        : story.image
          ? <img src={story.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-fb-blue/60 to-fb-blue text-[44px] font-bold text-fb-card">{story.monogram?.charAt(0)}</div>}
      <div className="absolute inset-0 bg-gradient-to-t from-fb-video/50 via-transparent to-fb-video/30" />
      <span className="absolute left-2 top-2 rounded-full ring-2 ring-fb-blue"><Avatar src={story.avatar} logo={story.flick?.logo} monogram={story.monogram} size={32} /></span>
      <span className="absolute inset-x-2 bottom-2 text-[12px] font-semibold leading-4 text-fb-onvideo">
        {story.username}
      </span>
    </button>
  );
}

export function StoriesRow({ onOpen }: { onOpen: (s: Story) => void }) {
  return (
    <div className="bg-fb-card py-2">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-2">
        <CreateStoryCard />
        {STORIES.map((s) => <StoryCard key={s.username} story={s} onOpen={onOpen} />)}
      </div>
    </div>
  );
}

const DURATION = 12000;
/** Shared by the story on screen and the one turning in, so nothing pops when the turn lands. */
function StoryHeader({ story, onClose }: { story: Story; onClose?: () => void }) {
  const ad = story.flick ?? null;
  return <div className="pointer-events-none absolute inset-x-3 top-5 flex items-center gap-2">
    <Avatar src={story.avatar} logo={ad?.logo} monogram={story.monogram} size={32} />
    <div className="flex-1 leading-tight"><div className="flex items-center gap-1 text-[13.5px] font-semibold">{story.username}{ad && <Verified />}<span className="ml-1 font-normal text-fb-onvideo/70">{ad ? "" : "2h"}</span></div>{ad && <div className="flex items-center gap-1 text-[12px]">Sponsored <Globe size={11} /> </div>}</div>
    <More size={22} /><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" tabIndex={onClose ? 0 : -1} className={`${onClose ? "pointer-events-auto" : ""} text-fb-onvideo hover:bg-fb-onvideo/10`}><Close size={24} /></Button>
  </div>;
}
export function StoryViewer({ story, onClose, onChange }: { story: Story; onClose: () => void; onChange: (story: Story) => void }) {
  const [progress, setProgress] = useState(0);
  const [settling, setSettling] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (story.sponsored || progress !== 0 || settling) return;
    const t = setTimeout(() => { const next = STORIES[STORIES.indexOf(story) + 1]; if (next) onChange(next); else onClose(); }, 5000);
    return () => clearTimeout(t);
  }, [story, onClose, onChange, progress, settling]);
  useEffect(() => {
    const i = STORIES.indexOf(story);
    [STORIES[i - 1], STORIES[i + 1]].forEach(s => { if (s?.image) new Image().src = s.image; });
  }, [story]);
  const dur = story.sponsored ? DURATION : 5000;
  const ad = story.flick ?? null;
  const move = (direction: number) => { const next = STORIES[STORIES.indexOf(story) + direction]; if (next) onChange(next); else onClose(); };
  const drag = (dx: number, dy: number, width: number) => {
    if (settling || Math.abs(dx) <= Math.abs(dy)) return;
    const next = STORIES[STORIES.indexOf(story) + (dx < 0 ? 1 : -1)];
    setProgress(Math.max(-1, Math.min(1, dx / width)) * (next ? 1 : 0.15));
  };
  const release = (dx: number, dy: number, width: number) => {
    if (settling) return;
    const direction = storySwipeDirection(dx, dy, width);
    const next = STORIES[STORIES.indexOf(story) + direction];
    setSettling(true);
    setProgress(direction && next ? -direction : 0);
    timer.current = setTimeout(() => { if (direction && next) onChange(next); else { setSettling(false); setProgress(0); } }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260);
  };
  /** The gesture layer sits over the whole Flick so a swipe can start anywhere, including on the thumbnails.
   *  A tap is handed to whatever control of the Flick lies under the finger (thumbnail, sound, its own button). */
  const tapFlick = (stage: HTMLElement, x: number, y: number) => {
    const frame = stage.querySelector("iframe");
    try {
      const doc = frame?.contentDocument;
      if (!frame || !doc) return false;
      const r = frame.getBoundingClientRect();
      const fx = x - r.left, fy = y - r.top;
      let el: Element | null = doc.elementFromPoint(fx, fy);
      for (let i = 0; el?.shadowRoot && i < 4; i++) { const inner = el.shadowRoot.elementFromPoint(fx, fy); if (!inner || inner === el) break; el = inner; }
      const control = el?.closest("button,a,[data-vertex-diff],[data-vertex-trigger]") as HTMLElement | null | undefined;
      if (!control) return false;
      control.click();
      return true;
    } catch { return false; }
  };
  const adjacent = STORIES[STORIES.indexOf(story) + (progress < 0 ? 1 : -1)];
  const onPlayerEvent = (type: string, detail: unknown) => {
    if (!detail || typeof detail !== "object") return;
    const d = detail as { dx?: number; dy?: number; width?: number; x?: number };
    if (type === "story-tap" && typeof d.x === "number" && d.width) {
      if (!settling) move(storyTapDirection(d.x, d.width));
      return;
    }
    if (typeof d.dx !== "number" || typeof d.dy !== "number" || !d.width) return;
    if (type === "story-drag") drag(d.dx, d.dy, d.width);
    if (type === "story-release") release(d.dx, d.dy, d.width);
  };
  return <div data-placement={`story-${ad?.brand ?? story.username}`} className="story-stage fixed inset-0 z-50 overflow-hidden bg-fb-video text-fb-onvideo"
    onPointerDown={e => { if ((e.target as Element).closest("button,a,input")) return; start.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }}
    onPointerMove={e => { if (start.current) drag(e.clientX - start.current.x, e.clientY - start.current.y, e.currentTarget.clientWidth); }}
    onPointerUp={e => { if (!start.current) return; const dx = e.clientX - start.current.x, dy = e.clientY - start.current.y; start.current = null; if (Math.abs(dx) < 8 && Math.abs(dy) < 8) { if (ad && tapFlick(e.currentTarget, e.clientX, e.clientY)) return; move(storyTapDirection(e.clientX - e.currentTarget.getBoundingClientRect().left, e.currentTarget.clientWidth)); } else release(dx, dy, e.currentTarget.clientWidth); }}
    onPointerCancel={() => { start.current = null; setProgress(0); }}>
    {adjacent && progress !== 0 && <div data-story-preview aria-hidden className={`story-face pointer-events-none absolute inset-0 ${settling ? "story-settling" : ""}`} style={{ transformOrigin: progress < 0 ? "left center" : "right center", transform: `translateX(${(progress < 0 ? 1 + progress : -1 + progress) * 100}%) rotateY(${progress < 0 ? 90 + progress * 90 : -90 + progress * 90}deg)` }}>
      {/* A Flick sits in its own 9:16 box at the top of the screen; its poster has to sit in the same place. */}
      <img src={adjacent.image} alt="" className={`h-full w-full ${adjacent.flick ? "bg-fb-elev object-contain object-top" : "object-cover"}`} draggable={false} />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-fb-video/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-fb-video/70 to-transparent" />
      <div className="absolute inset-x-2 top-2 h-[2px] rounded bg-fb-onvideo/35" />
      <StoryHeader story={adjacent} />
      {adjacent.flick && <div className="absolute inset-x-3 bottom-4"><FlickCta flick={adjacent.flick} className="h-11 w-full rounded-full bg-fb-card text-fb-fg hover:bg-fb-elev" /></div>}
      {!adjacent.flick && <div className="absolute inset-x-3 bottom-4 flex items-center gap-3"><div className="flex-1 rounded-full border border-fb-onvideo/60 px-4 py-2.5 text-[14px] text-fb-onvideo/80">Send message</div></div>}
    </div>}
    <div data-story-face className={`story-face absolute inset-0 overflow-hidden ${settling ? "story-settling" : ""}`} style={{ transformOrigin: progress < 0 ? "right center" : "left center", transform: `translateX(${progress * 100}%) rotateY(${progress * 90}deg)` }}>
      {/* The "reel" surface stacks the Flick's thumbnails in a column on the left, as in the Instagram story. */}
      {ad ? <FlickEmbed id={ad.flickId} aspect={ad.aspect} fill surface="reel" priority={10} onEvent={onPlayerEvent} poster={story.image} /> : <img src={story.image} alt="" draggable={false} className="h-full w-full object-cover" />}
      {ad && <div aria-hidden data-story-gestures className="absolute inset-0" />}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-fb-video/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-fb-video/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-2 top-2 h-[2px] overflow-hidden rounded bg-fb-onvideo/35"><div className="h-full bg-fb-onvideo" style={{ animation: `fb-progress ${dur}ms linear infinite` }} /></div>
      <StoryHeader story={story} onClose={onClose} />
      {/* On a Flick the left arrow would sit on the thumbnail column; taps and swipes already move between stories. */}
      {!ad && <Button variant="ghost" aria-label="Previous story" onClick={() => move(-1)} className="absolute left-0 top-[45%] h-14 w-6 p-0 text-fb-onvideo/70 hover:bg-fb-onvideo/10">‹</Button>}
      <Button variant="ghost" aria-label="Next story" onClick={() => move(1)} className="absolute right-0 top-[45%] h-14 w-6 p-0 text-fb-onvideo/70 hover:bg-fb-onvideo/10">›</Button>
      {ad && <div className="pointer-events-none absolute inset-x-3 bottom-4"><FlickCta flick={ad} className="pointer-events-auto h-11 w-full rounded-full bg-fb-card text-fb-fg hover:bg-fb-elev" /></div>}
      {!ad && <div className="absolute inset-x-3 bottom-4 flex items-center gap-3"><div className="flex-1 rounded-full border border-fb-onvideo/60 px-4 py-2.5 text-[14px] text-fb-onvideo/80">Send message</div></div>}
    </div>
  </div>;
}
