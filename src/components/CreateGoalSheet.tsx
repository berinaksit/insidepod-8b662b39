import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

interface CreateGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (goal: GoalFormData) => void;
}

interface GoalFormData {
  title: string;
  category: string;
  metric: string;
  targetValue: number;
  targetUnit: string;
  endDate: Date | undefined;
}

const CATEGORIES = ['Activation', 'Retention', 'Revenue', 'Efficiency'];
const METRICS = ['Completion rate', 'Conversion rate', 'Time to value', 'Churn rate', 'Revenue per user'];
const UNITS = ['%', 'days', 'users', '$', 'sessions'];
const TIME_PRESETS = [
  { label: '30 days', days: 30 },
  { label: '60 days', days: 60 },
  { label: '90 days', days: 90 },
];

export function CreateGoalSheet({ open, onOpenChange, onSave }: CreateGoalSheetProps) {
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [customMetric, setCustomMetric] = useState('');
  const [showCustomMetric, setShowCustomMetric] = useState(false);
  const [targetValue, setTargetValue] = useState('');
  const [targetUnit, setTargetUnit] = useState('%');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customDate, setCustomDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handlePresetClick = (days: number) => {
    setSelectedPreset(days);
    setCustomDate(undefined);
    setShowDatePicker(false);
  };

  const handleCustomDateSelect = (date: Date | undefined) => {
    setCustomDate(date);
    setSelectedPreset(null);
  };

  const handleSave = () => {
    const goalData: GoalFormData = {
      title,
      category: showCustomCategory ? customCategory : (selectedCategory || ''),
      metric: showCustomMetric ? customMetric : (selectedMetric || ''),
      targetValue: parseFloat(targetValue) || 0,
      targetUnit,
      endDate: customDate || (selectedPreset ? addDays(new Date(), selectedPreset) : undefined),
    };
    onSave?.(goalData);
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setTitle('');
    setSelectedCategory(null);
    setCustomCategory('');
    setShowCustomCategory(false);
    setSelectedMetric(null);
    setCustomMetric('');
    setShowCustomMetric(false);
    setTargetValue('');
    setTargetUnit('%');
    setSelectedPreset(null);
    setCustomDate(undefined);
    setShowDatePicker(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-8">
          <SheetTitle className="font-display text-2xl text-foreground">
            Create a goal
          </SheetTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Define what success looks like for your product.
          </p>
        </SheetHeader>

        <div className="space-y-8">
          {/* Goal Title */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              What do you want to achieve?
            </label>
            <Input
              placeholder="e.g. Improve onboarding completion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl border-border bg-background"
            />
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowCustomCategory(false);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    selectedCategory === category && !showCustomCategory
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {category}
                </button>
              ))}
              <button
                onClick={() => {
                  setShowCustomCategory(true);
                  setSelectedCategory(null);
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1",
                  showCustomCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Plus className="w-3 h-3" />
                Custom
              </button>
            </div>
            <AnimatePresence>
              {showCustomCategory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    placeholder="Enter category name"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="mt-2 h-10 rounded-xl border-border bg-background"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Success Metric */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Success metric
            </label>
            <div className="flex flex-wrap gap-2">
              {METRICS.map((metric) => (
                <button
                  key={metric}
                  onClick={() => {
                    setSelectedMetric(metric);
                    setShowCustomMetric(false);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    selectedMetric === metric && !showCustomMetric
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {metric}
                </button>
              ))}
              <button
                onClick={() => {
                  setShowCustomMetric(true);
                  setSelectedMetric(null);
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1",
                  showCustomMetric
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Plus className="w-3 h-3" />
                Custom
              </button>
            </div>
            <AnimatePresence>
              {showCustomMetric && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    placeholder="Enter metric name"
                    value={customMetric}
                    onChange={(e) => setCustomMetric(e.target.value)}
                    className="mt-2 h-10 rounded-xl border-border bg-background"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Target Value */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Target value
            </label>
            <p className="text-xs text-muted-foreground">
              The outcome you want to reach.
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="85"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="flex-1 h-12 rounded-xl border-border bg-background"
              />
              <div className="flex rounded-xl border border-border overflow-hidden">
                {UNITS.map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setTargetUnit(unit)}
                    className={cn(
                      "px-4 h-12 text-sm font-medium transition-colors",
                      targetUnit === unit
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time Horizon */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Time horizon
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => handlePresetClick(preset.days)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    selectedPreset === preset.days
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {preset.label}
                </button>
              ))}
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                      customDate
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Calendar className="w-3 h-3" />
                    {customDate ? format(customDate, 'MMM d, yyyy') : 'Custom date'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={customDate}
                    onSelect={handleCustomDateSelect}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              onClick={handleSave}
              className="w-full h-12 rounded-xl text-base font-medium"
            >
              Save goal
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
