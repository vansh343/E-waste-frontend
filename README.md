# Kabadi Connect — Frontend

Hinglish voice-first frontend for the e-waste marketplace (Smart India Hackathon).
4 roles: **Seller**, **Company**, **Distributor**, **Admin**. White + green theme. A floating 🔊
button reads any page's key text aloud in Hinglish (Google Translate TTS direct from the
browser — no API key, `no-referrer` meta keeps it accepted — with browser `speechSynthesis`
as fallback).

## Run (all 3 services)

1. **Backend** (port 8080)
   ```
   .\mvnw.cmd spring-boot:run
   ```
2. **Python product detector** (port 5000)
   ```
   cd python-service
   pip install -r requirements.txt
   python app.py
   ```
3. **Frontend** (port 5173)
   ```
   cd frontend
   npm install
   npm run dev
   ```
   Open http://localhost:5173

`npm run build` produces a production build in `frontend/dist`.

## Backend URL

`src/config.js` is the single source of truth. Set `VITE_API_BASE_URL` in `frontend/.env`
(copy `.env.example`):

- **Set** (`https://e-waste-1-3ywr.onrender.com`) — the browser calls the backend
  **directly, cross-origin**. Credentials are sent, so the backend must allow this origin
  via CORS and must issue `SameSite=None; Secure` cookies. Both are configured on the
  backend by `app.cors.allowed-origin-patterns` and `app.jwt.cookie.*`.
- **Empty** — requests stay relative and the Vite proxy in `vite.config.js` handles them
  (same-origin, no CORS, cookie can stay `SameSite=Lax`).

Restart the dev server after editing `.env` — Vite only reads it at startup.

## How the proxy works (fallback, used when `VITE_API_BASE_URL` is empty)

`vite.config.js` proxies same-origin (cookies flow automatically, no CORS pain):
- `/api/*` → the backend (prefix stripped, so `/api/company/products` hits `/company/products`)
- `/ws` → SockJS WebSocket endpoint on the backend
- TTS plays directly from the browser (`<audio>` needs no CORS) to Google Translate TTS;
  `index.html` sets `no-referrer` so the request is accepted without an API key.

## Demo script (judges)

1. Sign up as **Company** — accounts are auto-approved on signup (the backend approves
   immediately and/or lazily creates the Company profile on first dashboard load; the **Admin
   panel** at `/admin` — login with phone `9876543210` — can suspend, promote, delete, and
   approve/reject from the queue).
2. Company: add a product (e.g. Keyboard, stock 50, ₹400-500) under **Mere Products**.
3. Company: add a Distributor (name/area/phone) under **Mere Distributors** — login auto-created.
4. Log in as **Distributor** (phone you just added), log in as **Seller** (or create one).
5. **Seller**: on My Dashboard, add item “Keyboard × 2”, tap the 📷 for photo detect,
   or press **Laap top khojein**.
6. Results show the company & distributor with exact-location match. Tap **💬 Baat karein**.
7. **Distributor** sees the chat request → **Accept (price auto)** → auto first message with
   quote. Open chat — the input is a **numpad only** (no free text): type your number and
   Bhejo. Bargaining happens in numbers.
8. Both sides open **Deal stage** → both propose the same amount → **LOCKED**.
9. Go to **Meri Deals** / **Company Ledger** → QR panel: tap to show your QR (it contains the
   common deal code + your number + location), camera to scan theirs (or paste the token),
   both scan → you see the other party's number & location → **accept window opens** → accept → **DONE**.
10. Tap 🔊 anywhere — the page reads itself aloud in Hinglish; real-time chat/request/deal
    events pop as toast + speech.

## Ledger visibility
- **Seller** — `/deal/my`: their own deals.
- **Company** — `/company/ledger` (and `/deal/my`): **everything recorded by the company
  itself AND by all of its distributors**, newest first.
- **Distributor** — `/distributor/deals`: their own deals.
- **Admin** — `/deal/admin/all`: every ledger in the system.

Records show only party IDs (`Seller #…`, `Company #…`, `Distributor #…`) — **no phone numbers
or locations**. Contact details are revealed only through the QR exchange: each QR encodes the
owner's number + location, and `QrPanel` shows the counterparty's details only after you scan
their QR.

## Notes
- OTP is not validated server-side (demo). Company accounts are auto-approved on signup.
- **Admin panel** (`/admin`) — the backend seeds an admin on startup at phone
  Sab Users (role-tab filter + suspend/activate/promote/delete), Sare Deals, Companies, and
  Approval Queue (approve/reject pending companies).
- QR flow: each side scans the *counterparty's* QR (GET `/deal/{id}/qr/me` returns the QR image;
  the QR encodes `E-CYCLE-DEAL:{ledgerId}:{token}:{phone}:{location}` — the common deal id and
  the owner's contact). POST `/deal/{id}/scan` expects just the token — the UI (QrPanel
  `normalizeToken`) reads the 3rd `:`-segment automatically from camera scan / paste.
- Chat is **numpad-only** by design (no free text) — every manual message is a number.
- Python `/detect` currently returns `["keyboard"]` as a stub — swap `detector.py` for the
  real CV model.
