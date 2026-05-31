# StockFlow — Inventory & Order Management System

A production-ready full-stack application for managing products, customers, orders, and inventory.

## Tech Stack
- **Backend**: Python · FastAPI · SQLAlchemy
- **Frontend**: React 18 · React Router v6 · Axios
- **Database**: PostgreSQL 15
- **Containerization**: Docker · Docker Compose
- **Frontend Deploy**: Vercel / Netlify
- **Backend Deploy**: Render / Railway / Fly.io

---

## Local Development (Docker)

### Prerequisites
- Docker Desktop installed and running
- Git

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env if needed — defaults work for local development
```

### 3. Start all services
```bash
docker compose up --build
```

This starts:
- **PostgreSQL** on `localhost:5432`
- **Backend API** on `http://localhost:8000`
- **Frontend** on `http://localhost:3000`

### 4. Access the app
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
- API Health: http://localhost:8000/health

### Stop services
```bash
docker compose down           # stop containers
docker compose down -v        # stop + delete database volume
```

---

## Running Without Docker (Development)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # update DATABASE_URL to your local postgres
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

---

## Deployment Guide

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/inventory-system.git
git push -u origin main
```

### Step 2 — Deploy Backend to Render

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory**: `backend`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add **Environment Variables**:
   - `DATABASE_URL` → (copy from Render Postgres or external DB)
   - `FRONTEND_URL` → your Vercel/Netlify URL (add after frontend deploy)

**Add a PostgreSQL database on Render:**
1. New → PostgreSQL → create instance
2. Copy the **External Database URL** into your backend's `DATABASE_URL`

### Step 3 — Deploy Frontend to Vercel

1. Go to https://vercel.com → New Project → import your repo
2. Set **Root Directory**: `frontend`
3. Add **Environment Variable**:
   - `REACT_APP_API_URL` → your Render backend URL (e.g. `https://inventory-api.onrender.com`)
4. Deploy

### Step 4 — Update backend CORS
After getting your Vercel URL, update Render env var:
- `FRONTEND_URL` → `https://your-app.vercel.app`

---

## Docker Hub (Push Backend Image)

```bash
# Build
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend

# Login
docker login

# Push
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

---

## API Reference

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /products | List all products |
| POST | /products | Create product |
| GET | /products/{id} | Get product |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /customers | List all customers |
| POST | /customers | Create customer |
| GET | /customers/{id} | Get customer |
| DELETE | /customers/{id} | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /orders | List all orders |
| POST | /orders | Create order (auto-reduces stock) |
| GET | /orders/{id} | Get order with items |
| DELETE | /orders/{id} | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard | Summary stats + low stock |

Full interactive docs: `http://localhost:8000/docs`

---

## Business Rules Implemented
- ✅ Unique product SKUs enforced
- ✅ Unique customer emails enforced
- ✅ Product quantity cannot be negative
- ✅ Orders rejected if insufficient stock
- ✅ Stock automatically reduced on order creation
- ✅ Stock automatically restored on order cancellation
- ✅ Total order amount calculated by backend
- ✅ Proper HTTP status codes (201, 204, 400, 404)
- ✅ Full request validation via Pydantic

---

## Project Structure
```
inventory-system/
├── backend/
│   ├── main.py          # FastAPI app + routes
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic validation schemas
│   ├── crud.py          # Database operations + business logic
│   ├── database.py      # DB connection setup
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── api/index.js     # Axios API layer
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Products.js
│   │   │   ├── Customers.js
│   │   │   └── Orders.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles.css
│   ├── public/index.html
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```
