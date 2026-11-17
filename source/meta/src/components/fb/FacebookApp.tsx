import { useEffect, useRef } from "react";
import { usePrototypeBack, usePrototypeState } from "./PrototypeNavigation";
import { CHATS, FEED, ME, STORIES, type Chat, type Flick, type FlickPlacement, type SellerChat, type Story } from "@/data/feed";
import { InAppBrowserProvider } from "./InAppBrowser";
import { FlickFormats } from "./FlickFormats";
import { Avatar } from "./Avatar";
import { Bell, Friends, Home, Menu, Messenger as MessengerIcon, Plus, Search, Store, Video } from "./Icons";
import { FlickAd, OrganicPost } from "./Post";
import { StoriesRow, StoryViewer } from "./Stories";
import { FlickProvider } from "./FlickEmbed";
import { ReelsTab } from "./ReelsTab";
import { MarketplaceTab } from "./Marketplace";
import { Messenger } from "./Messenger";

type Tab = "home" | "friends" | "video" | "marketplace" | "notifications" | "menu";

function Composer() {
  return (
    <div className="flex items-center gap-2.5 bg-fb-card px-3 py-2.5">
      <Avatar src={ME.avatar} size={36} />
      <div className="flex h-9 flex-1 items-center rounded-full border border-fb-sep px-3 text-[14px] text-fb-muted">What's on your mind, Alex?</div>
    </div>
  );
}

function HomeFeed({ onStory, adsEnabled }: { onStory: (s: Story) => void; adsEnabled: boolean }) {
  return (
    <div className="no-scrollbar h-full space-y-1.5 overflow-y-auto overscroll-contain pb-3">
      <Composer />
      <StoriesRow onOpen={onStory} />
      {FEED.map((item) =>
        item.kind === "photo" || item.kind === "video" ? <OrganicPost key={item.id} post={item} />
        : item.kind === "ad-feed" ? <FlickAd key={item.id} flick={item.flick} enabled={adsEnabled} kind="feed" />
        : item.kind === "ad-creator" ? <FlickAd key={item.id} flick={item.flick} enabled={adsEnabled} kind="creator" />
        : item.kind === "ad-shopping" ? <FlickAd key={item.id} flick={item.flick} enabled={adsEnabled} kind="shopping" />
        : item.kind === "ad-page" ? <FlickAd key={item.id} flick={item.flick} enabled={adsEnabled} kind="page" /> : null)}
      <div className="py-6 text-center text-[13px] text-fb-muted">You're all caught up</div>
    </div>
  );
}

function StaticScreen({ tab }: { tab: Tab }) {
  const rows: Record<string, [string, string][]> = {
    friends: [["Priya Kapoor", "4 mutual friends"], ["Dan Miller", "12 mutual friends"], ["Mia Chen", "2 mutual friends"], ["Leo Torres", "7 mutual friends"]],
    notifications: [["Sam Wilde", "liked your photo · 2h"], ["Priya Kapoor", "commented: so fun! · 5h"], ["Kicks Dept", "posted in Sneaker Heads · 8h"], ["Mia Chen", "invited you to Brunch Club · 1d"]],
    menu: [["Memories", ""], ["Saved", ""], ["Groups", ""], ["Marketplace", ""], ["Events", ""], ["Pages", ""]],
  };
  const titles: Record<string, string> = { friends: "Friend requests", notifications: "Notifications", menu: "Menu" };
  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-fb-card">
      <div className="px-4 pb-2 pt-3 text-[22px] font-bold">{titles[tab ?? "menu"]}</div>
      {tab === "menu" && <div className="mx-3 mb-2 flex items-center gap-3 rounded-xl bg-fb-bg p-3"><Avatar src={ME.avatar} size={44} /><div><div className="text-[15px] font-semibold">{ME.name}</div><div className="text-[13px] text-fb-muted">See your profile</div></div></div>}
      {(rows[tab ?? "menu"] ?? []).map(([name, sub]) => (
        <div key={name} className="flex items-center gap-3 px-4 py-2.5">
          <Avatar src="" monogram={name} size={44} />
          <div className="leading-tight"><div className="text-[15px] font-medium">{name}</div>{sub && <div className="text-[13px] text-fb-muted">{sub}</div>}</div>
        </div>
      ))}
    </div>
  );
}

export function FacebookApp() {
  const [view, setView] = usePrototypeState<{
    tab: Tab; story: Story | null; messenger: boolean; listing: Flick | null; thread: Chat | null; seller?: SellerChat | null;
    destination: { placement: FlickPlacement; visit: number } | null;
  }>("screen", { tab: "home", story: null, messenger: false, listing: null, thread: null, destination: null });
  const { tab, story, messenger, listing, thread, destination, seller } = view;
  const setTab = (tab: Tab) => setView(v => ({ ...v, tab, listing: null, story: null, thread: null, seller: null, messenger: false, destination: null }));
  const messageSeller = (seller: SellerChat) => setView(v => ({ ...v, messenger: true, thread: null, seller }));
  const setStory = (story: Story | null) => setView(v => ({ ...v, story }));
  const setMessenger = (messenger: boolean) => setView(v => ({ ...v, messenger }));
  const setListing = (listing: Flick | null) => setView(v => ({ ...v, tab: "marketplace", listing }), listing === null);
  const setThread = (thread: Chat | null) => thread ? setView(v => ({ ...v, thread })) : back();
  const back = usePrototypeBack(() => setView(v => ({ ...v, story: null, listing: null, thread: null, seller: null, messenger: false, tab: "home" })));
  const screen = useRef<HTMLDivElement>(null);
  const arrived = useRef(new Set<number>());
  const navigateSection = (section: FlickPlacement["section"]) => {
    const placement = section === "HOME" ? { key: FEED[0] && "flick" in FEED[0] ? FEED[0].flick.id : "", surface: "feed" } : null;
    setView({ story: null, listing: null, messenger: section === "MESSENGER", thread: null, seller: null,
      tab: section === "VIDEO" ? "video" : section === "MARKETPLACE" ? "marketplace" : "home",
      destination: placement ? { placement: placement as FlickPlacement, visit: Date.now() } : null });
  };
  useEffect(() => {
    if (!destination || arrived.current.has(destination.visit)) return;
    const target = screen.current?.querySelector<HTMLElement>(`[data-placement="${destination.placement.key}"]`);
    const media = target?.querySelector<HTMLElement>("[data-flick-id]");
    if (!target || !media) return;
    arrived.current.add(destination.visit);
    if (destination.placement.surface === "reel") target.scrollIntoView({ block: "start" });
    else if (destination.placement.surface !== "story") media.scrollIntoView({ block: "center" });
    media.classList.remove("flick-arrival");
    void media.offsetWidth;
    media.classList.add("flick-arrival");
    const timer = setTimeout(() => media.classList.remove("flick-arrival"), 1800);
    return () => clearTimeout(timer);
  }, [destination]);
  const close = () => setView(v => ({ ...v, story: null }), true);
  const tabs: { id: Tab; label: string; icon: (a: boolean) => React.ReactNode }[] = [
    { id: "home", label: "Home", icon: (a) => <Home filled={a} size={26} /> },
    { id: "friends", label: "Friends", icon: (a) => <Friends filled={a} size={26} /> },
    { id: "video", label: "Video", icon: (a) => <Video filled={a} size={26} /> },
    { id: "marketplace", label: "Marketplace", icon: (a) => <Store filled={a} size={26} /> },
    { id: "notifications", label: "Notifications", icon: (a) => <Bell filled={a} size={26} /> },
    { id: "menu", label: "Menu", icon: () => <Menu size={26} /> },
  ];
  return (
    <FlickProvider><div ref={screen} className="relative flex h-full flex-col bg-fb-bg font-fb text-fb-fg antialiased" style={{ transform: "translateZ(0)" }}><InAppBrowserProvider>
      {tab !== "video" && <header className="shrink-0 bg-fb-card">
        <div className="flex h-[52px] items-center justify-between pl-4 pr-3">
          <span className="text-[26px] font-bold lowercase tracking-tight text-fb-blue">facebook</span>
          <div className="flex items-center gap-2">
            <button aria-label="Create" className="flex h-9 w-9 items-center justify-center rounded-full bg-fb-elev"><Plus size={20} /></button>
            <button aria-label="Search" className="flex h-9 w-9 items-center justify-center rounded-full bg-fb-elev"><Search size={20} /></button>
            <button aria-label="Messenger" onClick={() => setMessenger(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-fb-elev"><MessengerIcon size={20} /></button>
          </div>
        </div>
        <nav className="flex h-[44px] items-stretch justify-around border-b border-fb-sep">
          {tabs.map((t) => (
            <button key={t.id} aria-label={t.label} onClick={() => setTab(t.id)} className={`relative flex flex-1 items-center justify-center ${tab === t.id ? "text-fb-blue" : "text-fb-muted"}`}>
              {t.icon(tab === t.id)}
              {tab === t.id && <span className="absolute inset-x-1 bottom-0 h-[3px] rounded-t bg-fb-blue" />}
            </button>
          ))}
        </nav>
      </header>}
      <main className="relative min-h-0 flex-1">
        <div className={tab === "home" ? "h-full" : "hidden"}><HomeFeed onStory={setStory} adsEnabled={tab === "home" && !story && !messenger} /></div>
        {tab === "video" && <ReelsTab onBack={back} onProfile={() => setTab("menu")} />}
        {tab === "marketplace" && <MarketplaceTab open={listing} setOpen={setListing} onMessage={messageSeller} />}
        {(tab === "friends" || tab === "notifications" || tab === "menu") && <StaticScreen tab={tab} />}
      </main>
      {story && <StoryViewer key={story.username} story={story} onClose={close} onChange={setStory} />}
      {messenger && <Messenger thread={thread} setThread={setThread} onClose={back} seller={seller ?? null} />}
      <FlickFormats onSelect={navigateSection} />
    </InAppBrowserProvider></div></FlickProvider>
  );
}
