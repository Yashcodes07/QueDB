<div align="center">

<img src="https://quedb.vercel.app/logo.png" width="100" alt="QueDB Logo" />

# QueDB — AI Database Engine

**Talk to your database in plain English.**  
QueDB translates natural language into optimised SQL, executes it instantly, and visualises results — so your whole team can query data without writing a single line of code.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[🚀 Live Demo](https://quedb.vercel.app) · [📖 API Docs](https://quedb-production.up.railway.app/docs) · [🐛 Report Bug](https://github.com/Yashcodes07/QueDB/issues)

</div>

## Overview

QueDB is a full-stack AI-powered database query engine. It connects to your existing databases and lets you interact with them using natural language. Under the hood, QueDB uses LLaMA-3 70B (via Groq) to convert plain English questions into optimised SQL, executes the query, and returns results with automatic visualisations.

```
User: "Show top 10 customers by revenue this quarter"
         ↓
QueDB AI generates SQL instantly
         ↓
SELECT c.name, SUM(o.total) AS revenue
FROM customers c JOIN orders o ON c.id = o.customer_id
WHERE o.created_at >= DATE_TRUNC('quarter', NOW())
GROUP BY c.name ORDER BY revenue DESC LIMIT 10;
         ↓
Results rendered as table + chart in < 50ms
```

---

## Features

| Feature | Description |
|---|---|
| 🧠 **Natural Language to SQL** | Ask questions in plain English — QueDB generates production-ready SQL using LLaMA-3 70B |
| ⚡ **Self-Correcting SQL** | If generated SQL fails, the error is fed back to the LLM for automatic retry |
| 🔒 **JWT Authentication** | Secure login/register with Bearer token auth |
| 🗂️ **Schema Explorer** | Browse tables, columns, types, and relationships visually |
| 📊 **Instant Visualisations** | Query results auto-render as charts, tables, or KPI cards |
| 🔌 **Multi-DB Support** | Connect PostgreSQL, MySQL, SQLite, and more |
| 🧩 **RAG Knowledge Base** | Vector-powered semantic search via ChromaDB + sentence-transformers |
| 🖥️ **Monaco Editor** | Full-featured SQL editor with syntax highlighting and autocomplete |
| 📱 **Responsive UI** | Fully mobile-friendly dark-themed interface |

---

## Live Deployment

| Service | Platform | URL |
|---|---|---|
| **Frontend** | Vercel | [quedb.vercel.app](https://quedb.vercel.app) |
| **Backend API** | Railway | [quedb-production.up.railway.app](https://quedb-production.up.railway.app) |
| **API Docs** | Railway | [quedb-production.up.railway.app/docs](https://quedb-production.up.railway.app/docs) |
| **Database** | Neon (PostgreSQL) | Managed cloud PostgreSQL |

---

## Tech Stack

### Frontend

| Package | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| Vite | 5.x | Build tool & dev server |
| React Router DOM | 6.x | Client-side routing |
| TailwindCSS | 3.x | Utility-first styling |
| Zustand | 4.x | Global auth state management |
| TanStack Query | 5.x | Server state, caching, data fetching |
| Axios | 1.x | HTTP client |
| Monaco Editor | 4.x | SQL code editor |
| Recharts | 2.x | Charts and data visualisations |
| Lucide React | 0.383 | Icon library |

### Backend

| Package | Purpose |
|---|---|
| FastAPI | Web framework & REST API |
| Uvicorn | ASGI server |
| LangChain + Groq | LLaMA-3 70B LLM integration |
| ChromaDB | Vector database for Knowledge Base |
| Sentence-Transformers | Text embeddings for RAG |
| Python-Jose | JWT token generation & validation |
| Passlib | Password hashing (bcrypt) |
| SQLAlchemy (async) | ORM & database abstraction |
| Pydantic v2 | Data validation & schemas |
| Alembic | Database migrations |

---

## Project Structure

```
QueDB/
│
├── app/                          # Backend (FastAPI)
│   ├── api/                      # Route handlers
│   ├── core/
│   │   └── config.py             # App settings (loaded from .env)
│   ├── db/                       # Database connection & session
│   ├── handlers/                 # Business logic handlers
│   ├── models/                   # SQLAlchemy ORM models
│   ├── schemas/                  # Pydantic request/response schemas
│   ├── services/                 # AI query generation services
│   ├── __init__.py
│   └── main.py                   # FastAPI app entry point
│
├── chroma_db/                    # ChromaDB vector store (auto-generated)
│
├── frontend/                     # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Axios instance with base URL & interceptors
│   │   ├── components/
│   │   │   ├── ConnectionManager/  # DB connection UI
│   │   │   ├── KnowledgeBase/      # Vector search interface
│   │   │   ├── Layout/             # App shell, sidebar, navbar
│   │   │   ├── QueryInterface/     # Monaco editor + results panel
│   │   │   └── SchemaExplorer/     # Table/column browser
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Public landing page
│   │   │   ├── Login.jsx           # Auth - sign in
│   │   │   ├── Register.jsx        # Auth - sign up
│   │   │   └── Dashboard.jsx       # Main app (protected)
│   │   ├── store/
│   │   │   └── authStore.js        # Zustand auth store (token + user)
│   │   ├── App.jsx                 # Router & route guards
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Tailwind + custom component classes
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── nixpacks.toml                 # Railway build config (CPU torch)
├── Procfile                      # Railway start command
├── runtime.txt                   # Python version pin
├── .env                          # Environment variables (never commit)
├── .gitignore
└── requirements.txt              # Python dependencies
```

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (or use Neon free tier)
- Groq API key — [console.groq.com](https://console.groq.com)


## Deployment

### Production Stack

| Layer | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploy on push to main |
| Backend | Railway | Nixpacks build, CPU torch |
| Database | Neon | Free PostgreSQL, no IPv4 issues |
| ChromaDB | Railway Volume | 1GB persistent disk at `/app/chroma_db` |

1
## Database Support

| Database | Status |
|---|---|
| PostgreSQL | ✅ Supported |
| MySQL / MariaDB | ✅ Supported |
| SQLite | ✅ Supported |
| CSV | ✅ Supported |
| BigQuery | 🔄 Coming soon |
| Snowflake | 🔄 Coming soon |

---

## API Reference

Full interactive API documentation available at:  
**[quedb-production.up.railway.app/docs](https://quedb-production.up.railway.app/docs)**

Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/connections` | List DB connections |
| POST | `/api/connections` | Add new DB connection |
| POST | `/api/query/generate` | Generate SQL from natural language |
| POST | `/api/query/execute` | Execute SQL query |
| GET | `/api/knowledge` | List knowledge base entries |
| POST | `/api/knowledge` | Add to knowledge base |
| GET | `/health` | Health check |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

