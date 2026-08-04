<h1 align="center">
  <br>
  📖 Lectura
  <br>
</h1>

<h3 align="center">Turn any YouTube lecture into a complete, intelligent learning experience</h3>

<p align="center">
  <a href="https://github.com/Aditya-Singh-018/Lectura/issues">Report Bug</a> •
  <a href="https://github.com/Aditya-Singh-018/Lectura/issues">Request Feature</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-BullMQ-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq-LLaMA%203.3-FF6600?style=for-the-badge&logo=meta&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

---

## 🧠 What is Lectura?

**Lectura** is an AI-powered learning platform that takes any YouTube video or playlist URL and automatically transforms it into a structured, personalized study experience.

Paste a link. Lectura handles the rest — it reads the lecture, identifies what you need to learn, builds a visual map of all the concepts, and then quizzes you on them intelligently, adapting its difficulty based on how well you're actually doing.

> No flashcard decks to manually create. No textbook chapters to hunt down. Just paste a YouTube link and start learning smarter.

---

## ✨ Key Features

| Feature | What it does |
|---|---|
| 🎬 **Video & Playlist Ingestion** | Accepts any YouTube video URL or full playlist link and kicks off the AI pipeline |
| 🗺️ **Knowledge Graph** | Builds an interactive visual map showing the key concepts and how they connect to each other |
| 🎯 **Adaptive Quiz Engine** | Asks you questions in a smart order — harder topics get more attention, mastered ones step aside |
| 🃏 **Flashcards** | Auto-generates spaced-repetition flashcards for each concept so you can review efficiently |
| 📊 **Learning Dashboard** | Tracks your accuracy, total questions attempted, and overall progress over time |
| 📡 **Real-time Processing Updates** | A live progress bar shows exactly what stage the AI pipeline is at while your video is being processed |
| 🔐 **Auth with Guest Mode** | Sign in with email or continue as a guest — your session is always preserved either way |
| 🌐 **Global Knowledge Graph** | Merges concepts from all your processed videos into one unified graph — your personal learning map |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Role |
|---|---|
| ![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black) | UI framework — component-based views and state management |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) | Development server and production bundler |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white) | Utility-first styling |
| ![ReactFlow](https://img.shields.io/badge/ReactFlow-FF0072?logo=react&logoColor=white) | Interactive, draggable knowledge graph visualization |
| ![Supabase JS](https://img.shields.io/badge/Supabase_JS-3ECF8E?logo=supabase&logoColor=white) | Auth session management on the client side |

### Backend
| Technology | Role |
|---|---|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) | Server runtime |
| ![Express 5](https://img.shields.io/badge/Express_5-000000?logo=express&logoColor=white) | REST API framework |
| ![BullMQ](https://img.shields.io/badge/BullMQ-DC382D?logo=redis&logoColor=white) | Background job queue for the AI pipeline |
| ![IORedis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white) | Message broker between the server and workers |

### Database & Storage
| Technology | Role |
|---|---|
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) | Hosted PostgreSQL with built-in Auth, RLS, and real-time |
| ![pgvector](https://img.shields.io/badge/pgvector-4169E1?logo=postgresql&logoColor=white) | Vector extension for storing and querying semantic embeddings |

### AI / ML Services
| Technology | Role |
|---|---|
| ![Groq](https://img.shields.io/badge/Groq_LLaMA_3.3_70B-FF6600?logo=meta&logoColor=white) | Concept extraction from transcripts, MCQ + flashcard generation |
| ![Hugging Face](https://img.shields.io/badge/HuggingFace_MiniLM-FFD21E?logo=huggingface&logoColor=black) | Generating 384-dimension text embeddings for semantic search & deduplication |
| ![YouTube](https://img.shields.io/badge/YouTube_Data_API_v3-FF0000?logo=youtube&logoColor=white) | Listing all videos in a playlist |

---

## 🗂️ Project Structure

```
Lectura/
├── client/                        # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── DashboardShell.jsx        # Main layout with sidebar navigation
│       │   ├── IngestView.jsx            # URL input + live progress tracking
│       │   ├── KnowledgeGraphDashboard.jsx  # Interactive ReactFlow graph
│       │   ├── AdaptiveQuiz.jsx          # Quiz interface with answer feedback
│       │   ├── LecturesView.jsx          # Library of all processed videos
│       │   ├── UserProfile.jsx           # Stats dashboard
│       │   ├── LoginForm.jsx / SignUpForm.jsx
│       │   └── ...
│       ├── App.jsx                       # Root component, view router & auth state
│       └── supabaseClient.js
│
└── server/                        # Node.js + Express backend
    ├── app.js                            # Server entry point, route mounting
    ├── routes/                           # ingest · graph · questions · profile
    ├── workers/
    │   └── ingestWorker.js               # BullMQ worker — orchestrates the full pipeline
    ├── services/                         # fetchTranscript · chunkText · embedChunks
    │                                     # extractConcepts · buildGraphs · generateQuestions
    │                                     # adaptiveEngine · submitAnswer
    ├── middleware/
    │   └── authMiddleware.js             # JWT Bearer token verification via Supabase
    └── database/
        └── schema.sql                    # Full PostgreSQL schema
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+  •  Redis (local or cloud)  •  A Supabase project

### 1. Clone & Install
```bash
git clone https://github.com/Aditya-Singh-018/Lectura.git
cd Lectura
npm install && npm install --prefix server && npm install --prefix client
```

### 2. Set Up the Database
In your Supabase project → SQL Editor → run `server/database/schema.sql`

### 3. Environment Variables

**`server/.env`**
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
HF_API_KEY=
YOUTUBE_API_KEY=
REDIS_URL=redis://127.0.0.1:6379
CLIENT_URL=http://localhost:5173
PORT=5000
```

**`client/.env`**
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Run
```bash
npm run dev    # starts both client (5173) and server (5000) concurrently
```

> Make sure Redis is running before starting the server.

---

## 📦 Production Deployment

| What | Where |
|---|---|
| Frontend | Vercel / Netlify — `npm run build --prefix client` |
| Backend + Worker | Render / Railway |
| Redis | Upstash (TLS-ready) |
| Database + Auth | Supabase (already hosted) |

---

## 👤 Author

**Aditya Singh**

- GitHub: [@Aditya-Singh-018](https://github.com/Aditya-Singh-018)
- Issues & Feedback: [github.com/Aditya-Singh-018/Lectura/issues](https://github.com/Aditya-Singh-018/Lectura/issues)

---

<p align="center">
  Built with ❤️ to make learning from video content actually enjoyable.
</p>
