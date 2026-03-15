# Schedulify

## Overview

Schedulify is a web application for planning group events without the usual back-and-forth.

- Create events with a name, description, and time window
- Share an event link with participants
- Collect availability in one place
- Find overlapping times more easily

![demo](https://github.com/user-attachments/assets/f3281ea5-0466-4e7e-84c5-08114f37ade8)

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite

## Local Development

### Prerequisites

- Node.js v22 or later
- npm

No external database server is required.

### Clone the Repository

```bash
git clone https://github.com/prasen-shakya/Schedulify
cd Schedulify
```

### Install Dependencies

From the project root:

```bash
npm run install:all
```

### Configure Environment Variables

Create `backend/.env`:

```bash
SQLITE_DB_PATH=./data/schedulify.db

PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

Create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

### Run the Application

From the project root:

```bash
npm run dev
```

This starts:

- Backend: `node --watch server.js`
- Frontend: Vite dev server

You can also run each service separately:

```bash
npm run backend
npm run frontend
```

## Database Notes

- The SQLite database is created automatically on first backend startup.
- The default database path is `./data/schedulify.db` at the project root.
- The backend loads its environment from `backend/.env` explicitly, so the database path stays stable no matter where you start the server from.
- The schema is initialized from `db/schema.sql`.
- `data/schedulify.db` is generated local state and is ignored by Git.
