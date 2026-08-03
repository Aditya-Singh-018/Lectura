-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- PLAYLISTS
CREATE TABLE playlists (
    id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VIDEOS
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    progress INT DEFAULT 0,
    status TEXT DEFAULT 'processing',
    current_stage TEXT,
    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    CONSTRAINT unique_user_video UNIQUE(video_id, user_id)
);

CREATE INDEX idx_videos_user_id ON videos(user_id);

-- TRANSCRIPT CHUNKS
CREATE TABLE chunks (
    id BIGSERIAL PRIMARY KEY,
    playlist_id VARCHAR(255) REFERENCES playlists(id) ON DELETE CASCADE,

    video_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    start_time FLOAT NOT NULL,
    embedding VECTOR(384),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chunks_video_id ON chunks(video_id);

-- KNOWLEDGE GRAPH CONCEPTS
CREATE TABLE concepts (
    id BIGSERIAL PRIMARY KEY,
    playlist_id VARCHAR(255) REFERENCES playlists(id) ON DELETE CASCADE,
    video_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    summary_markdown TEXT,
    concept_embedding VECTOR(384),
    sort_order INTEGER DEFAULT NULL
);

CREATE INDEX idx_concepts_video_id ON concepts(video_id);

-- KNOWLEDGE GRAPH EDGES
CREATE TABLE concept_edges (
    id BIGSERIAL PRIMARY KEY,
    playlist_id VARCHAR(255) REFERENCES playlists(id) ON DELETE CASCADE,
    video_id VARCHAR(255),
    source_concept_id BIGINT REFERENCES concepts(id) ON DELETE CASCADE,
    target_concept_id BIGINT REFERENCES concepts(id) ON DELETE CASCADE
);

CREATE INDEX idx_concept_edges_video_id
ON concept_edges(video_id);

-- GENERATED QUESTIONS
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    concept_id BIGINT REFERENCES concepts(id) ON DELETE CASCADE,
    difficulty_level INT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INT NOT NULL
);

-- FLASHCARDS
CREATE TABLE flashcards (
    id BIGSERIAL PRIMARY KEY,
    video_id VARCHAR(255) NOT NULL,
    concept_id BIGINT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    front_text TEXT NOT NULL,
    back_text TEXT NOT NULL
);

-- USER PERFORMANCE
CREATE TABLE user_performance (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    last_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);