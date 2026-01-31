import { motion } from 'framer-motion';
import { FileText, Bot, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FirstDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAgent: () => void;
  onLater: () => void;
}

export function FirstDocumentModal({ 
  open, 
  onOpenChange, 
  onCreateAgent, 
  onLater 
}: FirstDocumentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-0 rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
          >
            <FileText className="w-6 h-6 text-primary" strokeWidth={3} />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-xl font-semibold text-foreground"
          >
            Document added!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="text-muted-foreground mt-2"
          >
            Create your first agent to start generating insights from your data.
          </motion.p>
        </div>
        
        {/* Content */}
        <div className="p-6 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl mb-6"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-secondary" strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Agents analyze your documents
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                They continuously monitor for patterns, risks, and opportunities in your data.
              </p>
            </div>
          </motion.div>
          
          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="flex gap-3"
          >
            <Button
              variant="outline"
              onClick={onLater}
              className="flex-1 rounded-xl"
            >
              Later
            </Button>
            <Button
              onClick={onCreateAgent}
              className="flex-1 rounded-xl gap-2"
            >
              <Bot className="w-4 h-4" strokeWidth={3} />
              Create Agent
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
