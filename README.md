# Flicks in social apps: demos

Phone mock-ups showing Flam's Flicks (interactive video ads) inside social apps.

- `instagram/` is the Instagram demo, served at `/instagram/`
- `meta/` is the Facebook, Messenger and Marketplace demo, served at `/meta/`

Those folders hold the built sites that GitHub Pages serves. `source/<app>/` holds the project each one is built from: run `npm install` and `npm run build` there, then copy its `dist/` over the matching top-level folder.

The app code under `source/<app>/src/components`, `src/data` and `public` is taken unchanged from the Lovable projects. Only the page shell (`index.html`, `src/main.tsx`) and the build setup differ, so that the sites run as plain static files.

Organic accounts, posts, counts and prices are invented. Built by Flam for partner conversations. Not affiliated with or endorsed by Instagram, Meta or the advertisers shown.

## Flick tags are locked

The Flick embed wrappers (`flick-frame.html`) and the list of Flick ids are pinned in `locks/flick-tags.lock`.
`locks/verify.sh` runs on every push and fails if they differ. Do not change a Flick tag without Ari's approval.
