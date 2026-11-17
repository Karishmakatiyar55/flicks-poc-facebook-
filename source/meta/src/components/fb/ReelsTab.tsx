import { useRef, useState } from "react";
import { UserRound } from "lucide-react";
import { REELS, fmt, type Reel } from "@/data/feed";
import { FlickEmbed } from "./FlickEmbed";
import { FlickCta } from "./FlickCta";
import { Button } from "@/components/ui/button";
import { Avatar } from "./Avatar";
import { Back, Comment, Globe, More, Search, Share, ThumbUp, Verified } from "./Icons";
import { AutoVideo, useInView } from "./media";

function ReelItem({ reel, eligible }: { reel: Reel; eligible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.7);
  const [liked, setLiked] = useState(false);
  const ad = reel.kind === "ad" ? reel.flick : null;
  const username = ad ? (ad.displayName ?? ad.brand) : (reel as Extract<Reel, { kind: "organic" }>).username;
  const avatar = ad ? "" : (reel as Extract<Reel, { kind: "organic" }>).avatar;
  const likes = (ad ? ad.likes : (reel as Extract<Reel, { kind: "organic" }>).likes) + (liked ? 1 : 0);
  const comments = ad ? ad.comments : (reel as Extract<Reel, { kind: "organic" }>).comments;
  return (
    <div ref={ref} data-placement={ad?.id} className="relative h-full w-full shrink-0 snap-start snap-always overflow-hidden bg-fb-video [container-type:inline-size]">
      {ad ? <FlickEmbed id={ad.flickId} aspect={ad.aspect} fill surface="reel" enabled={eligible} /> : <AutoVideo src={(reel as Extract<Reel, { kind: "organic" }>).videoUrl} active={inView} />}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-fb-video/70 to-transparent" />
      <div data-fb-rail className="pointer-events-none absolute bottom-4 right-2.5 z-10 flex flex-col items-center gap-[18px] text-fb-onvideo">
        <Button variant="ghost" aria-label="Like" onClick={(e) => { e.stopPropagation(); setLiked((l) => !l); }} className="pointer-events-auto h-auto flex-col gap-1 p-0 text-fb-onvideo hover:bg-transparent [&_svg]:size-auto">
          <ThumbUp size={28} filled={liked} strokeWidth={liked ? 0 : 2} className={liked ? "text-fb-blue animate-fb-pop" : ""} />
          <span className="text-[12px] font-medium">{fmt(likes)}</span>
        </Button>
        <Button variant="ghost" aria-label="Comment" className="pointer-events-auto h-auto flex-col gap-1 p-0 text-fb-onvideo hover:bg-transparent [&_svg]:size-auto"><Comment size={28} /><span className="text-[12px] font-medium">{fmt(comments)}</span></Button>
        <Button variant="ghost" aria-label="Share" className="pointer-events-auto h-auto flex-col gap-1 p-0 text-fb-onvideo hover:bg-transparent [&_svg]:size-auto"><Share size={26} /><span className="text-[12px] font-medium">{fmt(Math.round(likes / 40))}</span></Button>
        <Button variant="ghost" size="icon" aria-label="More" className="pointer-events-auto h-6 w-6 p-0 text-fb-onvideo hover:bg-transparent [&_svg]:size-auto"><More size={24} /></Button>
        {ad ? <Avatar logo={ad.logo} monogram={ad.displayName ?? ad.brand} size={28} /> : <img src={avatar} alt="" className="h-7 w-7 rounded-md border-2 border-fb-onvideo object-cover" />}
      </div>
      <div data-fb-caption className="pointer-events-none absolute bottom-4 left-3 right-20 z-10 space-y-2 text-fb-onvideo">
        <div className="flex items-center gap-2">
          <Avatar src={avatar} logo={ad?.logo} monogram={ad ? (ad.displayName ?? ad.brand) : undefined} size={32} />
          <span className="flex items-center gap-1 text-[13.5px] font-semibold">{username}{ad && <Verified />}</span>
          <Button variant="ghost" className="pointer-events-auto h-auto rounded-lg border border-fb-onvideo/60 px-2.5 py-[3px] text-[12.5px] text-fb-onvideo hover:bg-transparent">Follow</Button>
        </div>
        <div className="line-clamp-2 text-[13.5px] leading-[18px]">{ad ? ad.caption : (reel as Extract<Reel, { kind: "organic" }>).caption}</div>
        {ad ? (
          <>
            <div className="flex items-center gap-1 text-[12px]">Sponsored <Globe size={11} /> </div>
            <FlickCta flick={ad} className="pointer-events-auto flex h-9 w-full justify-between rounded-md bg-fb-blue px-3 text-[13.5px] font-semibold text-fb-card hover:bg-fb-blue/90 active:scale-[0.99]" />
          </>
        ) : (
          <div className="flex items-center gap-1.5 text-[12.5px]">♫ <span className="truncate">{(reel as Extract<Reel, { kind: "organic" }>).audio}</span></div>
        )}
      </div>
    </div>
  );
}

export function ReelsTab({ onBack, onProfile }: { onBack: () => void; onProfile: () => void }) {
  const [current, setCurrent] = useState(0);
  return (
    <div className="relative h-full bg-fb-video">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[50px] items-center gap-2 bg-gradient-to-b from-fb-video/40 to-transparent px-2 text-fb-onvideo">
        <Button variant="ghost" size="icon" aria-label="Back to home" onClick={onBack} className="pointer-events-auto text-fb-onvideo hover:bg-fb-onvideo/10"><Back size={24} /></Button>
        <span className="flex-1 text-[22px] font-bold">Reels</span>
        <Button variant="ghost" size="icon" aria-label="Search Reels" className="pointer-events-auto shrink-0 text-fb-onvideo hover:bg-fb-onvideo/10"><Search size={24} /></Button>
        <Button variant="ghost" size="icon" aria-label="Your profile" onClick={onProfile} className="pointer-events-auto shrink-0 text-fb-onvideo hover:bg-fb-onvideo/10"><UserRound size={24} /></Button>
      </div>
      <div onScroll={(e) => setCurrent(Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight))} className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain">
        {REELS.map((r, i) => <ReelItem key={r.id} reel={r} eligible={Math.abs(i - current) <= 1} />)}
      </div>
    </div>
  );
}
