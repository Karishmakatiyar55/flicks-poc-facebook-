import { THREADS, ME, type Flick, type Thread } from "@/data/feed";
import { Avatar } from "./Avatar";
import { FlickEmbed } from "./FlickEmbed";
import { FlickCta } from "./FlickCta";
import { Camera, Chevron, Verified } from "./Icons";

function SharedPost({ flick }: { flick: Flick }) {
  return <div className="w-[250px] overflow-hidden rounded-2xl bg-ig-elev">
    <div className="flex items-center gap-2 px-3 py-2"><Avatar logo={flick.logo} monogram={flick.monogram ?? flick.brand} size={24} /><span className="flex items-center gap-1 text-[13px] font-semibold">{flick.brand}<Verified /></span></div>
    <FlickEmbed id={flick.flickId} aspect="1/1" />
    <div className="px-3 py-2 text-[13px]"><span className="mr-1 font-semibold">{flick.brand}</span>{flick.caption}</div>
  </div>;
}

/** The sponsored card carries the Flick; its one action sits below it as a separate pill. */
function SponsoredCard({ flick }: { flick: Flick }) {
  return <div className="flex w-[260px] flex-col items-start gap-2">
    <div className="w-full overflow-hidden rounded-2xl bg-ig-elev">
      <div className="px-3 pt-2 text-[11px] text-ig-muted">Sponsored</div>
      <div className="mt-1"><FlickEmbed id={flick.flickId} aspect="1/1" /></div>
      <div className="px-3 py-2 text-[13px]">{flick.caption}</div>
    </div>
    <FlickCta flick={flick} chevron={false} className="h-9 rounded-full bg-ig-blue px-5 text-[14px] font-semibold text-ig-fg hover:bg-ig-blue/90" />
  </div>;
}

function ThreadView({ thread, onBack }: { thread: Thread; onBack: () => void }) {
  return <div className="flex h-full flex-col">
    <header className="flex h-[54px] shrink-0 items-center gap-2 border-b border-ig-sep px-2">
      <button aria-label="Back" onClick={onBack} className="p-2"><Chevron size={22} className="rotate-180" /></button>
      <Avatar src={thread.avatar} logo={thread.logo} monogram={thread.monogram} size={32} />
      <div className="leading-tight"><div className="flex items-center gap-1 text-[14px] font-semibold">{thread.name}{thread.sponsored && <Verified />}</div><div className="text-[12px] text-ig-muted">{thread.sponsored ? "Sponsored" : thread.username}</div></div>
    </header>
    <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-4">
      {thread.messages.map((m, i) => <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
        {"text" in m ? <div className={`max-w-[75%] rounded-[20px] px-3.5 py-2 text-[14px] ${m.from === "me" ? "bg-ig-blue" : "bg-ig-elev"}`}>{m.text}</div>
          : <div data-placement={`dm-${thread.id}`} className="relative rounded-2xl">{"share" in m ? <SharedPost flick={m.share} /> : <SponsoredCard flick={m.sponsored} />}</div>}
      </div>)}
    </div>
    <div className="m-3 flex h-11 shrink-0 items-center gap-2 rounded-full bg-ig-elev px-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-ig-blue"><Camera size={18} /></span><span className="text-[14px] text-ig-muted">Message…</span></div>
  </div>;
}

export function MessagesTab({ thread, onThread }: { thread: string | null; onThread: (id: string | null) => void }) {
  const open = THREADS.find((t) => t.id === thread);
  if (open) return <ThreadView thread={open} onBack={() => onThread(null)} />;
  return <div className="no-scrollbar h-full overflow-y-auto overscroll-contain">
    <header className="flex h-[50px] items-center px-4 text-[20px] font-bold">{ME.username}<Chevron size={14} className="ml-1 mt-1 rotate-90" /></header>
    <div className="px-4 pb-2"><div className="flex h-9 items-center rounded-lg bg-ig-elev px-3 text-[15px] text-ig-muted">Search</div></div>
    <div className="flex items-center justify-between px-4 py-2 text-[15px] font-semibold"><span>Messages</span><span className="text-[14px] font-normal text-ig-muted">Requests</span></div>
    {THREADS.map((t) => <button key={t.id} onClick={() => onThread(t.id)} className="flex w-full items-center gap-3 px-4 py-2 text-left">
      <Avatar src={t.avatar} logo={t.logo} monogram={t.monogram} size={56} />
      <div className="min-w-0 flex-1">
        <div className={`flex items-center gap-1 text-[14px] ${t.unread ? "font-semibold" : ""}`}>{t.name}{t.sponsored && <Verified />}</div>
        <div className={`truncate text-[13px] ${t.unread ? "font-semibold text-ig-fg" : "text-ig-muted"}`}>{t.preview} · {t.time}</div>
      </div>
      {t.unread && <span className="h-2 w-2 rounded-full bg-ig-blue" />}
    </button>)}
  </div>;
}
