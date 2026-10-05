# Santheri — Personal Blog

A high-editorial personal blog built with **React (Vite)** on the frontend, **FastAPI** on the backend, and integrated with **Neon.tech** serverless PostgreSQL.

---

## ✨ Features

- **Writing Header Categories**: Dedicated navigation and dynamic headers for 3 core writing topics:
  - 🚗 **Travel** (`/writing?category=Travel`)
  - 💻 **Technology** (`/writing?category=Technology`)
  - 🌿 **Life** (`/writing?category=Life`)
- **Admin Publishing Portal (`/admin`)**:
  - Upload new blog content directly through the web UI.
  - Upload pictures (PNG, JPG, WEBP, GIF, SVG) from your machine directly to the server.
  - Set cover photos and insert pictures into markdown content at cursor position.
  - Live preview tab before publishing.
  - Manage, edit, and delete existing stories.
- **Dynamic Font Style Selection**:
  - Select typography for each story through the UI:
    - **Literary Serif** (*Newsreader / Georgia*)
    - **Modern Sans** (*Inter*)
    - **Editorial Display** (*Playfair Display*)
    - **Tech Mono** (*JetBrains Mono*)
    - **Poetic Minimal** (*Cormorant Garamond*)
  - Readers also have an interactive typography toolbar to toggle font styles in real-time.
- **Neon.tech PostgreSQL Connection**:
  - Connects securely to Neon's cloud serverless Postgres database.
  - Automatic fallback to local SQLite when `DATABASE_URL` is not yet configured.

---

## 🚀 Quick Start

### 1. Backend (FastAPI with `uv`)

```bash
# In backend directory
cd backend

# Sync virtual environment & install dependencies with uv
uv sync

# Start backend server
uv run python main.py
```
Backend API will be live at `http://127.0.0.1:8000` with interactive docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend (React Vite)

```bash
# In frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 🗄️ Connecting to Neon.tech

1. Create a free serverless PostgreSQL database at [Neon.tech](https://console.neon.tech).
2. Copy your connection string:
   ```
   postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Open `backend/.env` and paste your string:
   ```env
   DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Restart the FastAPI server. The database status badge in the `/admin` UI will automatically show **"Neon PostgreSQL: Connected"**.
