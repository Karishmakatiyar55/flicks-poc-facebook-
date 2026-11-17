export type FlickCandidate = { key: string; distance: number; viewport: number; retained: boolean; priority: number };
export function selectFlicks(candidates: FlickCandidate[]) {
  return candidates.filter((c) => c.distance <= c.viewport * (c.retained ? 2 : 1))
    .sort((a, b) => b.priority - a.priority || a.distance - b.distance)
    .slice(0, 2).map((c) => c.key);
}
export function diffIdFromDetail(detail: unknown): string | null {
  if (!detail || typeof detail !== "object") return null;
  const d = detail as Record<string, unknown>;
  const id = d['diff'] ?? d['diffId'] ?? d['diff_id'];
  return typeof id === "string" || typeof id === "number" ? String(id) : null;
}
export function optionForDiff(id: string, seen: string[], mapping: Record<string, { label: string; price?: string }>, fallbackByOrder = false) {
  const ids = seen.includes(id) ? seen : [...seen, id];
  return { ids, option: mapping[id] ?? (fallbackByOrder ? mapping[String(ids.indexOf(id))] : undefined) ?? { label: `Option ${ids.indexOf(id) + 1}` } };
}export type AudibleCandidate = { key: string; visible: number; covered: boolean };
/** At most one Flick may be audible: the most visible uncovered mounted Flick, if at least half of it is on screen and the page is shown. */
export function selectAudible(candidates: AudibleCandidate[], pageHidden: boolean): string | null {
  if (pageHidden) return null;
  const best = candidates.filter((c) => !c.covered && c.visible >= 0.5).sort((a, b) => b.visible - a.visible)[0];
  return best ? best.key : null;
}
