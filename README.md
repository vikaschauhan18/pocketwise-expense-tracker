# Pocketwise — Expense Tracker (MERN)

Pocketwise is a portfolio-ready personal finance dashboard for tracking income, expenses, and monthly budgets. The project uses a standard MERN architecture and stores each user’s financial records under their own account.

A full-stack personal finance app built with MongoDB, Express, React + Vite, and Node.js.

## Features
- JWT registration/login with bcrypt password hashing
- Per-user income and expense transactions (create, list, edit, delete)
- Dashboard totals, monthly summary, category breakdown
- Monthly budgets with progress tracking
- Search/filter transactions by type, category, and month
- Responsive UI and charts
- CSV export
- API health endpoint

## Requirements
- Node.js 20+
- MongoDB Atlas or local MongoDB

## Setup
1. Create a MongoDB database and copy its connection string.
2. Copy `server/.env.example` to `server/.env` and set `MONGO_URI` and `JWT_SECRET`.
3. Copy `client/.env.example` to `client/.env` (default API URL works locally).
4. Install and run backend:
   ```bash
   cd server
   npm install
   npm run dev
   ```
5. In a second terminal, run frontend:
   ```bash
   cd client
   npm install
   npm run dev
   ```
6. Open the Vite URL printed in the terminal.

## Deployment
- Deploy `server` as a Node Web Service (Render): Build `npm install`, Start `npm start`.
- Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` in the backend environment.
- Deploy `client` as a Static Site: Build `npm install && npm run build`, Publish Directory `dist`.
- Set `VITE_API_URL` to the deployed backend API base URL, e.g. `https://YOUR-BACKEND.onrender.com/api`.
- Set `CLIENT_URL` to the deployed frontend URL.
- Configure MongoDB Atlas Network Access appropriately. Avoid `0.0.0.0/0` for production where possible.


## Author
- **Name:** Vikas Chauhan
- **Project:** Pocketwise — Expense Tracker
- **Stack:** MongoDB, Express.js, React, Node.js

> Add your own GitHub repository URL and live deployment URL here after publishing the project.
