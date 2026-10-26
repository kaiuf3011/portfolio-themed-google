# Search Kaiuf

Kaiuf M's portfolio as a search engine that only knows one person. Built from `DESIGN-google.md` (design language) and `CONTENT.md` (every word on the site).

```bash
npm install
npm run dev
```

## Where things live

- `content/site.ts` — all copy, projects, journey, skills, photos. Edit this, not components. Placeholders are marked `TODO`.
- `lib/search.ts` — query interpretation (tabs, answer boxes, easter eggs) and project ranking.
- `components/search/SearchApp.tsx` — hero ↔ results orchestration; the URL (`?q=&tab=`) is the source of truth.
- `app/projects/[slug]` — case studies, opened with shared-element view transitions.
- `app/api/chat` — Ask Kaiuf, grounded in `lib/knowledge.ts`. `app/api/contact` — compose delivery.

## Optional integrations

Copy `.env.example` to `.env.local`. Both features degrade gracefully without keys.

## Easter eggs

Type into the search bar: `do a barrel roll`, `askew`, `circle rush`, `flip a coin`, `roll a die`, `kaiuf kaiuf kaiuf`. Konami code works anywhere.
