# Swathy Reddy Designer Studio

Bespoke boutique and styling appointment web application.

## Getting Started

1. Run `npm install`
2. Run `npm run dev`

## Live from the ScaleEzy shop

The signature edit, both collection sections and every "Explore" / "Shop online" button come from
the boutique's real shop (`src/lib/shop.ts`, `src/context/ShopData.tsx`). Add or change a product in
ScaleEzy Inventory and this page shows it on its next load; no edit here is needed.

- Pieces: the shop's newest, in-stock first. Each opens its page on shop.scaleezy.com.
- Collections: the shop's fabrics, then its crafts, with real piece counts and a real cover photo.
  Each opens that filtered list on the shop. Taglines for known names live in `WORDS` in ShopData.
- If the shop cannot be reached, the designed content shows and every button goes to the shop home.
- Settings: see `.env.example` (the defaults already point at the live shop).

## Tailoring, Styling & Measurement Submissions

Clients can schedule in-boutique or video styling consultations via the **"Book an appointment"** dialog. The elevated dialog features a 3-step luxury atelier flow:

1. **01. Consultation**: Client contact details, preferred date, occasion, consultation mode (*In the boutique* vs *Video consultation*), and city.
2. **02. Dress & Outfit**: Dynamic garment category selection (populated live from `GET /intake/products/`), custom design references, live boutique piece picker from the inventory shop, fabric preferences, and embroidery craftsmanship.
3. **03. Measurements**: Dedicated boutique tailoring measurement sheet with an **Inches (in) / CM (cm)** toggle, upper body/torso specs, blouse & sleeve measurements, lower silhouette, fit preferences, and padding options.

### Dual Actions:

- **Send Measurements (Submit as Boutique CRM Lead)**:
  - Connects to the **Scaleezy Customer Portal API**:
    1. Product catalogue: `GET /intake/products/`
    2. WhatsApp OTP request: `POST /intake/customer/verify/request/` (60s resend cooldown)
    3. WhatsApp OTP verification: `POST /intake/customer/verify/`
    4. Customer profile autofill: `GET /intake/customer/profile/`
    5. Customer registration: `POST /intake/customer/`
    6. Product requirement & measurements: `POST /intake/customer/product/`
  - Tokens are held in-memory only (never stored in localStorage or cookies, adhering to security guidelines).
  - Configured via `VITE_SCALEEZY_BASE_URL` and `VITE_SCALEEZY_PORTAL_KEY` in `.env`.
  - Runs in graceful simulation mode with full UI feedback and demo OTP verification if keys are not yet configured.

- **Send Email (Direct Email Booking)**:
  - Dispatches the complete appointment request, dress details, and formatted measurements via **EmailJS** (`sendAppointmentEmail`).
  - Formats all selections into the email body and template parameters:
    - `{{name}}`, `{{phone}}`, `{{email}}`, `{{occasion}}`, `{{date}}`, `{{mode}}`, `{{notes}}`, `{{message}}`
    - `{{dress_type}}`, `{{dress_summary}}`, `{{measurements_summary}}`
