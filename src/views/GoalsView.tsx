import { useState } from 'react';
import { motion } from 'framer-motion';
import { GoalCard } from '@/components/GoalCard';
import { GoalsEmptyState } from '@/components/GoalsEmptyState';
import { CreateGoalSheet } from '@/components/CreateGoalSheet';
import { mockGoals } from '@/data/mockData';
import { Plus } from 'lucide-react';

export function GoalsView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [goals, setGoals] = useState(mockGoals);

  // For demo: toggle between empty and populated state
  const showEmptyState = goals.length === 0;

  const handleCreateGoal = (goalData: any) => {
    const newGoal = {
      id: `g${Date.now()}`,
      title: goalData.title,
      description: `${goalData.metric} target: ${goalData.targetValue}${goalData.targetUnit}`,
      status: 'on-track' as const,
      progress: 0,
      signals: [],
      insights: [],
    };
    setGoals(prev => [...prev, newGoal]);
  };

  if (showEmptyState) {
    return (
      <>
        <GoalsEmptyState onCreateGoal={() => setIsCreateOpen(true)} />
        <CreateGoalSheet
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSave={handleCreateGoal}
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-full px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-display text-2xl text-foreground mb-1">Goals</h1>
            <p className="text-muted-foreground">
              Track progress toward your product objectives
            </p>
          </div>
          
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </motion.div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={index}
            />
          ))}
        </div>
      </div>
      
      <CreateGoalSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSave={handleCreateGoal}
      />
    </>
  );
}
