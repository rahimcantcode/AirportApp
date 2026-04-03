# Airport Luggage Tracking System (Full Stack)

This project is organized as a full stack application with a React + TypeScript frontend and a Node + TypeScript backend.

## Structure

- `frontend/` React UI (role based dashboards, check in, bag tracking)
- `backend/` API server (placeholder in this class version)
- `shared/` Shared types and utilities (if needed)

## Run locally

### 1) Install dependencies

From the project root:

```bash
npm install
```

### 2) Configure Supabase

1. Create a Supabase project.
2. In Supabase SQL editor, run:
   - `backend/supabase/schema.sql`
   - `backend/supabase/seed.sql` (optional sample data)
   Notes:
   - ERD core tables are implemented directly.
   - UI-only fields are in extension tables: `staff_credentials`, `message_meta`, `bag_meta`.
3. Add env files:

`backend/.env`:
```bash
PORT=3001
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

`frontend/.env`:
```bash
VITE_API_BASE_URL=http://localhost:3001
```

### 3) Start backend

```bash
cd backend
npm run dev
```

### 4) Start frontend

In another terminal:

```bash
cd frontend
npm run dev
```

## Notes

- Staff credentials are auto generated and saved in `login_credentials` (demo mode).
- Ground staff must choose a posting mode (Security Clearance or Gate Ops) before acting.
- Gate staff must select a gate and can only work one gate at a time.
