import { useRef, useState, type ReactNode } from "react";
import { fmt, type Flick, type Organic, CREATOR_AD } from "@/data/feed";
import { Button } from "@/components/ui/button";
import { FlickAudioBlock } from "./FlickAudio";
import { FlickEmbed } from "./FlickEmbed";
import { FlickCta } from "./FlickCta";
import { diffIdFromDetail, optionForDiff } from "./flick-policy";
import { Avatar } from "./Avatar";
import { Chevron, Close, Comment, Globe, Heart, More, Mute, Share, ThumbUp, Verified } from "./Icons";
import { AutoVideo, useInView } from "./media";

function PostHeader({ avatar, logo, monogram, title, sub }: { avatar?: string; logo?: string | undefined; monogram?: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-3 pb-2 pt-3">
      <Avatar src={avatar} logo={logo} monogram={monogram} size={40} />
      <div className="min-w-0 flex-1 leading-[18px]">
        <div className="flex items-center gap-1 truncate text-[15px] font-semibold">{title}</div>
        {sub && <div className="flex items-center gap-1 truncate text-[13px] text-fb-muted">{sub}</div>}
      </div>
      <button aria-label="More" className="p-2 text-fb-muted"><More size={20} /></button>
    </div>
  );
}

const SponsoredSub = ({ extra }: { extra?: ReactNode }) => (
  <>
    <span>Sponsored</span><span>·</span><Globe size={12} />
    
    {extra}
  </>
);

function Reactions({ likes, comments }: { likes: number; comments: number }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 text-[13px] text-fb-muted">
      <span className="flex items-center gap-1.5">
        <span className="flex -space-x-1">
          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-fb-blue ring-2 ring-fb-card"><ThumbUp size={10} filled className="text-fb-card" strokeWidth={0} /></span>
          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-fb-heart ring-2 ring-fb-card"><Heart size={10} filled className="text-fb-card" strokeWidth={0} /></span>
        </span>
        {fmt(likes)}
      </span>
      <span>{fmt(comments)} comments</span>
    </div>
  );
}

function ActionBar({ liked, onLike }: { liked: boolean; onLike: () => void }) {
  const [pop, setPop] = useState(0);
  const item = "flex h-10 flex-1 items-center justify-center gap-1.5 text-[13px] font-semibold";
  return (
    <div className="mx-3 flex border-t border-fb-sep">
      <button aria-label="Like" aria-pressed={liked} onClick={() => { onLike(); setPop((p) => p + 1); }} className={`${item} ${liked ? "text-fb-blue" : "text-fb-muted"}`}>
        <ThumbUp key={pop} size={18} filled={liked} className={pop ? "animate-fb-pop" : ""} strokeWidth={liked ? 0 : 2} />Like
      </button>
      <button aria-label="Comment" className={`${item} text-fb-muted`}><Comment size={18} />Comment</button>
      <button aria-label="Share" className={`${item} text-fb-muted`}><Share size={18} />Share</button>
    </div>
  );
}

function useLike(initial: number) {
  const [liked, setLiked] = useState(false);
  return { liked, likes: initial + (liked ? 1 : 0), toggle: () => setLiked((l) => !l) };
}

function Dots({ n, i }: { n: number; i: number }) {
  if (n < 2) return null;
  return (
    <div className="flex justify-center gap-1 pb-2">
      {Array.from({ length: n }).map((_, k) => <span key={k} className={`h-1.5 w-1.5 rounded-full ${k === i ? "bg-fb-blue" : "bg-fb-sep"}`} />)}
    </div>
  );
}

export function OrganicPost({ post }: { post: Organic }) {
  const l = useLike(post.likes);
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box);
  const [slide, setSlide] = useState(0);
  const isVideo = post.kind === "video";
  const n = isVideo ? 1 : post.media.length;
  return (
    <article className="bg-fb-card">
      <PostHeader avatar={post.avatar} title={<>{post.name}{post.verified && <Verified />}</>} sub={<>{post.time}<span>·</span><Globe size={12} /></>} />
      <p className="px-3 pb-2 text-[15px] leading-[20px]">{post.caption}</p>
      <div ref={box} className="relative w-full overflow-hidden bg-fb-elev" style={{ aspectRatio: post.aspect ?? "1/1" }}>
        {isVideo ? (
          <>
            <AutoVideo src={post.media[0] ?? ""} poster={post.media[1] ?? ""} active={inView} />
            <div className="absolute bottom-3 right-3 rounded-full bg-fb-video/60 p-1.5 text-fb-onvideo"><Mute size={12} /></div>
          </>
        ) : (
          <div className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto" onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
            {post.media.map((m) => <img key={m} src={m} alt="" loading="lazy" className="h-full w-full shrink-0 snap-center object-cover" />)}
          </div>
        )}
        {n > 1 && <div className="absolute right-3 top-3 rounded-full bg-fb-video/70 px-2 py-0.5 text-[12px] font-medium text-fb-onvideo">{slide + 1}/{n}</div>}
      </div>
      <Dots n={n} i={slide} />
      <Reactions likes={l.likes} comments={post.comments} />
      <ActionBar liked={l.liked} onLike={l.toggle} />
    </article>
  );
}

function LinkBar({ flick, headline, priceLine, option, onPress }: { flick: Flick; headline?: string | undefined; priceLine?: string | undefined; option?: { label: string; price?: string } | undefined; onPress?: (() => void) | undefined }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-fb-bg px-3 py-2">
      <div className="min-w-0">
        <div className="text-[12px] uppercase tracking-wide text-fb-muted">{flick.linkDomain}</div>
        <div className="truncate text-[15px] font-semibold text-fb-fg">{headline ?? flick.linkHeadline}</div>
        {priceLine && <div key={priceLine} className="flick-row-pop text-[13px] text-fb-muted">{priceLine}</div>}
      </div>
      {onPress
        ? <Button onClick={onPress} className="h-auto shrink-0 rounded-md bg-fb-elev px-4 py-2 text-[14px] font-semibold text-fb-fg hover:bg-fb-sep">{flick.cta}</Button>
        : <FlickCta flick={flick} option={option} className="h-auto shrink-0 justify-center gap-1 rounded-md bg-fb-elev px-4 py-2 text-[14px] font-semibold text-fb-fg hover:bg-fb-sep aria-pressed:bg-fb-sep [&_svg]:size-3.5" />}
    </div>
  );
}

type AdKind = "feed" | "creator" | "shopping" | "page";
export function FlickAd({ flick, kind, enabled = true }: { flick: Flick; kind: AdKind; enabled?: boolean }) {
  const l = useLike(flick.likes);
  const [sheet, setSheet] = useState(false);
  const [option, setOption] = useState<{ label: string; price?: string }>(flick.skuByDiff?.["0"] ?? { label: "" });
  const [change, setChange] = useState(0);
  const seen = useRef<string[]>([]);
  const creator = kind === "creator" ? CREATOR_AD : null;
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
  return <article data-placement={flick.id} className="bg-fb-card">
    {creator
      ? <PostHeader avatar={creator.creatorAvatar} title={<>{creator.creator}</>} sub={<><span>Paid partnership</span><span>·</span><span>with <span className="font-semibold text-fb-fg">{creator.displayName}</span></span><span>·</span><Globe size={12} /></>} />
      : <PostHeader logo={flick.logo} monogram={flick.displayName ?? flick.brand} title={<>{flick.displayName ?? flick.brand}<Verified /></>} sub={<SponsoredSub extra={flick.location && <span className="truncate">· {flick.location}</span>} />} />}
    <p className="px-3 pb-2 text-[15px] leading-[20px]">{flick.caption}</p>
    <div className="relative">
      <FlickEmbed id={flick.flickId} aspect={flick.aspect} enabled={enabled} onEvent={onEvent} />
      {product && <div className="pointer-events-none absolute left-3 right-20" style={{ top: product.tagTop }}><Button key={change} variant="ghost" aria-label={`View ${product.productName}, ${option.price ?? ""}`} onClick={() => setSheet(true)} className="flick-row-pop product-tag pointer-events-auto relative h-auto max-w-full flex-col items-start gap-0.5 whitespace-normal rounded-md bg-fb-card/95 px-3 py-2 text-left text-fb-fg shadow-md hover:bg-fb-card"><span className="text-[11px] font-semibold leading-4">{product.productName}</span>{option.price && <span className="text-[12px]">{option.price}</span>}</Button></div>}
    </div>
    <LinkBar flick={flick} option={product ? option : undefined} headline={product ? product.productName : undefined} priceLine={product ? option.price : undefined} />
    <Reactions likes={l.likes} comments={flick.comments} />
    <ActionBar liked={l.liked} onLike={l.toggle} />
    {sheet && product && <ProductSheet flick={product} option={option} onClose={() => setSheet(false)} />}
  </article>;
}

function ProductSheet({ flick, option, onClose }: { flick: Flick; option: { label: string; price?: string }; onClose: () => void }) {
  return <FlickAudioBlock><div className="fixed inset-0 z-50 flex items-end bg-fb-video/60" onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="View product" className="animate-fb-sheet w-full rounded-t-2xl bg-fb-card pb-8">
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-fb-sep" />
      <div className="flex items-center justify-between px-4 py-3"><span className="text-[15px] font-semibold">{flick.displayName ?? flick.brand}</span><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="hover:bg-fb-elev"><Close size={20} /></Button></div>
      <div className="px-4"><div className="text-[15px] font-semibold">{flick.productName}</div>{option.price && <div className="mt-1 text-[14px]">{option.price}</div>}
        <FlickCta flick={flick} option={option} className="mt-5 h-11 w-full bg-fb-blue text-fb-card hover:bg-fb-blue/90" />
      </div>
    </div>
  </div></FlickAudioBlock>;
}
