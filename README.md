<p align="center"><img src="images/logo.svg" alt="SharpBill" height="56" /></p>

# SharpBill

Invoicing for freelancers: create invoices in any currency from 8 template types, email them to clients (PDF attached) through your own EmailJS account, or download print-ready PDFs.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion** and **Firebase** (Auth + Firestore).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase web config
npm run dev
```

Open http://localhost:3000.

### Firebase setup

1. In the [Firebase console](https://console.firebase.google.com), create a project (or open an existing one).
2. **Build → Authentication → Get started → Sign-in method**: enable **Google** and **Email/Password**.
3. **Build → Firestore Database → Create database** (production mode, any region).
4. **Project settings → General → Your apps → Web app (`</>`)**: register an app and copy the `firebaseConfig` values into `.env.local` (one value per `NEXT_PUBLIC_FIREBASE_*` line). Restart `npm run dev` after editing it.
5. Publish the security rules — each account can only read and write its own data:

   ```bash
   firebase login --reauth
   firebase deploy --only firestore:rules --project YOUR_PROJECT_ID
   ```

   (or paste the contents of [`firestore.rules`](firestore.rules) into **Firestore → Rules** and click Publish).
6. When you deploy the site, add its domain under **Authentication → Settings → Authorized domains** (needed for Google sign-in). `localhost` is allowed by default.

**Logos and Firebase Storage.** In the console, open **Build → Storage → Get started**, then publish [`storage.rules`](storage.rules) (`firebase deploy --only storage`, or paste it into **Storage → Rules**). A business logo is saved in two forms: the full image goes to Storage at `users/{uid}/logo.png` (its download URL is stored as `business.logoUrl` and sent to email templates as `{{business_logo_url}}`), and a small ≤256px copy is embedded on the profile (`business.logo`) — invoices and PDFs use the embedded copy, so they render without any Storage CORS setup. If Storage isn't enabled, the upload falls back to the embedded copy only and invoices still show the logo. No Firestore indexes are needed.

### Deploying with Firebase App Hosting

SharpBill is a server-rendered Next.js app, so it uses **Firebase App Hosting** (not classic Hosting — a `"hosting": { "public": … }` block in `firebase.json` would publish an empty site). App Hosting needs the **Blaze** (pay-as-you-go) plan and the code in a GitHub repository.

1. Push this project to GitHub.
2. Firebase console → **Build → App Hosting → Get started**: connect the GitHub repo, pick the live branch (e.g. `main`), root directory `/`, and link the existing web app.
3. App Hosting builds and deploys on every push. Settings live in [`apphosting.yaml`](apphosting.yaml) (Firebase web config, instance limits).
4. After the first rollout, copy the live URL (`https://<backend>--<project>.<region>.hosted.app`) and:
   - uncomment `NEXT_PUBLIC_SITE_URL` in `apphosting.yaml` with that URL, then push again (share images, sitemap and robots.txt use it);
   - add the domain under **Authentication → Settings → Authorized domains** so Google sign-in works.

> App Hosting officially lists Next.js up to 15.2; this project is on Next.js 16, which Firebase describes as "might work, but not officially supported". If a rollout fails on the framework version, the fallback is hosting the site on Vercel and keeping Firebase for sign-in and data — no code changes needed, just the same environment variables.

### EmailJS setup (per user, done in-app at /settings)

1. Create an EmailJS account and connect an email service.
2. Create a template and set **Subject** `{{subject}}`, **To email** `{{to_email}}`, **Reply to** `{{reply_to}}` (and optionally **CC** `{{cc_email}}`).
3. In **Attachments**, add a **Variable Attachment**: parameter `invoice_pdf`, filename `{{invoice_number}}.pdf`, content type **PDF**.
4. Open **Content → Edit content → Code editor** and paste one of the six invoice email designs from **Settings → Invoice email designs** (Monolith, Blueprint, Cycle, Atelier, Emerald, Counterfoil — each pairs with the invoice design of the same name).
5. Paste the Service ID, Template ID and Public key into **Settings → Email sending**.

The designs are table-based HTML with inline styles (works in Gmail, Apple Mail and Outlook) and use these variables, filled in by `lib/email.ts`: `{{client_name}}`, `{{business_name}}`, `{{business_initials}}`, `{{invoice_number}}`, `{{amount}}`, `{{issue_date}}`, `{{due_date}}`, `{{payment_cta_label}}`, `{{payment_cta_url}}`, and the pre-escaped HTML blocks `{{{message_html}}}` and `{{{payment_details_html}}}` (triple braces). When an invoice is paid by bank transfer, the button becomes "Reply about payment" and the bank details appear in the payment block.

> **A paid EmailJS plan is required** (Personal or above) — every invoice email carries its PDF, and the Free plan has no attachments. **Settings → Email sending → Verify & save keys** sends a real test email with a test PDF; the keys only show as "Connected" if EmailJS accepts it. If it is refused, check that the attachment's **Parameter Name** is exactly `invoice_pdf` (not the filename). Emailed PDFs use a lighter rendering than downloads to stay well under plan limits.
>
> **Email button.** Invoices with a payment link get a "Pay now" button. Bank-transfer invoices get "Download invoice": the PDF is stored in Firebase Storage at `users/{uid}/invoices/{invoiceId}.pdf` and the button uses its download URL, so `storage.rules` must be deployed.

## Social share previews

Public pages have their own 1200×630 share images, generated at build time with `next/og`:

| Page | Image file |
| --- | --- |
| `/` | `app/(site)/opengraph-image.tsx` (also served at `/og.png` as the default for every other page) |
| `/auth/login` | `app/auth/login/opengraph-image.tsx` |
| `/auth/register` | `app/auth/register/opengraph-image.tsx` |

Shared pieces (fonts, logo, colours) live in `lib/og.tsx`; fonts are bundled in `assets/fonts` (SIL Open Font License). Titles and descriptions come from `lib/site.ts`. Signed-in pages are `noindex`; `robots.txt` and `sitemap.xml` are generated.

**After deploying, set `NEXT_PUBLIC_SITE_URL`** (e.g. `https://sharpbill.app`) so share images use absolute URLs on your domain. On Vercel the production domain is used automatically if it isn't set. Check your links with each platform's preview/debug tool after the first deploy (platforms cache previews).

## Data model (Firestore)

```
users/{uid}                      profile, business info, payment defaults, EmailJS keys, invoiceCounter
users/{uid}/clients/{clientId}   client details + invoiceCount (per-client order number) + totalBilled
users/{uid}/invoices/{invoiceId} invoice with client/business snapshots, items, totals, status
```

Invoice numbers (`INV-001`, `INV-002`…) and per-client order numbers (`#001`…) are assigned inside a Firestore transaction in `createInvoice`, so they never collide. `OVERDUE` is derived from the due date of `SENT` invoices.

## Project structure

```
app/                      routes (thin pages that render components)
  page.tsx                homepage
  auth/{login,register,business-setup}
  (app)/                  authenticated area with sidebar (AppShell)
    dashboard, invoices, invoice/create, invoice/[id], clients, clients/[id], templates, settings
components/
  home/                   homepage sections (Hero, Ticker, Demo, Features, HowItWorks, TemplatesFan, CallToAction, Footer)
  illustrations/          animated SVG illustrations (Framer Motion)
  auth/  app/  clients/  invoice/  settings/
  templates/              8 invoice designs + registry, sample data, previews
  ui/                     shared UI: Icon, Logo, Overlay (Modal/Drawer), Toast, Motion helpers, form bits
context/AuthContext.tsx   auth + live profile
hooks/useData.ts          realtime Firestore hooks
lib/
  firebase.ts             Firebase bootstrap (lazy)
  site.ts  og.tsx  og-home.tsx   site URL/metadata + share-image building blocks
  firebase-actions.ts     all reads/writes (auth, profile, clients, invoices)
  pdf.ts  email.ts  email-templates.ts  invoice-utils.ts  format.ts  types.ts  constants.ts
styles/globals.css        design tokens + reusable component classes
images/                   brand assets
```

## Invoice designs

Every invoice uses the same simple form: line items (description × quantity × rate), tax, notes, payment method and two optional fields (Subject, PO/reference). That covers both everyday services and a monthly salary (e.g. one line "Monthly salary — October 2026", qty 1). The eight designs only change the look:

| Design | Look | Group | Best for |
| --- | --- | --- | --- |
| Monolith | Bold ink & lime, oversized title | Minimal | Everyone (default) |
| Blueprint | Navy grid header, sky accents | Corporate | Tech & engineering clients |
| Ledger | Blue spine, numbers first | Technical | Developers & consultants |
| Cycle | Lime band, issue-to-due timeline | Creative | Monthly salary & retainers |
| Atelier | Cream paper, serif type | Creative | Designers, writers, creatives |
| Emerald | Deep green side column | Corporate | Premium consulting |
| Manifest | Purple, structured cards & barcode | Corporate | Agencies & studios |
| Counterfoil | Ticket stub with DUE/PAID stamp | Minimal | Bold, personal brands |

Design ids (`standard`, `proforma`, …) are kept from the original template names so saved invoices keep their look. Every PDF carries a "Generated with SharpBill" footer.
