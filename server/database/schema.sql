CREATE TABLE playlists (
  id VARCHAR(255) PRIMARY KEY, -- The YouTube Playlist ID string
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TRANSCRIPT CHUNKS TABLE (Stores Vector Embeddings)
CREATE TABLE chunks (
  id BIGSERIAL PRIMARY KEY,
  playlist_id VARCHAR(255) REFERENCES playlists(id) ON DELETE CASCADE,
  video_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,          -- Plain English text segment
  start_time FLOAT NOT NULL,      -- Exact video timestamp marker
  embedding vector(384),          -- 384 dimensions matching sentence-transformers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. KNOWLEDGE GRAPH CONCEPTS TABLE
CREATE TABLE concepts (
  id BIGSERIAL PRIMARY KEY,
  playlist_id VARCHAR(255) REFERENCES playlists(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  summary_markdown TEXT           -- Used later for cheat sheets
);

-- 4. KNOWLEDGE GRAPH EDGES (Defines Prerequisite Lines)
CREATE TABLE concept_edges (
  id BIGSERIAL PRIMARY KEY,
  playlist_id VARCHAR(255) REFERENCES playlists(id) ON DELETE CASCADE,
  source_concept_id BIGINT REFERENCES concepts(id) ON DELETE CASCADE, -- Topic A
  target_concept_id BIGINT REFERENCES concepts(id) ON DELETE CASCADE  -- Prerequisite to Topic B
);

-- 5. GENERATED QUESTIONS TABLE
CREATE TABLE questions (
  id BIGSERIAL PRIMARY KEY,
  concept_id BIGINT REFERENCES concepts(id) ON DELETE CASCADE,
  difficulty_level INT NOT NULL, -- 1=Easy, 2=Medium, 3=Hard
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,         -- Storing options array directly inside JSON format
  correct_option INT NOT NULL    -- Index pointer of correct choice
);

-- 6. USER ADAPTIVE PERFORMANCE TRACKING
CREATE TABLE user_performance (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,          -- Managed cleanly via Supabase Auth
  question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  last_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);