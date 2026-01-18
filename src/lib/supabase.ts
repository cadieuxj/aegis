import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);

/*
  Database Schema for Aegis Viral Engine
  Run this SQL in your Supabase SQL Editor:

  -- Enable UUID extension
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Research Sources Table
  CREATE TABLE research_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    domain TEXT NOT NULL,
    markdown TEXT,
    published_date TIMESTAMPTZ,
    authors TEXT[],
    credibility_score INTEGER DEFAULT 50,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Research Summaries Table
  CREATE TABLE research_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic TEXT NOT NULL,
    key_findings JSONB NOT NULL DEFAULT '[]',
    ethical_implications JSONB NOT NULL DEFAULT '[]',
    potential_hooks JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Junction table for summaries and sources
  CREATE TABLE summary_sources (
    summary_id UUID REFERENCES research_summaries(id) ON DELETE CASCADE,
    source_id UUID REFERENCES research_sources(id) ON DELETE CASCADE,
    PRIMARY KEY (summary_id, source_id)
  );

  -- TikTok Scripts Table
  CREATE TABLE scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_summary_id UUID REFERENCES research_summaries(id),
    title TEXT NOT NULL,
    hook_type TEXT NOT NULL CHECK (hook_type IN ('provocative_question', 'surprising_fact', 'counter_intuitive', 'future_prediction', 'personal_story')),
    sections JSONB NOT NULL DEFAULT '[]',
    full_text TEXT NOT NULL,
    target_audience TEXT DEFAULT 'North American, 18-35, tech-curious',
    estimated_duration INTEGER DEFAULT 45,
    visual_themes JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Audio Assets Table
  CREATE TABLE audio_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
    voice_id TEXT NOT NULL,
    voice_name TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    duration DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Visual Assets Table
  CREATE TABLE visual_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    style TEXT NOT NULL CHECK (style IN ('abstract_data_visualization', 'solarpunk_technology', 'holographic_interface', 'human_ai_interaction', 'research_lab_aesthetic')),
    image_url TEXT NOT NULL,
    sequence INTEGER NOT NULL DEFAULT 0,
    theme TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Posts Table (main content entity)
  CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published', 'archived')),
    research_source TEXT,
    hook_type TEXT NOT NULL,
    visual_style_prompt TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- TikTok Connections Table
  CREATE TABLE tiktok_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    open_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    expires_at TIMESTAMPTZ NOT NULL,
    refresh_expires_at TIMESTAMPTZ,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(open_id)
  );

  -- Engagement Metrics Table
  CREATE TABLE engagement_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    watch_time DECIMAL(10,2) DEFAULT 0,
    completion_rate DECIMAL(5,4) DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id)
  );

  -- Iteration Recommendations Table
  CREATE TABLE iteration_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    performance_percentile DECIMAL(5,2),
    suggested_hook_type TEXT,
    suggested_visual_style TEXT,
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Activity Logs Table
  CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    status TEXT NOT NULL DEFAULT 'success',
    message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Create indexes for performance
  CREATE INDEX idx_posts_status ON posts(status);
  CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
  CREATE INDEX idx_tiktok_connections_open_id ON tiktok_connections(open_id);
  CREATE INDEX idx_engagement_metrics_post_id ON engagement_metrics(post_id);
  CREATE INDEX idx_scripts_hook_type ON scripts(hook_type);
  CREATE INDEX idx_research_sources_credibility ON research_sources(credibility_score DESC);
  CREATE INDEX idx_activity_logs_event_type ON activity_logs(event_type);
  CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

  -- Enable Row Level Security
  ALTER TABLE research_sources ENABLE ROW LEVEL SECURITY;
  ALTER TABLE research_summaries ENABLE ROW LEVEL SECURITY;
  ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE audio_assets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE visual_assets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE tiktok_connections ENABLE ROW LEVEL SECURITY;
  ALTER TABLE engagement_metrics ENABLE ROW LEVEL SECURITY;
  ALTER TABLE iteration_recommendations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

  -- Create policies (allow all for now, customize based on auth needs)
  CREATE POLICY "Allow all" ON research_sources FOR ALL USING (true);
  CREATE POLICY "Allow all" ON research_summaries FOR ALL USING (true);
  CREATE POLICY "Allow all" ON scripts FOR ALL USING (true);
  CREATE POLICY "Allow all" ON audio_assets FOR ALL USING (true);
  CREATE POLICY "Allow all" ON visual_assets FOR ALL USING (true);
  CREATE POLICY "Allow all" ON posts FOR ALL USING (true);
  CREATE POLICY "Allow all" ON tiktok_connections FOR ALL USING (true);
  CREATE POLICY "Allow all" ON engagement_metrics FOR ALL USING (true);
  CREATE POLICY "Allow all" ON iteration_recommendations FOR ALL USING (true);
  CREATE POLICY "Allow all" ON activity_logs FOR ALL USING (true);

  -- Function to update updated_at timestamp
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  -- Triggers for updated_at
  CREATE TRIGGER update_scripts_updated_at
    BEFORE UPDATE ON scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_tiktok_connections_updated_at
    BEFORE UPDATE ON tiktok_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
*/
