# Project Title

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/node-%3E%3D14-brightgreen.svg)](https://nodejs.org/) [![Vite](https://img.shields.io/badge/vite-%5E4.0.0-646CFF.svg)](https://vitejs.dev/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Project Features](#project-features)
- [Architecture Diagram](#architecture-diagram)
- [Security Overview](#security-overview)
- [Installation & Setup](#installation--setup)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment Guide](#deployment-guide)
  - [cPanel](#cpanel)
  - [Docker (optional)](#docker-optional)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact & Acknowledgements](#contact--acknowledgements)

---

## Overview

This repository contains a full‑stack web application built with a **Node.js/Express** backend (using **Prisma** for database access) and a **Vite + React** frontend. The project demonstrates modern development practices, including TypeScript, environment configuration, and a clean separation of concerns between client and server.

---

## Features

### Frontend
- **Vite** powered fast development server with hot‑module replacement.
- **React** with functional components and hooks.
- Responsive UI built with vanilla CSS, employing modern design patterns.
- Client‑side routing via `react-router-dom`.
- Image upload handling with preview support.
- State management using React Context.

### Backend
- **Express** API server.
- **Prisma** ORM for type‑safe database interactions (MySQL compatible).
- Secure handling of file uploads (stored in `/uploads`).
- Environment‑based configuration (`.env`).
- RESTful endpoints for authentication, posts, comments, and user profiles.
- Input validation and sanitisation to mitigate injection attacks.

---

## Project Features

### Authentication & Authorization
- Secure JWT‑based authentication with session handling.
- Registration collects first name, last name, email, and password.
- Login grants access to protected routes (Feed).

### Feed Page
- Protected route showing posts from all users.
- Posts displayed newest first.
- Create posts with text and optional image upload.
- Like/Unlike functionality for posts, comments, and replies.
- Commenting system with nested replies and likes.
- Visibility controls: **Public** posts visible to everyone, **Private** posts visible only to the author.
- Shows who liked each post/comment/reply.

### Security & Performance
- Input validation, rate limiting, CORS restrictions.
- Environment‑based configuration, secrets stored in `.env`.
- Designed for scalability with Prisma ORM and indexed database tables.

### Deliverables
- live deployment on **Shared cPanel** with URL.

---

## Security Overview

- **Environment Variables**: Secrets (DB credentials, JWT secret) are stored in `.env` and never committed.
- **Input Validation**: All incoming data is validated with `express-validator` to prevent XSS and SQL injection.
- **CORS**: Configured to allow only trusted origins.
- **Rate Limiting**: Basic rate limiting on authentication routes.
- **File Upload Sanitisation**: Uploaded files are renamed with a UUID and MIME‑type checked.
- **HTTPS Ready**: The app can be run behind a reverse proxy (e.g., Nginx) with TLS termination.

---

## Installation & Setup

### Prerequisites
- **Node.js** (>=14) and **npm** (or **yarn**)
- **MySQL** instance (or use SQLite for quick start)

### Backend Setup
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy example env and configure
cp .env.example .env
# Edit .env with your DB credentials and JWT secret

# Run Prisma migrations (if using PostgreSQL/MySQL)
npx prisma migrate dev --name init

# Start the server
npm run dev   # or npm start for production build
```
The API will be available at `http://localhost:3000` by default.

### Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The Vite dev server runs at `http://localhost:5173` and proxies API calls to the backend (see `vite.config.js`).

---

## Development Workflow

| Command | Description |
|---------|-------------|
| `npm run dev` (backend) | Starts the Express server with `ts-node-dev` for hot reload |
| `npm run build` (backend) | Compiles TypeScript to `dist/` |
| `npm start` (backend) | Runs compiled production server |
| `npm run dev` (frontend) | Starts Vite dev server |
| `npm run build` (frontend) | Generates production assets in `dist/` |
| `npm run lint` | Runs ESLint across the codebase |
| `npm test` | Executes Jest test suite (if present) |

---

## Testing

The project includes a basic Jest configuration for unit testing backend services. To run tests:
```bash
cd backend
npm test
```
Frontend components can be tested with **React Testing Library** (setup pending). Add tests as needed and update the CI pipeline.

---

## Deployment Guide

### cPanel
1. **Create a Node.js application** in cPanel → *Setup Node.js App*.
2. Upload the repository (or pull via Git) to the home directory.
3. Set the **application root** to `backend`.
4. Install dependencies via the *Run NPM Install* button.
5. Add environment variables in the *Environment Variables* section (copy from `.env`).
6. Set the **startup file** to `dist/index.js` (after running `npm run build`).
7. Start the app and configure a reverse proxy (Apache/Nginx) to forward `/api` requests to the Node process.
8. For the frontend, build the static assets (`npm run build`) and place the `dist/` folder in the public_html directory or serve via the same Node server.


## Contact & Acknowledgements

- **Author**: Rayhan Hosen

---
