# Deployment Guide for Vercel

This project is best deployed as:

- Frontend: Vercel
- Backend: Render / Railway / VPS
- Database: PostgreSQL

## 1) Frontend deployment on Vercel

1. Push the repository to GitHub.
2. Open Vercel and create a new project.
3. Set the project root to the `frontend` folder.
4. Use these settings:
   - Framework: Vite
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
5. Add environment variable:
   - `VITE_API_URL=https://your-backend-domain.com`

## 2) Backend deployment

Deploy the backend from the project root to Render or Railway.

Use:

- Build Command: `npm install && npm run build`
- Start Command: `npm run start:prod`

Environment variables:

```env
PORT=3000
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://user:password@host:5432/isp_erp
DATABASE_SSL=false
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## 3) Why not deploy everything as one Vercel app

This project depends on:

- local SQLite in the current NestJS setup
- long-lived backend processes
- local file system access
- CORS restrictions for the frontend domain

These are not ideal for a single Vercel deployment without refactoring the backend. The architecture above is the correct production pattern.

## 4) Important note

If you are using the local SQLite database, it will not be suitable for Vercel production. Use PostgreSQL for all live deployments.

## 5) Final check before launch

- Test the frontend build: `cd frontend && npm run build`
- Test the backend build: `npm run build`
- Confirm the app can connect to the remote database
- Confirm `FRONTEND_URL` matches the live Vercel domain
- Confirm `VITE_API_URL` points to the live backend domain

## 6) Common fix

If frontend fails to connect:

- verify `VITE_API_URL`
- verify backend CORS allows the Vercel domain
- verify backend `DATABASE_URL` is valid
- verify backend is running on a public HTTPS domain
