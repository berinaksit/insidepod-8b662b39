import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronDown, Plus, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

interface AddGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (goal: GoalFormData) => void;
}

export interface GoalFormData {
  title: string;
  category: string;
  metric: string;
  targetValue: number;
  targetUnit: string;
  timeHorizon: Date | null;
}

const categories = [
  { id: 'activation', label: 'Activation' },
  { id: 'retention', label: 'Retention' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'efficiency', label: 'Efficiency' },
];

const commonMetrics = [
  'Completion rate',
  'Conversion rate',
  'Time to value',
  'Churn rate',
  'NPS score',
  'Active users',
];

const units = ['%', 'days', 'users', 'score', 'sessions'];

const timePresets = [
  { label: '30 days', days: 30 },
  { label: '60 days', days: 60 },
  { label: '90 days', days: 90 },
];

export function AddGoalSheet({ open, onOpenChange, onSave }: AddGoalSheetProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    category: '',
    metric: '',
    targetValue: 0,
    targetUnit: '%',
    timeHorizon: null,
  });

  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  const [customMetrics, setCustomMetrics] = useState<string[]>([]);
  const [newMetric, setNewMetric] = useState('');
  const [showNewMetric, setShowNewMetric] = useState(false);

  const [showMetricDropdown, setShowMetricDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const allCategories = [...categories, ...customCategories.map(c => ({ id: c.toLowerCase(), label: c }))];
  const allMetrics = [...commonMetrics, ...customMetrics];

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCustomCategories([...customCategories, newCategory.trim()]);
      setFormData({ ...formData, category: newCategory.trim().toLowerCase() });
      setNewCategory('');
      setShowNewCategory(false);
    }
  };

  const handleAddMetric = () => {
    if (newMetric.trim()) {
      setCustomMetrics([...customMetrics, newMetric.trim()]);
      setFormData({ ...formData, metric: newMetric.trim() });
      setNewMetric('');
      setShowNewMetric(false);
      setShowMetricDropdown(false);
    }
  };

  const handleSave = () => {
    onSave?.(formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      title: '',
      category: '',
      metric: '',
      targetValue: 0,
      targetUnit: '%',
      timeHorizon: null,
    });
  };

  const handlePresetSelect = (days: number) => {
    setFormData({ ...formData, timeHorizon: addDays(new Date(), days) });
    setShowDatePicker(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader className="mb-8">
          <SheetTitle className="font-display text-2xl">Create a goal</SheetTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Define what success looks like for your product.
          </p>
        </SheetHeader>

        <div className="space-y-8">
          {/* Goal Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Goal title
            </label>
            <Input
              placeholder="e.g. Improve onboarding completion"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-12 rounded-xl border-border bg-muted/30 focus:bg-background transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    formData.category === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat.label}
                </button>
              ))}
              
              <AnimatePresence mode="wait">
                {showNewCategory ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-1"
                  >
                    <Input
                      autoFocus
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                      placeholder="Category name"
                      className="h-9 w-32 rounded-full text-sm"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setShowNewCategory(false); setNewCategory(''); }}
                      className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowNewCategory(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-muted/50 text-muted-foreground hover:bg-muted border border-dashed border-border transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Success Metric */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Success metric
            </label>
            <div className="relative">
              <button
                onClick={() => setShowMetricDropdown(!showMetricDropdown)}
                className={cn(
                  "w-full h-12 px-4 rounded-xl text-left flex items-center justify-between",
                  "bg-muted/30 border border-border hover:bg-muted/50 transition-colors",
                  formData.metric ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <span>{formData.metric || 'Select a metric'}</span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  showMetricDropdown && "rotate-180"
                )} />
              </button>
              
              <AnimatePresence>
                {showMetricDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute z-50 top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="p-2 max-h-48 overflow-y-auto">
                      {allMetrics.map((metric) => (
                        <button
                          key={metric}
                          onClick={() => {
                            setFormData({ ...formData, metric });
                            setShowMetricDropdown(false);
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-left text-sm rounded-lg transition-colors",
                            formData.metric === metric
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          )}
                        >
                          {metric}
                        </button>
                      ))}
                    </div>
                    
                    <div className="border-t border-border p-2">
                      {showNewMetric ? (
                        <div className="flex items-center gap-2">
                          <Input
                            autoFocus
                            value={newMetric}
                            onChange={(e) => setNewMetric(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddMetric()}
                            placeholder="Custom metric"
                            className="h-9 text-sm flex-1"
                          />
                          <button
                            onClick={handleAddMetric}
                            className="p-2 rounded-lg bg-primary text-primary-foreground"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowNewMetric(true)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Create custom metric
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Target value
            </label>
            <p className="text-xs text-muted-foreground">
              The outcome you want to reach.
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0"
                value={formData.targetValue || ''}
                onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                className="h-12 rounded-xl border-border bg-muted/30 focus:bg-background transition-colors flex-1"
              />
              <div className="relative">
                <button
                  onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                  className="h-12 px-4 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors flex items-center gap-2 min-w-[80px] justify-between"
                >
                  <span>{formData.targetUnit}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    showUnitDropdown && "rotate-180"
                  )} />
                </button>
                
                <AnimatePresence>
                  {showUnitDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute z-50 top-full right-0 mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden min-w-[100px]"
                    >
                      <div className="p-2">
                        {units.map((unit) => (
                          <button
                            key={unit}
                            onClick={() => {
                              setFormData({ ...formData, targetUnit: unit });
                              setShowUnitDropdown(false);
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-left text-sm rounded-lg transition-colors",
                              formData.targetUnit === unit
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted"
                            )}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Time Horizon */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Time horizon
            </label>
            <div className="flex flex-wrap gap-2">
              {timePresets.map((preset) => {
                const presetDate = addDays(new Date(), preset.days);
                const isSelected = formData.timeHorizon && 
                  format(formData.timeHorizon, 'yyyy-MM-dd') === format(presetDate, 'yyyy-MM-dd');
                
                return (
                  <button
                    key={preset.days}
                    onClick={() => handlePresetSelect(preset.days)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
              
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      formData.timeHorizon && !timePresets.some(p => 
                        format(addDays(new Date(), p.days), 'yyyy-MM-dd') === format(formData.timeHorizon!, 'yyyy-MM-dd')
                      )
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted border border-dashed border-border"
                    )}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {formData.timeHorizon && !timePresets.some(p => 
                      format(addDays(new Date(), p.days), 'yyyy-MM-dd') === format(formData.timeHorizon!, 'yyyy-MM-dd')
                    )
                      ? format(formData.timeHorizon, 'MMM d, yyyy')
                      : 'Custom date'
                    }
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.timeHorizon ?? undefined}
                    onSelect={(date) => {
                      setFormData({ ...formData, timeHorizon: date ?? null });
                      setShowDatePicker(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-10 pt-6 border-t border-border">
          <Button
            onClick={handleSave}
            className="w-full h-12 rounded-xl font-medium text-base"
          >
            Save goal
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
