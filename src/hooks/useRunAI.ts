import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AIResult {
  answer?: string;
  title?: string;
  synthesis?: string;
  confidence: number;
  used_sources: Array<{ id: string; title: string }>;
  next_actions: string[];
  evidence_count?: number;
  priority?: 'high' | 'medium' | 'low';
  insufficient?: boolean;
  message?: string;
  suggestion?: string;
}

interface RunAIParams {
  projectId?: string | null;
  query: string;
  mode: 'grounded' | 'insight' | 'dashboard';
  agentPrompt?: string;
}

// Build a context pack from documents, truncating safely
function buildContextPack(
  documents: Array<{ id: string; title: string | null; content: string; created_at: string | null }>
): string {
  if (documents.length === 0) return '';

  // Sort by most recent first
  const sorted = [...documents].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  let context = '';
  const maxChars = 30000; // Safe context window limit

  for (const doc of sorted) {
    const entry = `\n--- Document: "${doc.title || 'Untitled'}" (ID: ${doc.id}) ---\n${doc.content}\n`;
    if (context.length + entry.length > maxChars) {
      // Truncate the last doc to fit
      const remaining = maxChars - context.length;
      if (remaining > 200) {
        context += entry.slice(0, remaining) + '\n[...truncated]';
      }
      break;
    }
    context += entry;
  }

  return context;
}

export function useRunAI() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const runAI = useCallback(async ({
    projectId,
    query,
    mode,
    agentPrompt,
  }: RunAIParams): Promise<AIResult | null> => {
    if (!user) {
      toast.error('You must be logged in.');
      return null;
    }

    setIsLoading(true);
    try {
      // 1. Fetch documents for the project
      let docsQuery = supabase
        .from('documents')
        .select('id, title, content, created_at')
        .eq('user_id', user.id);

      if (projectId) {
        docsQuery = docsQuery.eq('project_id', projectId);
      }

      const { data: documents, error: docsError } = await docsQuery
        .order('created_at', { ascending: false });

      if (docsError) {
        console.error('Error fetching documents:', docsError);
        toast.error('Failed to load documents.');
        return null;
      }

      if (!documents || documents.length === 0) {
        return {
          insufficient: true,
          message: 'No documents uploaded yet. Upload documents to start generating insights.',
          suggestion: 'Upload research documents, interviews, analytics reports, or support tickets.',
          confidence: 0,
          used_sources: [],
          next_actions: ['Upload your first document'],
        };
      }

      // 2. Build context pack
      const documentContext = buildContextPack(documents);

      // 3. Build the full query
      const fullQuery = agentPrompt
        ? `${agentPrompt}\n\nUser query: ${query}`
        : query;

      // 4. Call the edge function
      const { data, error } = await supabase.functions.invoke('ask', {
        body: {
          mode,
          query: fullQuery,
          projectId,
          documentContext,
        },
      });

      if (error) {
        console.error('AI function error:', error);
        toast.error('AI analysis failed. Please try again.');
        return null;
      }

      // 5. Parse the response
      const content = data?.content || '';
      try {
        const parsed = JSON.parse(content);
        return parsed as AIResult;
      } catch {
        // If the AI didn't return valid JSON, wrap it
        console.warn('AI response was not valid JSON, wrapping:', content);
        return {
          answer: content,
          confidence: 0.5,
          used_sources: [],
          next_actions: [],
        };
      }
    } catch (err) {
      console.error('runAI error:', err);
      toast.error('Something went wrong with the AI analysis.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return { runAI, isLoading };
}
