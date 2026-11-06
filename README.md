# Flicks on Facebook · POC

Interactive proof of concept by Flam: Flicks (swappable, interactive videos) on Facebook. One phone, three formats:

1. **Facebook Feed playable ad**: the Gap ad tag as a Feed lead-in, tap to play full screen
2. **Audience Network rewarded**: a partner app trades hints for 12 seconds of play
3. **Messenger**: try the room swap in-app, then reply to the seller with the chosen variant

On a laptop, pick a format from the list, or use the arrow keys or the scroll wheel. On a phone, each format is full screen; move between them with ‹ ›.

## Hosting on Vercel
Import this repository in Vercel (Add New → Project), framework preset **Other**, no build command, root directory unchanged. Every push to `main` redeploys.

## Notes
- `index.html` is self-contained: scripts, fonts and photos are inlined.
- The Flicks and the Gap ad tag load live from their own sites, so present online.
- Audio stays muted until the viewer taps into a Flick, and stops when they leave it.
