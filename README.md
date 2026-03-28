# JAMB CBT — Frontend

React + Vite frontend for the JAMB CBT Simulator.

---
## Prerequisites

- Node.js v18+
- Backend API running at `http://localhost:5005`

---

## Setup

**1. Install dependencies**
```bash
cd frontend
npm install
```

**2. Create `.env` file**

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5005/api
```

> If your backend runs on a different port, update `VITE_API_URL` accordingly.

**3. Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Start Vite dev server on port 3000 |
| Build | `npm run build` | Production build to `dist/` |
| Preview | `npm run preview` | Preview production build locally |
| Lint | `npm run lint` | Run ESLint |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5005/api` | Base URL for all API requests |
