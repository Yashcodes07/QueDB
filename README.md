<div align="center">

<img src="https://img.shields.io/badge/QueDB-AI%20Database%20Engine-6366f1?style=for-the-badge&logo=database&logoColor=white" alt="QueDB" />

# QueDB — AI Database Engine

**Talk to your database in plain English.**  
QueDB translates natural language into optimised SQL, executes it instantly, and visualises results — so your whole team can query data without writing a single line of code.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## Overview

QueDB is a full-stack AI-powered database query engine. It connects to your existing databases and lets you interact with them using natural language. Under the hood, QueDB uses a large language model to convert plain English questions into optimised SQL, executes the query, and returns results with automatic visualisations.

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
| 🧠 **Natural Language to SQL** | Ask questions in plain English — QueDB generates production-ready SQL |
| ⚡ **Sub-50ms Execution** | Intelligent query caching and index-aware planning |
| 🔒 **JWT Authentication** | Secure login/register with Bearer token auth |
| 🗂️ **Schema Explorer** | Browse tables, columns, types, and relationships visually |
| 📊 **Instant Visualisations** | Query results auto-render as charts, tables, or KPI cards |
| 🔌 **Multi-DB Support** | Connect PostgreSQL, MySQL, SQLite, MongoDB, and more |
| 🧩 **Knowledge Base** | Vector-powered semantic search over unstructured data via ChromaDB |
| 🖥️ **Monaco Editor** | Full-featured SQL editor with syntax highlighting and autocomplete |
| 📱 **Responsive UI** | Fully mobile-friendly dark-themed interface |

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
| ChromaDB | Vector database for Knowledge Base |
| Python-Jose | JWT token generation & validation |
| Passlib | Password hashing (bcrypt) |
| SQLAlchemy | ORM & database abstraction |
| Pydantic | Data validation & schemas |

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
├── venv/                         # Python virtual environment
├── .env                          # Environment variables (never commit)
├── .gitignore
└── requirements.txt              # Python dependencies
```


## Database Support

QueDB supports connections to:

| Database | Status |
|---|---|
| PostgreSQL | ✅ Supported |
| MySQL / MariaDB | ✅ Supported |
| SQLite | ✅ Supported |
| CSV| ✅ Supported |
| BigQuery | 🔄 Coming soon |
| Snowflake | 🔄 Coming soon |

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

---
