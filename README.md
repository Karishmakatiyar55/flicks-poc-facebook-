# Flicks on Facebook · POC

Interactive proof of concept by Flam: Flicks (swappable, interactive videos) on Facebook. One phone, four formats:

1. **Facebook Feed**: a Gap sponsored post whose picture is the Flick, swappable in place
2. **Playable ad (Audience Network rewarded)**: a partner app trades hints for 12 seconds with the Flick
3. **Messenger**: West Elm's message carries the Flick inside the thread; swap the chair there, open it full screen with "View full screen", then reply with the pick
4. **Marketplace**: a jacket listing whose photo is the Flick; pick a style and message the seller

On a laptop, pick a format from the list or use the arrow keys. On a phone, each format is full screen, and a small draggable "Formats" button (lower right) opens the list; tap a format to jump to it. Formats do not change by scrolling or swiping.

## Hosting on Vercel
Import this repository in Vercel (Add New → Project), framework preset **Other**, no build command, root directory unchanged. Every push to `main` redeploys.

## Notes
- `index.html` is self-contained: scripts, fonts and photos are inlined.
- The Flicks and the Gap ad tag load live from their own sites, so present online.
- Audio stays muted until the viewer taps into a Flick, and stops when they leave it.
- Everything on the phone screens is written for a US audience (names, places, dollars, miles), and the word "Flicks" does not appear on screen.
