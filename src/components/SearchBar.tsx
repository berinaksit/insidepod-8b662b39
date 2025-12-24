import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ArrowRight } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isProcessing?: boolean;
  placeholder?: string;
}

const suggestions = [
  'What is driving the onboarding drop-off?',
  'Show me churn risk signals from this week',
  'Which features are underutilized by enterprise?',
  'Summarize customer feedback on mobile app',
];

export function SearchBar({ onSearch, isProcessing = false, placeholder }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isProcessing) {
      onSearch(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setIsFocused(false);
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isFocused) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isFocused]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="search-container">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex-shrink-0">
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
              ) : (
                <Search className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={placeholder || "Ask anything about your product..."}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
              disabled={isProcessing}
            />
            
            <AnimatePresence>
              {query.trim() && !isProcessing && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="submit"
                  className="flex-shrink-0 p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
            
            {!query && !isFocused && (
              <kbd className="hidden sm:inline-flex px-2 py-1 text-xs text-muted-foreground bg-muted rounded">
                /
              </kbd>
            )}
          </div>
        </div>
      </form>
      
      <AnimatePresence>
        {isFocused && !query && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-50"
          >
            <div className="p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-2">
                Suggestions
              </p>
              <div className="space-y-1">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2.5 text-sm text-foreground rounded-xl hover:bg-muted transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
