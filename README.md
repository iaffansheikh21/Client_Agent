# AI Agent — Week 1 Setup

## What's built this week
- FastAPI backend with async PostgreSQL
- Claude AI integration with tool use (task creation, billing, escalation)
- Conversation memory (stores full chat history per client)
- REST API ready for n8n to call (Week 2)

---

## Prerequisites
- Python 3.11+
- PostgreSQL running locally (or Docker)
- OpenAI API key

---

## Step 1 — PostgreSQL setup

### Option A: Docker (easiest)
```bash
docker run --name ai-agent-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ai_agent_db \
  -p 5432:5432 \
  -d postgres:16
```

### Option B: Local PostgreSQL
```sql
CREATE DATABASE ai_agent_db;
```

---

## Step 2 — Python environment

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## Step 3 — Environment variables

```bash
cp .env .env.local
# Edit .env and fill in:
# - DATABASE_URL
# - ANTHROPIC_API_KEY
# - COMPANY_NAME, COMPANY_SERVICES, AGENT_NAME
```

---

## Step 4 — Run the server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Server starts at: http://localhost:8000
Swagger docs at: http://localhost:8000/docs

---

## Step 5 — Test the agent

### Health check
```bash
curl http://localhost:8000/health
```

### Send a message (new client)
```bash
curl -X POST http://localhost:8000/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "api",
    "message": "Hi, I have a bug in my login page, it crashes on mobile",
    "sender_name": "Ahmed"
  }'
```

Expected response:
```json
{
  "reply": "I've created a support task for your issue: 'Login page crash on mobile'. Our team will be in touch shortly.",
  "client_id": "uuid-here",
  "conversation_id": "uuid-here",
  "action": {
    "type": "create_task",
    "payload": {
      "title": "Login page crash on mobile",
      "description": "...",
      "priority": "high",
      "task_type": "bug"
    }
  },
  "tokens_used": 450
}
```

### Continue conversation (same client)
```bash
curl -X POST http://localhost:8000/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "paste-client-id-from-above",
    "channel": "api",
    "message": "How much will the fix cost?"
  }'
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /agent/chat | Main agent endpoint |
| GET | /conversations/ | List all conversations |
| GET | /conversations/{id} | Get single conversation with messages |
| PATCH | /conversations/{id}/status | Mark resolved/escalated |
| POST | /clients/ | Create client manually |
| GET | /clients/ | List all clients |
| GET | /health | Health check |

---

## Week 2 Preview

Next week we add:
- n8n webhook routes (`/webhook/whatsapp`, `/webhook/slack`)
- Twilio WhatsApp integration
- Slack Bolt integration
- n8n workflow JSONs (ready to import)
