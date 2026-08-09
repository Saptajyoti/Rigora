# Rigora

Rigora is a full-stack e-commerce platform designed for browsing and purchasing computer components and PC hardware.

## Features

- User registration and login
- JWT authentication with HTTP-only cookies
- Product catalog
- Search, filtering and pagination
- Category and brand browsing
- Product details
- Shopping cart
- Guest cart using localStorage
- Wishlist
- Checkout
- Razorpay payment integration
- Order management
- Order tracking
- Product reviews
- User profile management
- Admin dashboard
- Product management
- Order management
- Review management

## Tech Stack

### Frontend
- React
- Vite
- Redux Toolkit
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication
- JWT
- bcrypt
- HTTP-only cookies

### Payment
- Razorpay

## Architecture

React Frontend
        ↓
Redux Toolkit
        ↓
REST API
        ↓
Express.js / Node.js
        ↓
Mongoose
        ↓
MongoDB

## Running Locally

### 1. Clone the repository

git clone <repository-url>

### 2. Install dependencies

npm install

### 3. Configure environment variables

Create the required `.env` files using `.env.example`.

### 4. Start the application

npm run dev

Frontend:
http://localhost:5173

Backend:
http://localhost:5000