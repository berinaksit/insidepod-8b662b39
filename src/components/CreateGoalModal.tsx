import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type GoalType = 'KPI' | 'OKR' | 'Success Metric' | 'Custom';

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  createdAt: Date;
}

interface CreateGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
}

export function CreateGoalModal({ open, onOpenChange, onCreateGoal }: CreateGoalModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalType | ''>('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }
    if (!type) {
      setError('Goal type is required');
      return;
    }

    onCreateGoal({ title: title.trim(), type });
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setType('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create Goal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="goal-title">Goal title</Label>
            <Input
              id="goal-title"
              placeholder="Enter goal title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-type">Goal type</Label>
            <Select
              value={type}
              onValueChange={(value: GoalType) => {
                setType(value);
                setError('');
              }}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select goal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KPI">KPI</SelectItem>
                <SelectItem value="OKR">OKR</SelectItem>
                <SelectItem value="Success Metric">Success Metric</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleCreate} className="rounded-xl">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
