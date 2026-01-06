import { useState } from 'react';
import { motion } from 'framer-motion';
import { GoalCard } from '@/components/GoalCard';
import { GoalsEmptyState } from '@/components/GoalsEmptyState';
import { CreateGoalSheet } from '@/components/CreateGoalSheet';
import { mockGoals } from '@/data/mockData';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GoalsView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [goals, setGoals] = useState(mockGoals);

  const handleCreateGoal = (goalData: any) => {
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: goalData.title,
      description: `Target: ${goalData.targetValue}${goalData.targetUnit} by ${goalData.endDate?.toLocaleDateString() || 'TBD'}`,
      progress: 0,
      status: 'on-track' as const,
      signals: [],
      insights: [],
    };
    setGoals([...goals, newGoal]);
  };

  if (goals.length === 0) {
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
        
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
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

      <CreateGoalSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSave={handleCreateGoal}
      />
    </div>
  );
}
