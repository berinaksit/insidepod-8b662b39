import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot, Database, Send, Loader2, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoredDocument } from '@/contexts/DocumentsContext';
import { getDocumentIcon, getSourceTypeLabel } from '@/utils/documentSynthesis';
import { useDocuments } from '@/contexts/DocumentsContext';
import { useRunAI, AIResult } from '@/hooks/useRunAI';
import { useProjects } from '@/contexts/ProjectsContext';

interface SuggestedPromptViewProps {
  onClose: () => void;
  prompt: string;
  sourceDocuments?: StoredDocument[];
}

export function SuggestedPromptView({ onClose, prompt, sourceDocuments = [] }: SuggestedPromptViewProps) {
  const [inputValue, setInputValue] = useState(prompt);
  const [result, setResult] = useState<AIResult | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { documents } = useDocuments();
  const { runAI, isLoading } = useRunAI();
  const { activeProjectId } = useProjects();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputValue.length, inputValue.length);
    }
  }, []);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;
    const r = await runAI({
      projectId: activeProjectId,
      query: inputValue.trim(),
      mode: 'grounded',
    });
    if (r) setResult(r);
  };

  // Sources from real documents
  const referencedSources = documents.slice(0, 5).map(doc => ({
    name: doc.aiTitle || doc.name,
    type: getSourceTypeLabel(doc),
    icon: getDocumentIcon(doc)
  }));

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="min-h-full">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </button>
        <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">Prompt</span>
      </div>

      {/* Input Area */}
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50 mb-8">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full bg-transparent text-xl font-semibold text-foreground resize-none focus:outline-none min-h-[100px]"
          placeholder="Ask a question..."
        />
        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border/50">
          <Button onClick={handleSubmit} className="rounded-xl" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />}
            {isLoading ? 'Analyzing...' : 'Ask'}
          </Button>
        </div>
      </div>

      {/* AI Result */}
      {result && !result.insufficient && (
        <div className="mb-8 space-y-4">
          <div className="bg-foreground text-background rounded-2xl p-6">
            <h3 className="text-sm font-medium text-background/60 uppercase tracking-wider mb-3">Answer</h3>
            <p className="text-lg text-background leading-relaxed">{result.answer || result.synthesis}</p>
          </div>
          
          {result.used_sources && result.used_sources.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" strokeWidth={1.5} />
                Sources used
              </h3>
              <div className="space-y-2">
                {result.used_sources.map((source, i) => (
                  <div key={i} className="bg-card rounded-xl p-4 shadow-card border border-border/50 flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <span className="font-medium text-foreground">{source.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {result?.insufficient && (
        <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-foreground mb-1">{result.message}</p>
              {result.suggestion && <p className="text-sm text-muted-foreground">{result.suggestion}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Available sources */}
      {referencedSources.length > 0 && !result && (
        <div className="mb-10">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" strokeWidth={1.5} />
            Documents that will be searched
          </h3>
          <div className="space-y-2">
            {referencedSources.map((source) => (
              <div key={source.name} className="bg-card rounded-xl p-4 shadow-card border border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{source.icon}</span>
                  <span className="font-medium text-foreground">{source.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{source.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
