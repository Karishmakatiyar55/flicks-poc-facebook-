import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type SetStateAction } from "react";

type Values = Record<string, unknown>;
type ScrollPoint = { path: number[]; top: number; left: number };
type Milestone = { values: Values; scroll: ScrollPoint[] };
type Navigation = { values: Values; change: (key: string, initial: unknown, next: unknown, replace: boolean) => void; back: () => void };
const Context = createContext<Navigation | null>(null);

function capture(root: HTMLElement | null): ScrollPoint[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>("*")).filter(el => el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth).map(el => {
    const path: number[] = [];
    let node: Element | null = el;
    while (node && node !== root) {
      const parent: Element | null = node.parentElement;
      if (!parent) break;
      path.unshift(Array.from(parent.children).indexOf(node));
      node = parent;
    }
    return { path, top: el.scrollTop, left: el.scrollLeft };
  });
}

export function PrototypeNavigationProvider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Values>({});
  const entries = useRef<Milestone[]>([{ values: {}, scroll: [] }]);
  const index = useRef(0);
  const pending = useRef<ScrollPoint[] | null>(null);
  const session = useRef("");
  useEffect(() => {
    session.current = crypto.randomUUID();
    const marker = (step: number) => ({ ...window.history.state, prototype: { session: session.current, step } });
    // Keep a same-page safety entry below the first milestone, including on mobile Back.
    window.history.replaceState(marker(-1), "");
    window.history.pushState(marker(0), "");
    const onPop = (event: PopStateEvent) => {
      const target = event.state?.prototype;
      // Embedded players can add joint-history entries without changing our milestone.
      if (target?.session === session.current && target.step === index.current) {
        window.history.back();
        return;
      }
      if (target?.session !== session.current || target.step < 0) {
        window.history.pushState(marker(index.current), "");
        return;
      }
      const entry = entries.current[target.step];
      if (!entry) return;
      const current = entries.current[index.current];
      if (current) current.scroll = capture(root.current);
      index.current = target.step;
      pending.current = entry.scroll;
      setValues(entry.values);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useLayoutEffect(() => {
    const points = pending.current;
    if (!points) return;
    pending.current = null;
    for (const point of points) {
      let node: Element | null = root.current;
      for (const child of point.path) node = node?.children.item(child) ?? null;
      if (node instanceof HTMLElement) { node.scrollTop = point.top; node.scrollLeft = point.left; }
    }
  }, [values]);
  const change = useCallback((key: string, initial: unknown, next: unknown, replace: boolean) => {
    const previous = entries.current[index.current];
    if (!previous) return;
    if (Object.is(previous.values[key] ?? initial, next)) return;
    previous.values = { ...previous.values, [key]: previous.values[key] ?? initial };
    previous.scroll = capture(root.current);
    const updated = { ...previous.values, [key]: next };
    if (replace) entries.current[index.current] = { values: updated, scroll: previous.scroll };
    else {
      entries.current = entries.current.slice(0, index.current + 1);
      entries.current.push({ values: updated, scroll: [] });
      index.current += 1;
      window.history.pushState({ ...window.history.state, prototype: { session: session.current, step: index.current } }, "");
    }
    setValues(updated);
  }, []);
  const back = useCallback(() => { if (index.current > 0) window.history.back(); }, []);
  return <Context.Provider value={{ values, change, back }}><div ref={root} className="contents">{children}</div></Context.Provider>;
}

export function usePrototypeState<T>(key: string, initial: T): [T, (next: SetStateAction<T>, replace?: boolean) => void] {
  const navigation = useContext(Context);
  const [local, setLocal] = useState(initial);
  const value = navigation && key in navigation.values ? navigation.values[key] as T : local;
  const set = (next: SetStateAction<T>, replace = false) => {
    const result = typeof next === "function" ? (next as (previous: T) => T)(value) : next;
    if (navigation) navigation.change(key, initial, result, replace);
    else setLocal(result);
  };
  return [value, set];
}

export function usePrototypeBack(fallback: () => void) {
  const navigation = useContext(Context);
  return navigation?.back ?? fallback;
}