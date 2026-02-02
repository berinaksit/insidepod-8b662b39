import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ArrowRight, Plus, X } from 'lucide-react';
import { AddDocumentsModal, UploadedDocument } from './AddDocumentsModal';
import { useProjects } from '@/contexts/ProjectsContext';

interface SearchBarProps {
  onSearch?: (query: string, documents: UploadedDocument[]) => void;
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
  const navigate = useNavigate();
  const { activeProject, activeProjectId } = useProjects();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [showDocModal, setShowDocModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic placeholder based on project
  const dynamicPlaceholder = placeholder || 
    (activeProject ? `Ask anything about ${activeProject.name}...` : 'Ask anything about your project...');

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim() && !isProcessing) {
      onSearch?.(query.trim(), documents);
      navigate('/ask', { state: { query: query.trim(), documents } });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setIsFocused(false);
    // Don't auto-run, just set the query
  };

  const handleDocumentsAdded = (newDocs: UploadedDocument[]) => {
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isFocused && !showDocModal) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isFocused, showDocModal]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="search-container">
          <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-3 sm:py-3.5">
            <div className="flex-shrink-0">
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </motion.div>
              ) : (
                <Search className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              )}
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={dynamicPlaceholder}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm sm:text-base font-medium"
              disabled={isProcessing}
            />
            
            <AnimatePresence>
              {query.trim() && !isProcessing && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="submit"
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center"
                >
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </motion.button>
              )}
            </AnimatePresence>
            
            {!query && !isFocused && (
              <kbd className="hidden sm:inline-flex px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded font-medium">
                /
              </kbd>
            )}
          </div>
        </div>
      </form>

      {/* Document attachment area */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {/* Add documents button */}
        <button
          onClick={() => setShowDocModal(true)}
          className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
          title="Add documents"
        >
          <Plus className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </button>

        {/* Document badges */}
        <AnimatePresence>
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/80 rounded-full group"
            >
              <span className="text-sm text-foreground font-medium">{doc.aiTitle}</span>
              <button
                onClick={() => removeDocument(doc.id)}
                className="w-4 h-4 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Documents attached indicator */}
      {documents.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {documents.length} document{documents.length !== 1 ? 's' : ''} attached
        </p>
      )}
      
      {/* Suggestions dropdown */}
      <AnimatePresence>
        {isFocused && !query && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-lg overflow-hidden z-50"
          >
            <div className="p-2.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 px-2 font-medium">
                Suggestions
              </p>
              <div className="space-y-0.5">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-2.5 py-2 text-sm text-foreground rounded-xl hover:bg-muted transition-colors font-medium"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document modal */}
      <AddDocumentsModal
        open={showDocModal}
        onOpenChange={setShowDocModal}
        onDocumentsAdded={handleDocumentsAdded}
        existingDocuments={documents}
      />
    </div>
  );
}
