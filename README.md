# Multi-User Portfolio Platform - Phase 1 Foundation

This repository now includes a production-ready foundation for:

- Frontend: React + Vite + Tailwind CSS + React Router
- Backend: Node.js + Express + MongoDB + JWT structure

The goal of this phase is to establish scalable architecture, not complete feature logic.

## 1. Project Folder Structure

```text
schlmgnt/
	backend/
		package.json
		.env.example
		src/
			app.js
			server.js
			config/
				db.js
				env.js
			middlewares/
				authMiddleware.js
				errorHandler.js
				notFound.js
			modules/
				auth/
					auth.controller.js
					auth.route.js
					auth.service.js
				users/
					users.route.js
				portfolios/
					portfolios.route.js
				projects/
					projects.route.js
			routes/
				index.js
			utils/
				apiError.js
				asyncHandler.js
				jwt.js
			validations/
				auth.validation.js
				index.js
	src/
		app/
			router.jsx
		components/
			common/
			layout/
				Footer.jsx
				Navbar.jsx
		constants/
			routes.js
		features/
			auth/
				authService.js
		hooks/
			useAuth.js
		layouts/
			DashboardLayout.jsx
			MainLayout.jsx
		pages/
			Dashboard.jsx
			Home.jsx
			Login.jsx
			Portfolio.jsx
		routes/
			ProtectedRoute.jsx
		services/
			apiClient.js
		utils/
			classNames.js
		App.jsx
		index.css
		main.jsx
	datacontext.jsx
	.env.example
```

## 2. Installation Commands

Run from workspace root:

```bash
npm install
```

Run for backend:

```bash
cd backend
npm install
cd ..
```

If you want to install frontend dependencies from scratch manually:

```bash
npm install react react-dom react-router-dom axios
npm install -D tailwindcss @tailwindcss/vite @vitejs/plugin-react vite
```

Backend dependency install command:

```bash
cd backend
npm install express mongoose mongodb jsonwebtoken cookie-parser cors helmet morgan dotenv
cd ..
```

## 3. Environment Setup

Create these files:

1. Copy `.env.example` to `.env`
2. Copy `backend/.env.example` to `backend/.env`

Frontend env values:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=PortfolioHub
```

Backend env values:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio_platform
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=replace-with-strong-access-secret
JWT_REFRESH_SECRET=replace-with-strong-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## 4. Run Commands

Start frontend:

```bash
npm run dev
```

Start backend:

```bash
cd backend
npm run dev
```

## 5. File-by-File Setup Summary

### Frontend

- `src/app/router.jsx`
	- Centralized route definitions
	- Public routes and protected dashboard route

- `src/layouts/MainLayout.jsx`
	- Shared layout for public pages with navbar/footer

- `src/layouts/DashboardLayout.jsx`
	- Authenticated dashboard shell with side nav

- `src/routes/ProtectedRoute.jsx`
	- Route guard that redirects non-authenticated users to login

- `src/services/apiClient.js`
	- Axios instance with base URL, timeout, and credentials support

- `src/pages/*`
	- Starter pages for Home, Portfolio, Login, Dashboard

- `datacontext.jsx` + `src/hooks/useAuth.js`
	- Lightweight auth state with login/logout and loading

### Backend

- `backend/src/server.js`
	- Entry point, DB connect, and server startup

- `backend/src/app.js`
	- Express setup, security middleware, JSON parser, API mount

- `backend/src/config/env.js`
	- Env loading and required variable checks

- `backend/src/config/db.js`
	- MongoDB connection setup with Mongoose

- `backend/src/routes/index.js`
	- API v1 route aggregation

- `backend/src/middlewares/*`
	- `authMiddleware.js`: starter JWT protection
	- `notFound.js`: 404 handler
	- `errorHandler.js`: centralized error response

- `backend/src/utils/*`
	- `asyncHandler.js`: wraps async controllers
	- `apiError.js`: typed API error class
	- `jwt.js`: sign/verify JWT helpers

- `backend/src/modules/*`
	- Domain-based starter modules: auth, users, portfolios, projects

- `backend/src/validations/*`
	- Starter payload checks (ready to replace with zod/joi in next phase)

## 6. Architecture Decisions (Why This Structure)

- Domain-first module folders keep business logic grouped and scalable
- Separate `config`, `middlewares`, and `utils` avoids controller bloat
- Route aggregation under `/api/v1` enforces versioning from day one
- Frontend layouts and route guards keep navigation concerns centralized
- Axios client centralization prevents duplicated request logic
- Auth context is minimal now, so JWT integration can be swapped in later without rewiring UI

## 7. Setup Checklist

- [x] React + Vite app initialized
- [x] Tailwind configured and global styles added
- [x] React Router configured with dynamic and protected routes
- [x] MainLayout and DashboardLayout created
- [x] Starter pages created (Home, Portfolio, Login, Dashboard)
- [x] Reusable frontend folders created
- [x] Axios API client configured
- [x] Frontend env template added
- [x] Express backend initialized
- [x] MongoDB connection setup added
- [x] Core backend middleware configured
- [x] Error handling and async handler added
- [x] `/api/v1` versioning added
- [x] Starter modules created (auth, users, portfolios, projects)
- [x] JWT utility structure added
- [x] Protected middleware starter added

## 8. Next Implementation Steps (Phase 2)

1. Implement real User model and Auth model logic
2. Add password hashing (bcrypt) and login/register flow
3. Add refresh token flow with httpOnly cookies
4. Build portfolio schema and public member listing APIs
5. Connect frontend pages to backend APIs using `apiClient`
6. Replace demo auth with real JWT session handling

