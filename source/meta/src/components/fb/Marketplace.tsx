import { useRef, useState } from "react";
import { MARKETPLACE_ITEMS, type Flick, type Listing, type SellerChat } from "@/data/feed";
import { Avatar } from "./Avatar";
import { Back, Bookmark, Chevron, Comment, More, Search, Share } from "./Icons";
import { FlickEmbed } from "./FlickEmbed";
import { FlickCta } from "./FlickCta";
import { diffIdFromDetail, optionForDiff } from "./flick-policy";
import { Button } from "@/components/ui/button";
import { MockFlick } from "./MockFlick";
import { useRememberFlickVariant } from "./InAppBrowser";
import { MarketplacePreview } from "./MarketplacePreview";

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg bg-fb-card">
      <div className="relative aspect-square w-full overflow-hidden bg-fb-elev"><img src={listing.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /></div>
      <div className="p-2">
        <div className="text-[15px] font-semibold">{listing.price}</div>
        <div className="min-h-8 whitespace-normal break-words text-[13px] leading-4">{listing.title}</div>
        <div className="text-[12px] text-fb-muted">{listing.location}</div>
      </div>
    </div>
  );
}

function SponsoredTile({ flick, onOpen }: { flick: Flick; onOpen: () => void }) {
  return (
    <Button variant="ghost" onClick={onOpen} aria-label={`Open ${flick.displayName} listing`} className="h-auto min-w-0 flex-col items-stretch justify-start gap-0 overflow-hidden rounded-lg bg-fb-card p-0 text-left hover:bg-fb-card">
      <div className="relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden bg-fb-elev">
        <MarketplacePreview flick={flick} />
      </div>
      <div className="p-2">
        <div className="text-[15px] font-semibold">{flick.skuByDiff?.["0"]?.price}</div>
        <div className="min-h-8 whitespace-normal break-words text-[13px] leading-4">{flick.productName}</div>
        <div className="whitespace-normal text-[12px] text-fb-muted">Sponsored · {flick.displayName}</div>
      </div>
    </Button>
  );
}

function ListingDetail({ flick, onBack, onMessage }: { flick: Flick; onBack: () => void; onMessage: (chat: SellerChat) => void }) {
  const picked = useRef(0);
  const rememberVariant = useRememberFlickVariant();
  const [option, setOption] = useState<{ label: string; price?: string }>(flick.skuByDiff?.["0"] ?? { label: "" });
  const [change, setChange] = useState(0);
  const [saved, setSaved] = useState(false);
  const seen = useRef<string[]>([]);
  const onEvent = (type: string, detail: unknown) => {
    if (type !== "vertex-diff-change") return;
    console.log("[flick-diff]", flick.flickId, JSON.stringify(detail));
    const id = diffIdFromDetail(detail);
    if (id === null) return;
    const result = optionForDiff(id, seen.current, flick.skuByDiff ?? {}, true);
    seen.current = result.ids;
    picked.current = Number.isInteger(Number(id)) ? Number(id) : result.ids.indexOf(id);
    setOption(result.option); setChange((n) => n + 1);
  };
  const messageSeller = () => {
    const image = flick.previewThumbnails?.[picked.current] ?? flick.mockVariants?.[picked.current]?.thumbnail ?? flick.thumbnail;
    onMessage({ flick, label: option.label || flick.productName || flick.displayName || "",...(option.price ? { price: option.price } : {}), ...(image ? { image } : {}) });
  };
  const rowBtn = "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-fb-elev text-[14px] font-semibold text-fb-fg";
  return (
    <div data-placement={`listing-${flick.id}`} className="no-scrollbar h-full overflow-y-auto bg-fb-card">
      <header className="sticky top-0 z-20 flex h-[48px] items-center gap-2 bg-fb-card px-2">
        <Button variant="ghost" size="icon" aria-label="Back" onClick={onBack} className="hover:bg-fb-elev"><Back size={24} /></Button>
        <span className="text-[17px] font-semibold">Listing</span>
      </header>
      {flick.mock ? <MockFlick flick={flick} onChange={id => { picked.current = Number(id) || 0; rememberVariant(flick.flickId, { diff: id }); setOption(flick.skuByDiff?.[id] ?? { label: "" }); setChange(n => n + 1); }} /> : <FlickEmbed id={flick.flickId} aspect={flick.aspect} priority={8} onEvent={onEvent} />}
      <div className="space-y-1 px-3 pt-3">
        <div className="text-[17px] font-semibold">{flick.productName}</div>
        <div key={change} className="flick-row-pop text-[17px] font-bold">{option.price}</div>
        <div className="flex items-center gap-1 text-[13px] text-fb-muted">Sponsored · {flick.displayName} </div>
      </div>
      <div className="px-3 pt-3">
        <FlickCta flick={flick} option={option} className="flex h-10 w-full justify-center gap-1 rounded-lg bg-fb-blue text-[15px] font-semibold text-fb-card hover:bg-fb-blue/90 aria-pressed:bg-fb-blue/70" />
      </div>
      <div className="flex gap-2 px-3 py-3">
        <button onClick={() => messageSeller()} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-fb-blue text-[14px] font-semibold text-fb-card"><Comment size={18} />Message</button>
        <button aria-pressed={saved} onClick={() => setSaved((s) => !s)} className={rowBtn}><Bookmark size={18} filled={saved} />{saved ? "Saved" : "Save"}</button>
        <button className={rowBtn}><Share size={18} />Share</button>
      </div>
      <div className="border-t border-fb-sep px-3 py-3">
        <div className="text-[15px] font-semibold">Details</div>
        <p className="mt-1 text-[14px] leading-5 text-fb-muted">Listed by {flick.displayName} in San Francisco, CA. {flick.caption}</p>
        <div className="mt-3 flex items-center gap-2.5">
          <Avatar logo={flick.logo} monogram={flick.displayName} size={40} />
          <div className="leading-tight"><div className="text-[14px] font-semibold">{flick.displayName}</div><div className="text-[12px] text-fb-muted">Joined Facebook in 2012</div></div>
          <Chevron size={16} className="ml-auto text-fb-muted" />
        </div>
      </div>
    </div>
  );
}

export function MarketplaceTab({ open, setOpen, onMessage }: { open: Flick | null; setOpen: (flick: Flick | null) => void; onMessage: (chat: SellerChat) => void }) {
  if (open) return <ListingDetail key={open.flickId} flick={open} onBack={() => setOpen(null)} onMessage={onMessage} />;
  return (
    <div className="no-scrollbar h-full overflow-y-auto bg-fb-bg">
      <header className="sticky top-0 z-20 flex h-[52px] items-center justify-between bg-fb-card px-4">
        <span className="text-[22px] font-bold">Marketplace</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fb-elev"><Search size={18} /></span>
      </header>
      <div className="flex gap-2 bg-fb-card px-3 pb-2">
        <button className="rounded-full bg-fb-elev px-3.5 py-1.5 text-[14px] font-semibold">Sell</button>
        <button className="rounded-full bg-fb-elev px-3.5 py-1.5 text-[14px] font-semibold">Categories</button>
        <button aria-label="More" className="ml-auto p-1 text-fb-muted"><More size={20} /></button>
      </div>
      <div className="px-3 pb-1 pt-3 text-[17px] font-semibold">Today's picks</div>
      <div className="grid grid-cols-2 gap-2 p-2">
        {MARKETPLACE_ITEMS.map(item => item.kind === "flick" ? <SponsoredTile key={item.flick.id} flick={item.flick} onOpen={() => setOpen(item.flick)} /> : <ListingCard key={item.listing.id} listing={item.listing} />)}
      </div>
    </div>
  );
}
