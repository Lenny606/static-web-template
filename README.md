# Static Web Template

A reusable, mobile‑first, SEO‑friendly static website template for content sites, portfolios, or small business pages.

## Overview
This repository contains a static site built with HTML, CSS, and vanilla JavaScript. Styling is powered by **Tailwind CSS v4** (via a build step) using `npm` and `postcss`. The default content and copy are in Czech (`lang="cs"`).

## Stack & Tooling
- Language: HTML, CSS, JavaScript
- Frameworks: Tailwind CSS v4
- Package manager: npm
- Build step: Tailwind CLI / PostCSS
- Entry point: `index.html`

## Features
- Mobile‑first layout and typography
- Tailwind CSS v4 build setup for optimal performance
- Privacy‑first analytics with consent banner; Google Tag Manager is disabled until consent
- Lightweight, fast, and deployable to any static host (GitHub Pages, Netlify, Vercel, S3/CloudFront, etc.)
- Sitemap (`sitemap.xml`) and `robots.txt` included

## Requirements
- **Node.js** and **npm** are required to build the styles.
- A web browser.
- For local development, `npm run dev` provides a watch mode for CSS, but you'll still need a static file server to view HTML changes properly if not using a dedicated one.

## Getting Started
1. Clone the repository
   - `git clone <your-fork-or-repo-url>`
   - `cd static-web-template`
2. Install dependencies
   - `npm install`
3. Start development build
   - `npm run dev` (starts Tailwind watch mode for CSS changes)
4. Open locally (in a separate terminal)
   - Serve with a static server (recommended):
     - Python 3: `python -m http.server 5173`
     - Node (http-server): `npx http-server -p 5173`
     - Node (serve): `npx serve -l 5173`
   - Alternatively for simple preview: double‑click `index.html` (some features might be limited)
5. Visit `http://localhost:5173` (or the port you chose)

## Build Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Watches `css` and `html` files and rebuilds styles on change. |
| `npm run build:css` | ONE-OFF production build (minified). |

## Configuration

Analytics and consent:
- File: `assets/js/analytics.js`
  - Set your Google Tag Manager container ID:
    - `const GTM_ID = 'GTM-XXXXXXX'; // Replace with client GTM ID`
  - Consent is stored in `localStorage` under the key `dbda_consent_status`.

Tailwind configuration:
- `tailwind.config.js`: Main configuration file (v4 syntax).
- `assets/css/input.css`: Source CSS file with `@import "tailwindcss";`.
- `postcss.config.js`: PostCSS configuration.

Site pages and navigation:
- Main page: `index.html`
- Sub‑pages: `/pages/*.html` (`philosophy.html`, `projects.html`, `studio.html`, `contact.html`)
- Shared assets: `/assets` (CSS/JS/Images)

## Scripts (in-browser functionality)
- `assets/js/main.js`: Initialization, smooth scrolling, lazy‑loading hints, simple reveal‑on‑scroll.
- `assets/js/nav.js`: Mobile menu toggle, sticky header behavior, keyboard/overlay closing, current year.
- `assets/js/analytics.js`: Consent banner handling and optional GTM initialization; basic click tracking via `dataLayer`.
- `assets/js/lottie.js`: Lottie animation loader (referenced in `index.html`).

(Note: `assets/js/tailwind-config.js` is deprecated in favor of `tailwind.config.js` build step).

## Environment Variables
No runtime environment variables are required. The GTM container ID is set inline in `assets/js/analytics.js`.

TODO:
- If you plan to use a build step, consider moving `GTM_ID` to a `.env` and injecting it at build time.

## Testing
There are no automated tests in this template.

Suggested approaches (optional):
- Visual/manual checks: layout, responsive behavior, navigation, and consent banner behavior.
- Lighthouse audit in Chrome DevTools for Performance/Accessibility/Best Practices/SEO.
- Optional E2E setup (TODO): add Playwright or Cypress with a couple of smoke tests (homepage loads, nav links work, consent banner logic).

## Project Structure
Top‑level files and folders:

```
.
├── index.html
├── pages/
│   ├── contact.html
│   ├── philosophy.html
│   ├── projects.html
│   └── studio.html
├── assets/
│   ├── css/
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── layout.css
│   │   ├── theme.css
│   │   ├── input.css
│   │   └── output.css (generated)
│   ├── images/
│   │   └── DBDA_logo.png
│   ├── js/
│   │   ├── analytics.js
│   │   ├── contact-form.js
│   │   ├── lottie.js
│   │   ├── main.js
│   │   ├── nav.js
│   │   └── tailwind-config.js (legacy)
│   └── references/ (design references and examples)
├── robots.txt
└── sitemap.xml
```

Notes:
- The page currently loads `assets/css/theme.css` and the generated `assets/css/output.css`.
- `assets/references/` contains reference pages and artifacts (e.g., `minimax.html`, `opus.html`) not linked in navigation.

## Deployment
Because this is a static site, you can deploy it anywhere that serves static files:
- GitHub Pages: push to `main` and configure Pages to serve from the repo root (ensure `output.css` is committed or built in CI)
- Netlify: drag‑and‑drop the folder or connect the repo (publish directory: `/`)
- Vercel: import the project (framework preset: “Other”) and deploy from root
- Any static server or object storage + CDN (e.g., S3 + CloudFront)

## Accessibility & SEO
- Semantic HTML and responsive patterns are used throughout.
- Include descriptive `alt` attributes for images.
- `sitemap.xml` and `robots.txt` are included. Update URLs and rules as needed.

## License
No explicit license file is included in this repository.

TODO:
- Add a license file (e.g., MIT/Apache‑2.0) to clarify usage terms.

---

## Changelog / Maintenance
- 2026‑01‑10: README updated to reflect current codebase. Fixed stale note about `analytics.js` (now present), documented Tailwind CDN setup and GTM configuration.
- 2026-01-21: Migrated to Tailwind CSS v4 build process. Updated Getting Started and Configuration sections.
