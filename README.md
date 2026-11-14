# DEV31 — The Game of Love

A playful Hollywood-meets-video-game birthday experience for Dev's 31st birthday, made with Vite, Three.js and GSAP.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Production build

The Vite config uses relative asset paths so the project can be hosted from a GitHub Pages project subpath.

```bash
npm run build
npm run preview
```

The production website is generated in `dist/`.

## Experience

- Movie-style opening screen with a Press Start interaction.
- 3D animated starfield, glowing heart and orbiting ring.
- HUD-style player cards and five playable-looking story levels.
- Personal timeline: 2016 first glance; eight years of admiration; 07 January 2024 heart-change; 2024 fighting for the relationship; 03 February 2025 wedding.
- Photo gallery featuring the supplied couple and wedding photographs.
- Bonus round: collect 31 hearts to unlock an animated kiss reward, then continue to the birthday letter.
- Santhana Kaatre opens in an embedded YouTube player after a deliberate tap.
- Mobile readability pass with larger typography, larger touch targets, and responsive layouts.
- Animated kiss reward overlay with keyboard/touch dismissal and reduced-motion support.

## Before publishing

- Review all wording in `index.html` so it sounds like you.
- The music embed requires internet access and may be restricted by YouTube or the rights holder. If it does not load, the page links to the video on YouTube.
- GitHub Pages on a free account generally requires a public repository. Only publish photos you're comfortable making publicly accessible.
