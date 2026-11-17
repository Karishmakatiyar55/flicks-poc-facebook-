import { useEffect, useRef, useState } from "react";
import { CHATS, ME, type Chat, type SellerChat } from "@/data/feed";
import { Avatar } from "./Avatar";
import { Back, Chevron, Plus, Search, ThumbUp } from "./Icons";
import { FlickEmbed } from "./FlickEmbed";
import { FlickCta } from "./FlickCta";
import { Button } from "@/components/ui/button";

function ChatRow({ chat, onOpen }: { chat: Chat; onOpen: (c: Chat) => void }) {
  return (
    <button onClick={() => onOpen(chat)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-fb-bg">
      <Avatar src={chat.avatar} logo={chat.sponsored ? chat.flick?.logo : undefined} monogram={chat.monogram} size={52} />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[15px] font-medium">{chat.name}</div>
        <div className={`truncate text-[13px] ${chat.sponsored ? "text-fb-muted" : "text-fb-muted"}`}>
          {chat.preview}
        </div>
      </div>
      <span className="shrink-0 text-[12px] text-fb-muted">{chat.time}</span>
    </button>
  );
}

function ChatList({ onOpen, onClose }: { onOpen: (c: Chat) => void; onClose: () => void }) {
  return (
    <>
      <header className="flex h-[56px] shrink-0 items-center gap-2 border-b border-fb-sep px-2">
        <Button variant="ghost" size="icon" aria-label="Back to Facebook" onClick={onClose} className="hover:bg-fb-elev"><Back size={24} /></Button>
        <Avatar src={ME.avatar} size={32} />
        <span className="flex-1 text-[22px] font-bold">Chats</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fb-elev"><Search size={18} /></span>
      </header>
      <div className="px-3 py-2"><div className="flex h-9 items-center rounded-full bg-fb-elev px-3 text-[14px] text-fb-muted">Search</div></div>
      <div className="no-scrollbar flex-1 overflow-y-auto pb-4">
        {CHATS.map((c) => <ChatRow key={c.id} chat={c} onOpen={onOpen} />)}
      </div>
    </>
  );
}

function SponsoredThread({ chat, onBack }: { chat: Chat; onBack: () => void }) {
  const flick = chat.flick;
  return (
    <>
      <header className="flex h-[56px] shrink-0 items-center gap-2 border-b border-fb-sep px-2">
        <Button variant="ghost" size="icon" aria-label="Back to chats" onClick={onBack} className="hover:bg-fb-elev"><Back size={24} /></Button>
        <Avatar src={chat.avatar} logo={chat.sponsored ? flick?.logo : undefined} monogram={chat.monogram} size={36} />
        <div className="flex-1 leading-tight"><div className="text-[15px] font-semibold">{chat.name}</div><div className="text-[12px] text-fb-muted">{chat.shared ? "Messenger" : chat.sponsored ? "Sponsored" : "Active now"}</div></div>
      </header>
      <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-4">
        {chat.shared && <p className="mb-3 ml-10 w-3/4 rounded-2xl bg-fb-elev px-3 py-2 text-[14px]">Saw this and thought of you!</p>}
        {flick ? <div className="flex items-end gap-2">
          <Avatar logo={chat.sponsored || chat.shared ? flick.logo : undefined} monogram={chat.shared ? flick.displayName : chat.monogram} size={28} />
          <div data-placement={`message-${chat.id}`} className="w-[78%] overflow-hidden rounded-2xl border border-fb-sep bg-fb-card">
            <FlickEmbed id={flick.flickId} aspect={flick.aspect} priority={9} />
            <div className="px-3 py-2">
              <div className="text-[14px] font-semibold">{flick.productName ?? flick.linkHeadline ?? flick.displayName}</div>
              <div className="text-[12px] text-fb-muted">{flick.linkDomain} </div>
            </div>
            <FlickCta flick={flick} className="h-11 w-full rounded-none border-t border-fb-sep bg-fb-card text-fb-blue hover:bg-fb-elev" />
          </div>
        </div> : <p className="rounded-2xl bg-fb-elev p-3 text-[14px]">{chat.preview}</p>}
        {chat.shared && <p className="mt-3 ml-10 w-3/4 rounded-2xl bg-fb-elev px-3 py-2 text-[14px]">What do you think?</p>}
        <div className="mt-1 pl-10 text-[11px] text-fb-muted">{chat.time}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2 px-3 pb-4 pt-1">
        <span className="text-fb-blue"><Plus size={24} /></span>
        <div className="flex h-9 flex-1 items-center rounded-full bg-fb-elev px-3 text-[14px] text-fb-muted">Aa</div>
        <span className="text-fb-blue"><ThumbUp size={22} /></span>
      </div>
    </>
  );
}

type Line = { from: "me" | "seller"; text: string };
const QUICK = [
  { key: "order", label: "Place order", ask: "Yes, please reserve one for me." },
  { key: "delivery", label: "Ask about delivery", ask: "How long does delivery take?" },
  { key: "offer", label: "Make an offer", ask: "Is there any room on the price?" },
] as const;

/** Chat with a Marketplace seller, opened from a listing. It starts with the option picked in the Flick. */
function SellerThread({ chat, onBack }: { chat: SellerChat; onBack: () => void }) {
  const { flick, label, price, image } = chat;
  const cost = price ?? "the listed price";
  const answers: Record<(typeof QUICK)[number]["key"], string> = {
    order: `Done. One ${label} is reserved for you at ${cost}. You will get the order details here shortly.`,
    delivery: "Standard shipping is free and takes 3 to 5 days. You will get tracking as soon as it ships.",
    offer: `The price is ${cost}, and that already includes free shipping and returns.`,
  };
  const [lines, setLines] = useState<Line[]>([{ from: "me", text: `Hi! I'd like to order the ${label}. Is it available, and do you ship?` }]);
  const [typing, setTyping] = useState(true);
  const [used, setUsed] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reply = (text: string) => { setTyping(true); timers.current.push(setTimeout(() => { setTyping(false); setLines(l => [...l, { from: "seller", text }]); }, 1300)); };
  useEffect(() => {
    reply(`Yes! The ${label} is in stock. It's ${cost} with free shipping, and it arrives by Friday. Shall I reserve one for you?`);
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
    // The opening reply is sent once per chat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [lines, typing]);
  const say = (text: string, answer: string) => { if (typing) return; setLines(l => [...l, { from: "me", text }]); reply(answer); };
  const send = () => { const text = draft.trim(); if (!text || typing) return; setDraft(""); say(text, "Thanks for your message. We will get back to you here shortly."); };
  const open = QUICK.filter(q => !used.includes(q.key) && !used.includes("order"));
  return (
    <>
      <header className="flex h-[56px] shrink-0 items-center gap-2 border-b border-fb-sep px-2">
        <Button variant="ghost" size="icon" aria-label="Back to listing" onClick={onBack} className="hover:bg-fb-elev"><Back size={24} /></Button>
        <Avatar logo={flick.logo} monogram={flick.displayName} size={36} />
        <div className="min-w-0 flex-1 leading-tight"><div className="truncate text-[15px] font-semibold">{flick.displayName}</div><div className="truncate text-[12px] text-fb-muted">Marketplace · Typically replies within an hour</div></div>
      </header>
      <div className="flex shrink-0 items-center gap-3 border-b border-fb-sep bg-fb-bg px-3 py-2">
        {image && <img src={image} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover" />}
        <div className="min-w-0 flex-1 leading-tight"><div className="truncate text-[14px] font-semibold">{label}</div><div className="truncate text-[12px] text-fb-muted">{price ? price + " · " : ""}San Francisco, CA</div></div>
        <button onClick={onBack} className="shrink-0 text-[14px] font-semibold text-fb-blue">View listing</button>
      </div>
      <div data-seller-thread className="no-scrollbar flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-3">
        <div className="pb-1 text-center text-[12px] text-fb-muted">You started a chat about this listing</div>
        <div className="ml-auto w-[62%] overflow-hidden rounded-2xl bg-fb-blue text-fb-card">
          {image && <img src={image} alt="" className="aspect-[4/3] w-full bg-fb-elev object-cover" />}
          <div className="px-3 py-2 leading-tight"><div className="text-[12px] opacity-80">Variant I picked</div><div className="text-[15px] font-semibold">{label}</div></div>
        </div>
        {lines.map((line, i) => line.from === "me"
          ? <p key={i} className="ml-auto max-w-[78%] rounded-2xl bg-fb-blue px-3 py-2 text-[14px] leading-5 text-fb-card">{line.text}</p>
          : <div key={i} className="flex max-w-[84%] items-end gap-2"><Avatar logo={flick.logo} monogram={flick.displayName} size={28} /><p className="rounded-2xl bg-fb-elev px-3 py-2 text-[14px] leading-5">{line.text}</p></div>)}
        {typing && <div className="flex items-end gap-2"><Avatar logo={flick.logo} monogram={flick.displayName} size={28} /><span aria-label="Typing" className="flex gap-1 rounded-2xl bg-fb-elev px-3 py-3">{[0, 1, 2].map(i => <i key={i} className="h-1.5 w-1.5 animate-pulse rounded-full bg-fb-muted" style={{ animationDelay: `${i * 150}ms` }} />)}</span></div>}
        {!typing && open.length > 0 && <div className="flex flex-wrap gap-2 pl-9 pt-1">
          {open.map((q, i) => <button key={q.key} onClick={() => { setUsed(u => [...u, q.key]); say(q.ask, answers[q.key]); }} className={`h-9 rounded-full px-4 text-[14px] font-semibold ${i === 0 && q.key === "order" ? "bg-fb-blue text-fb-card" : "border border-fb-blue text-fb-blue"}`}>{q.label}</button>)}
        </div>}
        <div ref={end} />
      </div>
      <form onSubmit={e => { e.preventDefault(); send(); }} className="flex shrink-0 items-center gap-2 px-3 pb-4 pt-1">
        <span className="text-fb-blue"><Plus size={24} /></span>
        <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Aa" aria-label="Message" className="h-9 min-w-0 flex-1 rounded-full bg-fb-elev px-3 text-[16px] outline-none placeholder:text-fb-muted" />
        {draft.trim() ? <button type="submit" className="text-[15px] font-semibold text-fb-blue">Send</button> : <span className="text-fb-blue"><ThumbUp size={22} /></span>}
      </form>
    </>
  );
}

export function Messenger({ onClose, thread, setThread, seller = null }: { onClose: () => void; thread: Chat | null; setThread: (chat: Chat | null) => void; seller?: SellerChat | null }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-fb-card text-fb-fg">
      {seller ? <SellerThread key={seller.flick.id + seller.label} chat={seller} onBack={onClose} /> : thread ? <SponsoredThread chat={thread} onBack={() => setThread(null)} /> : <ChatList onOpen={setThread} onClose={onClose} />}
    </div>
  );
}
