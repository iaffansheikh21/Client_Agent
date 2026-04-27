# ClientFlow AI

> **Client support, on autopilot.**

ClientFlow AI is a full-stack AI-powered client communication and support automation platform. It autonomously handles client queries across WhatsApp and Slack, creates Trello tasks, sends notifications, and manages the entire support lifecycle — without human intervention.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Pending / Roadmap](#pending--roadmap)
- [License](#license)

---

## Overview

ClientFlow AI acts as an intelligent first-line support agent for businesses. Clients can message via **WhatsApp** or **Slack**, and the AI agent:

- Collects client name and email automatically
- Answers service-related queries using company context
- Creates **Trello tasks** for bugs, feature requests, and support issues
- Sends **email confirmations** to clients when tasks are created
- Notifies clients when **task status changes** (In Progress, Done, etc.)
- Escalates complex issues to human agents via **Slack alerts and email**
- Provides an **admin dashboard** for full visibility and control

---

## Features

### AI Agent
- GPT-4o powered responses with full conversation memory
- Dynamic system prompt — configurable from dashboard without restart
- Intelligent intent detection — creates tasks, invoices, or escalates based on context
- Multiple task creation in a single conversation
- Casual message filtering (no tasks created for "thanks", "ok", etc.)
- Dry-run mode for safe testing

### Communication Channels
- **WhatsApp** via Twilio sandbox
- **Slack** via Slack Events API

### Task Management
- Automatic Trello card creation with title, description, priority, and type
- Dashboard-based status updates (ToDo → In Progress → In Review → Done)
- Client notifications on status change via WhatsApp, Slack, and Email

### Notifications & Alerts
- Email to client on task creation (with Trello link)
- Email to client on task status update
- Slack alert to team on escalation
- Email alert to team on escalation

### Admin Dashboard (Next.js)
- Conversations list with search, channel filter, and status filter
- Full chat history viewer with status management
- Escalations panel with one-click resolve
- Trello tasks panel with status control
- Clients directory
- Test Agent with dry-run toggle and name input
- Agent settings — live update of name, company, services, tone, and instructions
- Analytics — messages, tasks, conversations per day + channel breakdown

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Python 3.12 |
| Database | PostgreSQL + SQLAlchemy (async) |
| AI | OpenAI GPT-4o |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| WhatsApp | Twilio WhatsApp API |
| Slack | Slack Events API |
| Task Management | Trello REST API |
| Email | Resend |
| Tunneling (dev) | ngrok |
| Containerization | Docker |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Communication Channels                 │
│              WhatsApp (Twilio)    Slack (Events API)      │
└──────────────────────┬──────────────────┬────────────────┘
                       │                  │
                       ▼                  ▼
              ┌─────────────────────────────────┐
              │         FastAPI Backend          │
              │   /webhook/whatsapp              │
              │   /webhook/slack                 │
              │   /webhook/trello                │
              └─────────────┬───────────────────┘
                            │
                            ▼
              ┌─────────────────────────────────┐
              │         AI Agent Core            │
              │   GPT-4o + Tool Use              │
              │   Conversation Memory (PostgreSQL)│
              │   Dynamic System Prompt (DB)     │
              └──┬──────────┬──────────┬─────────┘
                 │          │          │
                 ▼          ▼          ▼
           Trello API    Resend     Slack API
           (Task Create) (Email)   (Alerts)
                 │
                 ▼
        Trello Webhook → Client Notifications
        (WhatsApp + Slack + Email)
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- Docker (for PostgreSQL)
- ngrok (for local webhook testing)

### 1. Clone the repository

```bash
git clone https://github.com/iaffansheikh21/Client_Agent
```

### 2. Start PostgreSQL

```bash
docker run --name clientflow-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ai_agent_db \
  -p 5432:5432 \
  -d postgres:16
```

### 3. Setup Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

Copy `.env` file and fill in your credentials:

```bash
cp .env.example .env
```

Run the server:

```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Setup Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs at: `http://localhost:3000`
Backend API docs: `http://localhost:8000/docs`

### 5. Start ngrok (for webhooks)

```bash
ngrok http 5678   # for n8n (if used)
ngrok http 8000   # for FastAPI webhooks
```

Register the ngrok URL in:
- Twilio WhatsApp sandbox → `https://your-ngrok-url/webhook/whatsapp`
- Slack App Event Subscriptions → `https://your-ngrok-url/webhook/slack`
- Trello Webhook → `https://your-ngrok-url/webhook/trello`

---

## Environment Variables

```env
# App
APP_NAME=ClientFlow AI
APP_ENV=development
SECRET_KEY=your-secret-key

# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/ai_agent_db

# OpenAI
OPENAI_API_KEY=sk-...

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_WHATSAPP_NUMBER=+14155238886

# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_ALERT_CHANNEL=C0XXXXXXXXX

# Trello
TRELLO_API_KEY=xxxx
TRELLO_TOKEN=xxxx
TRELLO_BOARD_ID=xxxx
TRELLO_LIST_ID=xxxx

# Resend (Email)
RESEND_API_KEY=re_xxxx
ALERT_EMAIL=your-team-email@company.com
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/agent/chat` | Main AI agent endpoint |
| POST | `/webhook/whatsapp` | Twilio WhatsApp webhook |
| POST | `/webhook/slack` | Slack events webhook |
| POST | `/webhook/trello` | Trello card update webhook |
| GET | `/conversations/` | List all conversations |
| GET | `/conversations/{id}` | Get conversation with messages |
| PATCH | `/conversations/{id}/status` | Update conversation status |
| GET | `/clients/` | List all clients |
| GET | `/tasks/` | Get all Trello tasks |
| PATCH | `/tasks/{card_id}/status` | Update Trello card status |
| GET | `/analytics/` | Get analytics data |
| GET | `/settings/` | Get agent settings |
| PATCH | `/settings/` | Update agent settings |
| GET | `/health` | Health check |

---

## Project Structure

```
clientflow-ai/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   │   ├── agent.py          # Main AI chat endpoint
│   │   │   ├── analytics.py      # Analytics data
│   │   │   ├── clients.py        # Client management
│   │   │   ├── conversations.py  # Conversation history
│   │   │   ├── settings.py       # Agent configuration
│   │   │   ├── tasks.py          # Trello task management
│   │   │   └── webhook.py        # All incoming webhooks
│   │   ├── db/
│   │   │   ├── database.py       # Async DB connection
│   │   │   └── models.py         # SQLAlchemy models
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic schemas
│   │   ├── services/
│   │   │   ├── ai_service.py     # GPT-4o integration
│   │   │   ├── email_service.py  # Resend email service
│   │   │   ├── memory_service.py # Conversation memory
│   │   │   ├── settings_service.py# Agent settings
│   │   │   └── trello_service.py # Trello API wrapper
│   │   ├── config.py             # Environment settings
│   │   └── main.py               # FastAPI app entry point
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── app/
    │   ├── page.tsx              # Overview dashboard
    │   ├── analytics/            # Analytics charts
    │   ├── clients/              # Client directory
    │   ├── conversations/        # Conversation list + detail
    │   ├── escalations/          # Escalation management
    │   ├── settings/             # Agent configuration
    │   ├── tasks/                # Trello task management
    │   └── test-agent/           # Agent testing interface
    ├── components/
    │   └── Sidebar.tsx           # Navigation sidebar
    └── lib/
        └── api.ts                # API utility functions
```

---

## Pending / Roadmap

### In Progress
- [ ] Slack same-chat reply (currently replies in new thread in some cases)
- [ ] Multiple task creation bug fix (only first task being created in some flows)

### Planned Features
- [ ] **Domain email** — Verify `digitalsolutions.com.pk` on Resend for professional client emails
- [ ] **Date range filter** — Filter conversations and analytics by date
- [ ] **n8n workflows** — Visual workflow automation for complex routing
- [ ] **Stripe / Payment integration** — Invoice generation (blocked by Pakistan region restrictions)
- [ ] **Pinecone vector memory** — Long-term client context across conversations
- [ ] **Conversation summary** — Auto-summarize long conversations


---

## Built With

Developed as part of an AI Agent project for **DS Technologies (Pvt.) Limited**, Faisalabad, Pakistan.

- **Product:** ClientFlow AI
- **Tagline:** Client support, on autopilot.

---

## License

This project is proprietary and confidential.
© 2026 Muhammad Affan Sheikh. All rights reserved.