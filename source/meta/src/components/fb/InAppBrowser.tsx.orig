import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import type { Flick } from "@/data/feed";
import { Button } from "@/components/ui/button";
import { Close, More } from "./Icons";
import { Avatar } from "./Avatar";
import { diffIdFromDetail } from "./flick-policy";
import { usePrototypeBack, usePrototypeState } from "./PrototypeNavigation";

type ProductOption = { label: string; price?: string };
type Destination = { flick: Flick; diff: string; option?: ProductOption | undefined };
const BrowserContext = createContext<(flick: Flick, option?: ProductOption) => void>(() => {});
const VariantContext = createContext<(id: string, detail: unknown) => void>(() => {});
export const useInAppBrowser = () => useContext(BrowserContext);
export const useRememberFlickVariant = () => useContext(VariantContext);

export function InAppBrowserProvider({ children }: { children: ReactNode }) {
  const [destination, setDestination] = usePrototypeState<Destination | null>("browser", null);
  const close = usePrototypeBack(() => setDestination(null));
  const variants = useRef(new Map<string, string>());
  const remember = useCallback((id: string, detail: unknown) => {
    const diff = diffIdFromDetail(detail);
    if (diff !== null) variants.current.set(id, diff);
  }, []);
  const [menu, setMenu] = useState(false);
  const [pressed, setPressed] = useState(false);
  const open = (flick: Flick, option?: ProductOption) => {
    setMenu(false); setPressed(false);
    setDestination({ flick, diff: variants.current.get(flick.flickId) ?? "0", option });
  };
  const flick = destination?.flick;
  const diff = destination?.diff ?? "0";
  const images = flick?.landingVariants ?? flick?.mockVariants?.map((variant, i) => ({ image: variant.image, diff: String(i) })) ?? [];
  const selected = images.find(variant => variant.diff === diff) ?? images[0];
  const option = destination?.option ?? flick?.skuByDiff?.[diff] ?? flick?.skuByDiff?.["0"];
  const title = option?.label || flick?.productName || flick?.linkHeadline || flick?.displayName || flick?.brand;
  return <VariantContext.Provider value={remember}><BrowserContext.Provider value={open}>{children}{flick && <div role="dialog" aria-modal="true" aria-label="In-app browser" className="animate-fb-sheet fixed inset-0 z-[90] flex flex-col bg-fb-card text-fb-fg" onKeyDown={e => { if (e.key === "Escape") close(); }}>
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-fb-sep bg-fb-bg px-2">
      <Button variant="ghost" size="icon" aria-label="Close browser" onClick={close}><Close size={23} /></Button>
      <LockKeyhole size={14} className="text-fb-muted" /><span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{flick.landingSheet?.address ?? (flick.landingUrl ? new URL(flick.landingUrl).hostname : flick.brand)}</span>
      <Button variant="ghost" size="icon" aria-label="Browser menu" onClick={() => setMenu(v => !v)}><More size={22} /></Button>
    </header>
    <div className="h-0.5 shrink-0 bg-fb-blue" />
    {menu && <div className="absolute right-2 top-14 z-10 rounded-lg border border-fb-sep bg-fb-card p-2 shadow-md">{flick.landingUrl ? <Button asChild variant="ghost"><a href={flick.landingUrl} target="_blank" rel="noopener noreferrer">Open in browser</a></Button> : <span className="px-2 text-[13px] text-fb-muted">Demo page</span>}</div>}
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="flex items-center gap-3 px-4 py-4"><Avatar logo={flick.logo} monogram={flick.displayName ?? flick.brand} size={40} /><div className="min-w-0"><h1 className="text-[18px] font-semibold">{flick.displayName ?? flick.brand}</h1><p className="text-[12px] text-fb-muted">{flick.mock || flick.landingSheet ? "Demo collection" : "Flick preview"}</p></div></div>
      {selected && <img key={selected.image} src={selected.image} alt={`${title} — selected Flick variant`} className="max-h-[52dvh] w-full object-contain bg-fb-elev" />}
      <div className="px-4 py-5">
        <h2 className="break-words text-[22px] font-semibold">{title}</h2>
        {option?.price && <p className="mt-2 text-[20px] font-bold">{option.price}</p>}
        {flick.landingSheet && <p className="mt-3 text-[14px] leading-6 text-fb-muted">{flick.landingSheet.copy}</p>}
        {images.length > 1 && <div className="mt-4 flex gap-3 overflow-x-auto pb-2">{images.map((variant, i) => <Button key={variant.diff} variant="outline" aria-label={`View option ${i + 1}`} aria-pressed={variant === selected} onClick={() => { setPressed(false); setDestination({ flick, diff: variant.diff }, true); }} className="h-16 w-16 shrink-0 overflow-hidden rounded-md p-0 aria-pressed:ring-2 aria-pressed:ring-fb-blue"><img src={variant.image} alt="" className="h-full w-full object-cover" /></Button>)}</div>}
        {option?.price && !flick.mock && <p className="mt-2 text-[12px] text-fb-muted">Demo price</p>}
        {flick.landingSheet && <Button aria-pressed={pressed} onClick={() => setPressed(v => !v)} className="mt-5 w-full bg-fb-blue text-fb-card hover:bg-fb-blue/90">{pressed ? "Saved" : flick.landingSheet.button}</Button>}
      </div>
    </div>
  </div>}</BrowserContext.Provider></VariantContext.Provider>;
}