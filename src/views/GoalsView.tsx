import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateGoalModal, Goal, GoalType } from '@/components/CreateGoalModal';

const STORAGE_KEY = 'insidepod_goals_v2';

function loadGoals(): Goal[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((g: any) => ({
        ...g,
        createdAt: new Date(g.createdAt),
      }));
    }
  } catch (e) {
    console.warn('Failed to load goals from localStorage:', e);
  }
  return [];
}

function saveGoals(goals: Goal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch (e) {
    console.warn('Failed to save goals to localStorage:', e);
  }
}

export function GoalsView() {
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Persist goals whenever they change
  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  const handleCreateGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const typeColors: Record<GoalType, string> = {
    'KPI': 'bg-blue-100 text-blue-700',
    'OKR': 'bg-purple-100 text-purple-700',
    'Success Metric': 'bg-green-100 text-green-700',
    'Custom': 'bg-muted text-muted-foreground',
  };

  return (
    <div className="min-h-full px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="font-display text-2xl text-foreground">Goals</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Add Goal
        </Button>
      </motion.div>

      {/* Content */}
      {goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Target className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No goals yet</h2>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            Create goals to track product outcomes over time
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl"
          >
            Add your first goal
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-card rounded-2xl p-5 shadow-card border border-border/50 hover:border-border transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${typeColors[goal.type]}`}>
                  {goal.type}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground leading-tight">
                {goal.title}
              </h3>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Goal Modal */}
      <CreateGoalModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreateGoal={handleCreateGoal}
      />
    </div>
  );
}
