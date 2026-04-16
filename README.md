# 🖥️ ApexTech — Online Computer Hardware Store

> A fully functional full-stack e-commerce web application for computer hardware, built with the MERN stack. Users can browse products, manage their accounts, and perform full CRUD operations through a RESTful API.

## 🌐 Live Demo

| Service     | URL                                      |
|-------------|------------------------------------------|
| 🎨 Frontend  | Deployed on **Vercel**                   |
| ⚙️ Backend   | Hosted on **Render**                     |

> ⚠️ **Note:** The backend is hosted on Render's free tier. The first request may take **30–60 seconds** to wake up the server after inactivity.

---

## ✨ Features

- 🛒 Browse computer hardware products
- ➕ Add new products to the store
- ✏️ Update existing product details
- 🗑️ Delete products
- 👤 User Registration & Login
- 🔐 Secure Logout
- 🔗 RESTful API communication between frontend and backend
- 📦 MongoDB for persistent data storage

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React.js + Vite (tailwind css)          |
| Backend    | Node.js + Express.js                    |
| Database   | MongoDB (MongoDB Atlas)                 |
| API Style  | REST API                                |
| Deployment | Vercel (frontend) + Render (backend)    |

---

## 📁 Project Structure

```
computer-store-web/
│
├── i-computer-backend/             # Node.js + Express backend
│   ├── controllers/                # Route business logic
│   ├── models/                     # MongoDB Mongoose models
│   ├── routes/                     # API route definitions
│   ├── .env                        # Environment variables (git ignored)
│   ├── .gitignore
│   ├── index.js                    # Server entry point
│   ├── package-lock.json
│   └── package.json
│
├── i-computer-frontend/            # React.js + Vite frontend
│   ├── dist/                       # Production build output
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── assets/                 # Images, icons, fonts
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Page-level components
│   │   ├── utils/                  # Helper functions & API calls
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx                # React entry point
│   ├── .env                        # Environment variables (git ignored)
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started — Run Locally

### ✅ Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas cloud)
- [Git](https://git-scm.com/)

---

### 📥 1. Clone the Repository

```bash
git clone https://github.com/lakkanadulshan/computer-store-web.git
cd computer-store-web
```

---

### ⚙️ 2. Setup the Backend

```bash
cd i-computer-backend
npm install
```

Start the backend server:

```bash
npm start
```

> ✅ Backend will run at: `http://localhost:3000`

---

### 🎨 3. Setup the Frontend

Open a **new terminal**, then:

```bash
cd i-computer-frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

> ✅ Frontend will run at: `http://localhost:5173`

---

### 🖥️ Run Both Together (Summary)

| Terminal   | Folder                   | Command        | Runs At                     |
|------------|--------------------------|----------------|-----------------------------|
| Terminal 1 | `i-computer-backend/`    | `npm start`    | `http://localhost:3000`     |
| Terminal 2 | `i-computer-frontend/`   | `npm run dev`  | `http://localhost:5173`     |

---

## 🔗 API Endpoints

### Products

| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | `/api/products`       | Get all products      |
| GET    | `/api/products/:id`   | Get a single product  |
| POST   | `/api/products`       | Add a new product     |
| PUT    | `/api/products/:id`   | Update a product      |
| DELETE | `/api/products/:id`   | Delete a product      |

### Auth

| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| POST   | `/api/auth/register`  | Register a new user   |
| POST   | `/api/auth/login`     | Login and get token   |
| POST   | `/api/auth/logout`    | Logout user           |

---

## 🌍 Deployment

### Frontend — Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Set the **root directory** to `i-computer-frontend/`
4. Add environment variable: `VITE_API_URL=your_render_backend_url`
5. Deploy ✅

### Backend — Render

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repository
3. Set the **root directory** to `i-computer-backend/`
4. Set **build command**: `npm install`
5. Set **start command**: `npm start`
6. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT`
7. Deploy ✅
