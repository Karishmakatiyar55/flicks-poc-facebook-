import { useEffect, useRef } from "react";
import { EXPLORE, type ExploreTile, type Organic } from "@/data/feed";
import { FlickEmbed } from "./FlickEmbed";
import { FlickAd, OrganicPost } from "./Post";
import { Chevron, Search } from "./Icons";

const Layers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M19 15V7a4 4 0 0 0-4-4H7a2 2 0 0 1 2-2h8a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2Z" /><rect x="2" y="5" width="16" height="16" rx="3" /></svg>;

const PEOPLE = ["jess.outdoors", "marco.eats", "hannah.lens", "tyler.runs", "olivia.home", "chris_builds", "maya.style", "jordan.trips"];
const asPost = (t: Extract<ExploreTile, { kind: "photo" }>, i: number): Organic => ({
  kind: "photo", id: t.id, username: PEOPLE[i % PEOPLE.length]!, avatar: `https://i.pravatar.cc/150?img=${(i * 7) % 70 + 1}`,
  media: [t.image.replace("w=400", "w=1080")], aspect: "1/1", caption: "", likes: 800 + i * 137, comments: 12 + i * 3, time: `${(i % 9) + 1}h`,
});

/** Vertical Explore feed: the tapped tile first, then every other Explore post. */
function ExploreFeed({ start, onBack }: { start: string; onBack: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.scrollTo(0, 0); }, [start]);
  const i = EXPLORE.findIndex((t) => t.id === start);
  const order = i < 0 ? EXPLORE : [EXPLORE[i]!, ...EXPLORE.slice(i + 1), ...EXPLORE.slice(0, i)];
  return <div ref={box} className="no-scrollbar h-full overflow-y-auto overscroll-contain">
    <header className="sticky top-0 z-30 flex h-[50px] items-center gap-3 bg-ig-bg px-2">
      <button aria-label="Back" onClick={onBack} className="p-2"><Chevron size={22} className="rotate-180" /></button>
      <span className="text-[16px] font-semibold">Explore</span>
    </header>
    {order.map((t, n) => t.kind === "photo"
      ? <OrganicPost key={t.id} post={asPost(t, EXPLORE.indexOf(t))} />
      : <FlickAd key={t.id} flick={t.flick} kind="feed" placement={n === 0 ? `explore-open-${t.id}` : `explore-feed-${t.id}`} />)}
  </div>;
}

export function ExploreTab({ post, onPost }: { post: string | null; onPost: (id: string | null) => void }) {
  if (post) return <ExploreFeed start={post} onBack={() => onPost(null)} />;
  return <div className="no-scrollbar h-full overflow-y-auto overscroll-contain">
    <div className="sticky top-0 z-30 bg-ig-bg px-4 py-2">
      <div className="flex h-9 items-center gap-2 rounded-lg bg-ig-elev px-3 text-[15px] text-ig-muted"><Search size={16} />Search</div>
    </div>
    <div className="grid grid-cols-3 gap-[2px] [grid-auto-flow:dense]">
      {EXPLORE.map((t) => t.kind === "photo" ? <button key={t.id} aria-label="Open post" onClick={() => onPost(t.id)} className="block aspect-square w-full"><img src={t.image} alt="" loading="lazy" className="h-full w-full object-cover" /></button>
        : t.kind === "flick-live" ? <div key={t.id} data-placement={`explore-${t.id}`} className={`relative col-span-2 row-span-2 aspect-square ${t.side === "right" ? "col-start-2" : ""}`}>
          <FlickEmbed id={t.flick.flickId} aspect="1/1" fill />
          {/* Upper-left area opens the post; the right column (where a Flick's switcher can sit) stays with the Flick. */}
          <button aria-label={`Open ${t.flick.brand} post`} onClick={() => onPost(t.id)} className="absolute left-0 top-0 h-[55%] w-[76%]" />
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-ig-bg/60 px-1.5 py-0.5 text-[11px] font-medium">Sponsored</span>
        </div>
        : <button key={t.id} aria-label={`Open ${t.flick.brand} post`} onClick={() => onPost(t.id)} className="relative aspect-square w-full">
          <img src={t.still} alt="" className="h-full w-full object-cover" />
          <span className="pointer-events-none absolute right-1.5 top-1.5 drop-shadow"><Layers /></span>
        </button>)}
    </div>
  </div>;
}
