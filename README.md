# 📅 Schedulify

## 🚀 Overview

**Schedulify** is a web application that simplifies scheduling group events.  
No more endless back-and-forth messages — with Schedulify you can:

- ✅ Create events with details like name, description, and time frame
- 🤝 Share the event with participants via a unique link
- 📆 Collect availability from everyone in one place
- ⏱️ Automatically find the best overlapping time to meet

![demo](https://github.com/user-attachments/assets/f3281ea5-0466-4e7e-84c5-08114f37ade8)

---

## ⚙️ Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MySQL

---

## 💻 Local Development

### 1️⃣ Prerequisites

Before running this project, make sure you have installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/)

Before running the app, create a database using the schema file located in the db directory.

---

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/prasen-shakya/Schedulify
cd schedulify
```

---

### 3️⃣ Install Dependencies

**Install all dependencies**:

From the project root directory:

```bash
npm run install:all
```

---

### 4️⃣ Configure Environment Variables

Create a `.env` file inside the **backend** folder with the following content:

```bash
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name

PORT=3000
JWT_TOKEN=your_token
```

Create a `.env` file inside the **frontend** folder with the following content:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

---

### 5️⃣ Set Up SSH Tunnel to Remote Database

Run this command from your local machine:

```bash
ssh -L 3307:127.0.0.1:3306 YOUR_USERNAME@blue.cs.sonoma.edu
```

Keep this terminal open while working, or run it in the background.

### 6️⃣ Run the Application

From the project root directory:

```bash
npm run dev
```

This will use **concurrently** to start both servers:

- **Backend:** Node.js with automatic reload (`node --watch server.js`)
- **Frontend:** Vite development server

You can also run them individually:

```bash
npm run backend
npm run frontend
```

---
