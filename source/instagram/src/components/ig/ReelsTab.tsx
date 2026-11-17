import { useRef, useState } from "react";
import { REELS, fmt, type Reel } from "@/data/feed";
import { FlickEmbed } from "./FlickEmbed";
import { FlickCta } from "./FlickCta";
import { Button } from "@/components/ui/button";
import { Avatar } from "./Avatar";
import { Camera, Chevron, Comment, Heart, More, Share, Verified } from "./Icons";
import { AutoVideo, useDoubleTap, useInView } from "./media";

function ReelItem({ reel, eligible }: { reel: Reel; eligible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.7);
  const [liked, setLiked] = useState(false);
  const dt = useDoubleTap(() => setLiked(true));
  const ad = reel.kind === "ad" ? reel.flick : null;
  const username = ad ? ad.brand : (reel as Extract<Reel, { kind: "organic" }>).username;
  const avatar = ad ? "" : (reel as Extract<Reel, { kind: "organic" }>).avatar;
  const likes = (ad ? ad.likes : (reel as any).likes) + (liked ? 1 : 0);
  const comments = ad ? ad.comments : (reel as any).comments;
  return (
    <div ref={ref} data-placement={ad ? `reel-${reel.id}` : undefined} onClick={ad ? undefined : dt.onClick} className="relative h-full w-full shrink-0 snap-start snap-always overflow-hidden bg-ig-elev [container-type:inline-size]">
      {ad ? <FlickEmbed id={ad.flickId} aspect={ad.aspect} fill enabled={eligible} slot="reel" /> : <AutoVideo src={(reel as any).videoUrl} active={inView} />}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ig-bg/70 to-transparent" />
      <div data-ig-rail className="pointer-events-none absolute bottom-4 right-2.5 z-10 flex flex-col items-center gap-[18px]">
        <Button variant="ghost" aria-label="Like" onClick={(e) => { e.stopPropagation(); setLiked((l) => !l); }} className="pointer-events-auto h-auto flex-col gap-1 p-0 text-ig-fg hover:bg-transparent [&_svg]:size-auto">
          <Heart size={28} filled={liked} strokeWidth={liked ? 0 : 2} className={liked ? "text-ig-like animate-ig-pop" : ""} />
          <span className="text-[12px] font-medium">{fmt(likes)}</span>
        </Button>
        <Button variant="ghost" aria-label="Comment" className="pointer-events-auto h-auto flex-col gap-1 p-0 text-ig-fg hover:bg-transparent [&_svg]:size-auto"><Comment size={28} /><span className="text-[12px] font-medium">{fmt(comments)}</span></Button>
        <Button variant="ghost" aria-label="Share" className="pointer-events-auto h-auto flex-col gap-1 p-0 text-ig-fg hover:bg-transparent [&_svg]:size-auto"><Share size={26} /><span className="text-[12px] font-medium">{fmt(Math.round(likes / 40))}</span></Button>
        <Button variant="ghost" size="icon" aria-label="More" className="pointer-events-auto h-6 w-6 p-0 text-ig-fg hover:bg-transparent [&_svg]:size-auto"><More size={24} /></Button>
        {ad ? <Avatar logo={ad.logo} monogram={ad.monogram ?? ad.brand} size={28} /> : <img src={avatar} alt="" className="h-7 w-7 rounded-md border-2 border-ig-fg object-cover" />}
      </div>
      <div data-ig-caption className="pointer-events-none absolute bottom-4 left-3 right-20 z-10 space-y-2">
        <div className="flex items-center gap-2">
          <Avatar src={avatar} logo={ad?.logo} monogram={ad ? ad.monogram ?? ad.brand : undefined} size={32} />
          <span className="flex items-center gap-1 text-[13.5px] font-semibold">{username}{ad && <Verified />}</span>
          <Button variant="ghost" className="pointer-events-auto h-auto rounded-lg border border-ig-fg/60 px-2.5 py-[3px] text-[12.5px] text-ig-fg hover:bg-transparent">Follow</Button>
        </div>
        <div className="line-clamp-2 text-[13.5px] leading-[18px]">{ad ? ad.caption : (reel as any).caption}</div>
        {ad ? (
          <>
            <div className="text-[12px]">Sponsored</div>
            <FlickCta flick={ad} className="pointer-events-auto flex h-9 w-full justify-between rounded-md bg-ig-blue px-3 text-[13.5px] text-ig-fg hover:bg-ig-blue/90 aria-pressed:bg-ig-blue/70 active:scale-[0.99]" />
          </>
        ) : (
          <div className="flex items-center gap-1.5 text-[12.5px]">♫ <span className="truncate">{(reel as any).audio}</span></div>
        )}
      </div>
      {!ad && dt.overlay}
    </div>
  );
}

export function ReelsTab() {
  const [current, setCurrent] = useState(0);
  return (
    <div className="relative h-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[50px] items-center justify-between bg-gradient-to-b from-ig-bg/40 to-transparent px-4">
        <span className="flex items-center gap-1 text-[22px] font-bold">Reels<Chevron size={16} className="rotate-90" /></span>
        <Camera size={26} />
      </div>
      <div data-placement="reels-list" onScroll={(e) => setCurrent(Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight))} className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain">
        {REELS.map((r, i) => <ReelItem key={r.id} reel={r} eligible={Math.abs(i - current) <= 1} />)}
      </div>
    </div>
  );
}
