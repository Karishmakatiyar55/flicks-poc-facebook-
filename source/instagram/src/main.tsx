// Entry for the static (GitHub Pages) build. The page shell below is the Index component from
// the Lovable project's src/routes/index.tsx, unchanged.
import { createRoot } from "react-dom/client";
import { InstagramApp } from "@/components/ig/InstagramApp";
import "./styles.css";

function Index() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-ig-bg md:bg-ig-desk">
      {/* Phone frame on desktop, full-bleed on mobile */}
      <div className="relative h-[100dvh] w-full md:h-[min(860px,94vh)] md:w-[calc(min(860px,94vh)*0.4615)] md:rounded-[56px] md:bg-ig-frame md:p-[12px] md:shadow-[0_40px_120px_-20px_rgba(0,0,0,.8),inset_0_0_0_2px_rgba(255,255,255,.08)]">
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-ig-bg md:rounded-[44px]">
          <div className="hidden h-[50px] shrink-0 items-center justify-between px-8 pt-1 text-[15px] font-semibold text-ig-fg md:flex">
            <span>9:41</span>
            <span className="absolute left-1/2 top-[11px] h-[32px] w-[118px] -translate-x-1/2 rounded-full bg-ig-bg ring-1 ring-ig-frame" />
            <span className="flex items-center gap-1.5">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
              <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor"/><rect x="24" y="4" width="1.5" height="4" rx=".75" fill="currentColor" opacity=".4"/></svg>
            </span>
          </div>
          <div className="relative min-h-0 flex-1"><InstagramApp /></div>
          <div className="hidden h-[22px] shrink-0 md:block" />
          <div className="pointer-events-none absolute bottom-2 left-1/2 hidden h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-ig-fg md:block" />
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Index />);
