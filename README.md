# Arshad — Portfolio (arshadar.github.io)

Static multi-page site. No build step — edit files and push; GitHub Pages deploys in ~1 minute.

## Pages
index.html (home) · work.html (archive) · project.html?p=<slug> (case study, one template for all works)
services.html · about.html · contact.html (brief builder → WhatsApp / email) · 404.html

## Edit content
- **Works, clients, contact, availability** → `js/data.js`
- **Services, process steps, FAQ** → `js/content.js`
- **Page text** → the matching `.html` file
- **Colours / fonts** → top of `css/main.css` (paper #f4f3ed, ink #20221f, blue #2349ec, Space Grotesk)

## Add a project
Add 5 files with the same id and one entry in `js/data.js` → `works`:
- `media/<id>.mp4` full video (720p H.264) · `media/<id>-p.mp4` 4-second muted preview
- `img/<id>.webp` cover · `img/s/<id>-1.webp`, `-2`, `-3` stills

## Motion stack
GSAP + ScrollTrigger + Lenis + three.js (WebGL hero strip), all self-hosted in `vendor/`.
`js/core.js` = shared shell (loader, page transitions, cursor, menu, timeline HUD, reveals)
`js/home.js` + `js/gl-strip.js` + `js/curve.js` = home · `js/page.js` = inner pages
