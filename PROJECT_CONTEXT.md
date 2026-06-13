# MediBridge — Project Context

> Living reference for architecture, completed work, and conventions.  
> Last updated from codebase analysis: June 14, 2026.

---

## PROJECT OVERVIEW

| Field | Value |
|-------|-------|
| **Project Name** | MediBridge |
| **Purpose** | Healthcare Referral Management SaaS |
| **Repository layout** | Monorepo: `client/` (React SPA) + `server/` (Node API) |

### Backend

- **Runtime:** Node.js (CommonJS)
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose)
- **Realtime:** Socket.IO (server initialized; client integration pending — Phase 8)
- **Auth:** JWT (`Bearer` token), bcrypt password hashing
- **Other:** Helmet, CORS, Morgan, node-cron (reservation expiry job)

### Frontend

- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS
- **UI primitives:** shadcn/ui (Radix-based components in `components/ui/`)
- **Charts:** Recharts
- **HTTP:** Axios (shared instance in `services/api.ts`)
- **Toasts:** Sonner

### User Roles

`SUPER_ADMIN` · `HOSPITAL_ADMIN` · `REFERRAL_COORDINATOR` · `DOCTOR`

Role-based navigation and route guards are enforced via `lib/navigation.ts`, `RoleRoute`, and server middleware.

### Environment Variables

**Client** (`client/.env`):

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**Server:** MongoDB URI, JWT secret, PORT (see `server/.env` / `.env.example`).

---

## COMPLETED FEATURES

### Phase 1 — Architecture

- Monorepo split: `client/` + `server/`
- Feature-based frontend structure under `client/src/features/`
- Shared Axios client with JWT interceptors and 401 redirect
- Express route modularization under `server/src/routes/`
- MongoDB models: User, Hospital, Doctor, Referral, BedReservation, Notification, ActivityLog
- Docker Compose for local stack (`docker-compose.yml`)

### Phase 2 — Foundation

- **Auth:** Login flow, JWT storage (`localStorage`), profile hydration, logout
- **Routing:** Centralized `ROUTES` constants, nested protected routes, 404/unauthorized pages
- **AppLayout:** Collapsible sidebar, responsive mobile drawer, top navbar
- **Sidebar:** Role-filtered navigation from `navigationConfig`
- **Navbar:** Breadcrumbs, user menu, logout
- **Axios:** Request/response interceptors, typed error shape
- **Protected Routes:** `ProtectedRoute` (auth gate) + `RoleRoute` (role gate)

### Phase 3 — Dashboard

- **KPI cards:** Role-aware stats for `SUPER_ADMIN` and `HOSPITAL_ADMIN`
- **Dashboard stats:** `GET /dashboard/stats` via `useDashboard` hook
- **Activity feed placeholder:** Static data in `ActivityFeed.tsx` with banner noting Phase 8 API wiring

> Doctors and referral coordinators can reach `/dashboard` in the nav but see a “no access” message — only `SUPER_ADMIN` / `HOSPITAL_ADMIN` fetch live stats (`supportsDashboardApi`).

### Phase 4 — Hospitals & Doctors

- **Hospital directory:** Card grid, search, capacity/status filters, pagination
- **Doctor directory:** Card grid, search, status/specialization filters, pagination
- **Detail views:** `HospitalDetailSheet` (sheet), `DoctorDetailDialog` (dialog)
- **API:** `GET /hospitals`, `GET /hospitals/:id`, `GET /doctors`

### Phase 5 — Referrals

- **Table view:** Sortable columns, pagination, row actions
- **Kanban view:** Status columns with drag-style cards (view persisted in `localStorage`)
- **Detail drawer:** Patient info, hospitals, timeline, action buttons
- **Actions:** Accept, reject, complete with confirmation dialogs
- **Optimistic updates:** Status updated immediately in `useReferrals`, rolled back on failure
- **Filters:** Search (debounced), status, hospital; inbound/outbound/all via route path
- **API:** `GET /referrals`, `PATCH /referrals/:id/accept|reject|complete`

### Phase 6 — Reservations

- **Reservation dashboard:** Summary KPI cards, searchable/filterable table
- **Live countdown:** `useCountdownTick` + `ExpiryCountdown` for time-to-expiry
- **Reservation drawer:** Detail fetch on row click via `useReservationDetail`
- **KPI summary cards:** Active, expiring soon, expired counts from client-side aggregation
- **API:** `GET /reservations`, `GET /reservations/:id`

### Phase 7 — Reports & Analytics

- **Executive summary:** System-wide KPIs
- **Hospital analytics:** Capacity, bed utilization, reservation stats
- **Doctor analytics:** Availability breakdown, specialization distribution
- **Referral analytics:** Status/priority distribution charts
- **Top hospitals:** Ranked table by referral volume
- **Recharts integration:** `DistributionChart` for pie/bar visualizations
- **Shared analytics primitives:** `components/analytics/` (`StatCard`, `MetricsGrid`, `SectionCard`)
- **API:** Parallel fetch of five report endpoints via `useReports`

### Placeholder Pages (routed, not yet implemented)

- **Notifications** (`/notifications`) — `PagePlaceholder` only
- **Settings** (`/settings`) — `PagePlaceholder` only

---

## CURRENT FOLDER STRUCTURE

```
medibridge-ai/
├── client/                          # React + TypeScript SPA
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── analytics/           # Shared report/analytics layout primitives
│       │   ├── common/              # Cross-feature reusable UI
│       │   ├── layout/              # Sidebar, TopNavbar
│       │   └── ui/                  # shadcn/ui primitives (Button, Card, Badge, …)
│       ├── context/
│       │   └── AuthContext.tsx      # Auth state, login/logout, token persistence
│       ├── features/                # Feature modules (primary organization unit)
│       │   ├── dashboard/
│       │   │   ├── components/      # DashboardView, StatCard, ActivityFeed, skeletons
│       │   │   ├── hooks/           # useDashboard
│       │   │   ├── services/        # dashboard.service.ts
│       │   │   ├── types/
│       │   │   ├── utils/           # dashboardMappers
│       │   │   └── index.ts
│       │   ├── hospitals/
│       │   │   ├── components/      # HospitalsView, HospitalCard, HospitalDetailSheet
│       │   │   ├── hooks/           # useHospitals, useHospitalDetail
│       │   │   ├── services/
│       │   │   ├── types/
│       │   │   ├── utils/
│       │   │   └── index.ts
│       │   ├── doctors/
│       │   │   ├── components/      # DoctorsView, DoctorCard, DoctorDetailDialog
│       │   │   ├── hooks/           # useDoctors
│       │   │   ├── services/
│       │   │   ├── types/
│       │   │   ├── utils/
│       │   │   └── index.ts
│       │   ├── referrals/
│       │   │   ├── components/      # Table, Kanban, Drawer, ConfirmDialog, skeletons
│       │   │   ├── hooks/           # useReferrals, useReferralView
│       │   │   ├── services/
│       │   │   ├── types/
│       │   │   ├── utils/           # referralUtils, severity
│       │   │   └── index.ts
│       │   ├── reservations/
│       │   │   ├── components/      # ReservationsView, Table, Drawer, ExpiryCountdown
│       │   │   ├── hooks/           # useReservations, useReservationDetail, useCountdownTick
│       │   │   ├── services/
│       │   │   ├── types/
│       │   │   ├── utils/
│       │   │   └── index.ts
│       │   └── reports/
│       │       ├── components/      # ReportsView, section components, DistributionChart
│       │       ├── hooks/           # useReports
│       │       ├── services/
│       │       ├── types/
│       │       ├── utils/
│       │       └── index.ts
│       ├── hooks/                   # Global hooks: useAuth, useDebounce, usePagination
│       ├── layouts/
│       │   ├── AppLayout.tsx        # Sidebar + navbar shell
│       │   └── AuthLayout.tsx       # Login page wrapper
│       ├── lib/                     # constants, routes, navigation, toast, utils
│       ├── pages/                   # Thin route entry points → feature views
│       │   ├── auth/                # LoginPage, UnauthorizedPage
│       │   ├── dashboard/
│       │   ├── hospitals/
│       │   ├── doctors/
│       │   ├── referrals/
│       │   ├── reservations/
│       │   ├── reports/
│       │   ├── notifications/       # Placeholder
│       │   ├── settings/            # Placeholder
│       │   └── NotFoundPage.tsx
│       ├── routes/
│       │   ├── index.tsx            # AppRoutes — all route definitions
│       │   ├── ProtectedRoute.tsx
│       │   └── RoleRoute.tsx
│       ├── services/
│       │   ├── api.ts               # Shared Axios instance
│       │   └── auth.service.ts
│       ├── types/                   # auth.ts, api.ts
│       ├── App.tsx
│       └── main.tsx
│
├── server/                          # Node.js + Express API
│   ├── server.js                    # HTTP server, DB connect, Socket.IO init, cron jobs
│   └── src/
│       ├── app.js                   # Express app + route mounting
│       ├── config/
│       │   ├── db.js                # MongoDB connection
│       │   └── socket.js            # Socket.IO initialization
│       ├── controllers/             # Request handlers per domain
│       ├── middleware/
│       │   ├── auth.middleware.js   # JWT verification
│       │   ├── role.middleware.js
│       │   └── authorize.middleware.js
│       ├── models/                  # Mongoose schemas
│       ├── routes/                  # Express routers
│       ├── services/                # Business logic, socket emitter, cron, notifications
│       └── utils/                   # Mappers, distance, etc.
│
├── docs/
├── docker-compose.yml
└── PROJECT_CONTEXT.md
```

### Realtime (server-side, Phase 8 client pending)

| Location | Purpose |
|----------|---------|
| `server/src/config/socket.js` | Socket.IO server setup on HTTP server |
| `server/src/services/socketEmitter.service.js` | Broadcast helper (`io.emit`) |
| `client/src/lib/constants.ts` | `SOCKET_URL` constant defined; **no client Socket.IO usage yet** |

**Server-emitted events (not yet consumed by frontend):**

- `dashboardUpdated`
- `notificationCreated`
- `referralAccepted`
- `bedReserved`
- `doctorAssigned`
- `reservationExpired`

---

## API ENDPOINTS USED

All client calls go through the shared Axios instance (`baseURL`: `VITE_API_URL` → `/api` prefix).

### Auth

| Method | Endpoint | Service | Used By |
|--------|----------|---------|---------|
| `POST` | `/auth/login` | `auth.service.ts` | Login page |
| `GET` | `/auth/profile` | `auth.service.ts` | AuthContext (init + post-login) |

### Dashboard

| Method | Endpoint | Service | Used By |
|--------|----------|---------|---------|
| `GET` | `/dashboard/stats` | `dashboard.service.ts` | `useDashboard` → DashboardView |

### Hospitals

| Method | Endpoint | Service | Used By |
|--------|----------|---------|---------|
| `GET` | `/hospitals` | `hospital.service.ts` | `useHospitals` → HospitalsView |
| `GET` | `/hospitals/:id` | `hospital.service.ts` | `useHospitalDetail` → HospitalDetailSheet |

### Doctors

| Method | Endpoint | Service | Used By |
|--------|----------|---------|---------|
| `GET` | `/doctors` | `doctor.service.ts` | `useDoctors` → DoctorsView |

### Referrals

| Method | Endpoint | Service | Used By |
|--------|----------|---------|---------|
| `GET` | `/referrals` | `referral.service.ts` | `useReferrals` → ReferralsView |
| `PATCH` | `/referrals/:id/accept` | `referral.service.ts` | Accept action |
| `PATCH` | `/referrals/:id/reject` | `referral.service.ts` | Reject action |
| `PATCH` | `/referrals/:id/complete` | `referral.service.ts` | Complete action |

> `ReferralQueryParams` (status, patientName, condition) are typed but filtering is currently client-side; `getAll()` is called without query params.

### Reservations

| Method | Endpoint | Service | Used By |
|--------|----------|---------|---------|
| `GET` | `/reservations` | `reservation.service.ts` | `useReservations` → ReservationsView |
| `GET` | `/reservations/:id` | `reservation.service.ts` | `useReservationDetail` → ReservationDetailDrawer |

### Reports

| Method | Endpoint | Service | Used By |
|--------|----------|---------|---------|
| `GET` | `/reports/system-summary` | `report.service.ts` | `useReports` (parallel) |
| `GET` | `/reports/hospital-summary` | `report.service.ts` | `useReports` (parallel) |
| `GET` | `/reports/doctor-summary` | `report.service.ts` | `useReports` (parallel) |
| `GET` | `/reports/referral-summary` | `report.service.ts` | `useReports` (parallel) |
| `GET` | `/reports/top-hospitals` | `report.service.ts` | `useReports` (parallel) |

### Backend endpoints NOT yet connected to frontend

These exist on the server but have no client service/hook wiring:

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `GET /auth/admin`, `GET /auth/test` |
| Hospitals | `POST /hospitals`, `PATCH /hospitals/:id/beds` |
| Doctors | `POST /doctors`, `GET /doctors/hospital/:hospitalId` |
| Referrals | `POST /referrals` |
| Reports | `GET /reports/hospital/:hospitalId` (method exists in `report.service.ts` but unused) |
| Reservations | — (read-only connected) |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read` |
| Activities | `GET /activities` |
| Doctor dashboard | `GET /doctor-dashboard` |
| Recommendations | `GET /recommendations/best-hospital`, `/nearby`, etc. |
| AI | `POST /ai/triage`, etc. |
| Smart referrals | `POST /smart-referrals/*` |
| Admin | `GET /admin/*`, `PATCH /admin/*` |
| Health | `GET /api/health` |

---

## REUSABLE COMPONENTS

### `components/common/` — Cross-feature UI

| Component | Purpose |
|-----------|---------|
| `PageHeader` | Page title, description, optional action slot |
| `SearchBar` | Debounce-ready search input with clear button |
| `FilterBar` | Config-driven `<select>` filter row |
| `EmptyState` | Icon + title + description + optional action |
| `PagePlaceholder` | Stub page for unimplemented routes |
| `ResourceCard` | Generic card shell for hospital/doctor cards |
| `StatusBadge` | Domain badges: `ReferralStatusBadge`, `ReferralPriorityBadge`, `DoctorStatusBadge`, `HospitalStatusBadge`, `ReservationStatusBadge` |

### `components/analytics/` — Reports layout primitives

| Component | Purpose |
|-----------|---------|
| `StatCard` | KPI tile with label, value, optional trend |
| `MetricsGrid` | Responsive grid wrapper for metric tiles |
| `SectionCard` | Titled analytics section container |

### `components/layout/`

| Component | Purpose |
|-----------|---------|
| `Sidebar` | Role-filtered nav, collapse, mobile overlay |
| `TopNavbar` | Mobile menu trigger, breadcrumbs, user dropdown |

### `components/ui/` — shadcn/ui primitives

| Component | Notes |
|-----------|-------|
| `Button` | Variants: default, secondary, destructive, ghost, link |
| `Input` | Form text input |
| `Card` | Card, CardHeader, CardContent, CardFooter |
| `Badge` | Variants: default, success, warning, danger, secondary |
| `Avatar` | User avatar with fallback |
| `Dialog` | Modal dialog (used by doctor detail) |
| `Sheet` | Slide-over panel (used by hospital/referral/reservation drawers) |
| `DropdownMenu` | User menu in navbar |
| `ScrollArea` | Scrollable regions |
| `Separator` | Visual divider |

### Feature-local shared patterns (within features)

| Pattern | Location | Reused across |
|---------|----------|---------------|
| Skeleton loaders | Each feature's `components/*Skeleton.tsx` | Loading states per view |
| Detail drawers/sheets | referrals, reservations, hospitals | Consistent detail UX |
| View switcher | `ReferralViewSwitcher` | Table ↔ Kanban toggle |
| Confirm dialog | `ReferralConfirmDialog` | Destructive referral actions |
| `MetricItem` | reports feature | Inline metric rows in analytics sections |
| `DistributionChart` | reports feature | Recharts pie/bar charts |

### Global hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Read AuthContext (user, login, logout) |
| `useDebounce` | Debounce search inputs |
| `usePagination` | Client-side page slicing |

### Layouts

| Layout | Purpose |
|--------|---------|
| `AppLayout` | Authenticated app shell |
| `AuthLayout` | Centered login layout |

---

## ARCHITECTURE RULES

1. **Feature-based architecture** — Domain logic lives in `features/<domain>/` with co-located components, hooks, services, types, and utils. Pages are thin wrappers.

2. **No duplicate components** — Reuse `components/common/`, `components/analytics/`, and `components/ui/` before creating new shared UI. Extend existing badges and filters rather than copying.

3. **No mock APIs** — All live features call real backend endpoints via the shared Axios instance. Placeholder UIs (activity feed, notifications page) must be clearly marked until wired.

4. **No hardcoded URLs** — Use `ROUTES` (`lib/routes.ts`), `API_BASE_URL` / `SOCKET_URL` (`lib/constants.ts`), and env vars. Never inline `http://localhost:...` in components.

5. **Use existing Axios instance** — Import `api` from `@/services/api`. Do not create alternate HTTP clients.

6. **Use TypeScript everywhere** — All client code is `.ts`/`.tsx`. Define types in feature `types/` or shared `types/`.

7. **Reuse analytics components** — Reports and future analytics screens should compose `StatCard`, `MetricsGrid`, `SectionCard` from `components/analytics/`.

8. **Reuse badges** — Use `StatusBadge` exports for all status/priority/capacity display.

9. **Reuse search/filter components** — `SearchBar` + `FilterBar` + `useDebounce` + `usePagination` for list views.

10. **Never break existing features** — New work (Phase 8+) must extend, not replace, completed phases. Preserve optimistic update patterns, role guards, and service response handling (`success` + `data` checks).

### Additional conventions observed in codebase

- **Barrel exports:** Features expose public API via `features/<domain>/index.ts`.
- **Toast feedback:** `showSuccessToast` / `showErrorToast` from `lib/toast.ts` (Sonner).
- **Auth persistence:** `localStorage` key `medibridge_auth`; 401 clears storage and redirects to login.
- **Role navigation:** `getNavigationForRole()` filters sidebar items; `routeRoles` maps paths to allowed roles.
- **Service layer pattern:** Each feature has a `*.service.ts` that wraps Axios, validates `ApiResponse`, and throws on failure.
- **Page container:** Views use `page-container` CSS class for consistent padding/max-width.

---

## NEXT PHASE

### Phase 8 — Notifications + Socket.IO

**Goals:**

1. **Client Socket.IO integration**
   - Connect using `SOCKET_URL` from env/constants
   - Subscribe to server events: `notificationCreated`, `dashboardUpdated`, `referralAccepted`, `bedReserved`, `doctorAssigned`, `reservationExpired`
   - Consider `SocketContext` or feature-scoped hook

2. **Notifications UI**
   - Replace `NotificationsPage` placeholder
   - Wire `GET /notifications` and `PATCH /notifications/:id/read`
   - Navbar notification bell with unread count/badge
   - Real-time notification list updates via socket

3. **Activity feed**
   - Replace static data in `ActivityFeed.tsx` with `GET /activities`
   - Optional live updates via socket events

4. **Live dashboard refresh**
   - Refetch dashboard stats on `dashboardUpdated` socket event

**Backend already in place:**

- Socket.IO initialized in `server.js`
- `Notification` model + `notification.service.js`
- `ActivityLog` model + `activity.routes.js`
- Event emission in referral acceptance, reservation expiry, and notification creation flows

**Dependencies to add (client):**

- `socket.io-client` (already on server; not yet in `client/package.json`)

---

## QUICK REFERENCE — Route Map

| Path | Page | Roles |
|------|------|-------|
| `/login` | Login | Public |
| `/dashboard` | Dashboard | All authenticated (API: Super Admin, Hospital Admin only) |
| `/referrals` | All referrals | Super Admin, Hospital Admin, Referral Coordinator |
| `/referrals/inbound` | Inbound referrals | Same |
| `/referrals/outbound` | Outbound referrals | Same |
| `/hospitals` | Hospitals | Super Admin |
| `/doctors` | Doctors | Super Admin, Hospital Admin |
| `/reservations` | Reservations | Super Admin, Hospital Admin, Doctor |
| `/reports` | Reports & Analytics | Super Admin |
| `/notifications` | Notifications (stub) | All authenticated roles |
| `/settings` | Settings (stub) | All authenticated roles |
| `/unauthorized` | Unauthorized | Public |

---

## SERVER DATA MODELS

| Model | File | Domain |
|-------|------|--------|
| User | `models/User.js` | Auth, roles, hospital assignment |
| Hospital | `models/Hospital.js` | Facilities, beds, capacity |
| Doctor | `models/Doctor.js` | Staff, specialization, availability |
| Referral | `models/Referral.js` | Patient referrals between hospitals |
| BedReservation | `models/BedReservation.js` | Temporary bed holds with expiry |
| Notification | `models/Notification.js` | User notifications (Phase 8) |
| ActivityLog | `models/ActivityLog.js` | System activity audit trail (Phase 8) |
