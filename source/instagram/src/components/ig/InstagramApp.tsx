import { useCallback, useEffect, useRef, useState } from "react";
import { FEED, ME, type FlickSection, type Tab } from "@/data/feed";
import { Avatar } from "./Avatar";
import { Heart, Home, Reels, Search, Share, Chevron } from "./Icons";
import { ExploreTab } from "./ExploreTab";
import { MessagesTab } from "./MessagesTab";
import { FormatsIndex } from "./FormatsIndex";
import { FlickAd, OrganicPost } from "./Post";
import { StoriesTray, StoryViewer } from "./Stories";
import { FlickProvider } from "./FlickEmbed";
import { BrowserProvider } from "./InAppBrowser";
import { ReelsTab } from "./ReelsTab";


function Feed({ onStory, adsEnabled }: { onStory: (i: number) => void; adsEnabled: boolean }) {
  return (
    <div className="no-scrollbar h-full overflow-y-auto overscroll-contain">
      <header className="sticky top-0 z-30 flex h-[50px] items-center justify-between bg-ig-bg pl-4 pr-3">
        <span className="flex items-center gap-0.5 font-wordmark text-[30px] leading-none">Instagram<Chevron size={14} className="mt-2 rotate-90" /></span>
        <Heart size={24} />
      </header>
      <StoriesTray onOpen={onStory} />
      <div className="h-px bg-ig-sep" />
      {FEED.map((item) =>
        !("flick" in item) ? <OrganicPost key={item.id} post={item} />
        : <FlickAd key={item.id} flick={item.flick} enabled={adsEnabled} placement={`feed-${item.id}`} kind={item.kind === "ad-creator" ? "creator" : item.kind === "ad-shopping" ? "shopping" : "feed"} />)}
      <div className="py-10 text-center text-[13px] text-ig-muted">You're all caught up</div>
    </div>
  );
}

const GRID = ["photo-1506744038136-46273834b3fb","photo-1517248135467-4c7edcad34c4","photo-1507525428034-b723cf961d3e","photo-1495474472287-4d71bcdd2085","photo-1534438327276-14e5300c3a48","photo-1514525253161-7a46d19cd819","photo-1543466835-00a7907e9de1","photo-1549298916-b41d501d3772","photo-1533105079780-92b9be482077","photo-1494790108377-be9c29b29330","photo-1554118811-1e0d58224f24","photo-1542291026-7eec264c27ff"].map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=70`);

function ProfileScreen() {
  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <div className="px-4 pt-3">
        <div className="text-[20px] font-bold">{ME.username}</div>
        <div className="mt-4 flex items-center gap-6">
          <Avatar src={ME.avatar} size={84} />
          {[["48","posts"],["1,204","followers"],["612","following"]].map(([n,l]) => <div key={l} className="text-center"><div className="text-[16px] font-semibold">{n}</div><div className="text-[13px]">{l}</div></div>)}
        </div>
        <div className="mt-3 text-[13.5px] font-semibold">Alex Morgan</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-[2px]">
        {GRID.map((g) => <img key={g} src={g} alt="" loading="lazy" className="aspect-square w-full object-cover" />)}
      </div>
    </div>
  );
}

/** Wait for a placement to render, center it, and flash a highlight ring. */
function focusPlacement(key: string) {
  let tries = 0;
  const step = () => {
    const el = document.querySelector<HTMLElement>(`[data-placement="${key}"]`);
    if (el && el.getClientRects().length) {
      el.scrollIntoView({ block: key === "stories" || key.startsWith("reel") ? "start" : "center" });
      el.classList.remove("flick-flash"); void el.offsetWidth; el.classList.add("flick-flash");
      setTimeout(() => el.classList.remove("flick-flash"), 1900);
    } else if (tries++ < 40) setTimeout(step, 50);
  };
  setTimeout(step, 30);
}

export function InstagramApp() {
  // Every milestone (tab, story, thread, Explore post) is a browser-history entry, so Back steps back inside the demo.
  type Nav = { tab: Tab; story: number | null; thread: string | null; explorePost: string | null };
  const [nav, setNav] = useState<Nav>({ tab: "home", story: null, thread: null, explorePost: null });
  const { tab, story, thread, explorePost } = nav;
  useEffect(() => {
    window.history.replaceState({ ...window.history.state, ig: nav }, "");
    const onPop = (e: PopStateEvent) => {
      const s = e.state?.ig as Nav | undefined;
      if (s) setNav(s); else window.history.pushState({ ...window.history.state, ig: nav }, "");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cur = useRef(nav); cur.current = nav;
  const push = useCallback((patch: Partial<Nav>) => {
    const next = { ...cur.current, ...patch }; cur.current = next;
    window.history.pushState({ ...window.history.state, ig: next, browser: false }, ""); setNav(next);
  }, []);
  const replace = useCallback((patch: Partial<Nav>) => {
    const next = { ...cur.current, ...patch }; cur.current = next;
    window.history.replaceState({ ...window.history.state, ig: next }, ""); setNav(next);
  }, []);
  const close = useCallback(() => { if (window.history.state?.ig?.story != null) window.history.back(); else replace({ story: null }); }, [replace]);
  const back = useCallback(() => window.history.back(), []);
  const setStory = useCallback((i: number) => push({ story: i }), [push]);
  const stepStory = useCallback((i: number) => replace({ story: i }), [replace]);
  const setThread = useCallback((t: string | null) => t ? push({ thread: t }) : back(), [push, back]);
  const setExplorePost = useCallback((p: string | null) => p ? push({ explorePost: p }) : back(), [push, back]);
  const go = useCallback((s: FlickSection) => {
    push({ tab: s.tab, story: s.story ?? null, thread: s.thread ?? null, explorePost: null });
    focusPlacement(s.first);
  }, [push]);
  const tabs: { id: Tab; label: string; icon: (a: boolean) => React.ReactNode }[] = [
    { id: "home", label: "Home", icon: (a) => <Home filled={a} size={26} /> },
    { id: "reels", label: "Reels", icon: (a) => <Reels filled={a} size={26} /> },
    { id: "messages", label: "Messages", icon: (a) => <Share size={25} strokeWidth={a ? 2.8 : 2} /> },
    { id: "search", label: "Search", icon: (a) => <Search size={26} strokeWidth={a ? 3 : 2} /> },
    { id: "profile", label: "Profile", icon: (a) => <span className={`block rounded-full ${a ? "ring-2 ring-ig-fg" : ""}`}><Avatar src={ME.avatar} size={26} /></span> },
  ];
  return (
    <FlickProvider><div className="relative flex h-full flex-col bg-ig-bg font-ig text-ig-fg antialiased" style={{ transform: "translateZ(0)" }}><BrowserProvider>
      <main className="relative min-h-0 flex-1">
        <div className={tab === "home" ? "h-full" : "hidden"}><Feed onStory={setStory} adsEnabled={tab === "home" && story === null} /></div>
        {tab === "reels" && <ReelsTab />}
        {tab === "search" && <ExploreTab post={explorePost} onPost={setExplorePost} />}
        {tab === "messages" && <MessagesTab thread={thread} onThread={setThread} />}
        {tab === "profile" && <ProfileScreen />}
      </main>
      <nav className={`flex h-[50px] shrink-0 items-center justify-around border-t ${tab === "reels" ? "border-transparent" : "border-ig-sep"} bg-ig-bg pb-[env(safe-area-inset-bottom)]`} style={{ boxSizing: "content-box" }}>
        {tabs.map((t) => <button key={t.id} aria-label={t.label} onClick={() => { if (t.id !== tab || thread || explorePost) push({ tab: t.id, thread: null, explorePost: null }); }} className="p-2">{t.icon(tab === t.id)}</button>)}
      </nav>
      {story !== null && <StoryViewer index={story} onIndex={stepStory} onClose={close} />}
    </BrowserProvider><FormatsIndex onGo={go} /></div></FlickProvider>
  );
}
