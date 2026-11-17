import { createContext, useContext, useLayoutEffect, type ReactNode } from "react";

export const FlickAudioBlockContext = createContext<() => () => void>(() => () => {});

// Blocks sound without reloading a creative underneath a sheet.
export function FlickAudioBlock({ children, blocked = true }: { children?: ReactNode; blocked?: boolean }) {
  const block = useContext(FlickAudioBlockContext);
  useLayoutEffect(() => blocked ? block() : undefined, [block, blocked]);
  return children;
}
