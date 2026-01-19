import { motion } from 'framer-motion';
import { ArrowLeft, Bot, Database, Send, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';

interface SuggestedPromptViewProps {
  onClose: () => void;
  prompt: string;
}

export function SuggestedPromptView({ onClose, prompt }: SuggestedPromptViewProps) {
  const [inputValue, setInputValue] = useState(prompt);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Mock data for agents and sources that will be used
  const relatedAgents = [
    { name: 'Trend Summarizer', status: 'Active' },
    { name: 'Insight Synthesizer', status: 'Active' }
  ];

  const referencedSources = [
    { name: 'Amplitude Analytics', type: 'Product Analytics' },
    { name: 'User Interviews Q1', type: 'Research' },
    { name: 'Salesforce CRM', type: 'CRM Data' }
  ];

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
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
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
            <Send className="w-4 h-4 mr-2" />
            Ask
          </Button>
        </div>
      </div>

      {/* Agents that will be used */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4" />
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
      <div className="mb-10">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Sources that will be referenced
        </h3>
        <div className="space-y-2">
          {referencedSources.map((source) => (
            <div
              key={source.name}
              className="bg-card rounded-xl p-4 shadow-card border border-border/50 flex items-center justify-between"
            >
              <span className="font-medium text-foreground">{source.name}</span>
              <span className="text-sm text-muted-foreground">{source.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="rounded-xl">
          <Settings className="w-4 h-4 mr-2" />
          Change sources
        </Button>
      </div>
    </motion.div>
  );
}
