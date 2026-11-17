import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FEED_AD_3, type Flick } from "@/data/feed";
import { Avatar } from "./Avatar";
import { Chevron, Close, More, Share } from "./Icons";
import { landingFor } from "./flick-selection";

export type BrowserTarget = { flick: Flick; product?: string | undefined };
const BrowserContext = createContext<(target: BrowserTarget) => void>(() => {});
export const useInAppBrowser = () => useContext(BrowserContext);

/** Renders the dummy Instagram in-app browser inside the phone frame for every CTA. */
export function BrowserProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<BrowserTarget | null>(null);
  // The in-app browser is its own history entry: Back closes it instead of leaving the demo.
  const open = useCallback((t: BrowserTarget) => { window.history.pushState({ ...window.history.state, browser: true }, ""); setTarget({ ...t, flick: landingFor(t.flick) }); }, []);
  useEffect(() => {
    const onPop = (e: PopStateEvent) => { if (!e.state?.browser) setTarget(null); };
    window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop);
  }, []);
  const close = useCallback(() => { setTarget(null); if (window.history.state?.browser) window.history.back(); }, []);
  return <BrowserContext.Provider value={open}>{children}{target && <InAppBrowser target={target} onClose={close} />}</BrowserContext.Provider>;
}

const domain = (flick: Flick) => flick.landingSheet?.address ?? (flick.landingUrl ? new URL(flick.landingUrl).hostname.replace(/^www\./, "") : "");
const Lock = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17 9V7A5 5 0 0 0 7 7v2a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3ZM9 7a3 3 0 0 1 6 0v2H9Z" /></svg>;
const Refresh = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></svg>;

export function InAppBrowser({ target, onClose }: { target: BrowserTarget; onClose: () => void }) {
  const { flick } = target;
  const live = !flick.snapshot && !!flick.landingUrl && !!flick.embeddable && !flick.landingSheet;
  const [load, setLoad] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => { setDone(false); if (live || flick.snapshot) return; const t = setTimeout(() => setDone(true), 700); return () => clearTimeout(t); }, [live, load, flick.snapshot]);
  return <div role="dialog" aria-label="In-app browser" className="animate-ig-sheet absolute inset-0 z-[80] flex flex-col bg-ig-bg text-ig-fg">
    <div className="relative flex h-14 shrink-0 items-center gap-1 border-b border-ig-sep bg-ig-elev px-1">
      <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose} className="text-ig-fg hover:bg-ig-sep"><Close size={24} /></Button>
      <div className="flex min-w-0 flex-1 flex-col items-center leading-tight">
        <span className="flex items-center gap-1 text-[14px] font-semibold"><Lock />{domain(flick)}</span>
        <span className="text-[11px] text-ig-muted">{flick.displayName ?? flick.brandName}</span>
      </div>
      <Button variant="ghost" size="icon" aria-label="More options" className="text-ig-fg hover:bg-ig-sep"><More size={22} /></Button>
      <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden"><div key={load} className={`h-full bg-ig-blue transition-[width,opacity] duration-700 ${done ? "w-full opacity-0" : "w-2/3 opacity-100"}`} /></div>
    </div>
    <div className="relative min-h-0 flex-1 overflow-y-auto">
      {flick.landingSheet ? <RogersPage /> : flick.snapshot
        ? <img key={load} src={flick.snapshot} alt={`${flick.brandName} website`} onLoad={() => setDone(true)} className="block w-full bg-ig-fg" />
        : live
        ? <iframe key={load} src={flick.landingUrl} title={`${flick.brandName} website`} onLoad={() => setDone(true)} className="absolute inset-0 h-full w-full border-0 bg-ig-fg" />
        : <div className="flex flex-col items-center px-6 pt-20 text-center">
          <Avatar logo={flick.logo} monogram={flick.monogram ?? flick.brand} size={80} />
          <h1 className="mt-4 text-[22px] font-semibold">{flick.brandName}</h1>
          {target.product && <p className="mt-2 text-[15px]">{target.product}</p>}
          <p className="mt-6 text-[14px] text-ig-muted">This site can't be shown inside the demo.</p>
          <Button asChild className="mt-6 h-11 w-full max-w-[280px] bg-ig-blue text-ig-fg hover:bg-ig-blue/90"><a href={flick.landingUrl} target="_blank" rel="noopener noreferrer">Open in browser</a></Button>
        </div>}
    </div>
    <div className="flex h-12 shrink-0 items-center justify-around border-t border-ig-sep bg-ig-elev text-ig-fg">
      <button aria-label="Back" className="p-2 opacity-50"><Chevron size={22} className="rotate-180" /></button>
      <button aria-label="Forward" className="p-2 opacity-50"><Chevron size={22} /></button>
      <button aria-label="Refresh" onClick={() => setLoad((n) => n + 1)} className="p-2"><Refresh /></button>
      <button aria-label="Share" className="p-2"><Share size={22} /></button>
    </div>
  </div>;
}

function RogersPage() {
  const [pressed, setPressed] = useState(false);
  const sheet = FEED_AD_3.landingSheet;
  return <div className="flex flex-col items-center px-6 pt-14 text-center">
    <Avatar logo={FEED_AD_3.logo} monogram={FEED_AD_3.brand} size={80} />
    <h1 className="mt-6 text-[24px] font-semibold">{FEED_AD_3.displayName}</h1>
    <p className="mt-2 text-[14px] text-ig-muted">{FEED_AD_3.location}</p>
    <p className="mt-8 max-w-[300px] text-[15px] leading-6">{sheet?.copy}</p>
    <Button aria-pressed={pressed} onClick={() => setPressed((v) => !v)} className="mt-6 h-11 w-full max-w-[300px] bg-ig-blue text-ig-fg hover:bg-ig-blue/90 aria-pressed:bg-ig-blue/70">{sheet?.button}</Button>
  </div>;
}
