import type { Flick } from "@/data/feed";

/** The one shared record of the last selected diff id per flickId, written by every live player. */
const selected = new Map<string, string>();
export const setSelectedDiff = (flickId: string, diff: string) => { selected.set(flickId, diff); };
export const getSelectedDiff = (flickId: string) => selected.get(flickId);
export const resetSelectedDiffs = () => selected.clear();

/** Landing page for the selected variant; falls back to the first thumbnail, then the Flick's single page. */
export function landingFor(flick: Flick, diff = getSelectedDiff(flick.flickId)): Flick {
  const list = flick.variants ?? {};
  const variant = (diff !== undefined ? list[diff] : undefined)
    ?? (diff === undefined ? Object.values(list).find((v) => v.position === 1) : undefined);
  return variant ? { ...flick, landingUrl: variant.url, snapshot: variant.snapshot } : flick;
}
