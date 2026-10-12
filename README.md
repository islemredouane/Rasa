# Rasa Club website

Static site deployed on Vercel from `main` (https://rasa-off.vercel.app). Clean URLs (`/events`, not `/events.html`).

## Everyday tasks

| Task | How |
|---|---|
| Preview locally | `python scripts/serve.py` → http://127.0.0.1:5510 (behaves like Vercel: clean URLs + redirects) |
| Add / edit an event | edit `data/events.js`, then `node scripts/build.mjs` |
| Change the board | edit the cards in `index.html` (`#membersScroll`), then `node scripts/build.mjs` |
| Edit the FAQ | edit `FAQ` in `scripts/build.mjs`, then run it |
| Add a department to the phone menu | edit `DEPARTMENTS` in `js/mobile-nav.js` |
| New board photos | `python scripts/optimize-board.py "../2026-2027 Board" images/board-2026-27` |
| New event photos | `python scripts/optimize-gallery.py "../Events/<season>/<event>" images/events/<season>/<id>` |
| Heavy images | `python scripts/compress-in-place.py 300 1600 <files>` |
| Share images (Open Graph) | `python scripts/make-og.py` |
| App icons | `python scripts/make-icons.py` |
| Ship an update to installed apps | bump `VERSION` in `sw.js` |

`node scripts/build.mjs` regenerates the SEO block of every page (canonical, Open Graph, Twitter, JSON-LD),
the pre-rendered events, the homepage FAQ, `sitemap.xml` and `llms.txt`. Only the marked blocks are rewritten.

Python scripts need Pillow and pillow-heif (`pip install pillow pillow-heif`).
