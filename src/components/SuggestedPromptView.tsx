import { motion } from 'framer-motion';
import { ArrowLeft, Bot, Database, Send, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { StoredDocument } from '@/contexts/DocumentsContext';
import { getDocumentIcon, getSourceTypeLabel } from '@/utils/documentSynthesis';
import { useDocuments } from '@/contexts/DocumentsContext';

interface SuggestedPromptViewProps {
  onClose: () => void;
  prompt: string;
  sourceDocuments?: StoredDocument[];
}

export function SuggestedPromptView({ onClose, prompt, sourceDocuments = [] }: SuggestedPromptViewProps) {
  const [inputValue, setInputValue] = useState(prompt);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { agents } = useDocuments();

  // Get active agents for display
  const relatedAgents = agents
    .filter(a => a.isActive)
    .slice(0, 2)
    .map(agent => ({
      name: agent.name,
      status: 'Active'
    }));

  // Generate sources from real documents
  const referencedSources = sourceDocuments.length > 0
    ? sourceDocuments.map(doc => ({
        name: doc.aiTitle || doc.name,
        type: getSourceTypeLabel(doc),
        icon: getDocumentIcon(doc)
      }))
    : [];

  // Auto-focus the input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputValue.length, inputValue.length);
    }
  }, []);

  const handleSubmit = () => {
    // In a real app, this would trigger the AI query
    console.log('Submitting query:', inputValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="min-h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </button>
        <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
          Suggested Prompt
        </span>
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
          <Button onClick={handleSubmit} className="rounded-xl">
            <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Ask
          </Button>
        </div>
      </div>

      {/* Agents that will be used */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4" strokeWidth={1.5} />
          Agents that will be used
        </h3>
        <div className="space-y-2">
          {relatedAgents.map((agent) => (
            <div
              key={agent.name}
              className="bg-card rounded-xl p-4 shadow-card border border-border/50 flex items-center justify-between"
            >
              <span className="font-medium text-foreground">{agent.name}</span>
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                {agent.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sources that will be referenced */}
      {referencedSources.length > 0 && (
        <div className="mb-10">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" strokeWidth={1.5} />
            Sources that will be referenced
          </h3>
          <div className="space-y-2">
            {referencedSources.map((source) => (
              <div
                key={source.name}
                className="bg-card rounded-xl p-4 shadow-card border border-border/50 flex items-center justify-between"
              >
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

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="rounded-xl">
          <Settings className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Change sources
        </Button>
      </div>
    </motion.div>
  );
}
