# YashOS

YashOS is a browser-based operating system simulator built with React, Tailwind CSS, Node.js, Express, JWT, Mongoose and MongoDB.

## Structure
- `frontend/` — React + Vite + Tailwind desktop UI and apps
- `backend/` — Express REST API, JWT auth and MongoDB/Mongoose data layer

## Run
1. Copy `frontend/.env.example` to `frontend/.env`.
2. Copy `backend/.env.example` to `backend/.env` and set a strong `JWT_SECRET` and MongoDB URI.
3. From the root: `npm run install:all`
4. Terminal 1: `npm run dev:backend`
5. Terminal 2: `npm run dev:frontend`

Frontend: http://localhost:5173
Backend: http://localhost:5000/api/health

## Step 22
Step 22 is the current stability/UX baseline. It fixes theme handling, browser navigation, terminal focus, AI layout, window behavior, taskbar positioning, lifecycle cleanup, and adds desktop shortcuts, context actions, and window snapping.

## Step 24
Step 24 adds a scrollbar-free draggable desktop launcher, persistent icon positions, reset layout controls, long-label wrapping, and improved light-theme readability.
