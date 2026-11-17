import { Button } from "@/components/ui/button";
import type { Flick } from "@/data/feed";
import { Chevron } from "./Icons";
import { useInAppBrowser } from "./InAppBrowser";

export function FlickCta({ flick, className, option }: { flick: Flick; className: string; option?: { label: string; price?: string } | undefined }) {
  const open = useInAppBrowser();
  const content = <>{flick.cta}<Chevron size={16} /></>;
  return <Button data-fb-cta className={className} onClick={() => open(flick, option)}>{content}</Button>;
}
