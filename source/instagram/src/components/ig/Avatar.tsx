export function Avatar({ src = "", logo, monogram, size = 32, ring, seen }: { src?: string | undefined; logo?: string | undefined; monogram?: string | undefined; size?: number; ring?: boolean | undefined; seen?: boolean | undefined }) {
  if (logo) {
    const img = <img src={logo} alt="" width={size} height={size} className="h-full w-full rounded-full border border-ig-sep object-cover" />;
    if (!ring) return <div className="shrink-0 rounded-full" style={{ width: size, height: size }}>{img}</div>;
    return <div className={`shrink-0 rounded-full p-[2px] ${seen ? "bg-ig-sep" : "story-ring"}`} style={{ width: size + 8, height: size + 8 }}><div className="h-full w-full rounded-full bg-ig-bg p-[2px]">{img}</div></div>;
  }
  if (monogram) return <div className={`shrink-0 rounded-full ${ring ? "story-ring p-[4px]" : ""}`} style={{ width: size + (ring ? 8 : 0), height: size + (ring ? 8 : 0) }}><div className="flex h-full w-full items-center justify-center rounded-full bg-ig-sep font-semibold text-ig-monogram" style={{ fontSize: size * .45 }}>{monogram.charAt(0).toUpperCase()}</div></div>;
  if (!ring) return <img src={src} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <div className={`shrink-0 rounded-full p-[2px] ${seen ? "bg-ig-sep" : "story-ring"}`} style={{ width: size + 8, height: size + 8 }}>
      <div className="h-full w-full rounded-full bg-ig-bg p-[2px]">
        <img src={src} alt="" className="h-full w-full rounded-full object-cover" />
      </div>
    </div>
  );
}
