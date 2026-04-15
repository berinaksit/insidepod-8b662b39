-- Create agents table
CREATE TABLE public.agents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'custom',
    prompt TEXT,
    data_sources TEXT[] DEFAULT '{}',
    frequency TEXT DEFAULT 'Manual',
    is_active BOOLEAN DEFAULT true,
    is_preset BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    output_count INTEGER DEFAULT 0,
    linked_document_ids UUID[] DEFAULT '{}',
    attached_file_name TEXT,
    attached_file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agents
CREATE POLICY "Users can view their own agents"
ON public.agents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents"
ON public.agents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
ON public.agents FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
ON public.agents FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for agents updated_at
CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create insights table
CREATE TABLE public.insights (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type TEXT NOT NULL DEFAULT 'insight',
    title TEXT NOT NULL,
    synthesis TEXT,
    source_id TEXT,
    source_name TEXT,
    source_type TEXT,
    confidence NUMERIC(3,2) DEFAULT 0.80,
    evidence_count INTEGER DEFAULT 0,
    is_new BOOLEAN DEFAULT true,
    priority TEXT DEFAULT 'medium',
    related_goals UUID[] DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on insights
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for insights
CREATE POLICY "Users can view their own insights"
ON public.insights FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights"
ON public.insights FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
ON public.insights FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights"
ON public.insights FOR DELETE
USING (auth.uid() = user_id);

-- Create goals table
CREATE TABLE public.goals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Custom',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for goals
CREATE POLICY "Users can view their own goals"
ON public.goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
ON public.goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.goals FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.goals FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for goals updated_at
CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create project_files table for files associated with projects
CREATE TABLE public.project_files (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on project_files
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_files
CREATE POLICY "Users can view their own project files"
ON public.project_files FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own project files"
ON public.project_files FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project files"
ON public.project_files FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project files"
ON public.project_files FOR DELETE
USING (auth.uid() = user_id);