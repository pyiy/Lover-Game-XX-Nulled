-- M1: Database Schema (profiles, themes, tasks, rooms, game_sessions, game_moves)
-- Execute in Supabase SQL Editor or with supabase-cli.

-- Ensure uuid generation function is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- profiles: extend auth.users with optional fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname VARCHAR(100),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  total_games INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- themes
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'custom',
  is_public BOOLEAN DEFAULT false,
  task_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_themes_creator_id ON themes(creator_id);
CREATE INDEX IF NOT EXISTS idx_themes_type ON themes(type);
CREATE INDEX IF NOT EXISTS idx_themes_is_public ON themes(is_public);

-- tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'interaction',
  order_index INTEGER DEFAULT 0,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_theme_id ON tasks(theme_id);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_order_index ON tasks(order_index);

-- rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  player1_nickname VARCHAR(100),
  player2_nickname VARCHAR(100),
  player1_theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  player2_theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 hours')
);

CREATE INDEX IF NOT EXISTS idx_rooms_room_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_creator_id ON rooms(creator_id);
CREATE INDEX IF NOT EXISTS idx_rooms_player1_id ON rooms(player1_id);
CREATE INDEX IF NOT EXISTS idx_rooms_player2_id ON rooms(player2_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_expires_at ON rooms(expires_at);

-- game_sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_player_id UUID REFERENCES auth.users(id),
  current_turn INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'playing',
  game_state JSONB DEFAULT '{"player1_position": 0, "player2_position": 0, "board_size": 49}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_room_id ON game_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_players ON game_sessions(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);

-- game_moves
CREATE TABLE IF NOT EXISTS game_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dice_value INTEGER NOT NULL CHECK (dice_value >= 1 AND dice_value <= 6),
  old_position INTEGER NOT NULL,
  new_position INTEGER NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  task_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_moves_session_id ON game_moves(session_id);
CREATE INDEX IF NOT EXISTS idx_game_moves_player_id ON game_moves(player_id);
CREATE INDEX IF NOT EXISTS idx_game_moves_created_at ON game_moves(created_at DESC);

-- game_history: archive of completed sessions with task text snapshots
CREATE TABLE IF NOT EXISTS game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  session_id UUID, -- keep as plain UUID to preserve even after session deletion
  player1_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  player2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  task_results JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_game_history_ended_at ON game_history(ended_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_history_room_id ON game_history(room_id);
CREATE INDEX IF NOT EXISTS idx_game_history_players ON game_history(player1_id, player2_id);