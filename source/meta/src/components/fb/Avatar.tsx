export function Avatar({ src = "", logo, monogram, size = 32 }: { src?: string | undefined; logo?: string | undefined; monogram?: string | undefined; size?: number }) {
  if (logo) return <img src={logo} alt={monogram ? `${monogram} profile` : "Brand profile"} width={size} height={size} className="shrink-0 rounded-full object-cover ring-1 ring-fb-avatar-ring" style={{ width: size, height: size }} />;
  if (monogram) return <div className="flex shrink-0 items-center justify-center rounded-full bg-fb-elev font-semibold text-fb-monogram" style={{ width: size, height: size, fontSize: size * .45 }}>{monogram.charAt(0).toUpperCase()}</div>;
  return <img src={src} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
}
