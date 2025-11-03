# 📅 Schedulify  

## 🚀 Overview  
**Schedulify** is a web application that simplifies scheduling group events.  
No more endless back-and-forth messages — with Schedulify you can:  

- ✅ Create events with details like name, description, and time frame  
- 🤝 Share the event with participants via a unique link  
- 📆 Collect availability from everyone in one place  
- ⏱️ Automatically find the best overlapping time to meet  

---

## ⚙️ Tech Stack

- **Frontend:** React + Vite  
- **Backend:** Node.js + Express  
- **Database:** MySQL  

---

## 🧩 Project Structure  

```
schedulify/
├── backend/
│   ├── app.js
│   ├── routes/
│   ├── models/
│   └── ...
├── frontend/
│   ├── src/
│   ├── vite.config.js
│   └── ...
├── package.json
└── README.md
```

---

## 💻 Getting Started  

### 1️⃣ Prerequisites  
Before running this project, make sure you have installed:  
- [Node.js](https://nodejs.org/) (v18 or later)  
- [npm](https://www.npmjs.com/)  
- [MySQL](https://www.mysql.com/)

---

### 2️⃣ Clone the Repository  
```bash
git clone https://github.com/prasen-shakya/Schedulify
cd schedulify
```

---

### 3️⃣ Install Dependencies  

**Install root dependencies** (for concurrently):  
```bash
npm install
```

**Install backend dependencies:**  
```bash
cd backend
npm install
```

**Install frontend dependencies:**  
```bash
cd ../frontend
npm install
```

---

### 4️⃣ Configure Environment Variables  

Create a `.env` file inside the **backend** folder with the following content:  
```
SSH_HOST=
SSH_PORT=
SSH_USER=
SSH_PASSWORD=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

---

### 5️⃣ Run the Application  

From the project root directory:  
```bash
npm run dev
```

This will use **concurrently** to start both servers:
🔹 **Backend:** Node.js with automatic reload (`node --watch app.js`)
🔹 **Frontend:** Vite development server  

You can also run them individually:
```bash
npm run backend
npm run frontend
```

---

## 🧠 Available Scripts  

| Command | Description |
|----------|--------------|
| `npm run dev` | Run both frontend and backend concurrently |
| `npm run backend` | Start backend server only |
| `npm run frontend` | Start frontend dev server only |
