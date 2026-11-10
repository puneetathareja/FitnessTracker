
# Fitness Buddy

A full-stack fitness platform built for gym members, trainers, and gym owners.

It combines gym operations, social engagement, and AI-assisted nutrition tracking in one application.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (default) with MongoDB support in selected routes
- **Auth:** JWT-based authentication
- **Media Uploads:** Local uploads with optional Cloudinary
- **AI:** Google Gemini — chat `gemini-2.5-flash`, embeddings `gemini-embedding-001` (powers diet analysis, AI Coach, weekly insights, semantic search, NL booking)
- **Payments:** Stripe Checkout (hosted) + webhook
- **Scheduling:** node-cron (weekly AI insights)
- **UI:** three.js ambient background + Motion, glassmorphism/neumorphism, vector SVG icon set

## Core Features

- Role-based access (member, trainer, owner)
- Gym profile and membership management
- Equipment browsing and booking flows
- Social feed with posts, likes, follow/unfollow
- AI meal image analysis for calories/macros
- Daily diet log and streak tracking
- Rewards and points tracking
- **AI Coach** — retrieval-augmented chat grounded in your streaks/diet/bookings, with streaming replies
- **AI Weekly Insights** — scheduled progress report (headline, wins, focus, consistency score)
- **Semantic equipment search** — natural-language search ranked by embeddings
- **Natural-language booking** — e.g. "book the treadmill tomorrow at 7am" → structured intent
- **Stripe** membership payments (hosted Checkout + signed webhook)

## Project Structure

```text
FITNESS_BUDDY/
  backend/      # Express API, DB layer, routes, uploads
  frontend/     # React app (Vite)
  render.yaml   # Render deployment config
  vercel.json   # Vercel frontend config
```

## Local Setup

### Prerequisites

- Node.js 20+
- npm 9+

### 1) Backend Setup

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Backend runs on `http://localhost:4000` by default.

### 2) Frontend Setup (new terminal)

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend runs on Vite default port (usually `http://localhost:5173`).

## Environment Variables

### Backend (`backend/.env`)

- `PORT` (default: `4000`)
- `HOST` (default: `0.0.0.0`)
- `JWT_SECRET` (required for auth)
- `DB_FILE` (default local SQLite file)
- `GOOGLE_API_KEY` (or `GEMINI_API_KEY`) — **required for all AI features** (diet analysis, AI Coach, insights, semantic search, NL booking)
  - supports **multiple keys** separated by commas for fallback
- `GOOGLE_GEMINI_MODEL` (optional, default `gemini-2.5-flash`; embeddings always use `gemini-embedding-001`)
- `STRIPE_SECRET_KEY` — Stripe payments (test key `sk_test_…`)
- `STRIPE_WEBHOOK_SECRET` — `whsec_…`; required for the webhook to record payments
- `STRIPE_CURRENCY` (optional, default `inr`), `PUBLIC_URL` (site origin for Stripe redirects)
- `WEEKLY_INSIGHTS_CRON` (optional cron, default `0 8 * * 1` = Mon 08:00); `DISABLE_CRON=1` to turn the cron off
- `UPLOADS_DIR` (optional uploads location)
- `CLOUDINARY_URL` (optional cloud media storage)

### Frontend (`frontend/.env`)

- `VITE_API_URL` (backend base URL, example: `http://localhost:4000`)

## Useful Scripts

### Backend

- `npm run dev` — start with nodemon
- `npm start` — production start

### Frontend

- `npm run dev` — local development
- `npm run build` — production build
- `npm run preview` — preview built app

## API Highlights

- `POST /api/signup`
- `POST /api/login`
- `GET /api/profile`
- `POST /api/diet/analyze`
- `POST /api/diet/log`
- `GET /api/diet/logs?date=YYYY-MM-DD`
- `POST /api/posts`
- `GET /api/feed`
- `POST /api/coach/chat` — AI Coach (streaming Server-Sent Events)
- `POST /api/coach/insights` — weekly progress report (structured JSON)
- `POST /api/ai/search` — semantic equipment search (embeddings + cosine)
- `POST /api/ai/parse-booking` — natural-language booking → structured intent
- `POST /api/payments/stripe/create-checkout-session` — start Stripe Checkout
- `POST /api/payments/stripe/webhook` — Stripe events (records payment; raw body)

Most protected routes require:

```http
Authorization: Bearer <token>
```

## Troubleshooting

### Port already in use (`EADDRINUSE`)

```powershell
Get-NetTCPConnection -LocalPort 4000 -State Listen |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

### Feed images not loading

- Ensure backend is running and `/uploads/...` is reachable
- Verify `UPLOADS_DIR` points to a writable and served folder

### AI diet analyze errors

- Confirm `GOOGLE_API_KEY` is set
- If you hit quota/rate limits, add fallback keys via comma-separated `GOOGLE_API_KEY`
- If model issues occur, set `GOOGLE_GEMINI_MODEL` explicitly

## Deploy & Environment Variables

When deploying the application:

- **Frontend (e.g. Vercel / Netlify):** Deploy the `frontend/` directory. Set `VITE_API_URL` to your live backend URL (e.g. `https://your-backend.onrender.com`).
- **Backend (e.g. Render / Railway):** Deploy the `backend/` directory using Node 20+.

### Required environment variables (set in your backend deploy dashboard)

**Backend Environment (e.g. Render):**

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Strong random secret for JWT auth signing |
| `GOOGLE_API_KEY` | **Google Gemini API Key** (Free tier available at Google AI Studio) for diet analysis, AI coach, insights, and semantic search. |
| `GOOGLE_GEMINI_MODEL` | Optional; default `gemini-2.5-flash` |
| `STRIPE_SECRET_KEY` | Optional; Stripe secret key (`sk_test_…`) for payments |
| `STRIPE_WEBHOOK_SECRET` | Optional; Stripe webhook secret (`whsec_…`) |
| `MONGODB_URI` | Optional; if not provided, local SQLite (`/tmp/db.sqlite`) is used |
| `PUBLIC_URL` | Optional; frontend live URL for Stripe checkout redirects |

### Stripe Webhook Configuration (Optional)

1. In the **Stripe Dashboard → Developers → Webhooks**, add an endpoint:
   `https://<your-backend-domain>/api/payments/stripe/webhook`
   Event: `checkout.session.completed`
2. Copy the **Signing secret** (`whsec_…`) into your backend environment as `STRIPE_WEBHOOK_SECRET`.
3. Test using test cards in Stripe test mode.

Without the webhook, Checkout still completes and the user sees a success message, but the payment row is only written when Stripe can reach the endpoint above.

### Weekly AI Insights cron

Runs inside the backend process via `node-cron` (default **Monday 08:00**, `WEEKLY_INSIGHTS_CRON`). Each run notifies every member that their weekly report is ready; the full report is generated on demand when they open the AI Coach. Set `DISABLE_CRON=1` to turn it off, or move it to a Render Cron Job for multi-instance deploys.

> **Never commit real keys.** `backend/.env` is git-ignored — put secrets there locally and in the dashboards for production.

## Security Notes

- Do not commit real API keys or secrets
- Rotate keys if they were exposed
- Use a strong `JWT_SECRET` in production
