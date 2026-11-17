import type { SVGProps } from "react";
type P = SVGProps<SVGSVGElement> & { size?: number; filled?: boolean };
const base = (size = 24) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

export const ThumbUp = ({ size, filled, ...p }: P) => (
  <svg {...base(size)} {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);
export const Heart = ({ size, filled, ...p }: P) => (
  <svg {...base(size)} {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938Z" />
  </svg>
);
export const Comment = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" /></svg>
);
export const Share = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M13 5.5 21 12l-8 6.5v-4C7 14.5 4 17 3 20c0-6 4-9.5 10-10Z" /></svg>
);
export const Globe = ({ size = 12, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" /></svg>
);
export const More = ({ size = 24, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="12" cy="12" r="1.5" /><circle cx="6" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" /></svg>
);
export const Messenger = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12.003 2.001a9.705 9.705 0 1 1 0 19.4 10.876 10.876 0 0 1-2.895-.384.798.798 0 0 0-.533.04l-1.984.876a.801.801 0 0 1-1.123-.708l-.054-1.78a.806.806 0 0 0-.27-.569 9.49 9.49 0 0 1-3.14-7.175 9.65 9.65 0 0 1 10-9.7Z" strokeWidth="1.74" />
    <path d="M17.79 10.132a.659.659 0 0 0-.962-.873l-2.556 2.05a.63.63 0 0 1-.758.002L11.06 9.47a1.576 1.576 0 0 0-2.277.42l-2.567 3.98a.659.659 0 0 0 .961.875l2.556-2.049a.63.63 0 0 1 .759-.002l2.452 1.84a1.576 1.576 0 0 0 2.278-.42Z" fill="currentColor" stroke="none" />
  </svg>
);
export const Home = ({ size, filled, ...p }: P) => filled ? (
  <svg width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M22 23h-6.001a1 1 0 0 1-1-1v-5.455a2.997 2.997 0 1 0-5.993 0V22a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V11.543a1.002 1.002 0 0 1 .31-.724l10-9.543a1.001 1.001 0 0 1 1.38 0l10 9.543a1.002 1.002 0 0 1 .31.724V22a1 1 0 0 1-1 1Z" /></svg>
) : (
  <svg {...base(size)} {...p}><path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005Z" /></svg>
);
export const Friends = ({ size, filled, ...p }: P) => (
  <svg {...base(size)} {...p} fill={filled ? "currentColor" : "none"}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
export const Video = ({ size, filled, ...p }: P) => (
  <svg {...base(size)} {...p} fill={filled ? "currentColor" : "none"}><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M10 9.5v5l4.5-2.5Z" fill={filled ? "var(--fb-card)" : "currentColor"} stroke="none" /></svg>
);
export const Store = ({ size, filled, ...p }: P) => (
  <svg {...base(size)} {...p} fill={filled ? "currentColor" : "none"}><path d="M3 9.5 4.5 4h15L21 9.5M3 9.5V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9.5M3 9.5h18M9 21v-6h6v6" /></svg>
);
export const Bell = ({ size, filled, ...p }: P) => (
  <svg {...base(size)} {...p} fill={filled ? "currentColor" : "none"}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
);
export const Menu = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
);
export const Search = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z" /><line x1="16.511" x2="22" y1="16.511" y2="22" /></svg>
);
export const Plus = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>
);
export const Verified = ({ size = 12, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 40 40" {...p}><path fill="var(--fb-blue)" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" /></svg>
);
export const Mute = ({ size = 12, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M1.5 13.3c-.8 0-1.5.7-1.5 1.5v4.7c0 .8.7 1.5 1.5 1.5h3l6.2 4.3V9l-6.2 4.3Zm18.4-1.2 2.9-2.9a.9.9 0 0 0-1.3-1.3l-2.9 2.9-2.9-2.9a.9.9 0 0 0-1.3 1.3l2.9 2.9-2.9 2.9a.9.9 0 1 0 1.3 1.3l2.9-2.9 2.9 2.9a.9.9 0 0 0 1.3-1.3l2.9 2.9-2.9 2.9a.9.9 0 0 0 1.3 1.3Z" transform="translate(0 -6)" /></svg>
);
export const Chevron = ({ size = 16, ...p }: P) => (
  <svg {...base(size)} {...p}><polyline points="9 6 15 12 9 18" /></svg>
);
export const Back = ({ size = 24, ...p }: P) => (
  <svg {...base(size)} {...p}><polyline points="15 18 9 12 15 6" /></svg>
);
export const Close = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><line x1="20" x2="4" y1="4" y2="20" /><line x1="4" x2="20" y1="4" y2="20" /></svg>
);
export const Bookmark = ({ size, filled, ...p }: P) => (
  <svg {...base(size)} {...p} fill={filled ? "currentColor" : "none"}><polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21" /></svg>
);
