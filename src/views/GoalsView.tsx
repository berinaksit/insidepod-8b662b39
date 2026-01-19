import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
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

interface Goal {
  id: string;
  title: string;
  type: string;
}

export function GoalsView() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalType, setGoalType] = useState('');

  const handleOpenModal = () => {
    setGoalTitle('');
    setGoalType('');
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleCreate = () => {
    if (!goalTitle.trim() || !goalType) return;
    
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: goalTitle.trim(),
      type: goalType,
    };
    
    setGoals([...goals, newGoal]);
    setIsModalOpen(false);
  };

  // Empty state
  if (goals.length === 0) {
    return (
      <div className="min-h-full px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl text-foreground">Goals</h1>
          <Button onClick={handleOpenModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-2">No goals yet</h2>
          <p className="text-muted-foreground text-center mb-6">
            Create goals to track product outcomes over time
          </p>
          <Button onClick={handleOpenModal}>Add your first goal</Button>
        </div>

        {/* Add Goal Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal title</Label>
                <Input
                  id="goal-title"
                  placeholder="Enter goal title"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-type">Goal type</Label>
                <Select value={goalType} onValueChange={setGoalType}>
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
              <Button onClick={handleCreate} disabled={!goalTitle.trim() || !goalType}>
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Goals list
  return (
    <div className="min-h-full px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-foreground">Goals</h1>
        <Button onClick={handleOpenModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      {/* Goals grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="p-5 rounded-xl border border-border bg-card"
          >
            <h3 className="font-medium text-foreground mb-2">{goal.title}</h3>
            <span className="text-sm text-muted-foreground">{goal.type}</span>
          </div>
        ))}
      </div>

      {/* Add Goal Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal-title">Goal title</Label>
              <Input
                id="goal-title"
                placeholder="Enter goal title"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-type">Goal type</Label>
              <Select value={goalType} onValueChange={setGoalType}>
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
            <Button onClick={handleCreate} disabled={!goalTitle.trim() || !goalType}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
