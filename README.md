# Arshad — Portfolio

Static site (no build step). Open `index.html` through any static server.

## How to edit
- **Text, contact, availability, list of works** → `js/data.js`
- **Add a new video** → put 3 files and add one entry in `js/data.js`:
  - `media/<id>.mp4` – full video (720p H.264, ~2–8 MB)
  - `media/<id>-p.mp4` – 4-second muted preview loop (~200 KB)
  - `img/<id>.webp` – cover frame
- **Hero showreel** → replace `media/reel-loop.mp4` (desktop 16:9) and `media/reel-loop-m.mp4` (mobile 4:5)
- **Colours & fonts** → top of `css/style.css` (`--accent` etc.)
- **Animations** → `js/main.js` (GSAP + ScrollTrigger + Lenis, self-hosted in `vendor/`)
