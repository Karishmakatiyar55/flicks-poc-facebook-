import { useRef, useState, type ReactNode } from "react";
import { fmt, type Flick, type Organic, CREATOR_AD, SHOPPING_AD } from "@/data/feed";
import { Button } from "@/components/ui/button";
import { FlickEmbed } from "./FlickEmbed";
import { FlickCta } from "./FlickCta";
import { diffIdFromDetail, optionForDiff } from "./flick-policy";
import { Avatar } from "./Avatar";
import { Chevron, Close, Comment, Heart, More, Mute, Save, Share, Shop, Verified } from "./Icons";
import { AutoVideo, useDoubleTap, useInView } from "./media";

function Header({ avatar, logo, monogram, title, sub, ring }: { avatar?: string; logo?: string | undefined; monogram?: string; title: ReactNode; sub?: ReactNode; ring?: boolean }) {
  return (
    <div className="flex h-[54px] items-center gap-2.5 pl-3 pr-2">
      <Avatar src={avatar} logo={logo} monogram={monogram} size={32} ring={ring} />
      <div className="min-w-0 flex-1 leading-[16px]">
        <div className="flex items-center gap-1 truncate text-[13.5px] font-semibold">{title}</div>
        {sub && <div className="truncate text-[12px] text-ig-fg/90">{sub}</div>}
      </div>
      <button aria-label="More" className="p-2"><More size={20} /></button>
    </div>
  );
}

function Actions({ liked, onLike, saved, onSave, comments, right }: { liked: boolean; onLike: () => void; saved: boolean; onSave: () => void; comments: number; right?: ReactNode }) {
  const [pop, setPop] = useState(0);
  return (
    <div className="relative flex h-[46px] items-center px-3">
      <div className="flex items-center gap-4">
        <button aria-label="Like" onClick={() => { onLike(); setPop((p) => p + 1); }} className="flex items-center gap-1.5">
          <Heart key={pop} size={24} filled={liked} className={`${liked ? "text-ig-like" : ""} ${pop ? "animate-ig-pop" : ""}`} strokeWidth={liked ? 0 : 2} />
        </button>
        <button aria-label="Comment" className="flex items-center gap-1.5"><Comment size={24} /><span className="text-[13px] font-semibold">{fmt(comments)}</span></button>
        <button aria-label="Share"><Share size={22} /></button>
      </div>
      {right && <div className="absolute left-1/2 -translate-x-1/2">{right}</div>}
      <button aria-label="Save" onClick={onSave} className="ml-auto"><Save size={24} filled={saved} /></button>
    </div>
  );
}

function Caption({ username, text, likes, comments, time, likedBy }: { username: string; text: string; likes: number; comments: number; time: string; likedBy?: string | undefined }) {
  const [more, setMore] = useState(false);
  const long = text.length > 70;
  return (
    <div className="space-y-[5px] px-3 pb-4 text-[13.5px] leading-[18px]">
      <div className="font-semibold">{likedBy ? <>Liked by <span>{likedBy}</span> and {fmt(likes)} others</> : <>{fmt(likes)} likes</>}</div>
      <div>
        <span className="mr-1 font-semibold">{username}</span>
        {long && !more ? <>{text.slice(0, 64)}… <button onClick={() => setMore(true)} className="text-ig-muted">more</button></> : text}
      </div>
      {comments > 0 && <div className="text-ig-muted">View all {fmt(comments)} comments</div>}
      <div className="text-[11px] text-ig-muted">{time}</div>
    </div>
  );
}

function useLike(initial: number) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  return { liked, saved, likes: initial + (liked ? 1 : 0), toggle: () => setLiked((l) => !l), like: () => setLiked(true), save: () => setSaved((s) => !s) };
}

function Dots({ n, i }: { n: number; i: number }) {
  if (n < 2) return null;
  return (
    <div className="flex gap-1">
      {Array.from({ length: n }).map((_, k) => <span key={k} className={`h-1.5 w-1.5 rounded-full ${k === i ? "bg-ig-blue" : "bg-ig-muted/50"}`} />)}
    </div>
  );
}

export function OrganicPost({ post }: { post: Organic }) {
  const l = useLike(post.likes);
  const dt = useDoubleTap(l.like);
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box);
  const [slide, setSlide] = useState(0);
  const isVideo = post.kind === "video";
  const n = isVideo ? 1 : post.media.length;
  return (
    <article className="border-b border-ig-sep/0">
      <Header avatar={post.avatar} ring title={<>{post.username}{post.verified && <Verified />}</>} sub={post.location} />
      <div ref={box} onClick={dt.onClick} className="relative w-full overflow-hidden bg-ig-elev" style={{ aspectRatio: post.aspect ?? "1/1" }}>
        {isVideo ? (
          <>
            <AutoVideo src={post.media[0] ?? ""} poster={post.media[1] ?? ""} active={inView} />
            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 p-1.5"><Mute size={12} /></div>
          </>
        ) : (
          <div className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto" onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
            {post.media.map((m) => <img key={m} src={m} alt="" loading="lazy" className="h-full w-full shrink-0 snap-center object-cover" />)}
          </div>
        )}
        {n > 1 && <div className="absolute right-3 top-3 rounded-full bg-black/70 px-2 py-0.5 text-[12px] font-medium">{slide + 1}/{n}</div>}
        {dt.overlay}
      </div>
      <Actions liked={l.liked} onLike={l.toggle} saved={l.saved} onSave={l.save} comments={post.comments} right={<Dots n={n} i={slide} />} />
      <Caption username={post.username} text={post.caption} likes={l.likes} comments={post.comments} time={post.time} likedBy={post.likedBy} />
    </article>
  );
}

const SponsoredLine = ({ prefix }: { prefix?: ReactNode }) => (
  <span className="flex items-center gap-1">
    {prefix}
    <span>Sponsored</span>
  </span>
);

function CtaBar({ flick }: { flick: Flick }) {
  return <FlickCta flick={flick} className="flex h-[44px] w-full justify-between rounded-none bg-ig-blue px-3 text-[13.5px] text-ig-fg hover:bg-ig-blue/90 aria-pressed:bg-ig-blue/70 active:scale-[0.99]" />;
}

type AdKind = "feed" | "creator" | "shopping";
export function FlickAd({ flick, kind, enabled = true, placement }: { flick: Flick; kind: AdKind; enabled?: boolean; placement?: string }) {
  const l = useLike(flick.likes);
  const [sheet, setSheet] = useState(false);
  const [option, setOption] = useState<{ label: string; price?: string }>(flick.skuByDiff?.["0"] ?? { label: "" });
  const [change, setChange] = useState(0);
  const seen = useRef<string[]>([]);
  const creator = kind === "creator" ? CREATOR_AD : null;
  const shopping = kind === "shopping" ? SHOPPING_AD : null;
  const product = flick.productName && flick.skuByDiff ? flick : null;
  const onEvent = (type: string, detail: unknown) => {
    if (!product || type !== "vertex-diff-change") return;
    console.log("[flick-diff]", flick.flickId, JSON.stringify(detail));
    const id = diffIdFromDetail(detail);
    if (id === null) return;
    const result = optionForDiff(id, seen.current, product.skuByDiff ?? {}, true);
    seen.current = result.ids;
    setOption(result.option); setChange((n) => n + 1);
  };
  return <article className="relative" data-placement={placement}>
    {creator ? <Header avatar={creator.creatorAvatar} ring title={<>{creator.creator}<span className="font-normal">and</span>{flick.brand}<Verified /></>} sub={<span>Paid partnership with <span className="font-semibold">{flick.brand}</span></span>} />
      : <Header logo={flick.logo} monogram={flick.monogram ?? flick.brand} title={<>{flick.brand}<Verified /></>} sub={<><SponsoredLine />{flick.displayName && flick.location && <span className="block truncate text-[10px] leading-3 text-ig-muted">{flick.location}</span>}</>} />}
    <div className="relative">
      <FlickEmbed id={flick.flickId} aspect={flick.aspect} enabled={enabled} onEvent={onEvent} />
      {product && <div className="pointer-events-none absolute left-3 right-20" style={{ top: product.tagTop }}><Button key={change} variant="ghost" aria-label={`View ${product.productName}, ${option.price ?? ""}`} onClick={() => setSheet(true)} className="flick-row-pop product-tag pointer-events-auto relative h-auto max-w-full flex-col items-start gap-0.5 whitespace-normal rounded-md bg-ig-elev/95 px-3 py-2 text-left text-ig-fg hover:bg-ig-sep"><span className="text-[11px] font-semibold leading-4">{product.productName}</span>{option.price && <span className="text-[12px]">{option.price}</span>}</Button></div>}
    </div>
    {shopping ? <Button variant="ghost" onClick={() => setSheet(true)} className="flex h-auto min-h-[64px] w-full justify-between gap-3 whitespace-normal rounded-none bg-ig-elev px-3 py-2 text-left hover:bg-ig-sep">
      <span key={change} className="flick-row-pop min-w-0 flex-1"><span className="block text-[12px] font-semibold leading-[16px]">{shopping.productName}</span><span className="block min-h-[16px] text-[12px] text-ig-muted">{option.price}</span></span><span className="flex shrink-0 items-center gap-1 text-[11px]">View product<Chevron size={14} /></span>
    </Button> : <CtaBar flick={flick} />}
    <Actions liked={l.liked} onLike={l.toggle} saved={l.saved} onSave={l.save} comments={flick.comments} />
    <Caption username={creator ? creator.creator : flick.brand} text={flick.caption} likes={l.likes} comments={flick.comments} time="Sponsored" />
    {sheet && product && <ShopSheet flick={product} option={option} onClose={() => setSheet(false)} />}
  </article>;
}

function ShopSheet({ flick, option, onClose }: { flick: Flick; option: { label: string; price?: string }; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-end bg-ig-bg/60" onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="View product" className="animate-ig-sheet w-full rounded-t-2xl bg-ig-elev pb-8">
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-ig-muted/50" />
      <div className="flex items-center justify-between px-4 py-3"><span className="text-[15px] font-semibold">{flick.brand}</span><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="hover:bg-ig-sep"><Close size={20} /></Button></div>
      <div className="px-4"><div className="text-[15px] font-semibold">{flick.productName}</div>{option.price && <div className="mt-1 text-[14px]">{option.price}</div>}
        <FlickCta flick={flick} label="View product" className="mt-5 h-11 w-full bg-ig-blue text-ig-fg hover:bg-ig-blue/90" />
      </div>
    </div>
  </div>;
}
