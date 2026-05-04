# 🛡️ AI Sheriff — Audit. Comply. Trust.

> **An AI governance & compliance platform** that audits AI models for bias, hallucinations, toxicity, jailbreak vulnerabilities, and regulatory compliance — with real-time drift monitoring and automated alerting.

---

## 🧠 What Is This Project?

**AI Sheriff** is a full-stack SaaS startup project built to solve a real-world problem: *who watches the AI?*

As organizations deploy LLMs and ML models into production, there's a growing need to continuously audit them for safety, fairness, and regulatory compliance. AI Sheriff provides:

- **Adversarial auditing** — tests models for bias, hallucinations, toxicity, and jailbreak resistance
- **Compliance scoring** — evaluates against EU AI Act, NIST RMF, and India's DPDP Act
- **Drift monitoring** — tracks trust scores over time and alerts on degradation
- **Multi-tier access** — Free, Pro, and Enterprise plans with API key auth
- **Interactive dashboard** — real-time visualization of model health and risk levels

---

## 🏗️ Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Language | Python 3.11+ |
| Framework | FastAPI (async) |
| ORM | SQLAlchemy (async) with `aiosqlite` |
| Database | SQLite (via `sqlite+aiosqlite`) |
| Auth | JWT + bcrypt password hashing (`passlib`) |
| AI Engine | Anthropic Claude API (`claude-sonnet`) |
| Containerization | Docker |

### Frontend
| Layer | Technology |
|-------|-----------|
| Language | JavaScript (67.3% of codebase) |
| Framework | React (via Vite / `npm run dev`) |
| Containerization | Docker + Nginx (port 80 → 3000) |

### DevOps & Tooling
| Tool | Purpose |
|------|---------|
| `docker-compose.yml` | Orchestrates backend + frontend services |
| `start.bat` | One-click Windows launcher (no Docker required) |
| `seed_demo.py` | Populates DB with realistic demo data |
| `.gitignore` | Excludes venv, node_modules, DB files |

---

## 📁 Project Structure

```
Startup-Project/
├── backend/                   # Python FastAPI backend
│   ├── main.py                # App entrypoint
│   ├── Dockerfile             # Backend container config
│   ├── requirements.txt       # Python dependencies
│   └── db/
│       └── database.py        # SQLAlchemy models (User, AIModel, AuditResult, etc.)
│
├── frontend/                  # React frontend
│   ├── Dockerfile             # Frontend container (Nginx)
│   └── src/                   # React components & pages
│
├── docker-compose.yml         # Multi-service Docker orchestration
├── seed_demo.py               # Demo data seeder script
├── start.bat                  # Windows quick-start launcher
├── package-lock.json          # Node dependency lockfile
└── .gitignore
```

---

## ⚙️ Database Models

The backend defines the following core entities:

| Model | Description |
|-------|-------------|
| `User` | Auth, tier (Free/Pro/Enterprise), API key |
| `AIModel` | Registered AI models with type, trust score, risk level |
| `AuditResult` | Per-model adversarial test results (bias, hallucination, toxicity, jailbreak) |
| `ComplianceResult` | Scores against EU AI Act, NIST RMF, India DPDP |
| `DriftRecord` | Time-series trust score history (30-day windows) |
| `Alert` | Risk alerts sent to users for failing models |

---

## 🚀 Running the Project

There are **two ways** to run AI Sheriff: using Docker (recommended) or running it manually on Windows.

---

### Method 1 — Docker Compose (Recommended, Cross-Platform)

#### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- An Anthropic API key (`sk-ant-...`)

#### Steps

```bash
# 1. Clone the repository
git clone https://github.com/lakshay-sharma-ai-ml-ds/Startup-Project.git
cd Startup-Project

# 2. Set your Anthropic API key
#    On Linux/macOS:
export ANTHROPIC_API_KEY=sk-ant-your-key-here

#    On Windows (PowerShell):
$env:ANTHROPIC_API_KEY="sk-ant-your-key-here"

# 3. Build and start both services
docker-compose up --build

# 4. (Optional) Seed demo data in a new terminal
docker exec -it <backend_container_name> python /app/seed_demo.py
# Or run it locally if Python is available:
python seed_demo.py
```

#### Access Points
| Service | URL |
|---------|-----|
| Frontend Dashboard | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

#### Stop the app
```bash
docker-compose down
```

---

### Method 2 — Windows Quick Start (No Docker)

#### Prerequisites
- Python 3.11+ installed → [python.org](https://python.org)
- Node.js 18+ installed → [nodejs.org](https://nodejs.org)
- `ANTHROPIC_API_KEY` environment variable set (optional — audit engine uses simulated results without it)

#### Steps

```bat
:: Set your API key first (optional)
set ANTHROPIC_API_KEY=sk-ant-your-key-here

:: Run the one-click launcher
start.bat
```

The script will automatically:
1. Create a Python virtual environment inside `backend/`
2. Install Python dependencies from `requirements.txt`
3. Start the FastAPI backend in a new terminal window
4. Install Node.js dependencies in `frontend/`
5. Start the React development server

#### Access Points (same as Docker)
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

### Method 3 — Manual Setup (Linux/macOS)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py &

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## 🌱 Seeding Demo Data

The `seed_demo.py` script populates the database with realistic demo data for investor demos and testing.

```bash
# Seed demo data (adds data without wiping the DB)
python seed_demo.py

# Reset — drops all tables and re-seeds from scratch
python seed_demo.py --reset
```

### Demo Accounts Created

| Role | Email | Password |
|------|-------|----------|
| Enterprise User | demo@aisheriff.com | `Sheriff2024!` |
| Free Trial User | free@test.com | `test1234` |

### Demo AI Models Seeded

| Model | Type | Trust Score | Risk |
|-------|------|------------|------|
| GPT-4 Turbo Production | LLM | 84.2 | Low |
| HR Screening Agent v3 | Agent | 47.3 | High ⚠️ |
| LoanDecide v2.1 | ML Model | 63.8 | Medium |
| MedDiagnose Assistant | LLM | 91.5 | Low |

Each model is seeded with 30 days of drift history, audit results, compliance scores, and alerts (for high-risk models).

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Recommended | Claude API key for live auditing. Without it, the engine returns simulated results. |
| `SECRET_KEY` | Optional | JWT signing secret. Defaults to `change-me-in-production`. **Change this in production!** |
| `DATABASE_URL` | Auto-set | SQLite path. Default: `sqlite+aiosqlite:///./ai_sheriff.db` |
| `ALLOWED_ORIGINS` | Auto-set | CORS origins. Default: `http://localhost:3000` |

---

## 🧪 How the Audit Engine Works

When a model is submitted for auditing, AI Sheriff:

1. **Runs adversarial test cases** across 4 dimensions:
   - **Bias** — prompts designed to elicit discriminatory outputs
   - **Hallucination** — factual questions to test confabulation
   - **Toxicity** — harmful content generation attempts
   - **Jailbreak resistance** — prompt injection and bypass attempts

2. **Computes a trust score** (0–100) as a weighted aggregate of all test results

3. **Checks regulatory compliance** against:
   - 🇪🇺 EU AI Act
   - 🇺🇸 NIST AI RMF
   - 🇮🇳 India DPDP Act

4. **Records a drift data point** and sends alerts if the score degrades beyond a threshold

---

## 🏛️ Architecture Overview

```
┌─────────────────────┐         ┌────────────────────────┐
│   React Frontend    │  HTTP   │   FastAPI Backend       │
│   (port 3000)       │◄───────►│   (port 8000)          │
│                     │         │                        │
│  - Dashboard        │         │  - /auth endpoints     │
│  - Model Registry   │         │  - /models endpoints   │
│  - Audit Reports    │         │  - /audit endpoints    │
│  - Compliance View  │         │  - /compliance         │
│  - Drift Charts     │         │  - /alerts             │
└─────────────────────┘         └──────────┬─────────────┘
                                           │
                              ┌────────────▼─────────────┐
                              │  SQLite Database          │
                              │  (ai_sheriff.db)          │
                              └────────────┬─────────────┘
                                           │
                              ┌────────────▼─────────────┐
                              │  Anthropic Claude API     │
                              │  (Audit Engine)           │
                              └──────────────────────────┘
```

---

## 📋 User Tiers

| Feature | Free | Pro | Enterprise |
|---------|------|-----|-----------|
| Models registered | Limited | More | Unlimited |
| Audit runs | Limited | More | Unlimited |
| Compliance frameworks | Basic | Full | Full |
| Drift monitoring | ❌ | ✅ | ✅ |
| API access | ❌ | ✅ | ✅ |
| Alerts | ❌ | ✅ | ✅ |

---

## 🔧 Troubleshooting

**Backend doesn't start?**
- Check Python version: `python --version` (needs 3.11+)
- Ensure `requirements.txt` installed correctly

**Audit returns simulated results?**
- Set `ANTHROPIC_API_KEY` environment variable with a valid key

**Frontend can't reach backend?**
- Make sure the backend is running on port `8000`
- Check CORS — `ALLOWED_ORIGINS` must match your frontend URL

**Docker: port already in use?**
- Kill conflicting processes: `lsof -i :8000` or `lsof -i :3000`

---

## 👤 Author

**Lakshay Sharma** — IIIT Delhi  
GitHub: [@lakshay-sharma-ai-ml-ds](https://github.com/lakshay-sharma-ai-ml-ds)

---

## 📄 License

This project is currently unlicensed / proprietary. Contact the author for usage rights.