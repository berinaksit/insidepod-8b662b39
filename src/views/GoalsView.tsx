import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDocuments } from '@/contexts/DocumentsContext';

type GoalType = 'KPI' | 'OKR' | 'Success Metric' | 'Custom';

interface SimpleGoal {
  id: string;
  title: string;
  type: GoalType;
}

export function GoalsView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalType>('KPI');
  const [goals, setGoals] = useState<SimpleGoal[]>([]);
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }

    const newGoal: SimpleGoal = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      type,
    };

    setGoals(prev => [...prev, newGoal]);
    setTitle('');
    setType('KPI');
    setError('');
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setTitle('');
    setType('KPI');
    setError('');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-full px-6 py-8">
      {/* Header with Add Goal button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-foreground mb-1">Goals</h1>
          <p className="text-muted-foreground">Track your product objectives</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Goal Cards Grid */}
      {goals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-5 rounded-xl border border-border bg-card"
            >
              <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground mb-3">
                {goal.type}
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                {goal.title}
              </h3>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Goal title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter goal title"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Goal type</Label>
              <Select value={type} onValueChange={(value: GoalType) => setType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KPI">KPI</SelectItem>
                  <SelectItem value="OKR">OKR</SelectItem>
                  <SelectItem value="Success Metric">Success Metric</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
