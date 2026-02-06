
-- Create agent_outputs table for storing real agent run results
CREATE TABLE public.agent_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  output JSONB NOT NULL DEFAULT '{}'::jsonb,
  sources TEXT[] NOT NULL DEFAULT '{}'::text[],
  source_titles TEXT[] NOT NULL DEFAULT '{}'::text[],
  query TEXT,
  mode TEXT NOT NULL DEFAULT 'insight',
  confidence NUMERIC DEFAULT 0.8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_outputs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own agent outputs"
  ON public.agent_outputs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent outputs"
  ON public.agent_outputs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent outputs"
  ON public.agent_outputs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent outputs"
  ON public.agent_outputs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_agent_outputs_user_project ON public.agent_outputs(user_id, project_id);
CREATE INDEX idx_agent_outputs_agent ON public.agent_outputs(agent_id);
