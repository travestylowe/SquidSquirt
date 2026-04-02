# squidsquirt.com

A squid. You press it. It squirts. That's it.

---

## Quick start

```bash
npm start
# or
npx serve .
# or
python -m http.server 8080
```

Use **`npm start`** or any static HTTP server. The app loads ES modules and JSON over `fetch`; opening `index.html` as a `file://` URL usually **fails** (use localhost).

```bash
npm run check   # syntax-check all .js files (Node)
```

---

## File structure

```
squidsquirt/
├── index.html
├── config.js              # Supabase URL + anon key + optional debug
├── config.example.js      # template for real keys
├── style.css
├── data/                  # taunts, thanks, color palettes (JSON)
├── js/                    # ES modules (entry: app.js)
├── docs/
│   └── ROADMAP.md         # completed features & planned work
├── BEHAVIOR.md            # frozen behavior notes for regressions
├── CLAUDE.md              # project instructions for Claude Code
├── supabase/sql/
│   └── init_counters.sql  # copy-paste into Supabase SQL editor
├── package.json           # npm start → local static server; npm run check
└── README.md
```

Everything is vanilla HTML/CSS/JS. No bundler; no runtime npm dependencies in the browser.

---

## Counters (local vs global)

- **Total squirts** (top): your **local** count, stored in **`localStorage`** (`sqc`). Drives palette milestones and confetti timing.
- **Global squirts** (footer): optional **shared** total from Supabase when `config.js` has both URL and anon key. Shows `—` if not configured or if the load request fails.

---

## Counter backend (global)

By default the **global** footer uses **no server** (`—`). For a **shared global** count:

### 1. Create a Supabase project

- Go to https://supabase.com and create a free project.
- Copy the **Project URL** and **anon public key** from Settings → API.

### 2. Create the table and RPC

Run `supabase/sql/init_counters.sql` in the Supabase SQL editor (or paste the same SQL from the older docs — it matches).

### 3. Configure the site

Edit **`config.js`** and set:

```js
window.SQUIDSQUIRT_CONFIG = {
  supabaseUrl: 'https://xyz.supabase.co',
  supabaseAnonKey: 'eyJhbGc...',
};
```

Leave either field empty to skip the global counter (local squirts still work).

The anon key is intended for client use; RLS and the `increment_squirt` function limit what it can do.

---

## Deployment

Static hosting: Netlify, Vercel, GitHub Pages, or any file host.

**Netlify (CLI):**

```bash
npm install -g netlify-cli
netlify deploy --prod --dir .
```

**Vercel:**

```bash
npm install -g vercel
vercel --prod
```

---

## How the sounds work

All audio is synthesized with the Web Audio API — no sound files.

| Event | Sound |
|-------|--------|
| Tiny squirt (power < 0.15) | Short high-freq bandpass noise |
| Normal squirt | Bandpass noise; freq + duration scale with power |
| Mega squirt (power > 0.85) | Deep, long, wobbling wet gush |
| Small fart (power < 0.3) | Sawtooth ~350Hz, fast AM flutter |
| Big fart (power > 0.7) | Sawtooth ~80Hz, slow rumble |
| Giggle | 3–5 rising-pitch bandpass bursts after the main sound |

Giggle probability: **86%** after a tiny squirt, **72%** after a fart, **42%** after a mega squirt, ~20% otherwise.

---

## How the ink works

Each squirt picks a random `power` value between 0 and 1. Power controls:

- **Particles**: airborne ink with gravity and fade
- **Drips**: blobs that stick, then drip down
- **Blackout**: power > 0.85 floods a dark overlay that fades over ~30s
- **Blush**: cheeks flush at power > 0.75 (or > 0.65 for farts)
- **Direction**: normal squirts spray downward; mega squirts spray in all directions

---

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for completed features and planned work.
