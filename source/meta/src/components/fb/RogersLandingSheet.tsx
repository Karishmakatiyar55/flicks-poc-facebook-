import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PAGE_AD } from "@/data/feed";
import { Avatar } from "./Avatar";
import { Close } from "./Icons";

export function RogersLandingSheet({ onClose }: { onClose: () => void }) {
  const [pressed, setPressed] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { close.current?.focus(); }, []);
  return <div role="dialog" aria-modal="true" aria-label="Rogers Football Club" onKeyDown={(e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Tab") {
      const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>("button");
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  }} className="animate-fb-sheet fixed inset-0 z-50 flex flex-col bg-fb-card text-fb-fg">
    <div className="relative flex h-14 shrink-0 items-center justify-center border-b border-fb-sep bg-fb-bg">
      <Button ref={close} variant="ghost" size="icon" aria-label="Close" onClick={onClose} className="absolute left-2 text-fb-fg hover:bg-fb-elev"><Close size={24} /></Button>
      <span className="text-[14px] font-semibold">{PAGE_AD.landingSheet?.address}</span>
    </div>
    <div className="flex flex-1 flex-col items-center px-6 pt-16 text-center">
      <Avatar monogram={PAGE_AD.brand} size={80} />
      <h1 className="mt-6 text-[24px] font-semibold">{PAGE_AD.displayName}</h1>
      <p className="mt-2 text-[14px] text-fb-muted">{PAGE_AD.location}</p>
      <p className="mt-8 max-w-[300px] text-[15px] leading-6">{PAGE_AD.landingSheet?.copy}</p>
      <Button aria-pressed={pressed} onClick={() => setPressed((value) => !value)} className="mt-6 h-11 w-full max-w-[300px] bg-fb-blue text-fb-card hover:bg-fb-blue/90 aria-pressed:bg-fb-blue/70">{PAGE_AD.landingSheet?.button}</Button>
    </div>
  </div>;
}
