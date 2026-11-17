/**
 * FLICKS ON INSTAGRAM — MEDIA CONFIG (single source of truth).
 * Swap a production Flick slot by changing its flickId.
 * `embeddable` records whether the landing site allows framing (checked against its
 * X-Frame-Options / CSP frame-ancestors headers); false shows an honest stand-in page.
 * Organic images, videos, avatars and demo copy remain here.
 */
export type Flick = {
  id: string;
  flickId: string;
  aspect: "1/1" | "9/16";
  brand: string;
  /** Human brand name shown in the "Flicks formats" index. */
  brandName: string;
  displayName?: string;
  /** Letter shown in the monogram avatar; defaults to the handle's first letter. */
  monogram?: string;
  /** Optional brand profile image (public/logos/<name>.webp); falls back to the monogram. */
  logo?: string;
  location?: string;
  landingUrl?: string;
  landingSheet?: { address: string; copy: string; button: string };
  /** Landing site allows being framed in the in-app browser. */
  embeddable?: boolean;
  /** Phone-width capture of the real landing page (public/landing/), shown scrollable in the in-app browser. */
  snapshot?: string;
  /** Per-variant landing pages keyed by the player's diff id (observed by tapping each thumbnail).
   * Variants without an entry fall back to landingUrl/snapshot. */
  variants?: Record<string, LandingVariant>;
  productName?: string;
  tagTop?: string;
  skuByDiff?: Record<string, { label: string; price?: string }>;
  cta: string;
  caption: string;
  likes: number;
  comments: number;
};
/** position = thumbnail position in the Flick's own switcher (1-based); snapshot = public/landing/<flickId>-<position>.jpg. */
/** `snapshot` is a capture of that exact page; leave it out when there is none. */
export type LandingVariant = { position: number; url: string; snapshot?: string };
const variants = (flickId: string, rows: [position: number, diff: string, url: string][]) =>
  Object.fromEntries(rows.map(([position, diff, url]) => [diff, { position, url, snapshot: `/landing/${flickId}-${position}.jpg` }]));
const M = (id: number) => `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;
const U = (id: string, w = 1080) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const AV = (n: number) => `https://i.pravatar.cc/150?img=${n}`;
export const ME = { username: "alex.morgan", avatar: AV(12) };

export const STORY_AD: Flick = {
  id: "story-fashion", flickId: "typxqe",
  variants: variants("typxqe", [
    [1, "0", "https://www.zara.com/us/en/polka-dot-bomber-jacket-p08372236.html?v1=594401057&v2=2417772"],
    [2, "1", "https://www.zara.com/us/en/checked-bomber-jacket-p06318268.html?v1=590685516"],
    [3, "2", "https://www.zara.com/us/en/houndstooth-print-jacket-p05854708.html"],
  ]), aspect: "9/16", brand: "zara", logo: "/logos/zara.webp", brandName: "Zara",
  landingUrl: "https://www.zara.com/us/", snapshot: "/landing/zara.jpg", cta: "Shop now", caption: "New season, new favorites.", embeddable: false,
  likes: 0, comments: 0,
};

export const FEED_AD: Flick = {
  id: "feed-cayman", flickId: "cayman", aspect: "1/1", brand: "visitcaymanislands", logo: "/logos/cayman.webp", brandName: "Cayman Islands",
  displayName: "Cayman Islands", monogram: "C",
  landingUrl: "https://www.visitcaymanislands.com/", snapshot: "/landing/cayman.jpg", cta: "Book Now", caption: "Island time starts here.", embeddable: false,
  likes: 18422, comments: 312,
};

export const CREATOR_AD: Flick & { creator: string; creatorAvatar: string } = {
  id: "creator-collab", flickId: "gwhttp",
  variants: variants("gwhttp", [
    [3, "2", "https://www.topperzstore.com/new-era-los-angeles-dodgers-olive-edition-9forty-a-frame-trucker-snapback-hat"],
  ]), aspect: "1/1", brand: "neweracap", logo: "/logos/neweracap.webp", brandName: "New Era",
  landingUrl: "https://www.neweracap.com/collections/mlb-headwear", snapshot: "/landing/neweracap.jpg", cta: "Shop now", caption: "Game day, every day.", embeddable: false,
  likes: 42910, comments: 1204,
  creator: "jess.on.the.go", creatorAvatar: AV(47),
};

export const SHOPPING_AD: Flick & { productName: string; skuByDiff: Record<string, { label: string; price?: string }> } = {
  id: "shopping", flickId: "vq0vp6",
  variants: variants("vq0vp6", [
    [1, "0", "https://www.underarmour.com/en-us/p/heatgear_elite_womens_crop_mock_short_sleeve/6014710.html?dwvar_6014710_color=008&utm_source=flam&utm_medium=flicks&utm_campaign=ua_dawn_repeats&utm_content=black_008"],
    [2, "1", "https://www.underarmour.com/en-us/p/heatgear_elite_womens_crop_mock_short_sleeve/6014710.html?dwvar_6014710_color=600&utm_source=flam&utm_medium=flicks&utm_campaign=ua_dawn_repeats&utm_content=pink_600"],
    [3, "2", "https://www.underarmour.com/en-us/p/heatgear_elite_womens_crop_mock_short_sleeve/6014710.html?dwvar_6014710_color=394&utm_source=flam&utm_medium=flicks&utm_campaign=ua_dawn_repeats&utm_content=lime_394"],
  ]), aspect: "1/1", brand: "underarmour", logo: "/logos/underarmour.webp", brandName: "Under Armour",
  landingUrl: "https://www.underarmour.com/en-us/p/heatgear_elite_womens_crop_mock_short_sleeve/6014710.html?dwvar_6014710_color=008", snapshot: "/landing/underarmour.jpg", cta: "Shop now", caption: "Built for the work.", embeddable: false,
  likes: 9876, comments: 188,
  productName: "HeatGear Elite Crop Mock", tagTop: "20%",
  skuByDiff: { "0": { label: "HeatGear Elite Crop Mock", price: "$35.00" }, "1": { label: "HeatGear Elite Crop Mock", price: "$38.00" }, "2": { label: "HeatGear Elite Crop Mock", price: "$40.00" } },
};

export const REELS_AD: Flick = {
  id: "reels-auto", flickId: "sfb39l",
  // Thumbnail order in the Flick is dress, suit, floral dress; the suit reports diff 2 and the floral dress diff 1.
  variants: { "0": { position: 1, url: "https://www.net-a-porter.com/en-us/shop/product/gucci/clothing/midi-dresses/belted-satin-jacquard-midi-shirt-dress/46376663162893685" }, "2": { position: 2, url: "https://www.mytheresa.com/us/en/women/gucci-cotton-velvet-blazer-green-p01088130" } },
  skuByDiff: { "0": { label: "Belted satin jacquard midi shirt dress", price: "$3,850.00" }, "2": { label: "Cotton velvet blazer" }, "1": { label: "Flora print silk dress" } }, aspect: "9/16", brand: "gucci", logo: "/logos/gucci.webp", brandName: "Gucci",
  landingUrl: "https://www.gucci.com/us/en/ca/women/ready-to-wear-for-women/dresses-and-jumpsuits-for-women-c-women-readytowear-dresses", snapshot: "/landing/gucci.jpg", cta: "Shop now", caption: "A new chapter, in motion.", embeddable: false,
  likes: 128400, comments: 2301,
};

export const FEED_AD_2: Flick = {
  id: "feed-beauty", flickId: "tzed9x",
  variants: variants("tzed9x", [
    [1, "0", "https://www.ulta.com/p/macximal-silky-matte-lipstick-pimprod2043558?sku=2644466"],
    [2, "1", "https://www.ulta.com/p/almost-lipstick-in-black-honey-xlsImpprod10792007"],
    [3, "2", "https://www.ulta.com/p/matte-revolution-lipstick-pimprod2043355"],
  ]), aspect: "1/1", brand: "ultabeauty", logo: "/logos/ultabeauty.webp", brandName: "Ulta",
  landingUrl: "https://www.ulta.com/p/macximal-silky-matte-lipstick-pimprod2043558?sku=2644466", snapshot: "/landing/ulta.jpg",
  cta: "Shop now", caption: "Find yours.", embeddable: false, likes: 6421, comments: 94,
  productName: "MACximal Silky Matte Lipstick", tagTop: "16%",
  skuByDiff: { "0": { label: "MACximal Silky Matte Lipstick", price: "$25.00" }, "1": { label: "MACximal Silky Matte Lipstick", price: "$27.00" }, "2": { label: "MACximal Silky Matte Lipstick", price: "$29.00" } },
};
export const FEED_AD_3: Flick = {
  id: "feed-demo", flickId: "s87ukl", aspect: "1/1", brand: "rogersfc", logo: "/logos/rogersfc.webp", brandName: "Rogers FC",
  displayName: "Rogers Football Club", location: "Rogers FC Training Center",
  landingSheet: { address: "rogersfc.com", copy: "Train with the first team. Open sessions every Saturday.", button: "Book a session" },
  cta: "Tap to explore", caption: "One club. One team.", embeddable: false, likes: 3204, comments: 57,
};
export const REELS_AD_2: Flick = {
  id: "reels-ram", flickId: "cx5dwz",
  variants: variants("cx5dwz", [
    [1, "0", "https://www.ramtrucks.com/ram-1500/features.html"],
    [2, "1", "https://www.ramtrucks.com/ram-1500/trx/design.html"],
    [3, "2", "https://www.ramtrucks.com/ram-1500/design.html"],
  ]), aspect: "9/16", brand: "ramtrucks", logo: "/logos/ramtrucks.webp", brandName: "Ram Trucks",
  landingUrl: "https://www.ramtrucks.com/", snapshot: "/landing/ram.jpg",
  cta: "Explore", caption: "Built to go further.", embeddable: false, likes: 28400, comments: 309,
};

const sku = (label: string, prices: string[]) => Object.fromEntries(prices.map((price, i) => [String(i), { label, price }]));
export const COACH_AD: Flick = {
  id: "feed-coach", flickId: "d81eio", aspect: "1/1", brand: "coach", logo: "/logos/coach.webp", brandName: "Coach",
  // Three different bags, one per thumbnail, each with its own coach.com product page.
  variants: { "0": { position: 1, url: "https://www.coach.com/products/tabby-shoulder-bag-26/CCX04-B4POP.html", snapshot: "/landing/coach.jpg" }, "1": { position: 2, url: "https://www.coach.com/products/belted-ergo-shoulder-bag-26-in-signature-jacquard/CEN87-B4Z38.html" }, "2": { position: 3, url: "https://www.coach.com/products/rogue-bag-31/CCX23-B4MPL.html" } },
  landingUrl: "https://www.coach.com/products/tabby-shoulder-bag-26/CCX04-B4POP.html", snapshot: "/landing/coach.jpg",
  cta: "Shop now", caption: "Made to be carried.", embeddable: false, likes: 21840, comments: 402,
  productName: "Tabby Shoulder Bag 26", tagTop: "18%", skuByDiff: { "0": { label: "Tabby Shoulder Bag 26", price: "$475.00" }, "1": { label: "Belted Ergo Shoulder Bag 26", price: "$295.00" }, "2": { label: "Rogue Bag 31", price: "$795.00" } },
};
export const SAMSUNG_AD: Flick = {
  id: "feed-samsung", flickId: "yux3w1",
  variants: variants("yux3w1", [
    [1, "0", "https://www.samsung.com/us/smartphones/galaxy-s26/buy/galaxy-s26-512gb-unlocked-sku-sm-s942uzdfxaa/"],
    [2, "1", "https://www.samsung.com/us/smartphones/galaxy-s26/buy/galaxy-s26-512gb-unlocked-sku-sm-s942uzvfxaa/"],
    [3, "2", "https://www.samsung.com/us/smartphones/galaxy-s26/buy/galaxy-s26-512gb-unlocked-sku-sm-s942uzkfxaa/"],
  ]), aspect: "1/1", brand: "samsung", logo: "/logos/samsung.webp", brandName: "Samsung",
  landingUrl: "https://www.samsung.com/us/smartphones/galaxy-s26/buy/galaxy-s26-512gb-unlocked-sku-sm-s942uzdfxaa/", snapshot: "/landing/samsung.jpg",
  cta: "Shop now", caption: "Meet the new Galaxy.", embeddable: true, likes: 64210, comments: 1890,
  productName: "Galaxy S26 512GB Unlocked", tagTop: "6%", skuByDiff: sku("Galaxy S26 512GB Unlocked", ["$999.99", "$1,099.99", "$1,199.99"]),
};
export const AVEENO_AD: Flick = {
  id: "explore-aveeno", flickId: "um792g",
  variants: variants("um792g", [
    [1, "0", "https://aveeno.com/products/daily-moisturizing"],
    [2, "1", "https://neutrogena.com/products/neutrogena-hydro-boost-hyaluronic-acid-serum/6811356"],
    [3, "2", "https://www.mauimoisture.com/products/lightweight-hydration-hibiscus-water-shampoo"],
  ]), aspect: "1/1", brand: "aveeno", logo: "/logos/aveeno.webp", brandName: "Aveeno",
  landingUrl: "https://www.aveeno.com/", snapshot: "/landing/aveeno.jpg", cta: "Learn more", caption: "Everyday care, your way.", embeddable: false, likes: 7311, comments: 120,
};
export const GM_AD: Flick = {
  id: "feed-gm", flickId: "ccheju",
  variants: variants("ccheju", [
    [2, "1", "https://www.generalmills.com/our-food/brands/cheerios"],
    [3, "2", "https://www.generalmills.com/food-we-make/brands/cinnamon-toast-crunch"],
  ]), aspect: "1/1", brand: "generalmills", logo: "/logos/generalmills.webp", brandName: "General Mills",
  landingUrl: "https://www.generalmills.com/our-food/where-to-buy", snapshot: "/landing/generalmills.jpg", cta: "Learn more", caption: "Breakfast, the way you like it.", embeddable: false, likes: 12530, comments: 233,
};

/* ---------------- Stories tray ---------------- */
export type Story = { username: string; avatar: string; monogram?: string; logo?: string | undefined; seen?: boolean; sponsored?: boolean; image?: string; flick?: Flick };
/** Bubble shows the brand logo when supplied; otherwise a still captured from the live Flick. */
const sponsoredStory = (flick: Flick): Story => ({ username: flick.brand, avatar: `/flick-thumbs/story-${flick.flickId}.jpg`, logo: flick.logo, sponsored: true, flick });
export const STORIES: Story[] = [
  sponsoredStory(STORY_AD), sponsoredStory(REELS_AD), sponsoredStory(REELS_AD_2),
  { username: "sam_wilde", avatar: AV(33), image: U("photo-1506744038136-46273834b3fb") },
];

/* ---------------- Feed ---------------- */
export type Organic = {
  kind: "photo" | "video";
  id: string;
  username: string;
  avatar: string;
  verified?: boolean;
  location?: string;
  media: string[]; // photo: one or more image URLs (carousel). video: [videoUrl, poster]
  aspect?: "1/1" | "4/5";
  caption: string;
  likes: number;
  comments: number;
  time: string;
  likedBy?: string;
};
export type FeedItem =
  | Organic
  | { kind: "ad-feed"; id: string; flick: Flick }
  | { kind: "ad-creator"; id: string; flick: typeof CREATOR_AD }
  | { kind: "ad-shopping"; id: string; flick: typeof SHOPPING_AD };

export const FEED: FeedItem[] = [
  { kind: "ad-feed", id: "a1", flick: FEED_AD },
  { kind: "photo", id: "p1", username: "dan.travels", avatar: AV(53), location: "Malibu, CA",
    media: [U("photo-1533105079780-92b9be482077"), U("photo-1507525428034-b723cf961d3e")], aspect: "4/5",
    caption: "couldn't have asked for a better beach weekend ☀️ already planning the next road trip", likes: 482, comments: 37, time: "2 hours ago", likedBy: "priya.k" },
  { kind: "ad-shopping", id: "a3", flick: SHOPPING_AD },
  { kind: "video", id: "p2", username: "the.daily.grind", avatar: U("photo-1554118811-1e0d58224f24", 150), location: "The Daily Grind Cafe · Brooklyn, NY",
    media: [M(1737), U("photo-1554118811-1e0d58224f24")], aspect: "4/5",
    caption: "brunch is served 🥞 new seasonal menu drops this weekend", likes: 2310, comments: 96, time: "4 hours ago", likedBy: "mia_eats" },
  { kind: "ad-creator", id: "a2", flick: CREATOR_AD },
  { kind: "video", id: "p6", username: "biscuit.the.corgi", avatar: U("photo-1543466835-00a7907e9de1", 150),
    media: [M(1476), U("photo-1543466835-00a7907e9de1")], aspect: "4/5",
    caption: "zoomies at 7am are a lifestyle 🐶💨", likes: 30244, comments: 640, time: "8 hours ago", likedBy: "nora" },
  { kind: "ad-feed", id: "a6", flick: SAMSUNG_AD },
  { kind: "photo", id: "p4", username: "leo.fit", avatar: AV(59), location: "Iron Temple Gym · Austin, TX",
    media: [U("photo-1534438327276-14e5300c3a48")], aspect: "4/5",
    caption: "leg day doesn't skip itself 🦵 6am crew where you at", likes: 1022, comments: 58, time: "6 hours ago", likedBy: "sam_wilde" },
  { kind: "ad-feed", id: "a7", flick: GM_AD },
  { kind: "photo", id: "p5", username: "dailymemes.hq", avatar: AV(68), verified: true,
    media: [U("photo-1517694712202-14dd9538aa97")], aspect: "1/1",
    caption: "me pretending to understand the code I wrote yesterday 😭", likes: 88213, comments: 1932, time: "7 hours ago" },
  { kind: "ad-feed", id: "a8", flick: COACH_AD },
  { kind: "video", id: "p7", username: "nora", avatar: AV(25), location: "Madison Square Garden",
    media: [M(11942), U("photo-1514525253161-7a46d19cd819")], aspect: "4/5",
    caption: "LAST NIGHT WAS UNREAL 🎤🔥", likes: 742, comments: 64, time: "9 hours ago", likedBy: "dan.travels" },
  { kind: "ad-feed", id: "a4", flick: FEED_AD_2 },
  { kind: "photo", id: "p8", username: "priya.k", avatar: AV(45),
    media: [U("photo-1494790108377-be9c29b29330"), U("photo-1438761681033-6461ffad8d80"), U("photo-1534528741775-53994a69daeb")], aspect: "4/5",
    caption: "photo dump from the weekend 📸", likes: 356, comments: 22, time: "10 hours ago", likedBy: "alex.morgan" },
];

/* ---------------- Reels tab ---------------- */
export type Reel =
  | { kind: "organic"; id: string; username: string; avatar: string; videoUrl: string; caption: string; likes: number; comments: number; audio: string }
  | { kind: "ad"; id: string; flick: Flick };
export const REELS_AD_3: Flick = { ...STORY_AD, id: "reels-zara", likes: 54200, comments: 812 };
export const REELS: Reel[] = [
  { kind: "ad", id: "r3", flick: REELS_AD },
  { kind: "ad", id: "r6", flick: REELS_AD_2 },
  { kind: "ad", id: "r8", flick: REELS_AD_3 },
  { kind: "organic", id: "r1", username: "wanderlust.films", avatar: AV(5), videoUrl: M(15169), caption: "this place is unreal 🌊", likes: 210400, comments: 1840, audio: "Original audio" },
];

/* ---------------- Search (Explore grid) ----------------
 * "flick-live" plays the production Flick in a 2x2 tile.
 * "flick-still" shows a still captured from the live Flick (public/flick-thumbs/<flickId>.jpg)
 * and opens a post view with the live Flick. */
export type ExploreTile =
  | { kind: "photo"; id: string; image: string }
  | { kind: "flick-live"; id: string; flick: Flick; side?: "right" }
  | { kind: "flick-still"; id: string; flick: Flick; still: string };
const tile = (id: string): ExploreTile => ({ kind: "photo", id, image: U(id, 400) });
export const EXPLORE: ExploreTile[] = [
  // Block 1: large Flick left, two small tiles right. Block 2: two small tiles left, large Flick right.
  { kind: "flick-live", id: "x-aveeno", flick: AVEENO_AD },
  tile("photo-1506744038136-46273834b3fb"), tile("photo-1517248135467-4c7edcad34c4"),
  tile("photo-1507525428034-b723cf961d3e"), { kind: "flick-live", id: "x-coach", flick: COACH_AD, side: "right" }, tile("photo-1495474472287-4d71bcdd2085"),
  // Two full rows of organic tiles, then block 3: large Aveeno Flick left, two small tiles right.
  tile("photo-1534438327276-14e5300c3a48"), tile("photo-1514525253161-7a46d19cd819"), tile("photo-1543466835-00a7907e9de1"),
  tile("photo-1549298916-b41d501d3772"), tile("photo-1533105079780-92b9be482077"), tile("photo-1494790108377-be9c29b29330"),
  { kind: "flick-live", id: "x-rogers", flick: FEED_AD_3 },
  tile("photo-1554118811-1e0d58224f24"), tile("photo-1542291026-7eec264c27ff"),
  tile("photo-1460353581641-37baddab0fa2"), tile("photo-1494976388531-d1058494cdd8"), tile("photo-1517694712202-14dd9538aa97"),
];

/* ---------------- Messages (DM inbox) ---------------- */
export type DmMessage = { from: "me" | "them"; text: string } | { from: "me" | "them"; share: Flick } | { from: "them"; sponsored: Flick };
export type Thread = { id: string; username: string; name: string; avatar: string; monogram?: string; logo?: string | undefined; preview: string; time: string; unread?: boolean; sponsored?: boolean; messages: DmMessage[] };
export const THREADS: Thread[] = [
  { id: "t-cayman", username: FEED_AD.brand, name: FEED_AD.brandName, avatar: "", logo: FEED_AD.logo, monogram: "C", preview: `Sponsored · ${FEED_AD.caption}`, time: "1h", sponsored: true, messages: [{ from: "them", sponsored: FEED_AD }] },
  { id: "t-samsung", username: SAMSUNG_AD.brand, name: SAMSUNG_AD.brandName, avatar: "", logo: SAMSUNG_AD.logo, monogram: SAMSUNG_AD.brand, preview: `Sponsored · ${SAMSUNG_AD.caption}`, time: "4h", sponsored: true, messages: [{ from: "them", sponsored: SAMSUNG_AD }] },
  { id: "t-ulta", username: FEED_AD_2.brand, name: FEED_AD_2.brandName, avatar: "", logo: FEED_AD_2.logo, monogram: FEED_AD_2.brand, preview: `Sponsored · ${FEED_AD_2.caption}`, time: "8h", sponsored: true, messages: [{ from: "them", sponsored: FEED_AD_2 }] },
  { id: "t-generalmills", username: GM_AD.brand, name: GM_AD.brandName, avatar: "", logo: GM_AD.logo, monogram: GM_AD.brand, preview: `Sponsored · ${GM_AD.caption}`, time: "1d", sponsored: true, messages: [{ from: "them", sponsored: GM_AD }] },
  { id: "t-dan", username: "dan.travels", name: "Dan Reyes", avatar: AV(53), preview: "road trip this weekend?", time: "3h", messages: [{ from: "them", text: "road trip this weekend?" }] },
  { id: "t-mia", username: "mia_eats", name: "Mia Chen", avatar: AV(44), preview: "brunch Sunday at 11 🥞", time: "5h", messages: [{ from: "them", text: "brunch Sunday at 11 🥞" }] },
  { id: "t-leo", username: "leo.fit", name: "Leo Grant", avatar: AV(59), preview: "Sent a reel", time: "1d", messages: [{ from: "them", text: "6am tomorrow?" }] },
  { id: "t-sam", username: "sam_wilde", name: "Sam Wilde", avatar: AV(33), preview: "game day!! 🏈", time: "2d", messages: [{ from: "them", text: "game day!! 🏈" }] },
  { id: "t-nora", username: "nora", name: "Nora Blake", avatar: AV(25), preview: "You: see you at the show", time: "3d", messages: [{ from: "me", text: "see you at the show" }] },
];

/* ---------------- Floating "Flicks" menu (counts generated from the config above) ---------------- */
export type Tab = "home" | "reels" | "messages" | "search" | "profile";
export type FlickSection = { tab: Tab; label: string; /** data-placement key of the section's first Flick */ first: string; thread?: string | undefined; /** open this story index */ story?: number };
const firstDm = THREADS.find((t) => t.messages.some((m) => "share" in m || "sponsored" in m));
export const FLICK_SECTIONS: FlickSection[] = [
  { tab: "home", label: "Flicks for Stories", first: "story-0", story: 0 },
  { tab: "home", label: "Flicks for Home", first: `feed-${FEED[0]?.id}` },
  { tab: "reels", label: "Flicks for Reels", first: `reel-${REELS.find((r) => r.kind === "ad")?.id}` },
  { tab: "search", label: "Flicks for Search", first: `explore-${EXPLORE.find((t) => t.kind !== "photo")?.id}` },
  { tab: "messages", label: "Flicks for Messages", first: `dm-${firstDm?.id}`, thread: firstDm?.id },
];

export const fmt = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  : n >= 10_000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "K"
  : n.toLocaleString("en-US");
