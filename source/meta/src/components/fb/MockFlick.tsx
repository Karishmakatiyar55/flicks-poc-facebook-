import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Flick } from "@/data/feed";

export function MockFlick({ flick, onChange }: { flick: Flick; onChange: (id: string) => void }) {
  const [selected, setSelected] = useState(0);
  return <div data-mock-flick className="relative aspect-square w-full overflow-hidden bg-fb-elev">
    {flick.mockVariants?.map((variant, i) => <img key={variant.image} src={variant.image} alt={`${flick.productName}, sweater ${i + 1}`} width={1024} height={1024} className={`mock-flick-image absolute inset-0 h-full w-full object-cover ${selected === i ? "opacity-100" : "opacity-0"}`} />)}
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-3">
      {flick.mockVariants?.map((variant, i) => <Button key={variant.thumbnail} variant="ghost" aria-label={`Sweater ${i + 1}`} aria-pressed={selected === i} onClick={() => { setSelected(i); onChange(String(i)); }} className={`pointer-events-auto h-14 w-14 overflow-hidden rounded-full border-2 bg-fb-card p-0 shadow-md hover:bg-fb-card ${selected === i ? "border-fb-blue ring-2 ring-fb-card" : "border-fb-card"}`}><img src={variant.thumbnail} alt="" width={1024} height={1024} className="h-full w-full object-cover" /></Button>)}
    </div>
  </div>;
}