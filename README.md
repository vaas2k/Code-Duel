# Coding Duel Platform

> Real-time 1v1 competitive coding — LeetCode meets Chess Elo.

Two players. One problem. A live code editor, hidden test cases, and an Elo rating system that updates the moment the match ends. Built end-to-end as a solo project.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Matchmaking Algorithm](#matchmaking-algorithm)
- [Code Execution Pipeline](#code-execution-pipeline)
- [Elo Rating System](#elo-rating-system)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)

---

## Overview

Coding Duel is a competitive programming platform where players are matched in real-time based on their Elo ratings, assigned a coding problem suited to their skill level, and race to solve it in a shared browser-based IDE. The platform supports multiple win conditions — first to pass all test cases, most test cases solved before time expires, or opponent surrender — mirroring the match dynamics of competitive chess.

---

## Features

### Core Gameplay
- **Real-time 1v1 duels** — matched via Elo-bucketed Redis queues with live opponent status via WebSockets
- **Elo rating system** — ratings update dynamically after every match (win, loss, draw, surrender, time-expiry)
- **Problem assignment engine** — problems are filtered by Elo bucket (easy / medium / hard) and deduplicated against the player's last 24 hours of match history
- **In-browser code editor** — Monaco Editor with multi-language support, syntax highlighting, and familiar LeetCode-style layout
- **Live test case results** — code is executed against hidden test cases via Judge0; results stream back to both players via WebSocket

### Win Conditions
| Scenario | Outcome |
|---|---|
| Player passes all test cases | Immediate win; opponent loses |
| Time limit expires | Player with most test cases passed wins; draw if equal |
| Player surrenders | Opponent wins; both Elos update accordingly |
| Match aborted (mutual) | No Elo change |

### Platform Features
- **Duel history & replay viewer** — all match data, code submissions, and results are persisted
- **Global leaderboard** — ranked by Elo with seasonal resets
- **Marathon Mode** — solve as many problems as possible under a fixed time window; ranked by volume
- **Admin dashboard** — full CRUD over users, problems, test cases, matches, and feedback

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  CLIENT LAYER                                                    │
│  Next.js 14 (App Router)  ·  Monaco Editor  ·  Zustand          │
└──────────┬───────────────────────────────┬───────────────────────┘
           │ REST / HTTPS                  │ WebSocket
┌──────────▼───────────────────────────────▼───────────────────────┐
│  API GATEWAY & AUTH                                              │
│  Express Router  ·  JWT Middleware  ·  WS Server  ·  Rate Limit  │
└──────┬───────────┬────────────────────────┬──────────────────────┘
       │           │                        │
┌──────▼──┐  ┌─────▼──────┐  ┌─────────────▼──────┐  ┌───────────┐
│Matchmak-│  │  Problem   │  │  Elo Calculator    │  │   Code    │
│ing Eng. │  │  Engine    │  │  Win/Loss/Draw     │  │Submission │
│Elo buck-│  │Elo-filter  │  │  K-factor scaling  │  │Judge0 Bri-│
│ets·FIFO │  │24h dedup   │  │  Surrender logic   │  │dge·Verdict│
└──────┬──┘  └─────┬──────┘  └──────────┬─────────┘  └─────┬─────┘
       │           │                    │                   │
┌──────▼───────────▼────────────────────▼───────────────────▼─────┐
│  DATA & INFRASTRUCTURE                                          │
│  Redis 7 (queues · match cache)                                 │
│  PostgreSQL 16 via Drizzle ORM (users · matches · problems)     │
│  Docker → Judge0 CE (sandboxed execution) → k8s (prod)          │
└──────────────────────────────────────────────────────────────────┘
```

### Request lifecycle — matchmaking

```
Player clicks "Find Match"
  → POST /queue-for-match
  → Auth middleware validates JWT
  → Matchmaking Engine reads player Elo
  → Computes bucket key (e.g. "bucket:0-99")
  → RPUSH player data onto Redis queue
  → Poll: LLEN >= 2? → LPOP two entries
  → Problem Engine selects a problem (Elo-filtered, deduped)
  → Match object created (roomID, player1, player2, problem, testCases)
  → Stored in PostgreSQL + Redis (TTL cache)
  → WS Server emits `match:found` to both players on roomID channel
  → Both clients redirect to /duel/[roomID]
```

### Request lifecycle — code submission

```
Player submits code
  → POST /all-test-check  { code, language, problemId }
  → Code Submission service fetches all testCases for problemId
  → Batches { source_code, language_id, stdin } → Judge0 REST API
  → Judge0 runs each case in a sandboxed container
  → Returns per-case: stdout, stderr, status, time, memory
  → Verdict analysis: RTE / CTE / WA / AC, pass count
  → WS Server emits `submission:result` on roomID
  → Both players receive updated test case status
  → If AC (all passed): emit `match:win` / `match:lose`
  → Elo Calculator updates both ratings in PostgreSQL
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Zustand, Tailwind CSS, Monaco Editor |
| Backend | Node.js, Express.js, TypeScript, `ws` (WebSockets) |
| Database | PostgreSQL 16, Drizzle ORM |
| Cache / Queue | Redis 7 (FIFO queues per Elo bucket, match object TTL cache) |
| Code Execution | Judge0 Community Edition, Docker (→ Kubernetes in production) |
| Auth | JWT, email OTP verification, session revocation table |

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `defaultRandom()` |
| `username` | `text` | unique |
| `email` | `text` | unique |
| `password` | `text` | hashed |
| `rating` | `integer` | default 50 (starting Elo) |
| `verified` | `boolean` | email verified flag |
| `banned` | `boolean` | admin-controlled |
| `oauthId` | `text` | nullable, for OAuth providers |
| `codeExpirey` | `timestamp` | OTP expiry |

### `match`
| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | |
| `roomId` | `uuid` | unique per match |
| `problemId` | `integer` | FK → `problems` |
| `player1` | `jsonb` | player snapshot |
| `player2` | `jsonb` | player snapshot |
| `winner` | `text` | nullable until resolved |
| `rated` | `boolean` | whether Elo changes apply |
| `totalCases` | `integer` | total test cases in problem |
| `solution` | `jsonb` | both players' final code |
| `status` | `text` | `ongoing` \| `completed` \| `draw` |

### `problems`
| Column | Type | Notes |
|---|---|---|
| `id` | `serial` PK | |
| `problemId` | `integer` | unique display ID |
| `title` | `text` | |
| `statement` | `text` | problem description |
| `input` / `output` | `text` | format description |
| `constraints` | `text` | |
| `testCases` | `jsonb` | array of `{ input, output }` |

### `user_sessions`
Tracks active JWT sessions with revocation support (`revoked`, `expiresAt`).

### `marathon_match`
Stores marathon session data: `problems` (JSONB array of solved problems), `totalTime`, `status`.

### `feedbacks`
User-submitted feedback with `issueType`, `severity`, `anonymous` flag, and `resolved` status.

---

## Matchmaking Algorithm

Players are assigned to Redis queues based on Elo bucket ranges:

| Bucket | Elo Range | Problem Difficulty |
|---|---|---|
| `bucket:0` | 0 – 99 | Easy |
| `bucket:1` | 100 – 199 | Easy–Medium |
| `bucket:2` | 200 – 349 | Medium |
| `bucket:3` | 350 – 499 | Medium–Hard |
| `bucket:4` | 500+ | Hard |

```
queueForMatch(player):
  bucketKey = getBucket(player.rating)
  RPUSH bucketKey serialize(player)

  if LLEN(bucketKey) >= 2:
    p1 = LPOP(bucketKey)
    p2 = LPOP(bucketKey)
    problem = selectProblem(bucketKey, [p1.history, p2.history])
    createMatch(p1, p2, problem)
  else:
    wait (show lobby with estimated wait + active players)
```

**Problem deduplication:** If either player solved the candidate problem in the last 24 hours, the engine re-samples from the pool until a fresh problem is found.

---

## Code Execution Pipeline

```
Client  →  POST /all-test-check
           { code: string, language: string, problemId: number }

Backend:
  1. Fetch all testCases WHERE problemId = ?
  2. For each { input, expectedOutput }:
       POST judge0/submissions { source_code, language_id, stdin }
  3. Poll for results (or use callbacks)
  4. Analyze verdict array:
       - All AC → match win
       - Any RTE / CTE → surface error type (not raw stderr)
       - Count passed / total → emit partial progress

WebSocket:
  emit('submission:result', { passed, total, verdict, time, memory })
  if allPassed: emit('match:win') to winner, emit('match:lose') to opponent
```

Test case inputs/outputs are **never sent to the client** — only pass/fail counts and error categories are exposed, matching competitive platform standards.

---

## Elo Rating System

Rating changes use the standard Elo formula with a fixed K-factor:

```
expected = 1 / (1 + 10^((opponentRating - playerRating) / 400))
newRating = currentRating + K * (actual - expected)

Where:
  actual = 1.0  (win)
         = 0.5  (draw / time-expiry tie)
         = 0.0  (loss / surrender)
  K      = 32   (adjustable per tier)
```

Special cases:
- **Abort (mutual):** no Elo change for either player
- **Time-expiry:** player with more test cases passed wins; tie → draw
- **Surrender:** treated as a loss for the surrendering player

---

## API Reference

### Auth routes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/signin` | Sign in, returns JWT |
| POST | `/create-account` | Register new user |
| POST | `/forget-password` | Send OTP to email |
| POST | `/reset-password` | Reset with OTP |
| POST | `/verify-account` | Email verification |
| POST | `/logout-account` | Revoke session |

### Match routes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/get-stats` | Player stats |
| POST | `/queue-for-match` | Enter matchmaking |
| POST | `/cancel-matchmaking` | Dequeue player |
| POST | `/time-expiry` | Trigger time-expiry resolution |
| POST | `/notify-passed-all` | Signal all test cases passed |
| POST | `/notify-loss` | Signal match loss |
| POST | `/match-abort` | Abort current match |
| POST | `/match-rankings` | Leaderboard data |
| POST | `/match-history` | Past matches for player |

### Code routes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/all-test-check` | Submit code, run all test cases |
| POST | `/problem` | Fetch problem by ID |

### Admin routes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin-stats` | Platform-wide statistics |
| GET | `/admin-users` | All users |
| GET | `/admin-feedbacks` | All feedback |
| GET | `/admin-matches` | All matches |
| GET | `/admin-problems` | All problems |
| POST | `/admin-user-activity` | User activity log |
| POST | `/admin-feedback-activity` | Feedback activity |
| POST | `/admin-add-problem` | Add problem |
| POST | `/admin-delete-problem` | Delete problem |
| POST | `/admin-update_problem` | Update problem |
| POST | `/admin-add-testCase` | Add test case to problem |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- Redis 7
- Docker (for Judge0)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/coding-duel-platform.git
cd coding-duel-platform
```

### 2. Start Judge0 via Docker

```bash
cd judge0
docker compose up -d
```

Judge0 will be available at `http://localhost:2358` by default.

### 3. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Configure environment variables

See [Environment Variables](#environment-variables) below.

### 5. Run database migrations

```bash
cd server
npx drizzle-kit push
```

### 6. Start the development servers

```bash
# Backend (from /server)
npm run dev

# Frontend (from /client)
npm run dev
```

---

## Environment Variables

### Backend (`/server/.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/coding_duel

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=7d

# Judge0
JUDGE0_BASE_URL=http://localhost:2358
JUDGE0_AUTH_TOKEN=           # leave empty for local CE

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_smtp_password

# Server
PORT=4000
NODE_ENV=development
```

### Frontend (`/client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

---

## Project Structure

```
coding-duel-platform/
├── client/                   # Next.js frontend
│   ├── app/                  # App Router pages
│   │   ├── (auth)/           # Login, register, verify
│   │   ├── dashboard/        # Main player dashboard
│   │   ├── duel/[roomId]/    # Live duel room
│   │   ├── leaderboard/      # Rankings
│   │   ├── marathon/         # Marathon mode
│   │   └── admin/            # Admin panel
│   ├── components/           # Shared UI components
│   ├── store/                # Zustand state slices
│   └── lib/                  # API client, WS helpers
│
├── server/                   # Express backend
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── matchController.ts
│   │   ├── codeCheck_Controller.ts
│   │   ├── generalController.ts
│   │   └── AdminController.ts
│   ├── routes/               # Express router
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema definitions
│   │   └── index.ts          # DB connection
│   ├── services/
│   │   ├── matchmaking.ts    # Redis queue logic
│   │   ├── elo.ts            # Rating calculation
│   │   ├── judge0.ts         # Judge0 API client
│   │   └── websocket.ts      # WS room management
│   └── middleware/
│       ├── auth.ts           # JWT validation
│       └── rateLimiter.ts
│
└── judge0/                   # Docker Compose for Judge0
    └── docker-compose.yml
```

---

## Roadmap

- [ ] Spectator mode — watch live matches in real time
- [ ] Custom room creation — private duels with invite links
- [ ] Team mode — 2v2 collaborative solving
- [ ] Problem submission portal — community-contributed problems with admin review
- [ ] Kubernetes deployment manifests for Judge0 horizontal scaling
- [ ] OAuth (GitHub / Google) login
- [ ] Mobile-responsive duel room layout

---

## Author

**Salman Ahmed Khan**  
Software Engineer  
[LinkedIn](https://linkedin.com/in/salsuqe) · [GitHub](https://github.com/vaas2k)

---

> Built with Node.js · Next.js · Redis · PostgreSQL · Judge0 · Docker