import { useState } from 'react';
import { motion } from 'framer-motion';
import { GoalCard } from '@/components/GoalCard';
import { GoalsEmptyState } from '@/components/GoalsEmptyState';
import { AddGoalSheet, GoalFormData } from '@/components/AddGoalSheet';
import { mockGoals } from '@/data/mockData';
import { Plus } from 'lucide-react';
import { Goal } from '@/types';

export function GoalsView() {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);

  const handleSaveGoal = (formData: GoalFormData) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: formData.title,
      description: `Target: ${formData.targetValue}${formData.targetUnit} ${formData.metric}`,
      status: 'on-track',
      progress: 0,
      signals: [],
      insights: [],
    };
    setGoals([...goals, newGoal]);
  };

  if (goals.length === 0) {
    return (
      <>
        <GoalsEmptyState onCreateGoal={() => setIsAddGoalOpen(true)} />
        <AddGoalSheet 
          open={isAddGoalOpen} 
          onOpenChange={setIsAddGoalOpen}
          onSave={handleSaveGoal}
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
        
        <button 
          onClick={() => setIsAddGoalOpen(true)}
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

      <AddGoalSheet 
        open={isAddGoalOpen} 
        onOpenChange={setIsAddGoalOpen}
        onSave={handleSaveGoal}
      />
    </div>
  );
}
