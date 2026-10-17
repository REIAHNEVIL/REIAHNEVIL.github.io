# reiahnevil.github.io

Portfolio of Jure Rhoanne Q. Batohanon. Static HTML, CSS and JavaScript, no build step.

## Deploy to GitHub Pages

1. Create a public repository named `REIAHNEVIL.github.io` on GitHub.
2. Push this folder to its `main` branch.
3. Settings → Pages → Build and deployment → Source: **Deploy from a branch**, Branch: `main`, folder `/ (root)`.
4. The site goes live at https://reiahnevil.github.io within a minute or two.

## Preview locally

```
python -m http.server 8000
```

Then open http://localhost:8000.

## Where things are

- `index.html` – all content (taken from `cv/BATOHANON_CV.pdf`)
- `assets/css/tokens.css` – colours (dark and light), type sizes, spacing
- `assets/css/site.css` – layout, sections, motion
- `assets/js/site.js` – theme, menu, about dropdowns, skill cards, experience timeline, project details window, events carousel and photo popup
- `assets/img/` – pictures (portrait, project screenshots, and one folder of numbered photos per event)

## Adding your photos

Drop JPGs into these folders and they appear automatically. Until then each spot shows a designed placeholder.

**Event carousel** (as many photos per event as you like, numbered from 1, no gaps):

| Folder | Event |
| --- | --- |
| `assets/img/events/ipbl/` | iPBL 2026 |
| `assets/img/events/psite/` | PSITE Innovation Challenge |
| `assets/img/events/skydeck/` | Bangkok University × Berkeley SkyDeck Hackathon |
| `assets/img/events/cesafi/` | CESAFI Computer Quiz Bowl |
| `assets/img/events/lead2lead/` | EO Lead 2 Lead Congress |
| `assets/img/events/topcit/` | TOPCIT certificate |

Name them `1.webp`, `2.webp`, `3.webp`… and set that event's `data-count` in `index.html` to the number of photos. Portrait-ish (4:5) photos fit the cards best. Several photos in one folder become a slideshow on that event's card, and clicking the card opens them one at a time in the event popup.

**Single photos:**

| File | Where it shows |
| --- | --- |
| `assets/img/portrait.webp` (about 9:11) | Intro photo card and the event popup avatar (keep `portrait.jpg` too: it's the link-preview image) |
| `assets/img/projects/lab-booking.webp` | Lab Booking System |
| `assets/img/projects/salitayo.webp` | SALITAyo |
| `assets/img/projects/aaims.webp` | AAIMS |
| `assets/img/projects/josenicare.webp` | JoseniCare |

Project screenshots work best at 16:10, for example 1440×900. Keep each photo under about 400 KB (resize to roughly 1600px on the long side) so the site stays fast. Save photos as WebP (quality about 80), e.g. with [Squoosh](https://squoosh.app), and keep videos at 720p with no audio track.
