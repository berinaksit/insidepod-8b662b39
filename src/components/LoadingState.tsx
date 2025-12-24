import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Analyzing...' }: LoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8"
    >
      <div className="relative mb-6">
        <div className="w-12 h-12 rounded-full border-2 border-muted" />
        <motion.div
          className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      
      <p className="text-muted-foreground">{message}</p>
    </motion.div>
  );
}
