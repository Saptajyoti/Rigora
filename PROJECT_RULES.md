# Rigora – Project Rules

## Project Overview

Rigora is a full-stack MERN e-commerce platform focused on computer components and PC hardware.

Tech stack:
- React + Vite
- Redux Toolkit
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication using HTTP-only cookies
- Razorpay payment integration

---

## Project Structure

rigora/
├── client/          # React frontend
├── server/          # Express backend
├── docs/            # Project documentation
├── README.md
└── PROJECT_RULES.md

---

## Development Rules

### Frontend

- Use React functional components and hooks.
- Use Redux Toolkit for global application state.
- Keep API communication separate from presentation logic.
- Reuse existing components before creating new ones.
- Keep pages inside `client/src/pages`.
- Keep reusable UI components inside `client/src/components`.
- Use React Router for navigation.
- Never hardcode backend URLs.
- Use Vite environment variables for configurable URLs and keys.

### Backend

- Follow the Model–Controller–Route architecture.
- Keep database logic inside models/controllers.
- Keep routes lightweight.
- Use `asyncHandler` for asynchronous controllers.
- Use centralized error handling.
- Validate incoming user data.
- Never expose passwords, JWT secrets, database credentials, or payment secrets.
- Protected endpoints must use authentication middleware.
- Admin operations must use role-based authorization.

### Database

- Use Mongoose models for database access.
- Maintain relationships using MongoDB ObjectIds.
- Avoid duplicate records where uniqueness is required.
- Validate required fields at schema level.
- Do not modify production data through seed scripts.

### Authentication

- Passwords must be hashed using bcrypt.
- Authentication must use JWT.
- JWT should be stored in HTTP-only cookies.
- Protected routes must verify authentication.
- Admin routes must verify both authentication and admin role.

### Cart & Wishlist

- Guest cart data is stored in localStorage.
- Authenticated cart/wishlist data is stored in MongoDB.
- Guest cart should merge with the user's cart after authentication.
- Product price and stock must be verified by the backend.

### Orders & Payments

- Never trust prices received from the frontend.
- Calculate order totals on the backend.
- Never expose Razorpay secret keys to the frontend.
- Verify payment information on the backend.
- Orders must belong to the authenticated user.
- Admin-only order operations must remain protected.

---

## Code Quality

Before considering a change complete:

1. Run linting.
2. Run the production build.
3. Check the browser console for errors.
4. Check the server terminal for errors.
5. Test affected API endpoints.
6. Test both authenticated and guest behavior where applicable.

---

## Environment Variables

Secrets must only exist inside `.env` files.

Never commit:

- MongoDB credentials
- JWT secrets
- Razorpay secret keys
- Production secrets
- Private API keys

Only `.env.example` should be committed.

---

## Git Rules

Do not commit:

- node_modules/
- .env
- build output
- temporary files
- logs
- private credentials

Use meaningful commit messages.

Examples:

feat: add order tracking
fix: merge guest cart after login
fix: verify Razorpay payment
docs: update deployment instructions

---

## Deployment

Frontend and backend configuration must work through environment variables.

Production code must not depend on:

- localhost URLs
- local MongoDB
- developer-specific file paths

Always verify the production build before deployment.