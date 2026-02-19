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

### 2) Start backend

```bash
cd backend
npm run dev
```

### 3) Start frontend

In another terminal:

```bash
cd frontend
npm run dev
```

## Notes

- Staff credentials are auto generated and emailed in a simulated way (logged in console).
- Ground staff must choose a posting mode (Security Clearance or Gate Ops) before acting.
- Gate staff must select a gate and can only work one gate at a time.

