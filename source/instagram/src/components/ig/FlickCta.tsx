import { Button } from "@/components/ui/button";
import type { Flick } from "@/data/feed";
import { Chevron } from "./Icons";
import { useInAppBrowser } from "./InAppBrowser";
import { getSelectedDiff } from "./flick-selection";

/** Our single CTA for a Flick; always opens the in-app browser. */
export function FlickCta({ flick, className, label, chevron = true }: { flick: Flick; className: string; label?: string; chevron?: boolean }) {
  const open = useInAppBrowser();
  return <Button className={className} onClick={(e) => { e.stopPropagation(); open({ flick, product: flick.skuByDiff?.[getSelectedDiff(flick.flickId) ?? "0"]?.label ?? flick.productName }); }}>{label ?? flick.cta}{chevron && <Chevron size={16} />}</Button>;
}
