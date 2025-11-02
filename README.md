# OneHotel Conversational Suite

Production-ready lead capture and support bots for OneHotel.asia, built with Next.js and designed for Vercel deployment.

## Features
- Guided lead-qualification chat experience with CRM sync (HubSpot, ClickUp)
- Support assistant grounded in the OneHotel System Manual with auto-escalation
- Multilingual responses (English, Simplified Chinese, Thai, Japanese, Korean, Bahasa Melayu)
- Tailwind CSS styling, App Router architecture, and API routes for integrations

## Getting Started
```bash
npm install
npm run dev
```

Then visit `http://localhost:3000`.

## Scripts
- `npm run dev` – Development server
- `npm run build` – Production build
- `npm start` – Run the built app
- `npm run lint` – ESLint

## Documentation
- `docs/implementation.md` – Architecture overview and extension pointers
- `docs/configuration.md` – Environment variables and deployment guide

## Deployment
Build locally and deploy to Vercel:
```bash
npm run build
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-22d2a817
```

## License
MIT
