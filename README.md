# Smart Dukaan

> **Digital Shop Management System** — Billing | Inventory | Udhaar | Reports

A low-cost, freemium SaaS web app designed for kirana stores and small retailers in India. Replaces handwritten notebooks with a modern digital dashboard.

---

## Features

| Module | Description |
|---|---|
| **Dashboard** | Daily KPIs, sales chart, low-stock alerts |
| **Billing** | Fast bill creation, receipt print/PDF |
| **Inventory** | Product management, stock tracking, expiry alerts |
| **Udhaar** | Customer credit ledger, payment history |
| **Expenses** | Category-wise expense tracking |
| **Reports** | Daily/monthly sales reports, best-sellers chart |

## Tech Stack

- **Frontend:** React + Vite + Recharts + Lucide Icons
- **Backend:** Node.js + Express + Zod
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + bcrypt
- **Alerts:** node-cron + WhatsApp Cloud API

## Quick Start

### 1. Database Setup
Create a PostgreSQL database and update `server/.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/smartdukaan"
```

### 2. Backend
```bash
cd server
npm install
npm run db:generate
npm run db:push # or npx prisma migrate dev --name init
npm run dev
```

### 3. Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open App
Visit: http://localhost:5173

Register your shop -> Start billing!

---

## Project Structure

```
SmartDukan/
├── client/          # React + Vite frontend
│   └── src/
│       ├── pages/   # Dashboard, Billing, Inventory, Udhaar, Expenses, Reports
│       ├── context/ # AuthContext
│       ├── services/# Axios API service
│       └── components/
├── server/          # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── jobs/    # node-cron alert jobs
│   └── prisma/      # Database schema
└── README.md
```

## Environment Variables

### server/.env
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
PORT=5000
CLIENT_URL=http://localhost:5173
WHATSAPP_TOKEN=         # Optional: WhatsApp Cloud API token
WHATSAPP_PHONE_NUMBER_ID= # Optional
```

### client/.env
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

Made for Indian kirana shopkeepers
