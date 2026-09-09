# README.md

# Abodé — Student Accommodation Search & Management

A full-stack marketplace for university students to discover, search, filter,
compare, save, and enquire about off-campus accommodation. Built for
Obafemi Awolowo University (OAU), Ile-Ife, with an architecture that supports
additional universities.

**Stack:** Next.js (App Router, JavaScript only — no TypeScript), Tailwind CSS v4,
PostgreSQL (designed for Neon), custom JWT-based auth (no third-party auth provider).

---

## 1. What's included

- **Public marketplace**: landing page, search/filter with URL-driven state,
  property detail pages with photo gallery, map embed, reviews, facilities,
  verification badges, and a side-by-side comparison tool (up to 4 properties).
- **Student features**: accounts, favourites, comparisons, inspection requests,
  in-app messaging with landlords/agents, reviews, and reporting suspicious listings.
- **Landlord / agent dashboard**: create & edit listings (submitted for admin
  review on every substantive change), manage availability, respond to
  inspection requests, message students.
- **Admin dashboard**: moderate/approve/reject/verify listings, manage users
  (verify/suspend), resolve reports, manage universities and locations.
- **Fully responsive** across mobile, tablet, laptop, and desktop — including a
  mobile bottom tab bar, a filter drawer/sheet on small screens, and a
  horizontally-scrollable comparison table on mobile.

## 2. Project structure

```
app/                     Next.js App Router pages & API routes
  accommodations/        Public search + property detail pages
  dashboard/             Student dashboard (favourites, inspections, messages, reports)
  owner/                 Landlord/agent dashboard (listings, inspections, messages)
  admin/                 Admin dashboard (listings, users, reports, universities, locations)
  api/                   Route handlers (auth, properties, favourites, compare,
                         reviews, inspections, reports, conversations, admin actions)
components/
  ui/                    Generic UI kit (Button, Input, Select, Modal, Badge, ...)
  layout/                Navbar, Footer, MobileTabBar, DashboardShell
  accommodation/         Property card, gallery, filters, favourite/compare toggles
  auth/                  Login/register forms
  dashboard/             Student-facing dashboard widgets (inspections, messages)
  owner/                 Owner-facing dashboard widgets (property form, listing actions)
  admin/                 Admin-facing dashboard widgets (moderation, user/report actions)
lib/
  db.js                  Postgres connection pool (pg)
  auth.js                Password hashing, JWT session helpers
  format.js               Currency/date/label formatting helpers
  queries/                All SQL lives here, grouped by domain
  validation/             Zod schemas
db/
  schema.sql              Full Postgres schema (run via db:migrate)
  seed.mjs                 Realistic OAU demo data (run via db:seed)
  migrate.mjs              Schema runner
proxy.js                   Edge middleware — protects /dashboard, /owner, /admin by role
```

Every source file begins with a comment stating its own path, e.g. `// app/page.js`,
per the project's file-path convention.

## 3. Getting a database (Neon)

1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the pooled connection string from your Neon dashboard
   (Connection Details → include `?sslmode=require`).
3. Copy `.env.example` to `.env.local` and paste it into `DATABASE_URL`.
4. Generate a session secret and put it in `JWT_SECRET`:
   ```bash
   openssl rand -base64 48
   ```

## 4. Local setup

```bash
npm install
npm run db:migrate   # creates all tables, enums, indexes in your database
npm run db:seed      # populates realistic OAU demo data
npm run dev          # http://localhost:3000
```

To build for production:

```bash
npm run build
npm run start
```

## 5. Demo accounts

The seed script creates one account per role. Password for all of them:
`Password123!`

| Role      | Email                              |
|-----------|-------------------------------------|
| Admin     | admin@abode.app                  |
| Landlord  | bayo.landlord@abode.app          |
| Landlord  | funke.landlord@abode.app         |
| Agent     | tunde.agent@abode.app            |
| Student   | chiamaka.student@abode.app       |
| Student   | segun.student@abode.app          |

## 6. Notable design/architecture decisions

- **Multi-university ready**: every property belongs to a `university_id` and
  `location_id`. OAU is seeded as the only active university today, but
  admins can add more from `/admin/universities` and `/admin/locations`
  without any code changes.
- **Moderation workflow**: new listings start as `pending_review`. Any
  substantive edit by an owner also resets status to `pending_review`, so
  admins always see current, unreviewed content before it's public. Simple
  availability toggles do **not** trigger re-review.
- **Photos**: there's no cloud storage/upload service wired up in this
  environment, so the listing form accepts pasted, already-hosted image URLs
  rather than direct file uploads. Swapping in a real upload flow (S3,
  Cloudinary, UploadThing, etc.) only requires changing the "Photos" section
  of `components/owner/PropertyForm.jsx` and the `image_urls` handling in
  `lib/queries/properties.js` — the database schema (`property_images`) is
  already upload-service-agnostic.
- **Map**: property detail pages embed an OpenStreetMap iframe (no API key
  required) centered on the property's stored latitude/longitude. There is no
  dedicated map *search* page (browsing many pins at once) yet — the search
  page uses list + filters instead. This is the most straightforward place to
  extend if you want a full map-based search experience (e.g. with Leaflet or
  Google Maps JS SDK).
- **Messaging**: implemented as simple 5-second polling rather than
  WebSockets, to avoid needing a persistent connection/server infrastructure.
  Swappable later for something like Pusher, Ably, or a WebSocket server.
- **Sessions**: stateless JWT in an httpOnly cookie, verified in `proxy.js`
  (Next.js's edge middleware convention) for route protection, and re-verified
  server-side against the database on every request that needs the full user
  record.

## 7. Known simplifications / good next steps

- No automated test suite yet (manual + build-time verification only).
- No rate limiting on auth or write endpoints.
- No email verification or password reset flow.
- Reviews are one-per-student-per-property and always auto-published; a
  moderation queue for reviews could reuse the same pattern as listing
  moderation if needed.
- Agents currently share the same dashboard as landlords (`/owner/*`); if
  agents need materially different permissions (e.g. managing listings they
  don't personally own), that's a natural next iteration on top of the
  existing `role` column.
# accomodation-finder
# accomodation-finder
