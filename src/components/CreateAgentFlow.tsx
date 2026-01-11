import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, Check, 
  AlertTriangle, TrendingUp, Zap, Brain, Sparkles, FileText,
  Upload, Link, Calendar, Bell
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockGoals } from '@/data/mockData';

interface CreateAgentFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated?: (agent: AgentFormData) => void;
}

interface AgentFormData {
  name: string;
  description: string;
  template: string;
  prompt: string;
  dataSources: string[];
  uploadedFiles: File[];
  linkedGoalId: string;
  runFrequency: string;
  notifyOnInsights: boolean;
}

const STEPS = [
  { id: 1, title: 'Basics', shortTitle: 'Basics' },
  { id: 2, title: 'Template', shortTitle: 'Template' },
  { id: 3, title: 'Prompt', shortTitle: 'Prompt' },
  { id: 4, title: 'Data Sources', shortTitle: 'Data' },
  { id: 5, title: 'Link Goal', shortTitle: 'Goal' },
  { id: 6, title: 'Schedule', shortTitle: 'Schedule' },
  { id: 7, title: 'Review', shortTitle: 'Review' },
];

const TEMPLATES = [
  {
    id: 'risk-scanner',
    name: 'Risk Scanner',
    description: 'Monitors early signals of churn, friction, or drop-offs',
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    defaultPrompt: 'Monitor for early warning signals of customer churn, friction points in user journeys, and sudden drops in engagement or adoption metrics.',
  },
  {
    id: 'retention-monitor',
    name: 'Retention Monitor',
    description: 'Tracks engagement and repeat usage patterns',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    defaultPrompt: 'Track user engagement patterns, identify repeat usage behaviors, and surface accounts showing declining activity before they churn.',
  },
  {
    id: 'adoption-tracker',
    name: 'Adoption Tracker',
    description: 'Identifies underutilized features and adoption velocity',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    defaultPrompt: 'Measure feature adoption rates across user segments, identify underutilized capabilities, and track velocity of new feature adoption.',
  },
  {
    id: 'insight-synthesizer',
    name: 'Insight Synthesizer',
    description: 'Connects qualitative feedback with quantitative signals',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    defaultPrompt: 'Connect qualitative user feedback from interviews and support with quantitative usage data to surface meaningful patterns and insights.',
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    description: 'Start with a blank slate and define your own monitoring focus',
    icon: Sparkles,
    color: 'text-foreground',
    bgColor: 'bg-muted',
    defaultPrompt: '',
  },
];

const DATA_SOURCES = [
  { id: 'amplitude', name: 'Amplitude', type: 'Analytics' },
  { id: 'mixpanel', name: 'Mixpanel', type: 'Analytics' },
  { id: 'dovetail', name: 'Dovetail', type: 'Research' },
  { id: 'salesforce', name: 'Salesforce', type: 'CRM' },
  { id: 'intercom', name: 'Intercom', type: 'Support' },
  { id: 'zendesk', name: 'Zendesk', type: 'Support' },
];

const RUN_FREQUENCIES = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'biweekly', label: 'Bi-weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'manual', label: 'Manual only' },
];

export function CreateAgentFlow({ open, onOpenChange, onAgentCreated }: CreateAgentFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    template: '',
    prompt: '',
    dataSources: [],
    uploadedFiles: [],
    linkedGoalId: '',
    runFrequency: 'weekly',
    notifyOnInsights: true,
  });

  const updateFormData = (field: keyof AgentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    updateFormData('template', templateId);
    if (template && template.defaultPrompt) {
      updateFormData('prompt', template.defaultPrompt);
    }
  };

  const handleDataSourceToggle = (sourceId: string) => {
    setFormData(prev => ({
      ...prev,
      dataSources: prev.dataSources.includes(sourceId)
        ? prev.dataSources.filter(id => id !== sourceId)
        : [...prev.dataSources, sourceId],
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...newFiles],
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCreate = () => {
    onAgentCreated?.(formData);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      description: '',
      template: '',
      prompt: '',
      dataSources: [],
      uploadedFiles: [],
      linkedGoalId: '',
      runFrequency: 'weekly',
      notifyOnInsights: true,
    });
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.template.length > 0;
      case 3:
        return formData.prompt.trim().length > 0;
      default:
        return true;
    }
  };

  const selectedTemplate = TEMPLATES.find(t => t.id === formData.template);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Progress indicator */}
        <div className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Create Agent</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center gap-1">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    step.id <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-xs font-medium text-foreground">
              {STEPS[currentStep - 1].title}
            </span>
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 py-6 min-h-[360px] max-h-[480px] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Basics */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">Name your agent</h3>
                    <p className="text-sm text-muted-foreground">Give your agent a clear, descriptive name.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="agent-name">Agent name</Label>
                      <Input
                        id="agent-name"
                        placeholder="e.g. Retention Risk Scanner"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="agent-description">
                        Description <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <Textarea
                        id="agent-description"
                        placeholder="Describe what this agent should monitor and why it matters..."
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        A good description helps you remember what this agent does.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Template */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">What should this agent monitor?</h3>
                    <p className="text-sm text-muted-foreground">Choose a template or start from scratch.</p>
                  </div>
                  
                  <div className="space-y-2">
                    {TEMPLATES.map((template) => {
                      const Icon = template.icon;
                      const isSelected = formData.template === template.id;
                      return (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template.id)}
                          className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border/50 hover:border-border hover:bg-muted/30'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl ${template.bgColor} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${template.color}`} strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{template.name}</span>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Prompt */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">Define the agent prompt</h3>
                    <p className="text-sm text-muted-foreground">Tell this agent what to look for.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="agent-prompt">What should this agent look for?</Label>
                    <Textarea
                      id="agent-prompt"
                      placeholder="Monitor changes in onboarding completion, feature usage, and user feedback to identify emerging adoption risks."
                      value={formData.prompt}
                      onChange={(e) => updateFormData('prompt', e.target.value)}
                      className="min-h-[160px] resize-none"
                    />
                    {selectedTemplate && selectedTemplate.id !== 'custom' && (
                      <p className="text-xs text-muted-foreground">
                        Pre-filled from the {selectedTemplate.name} template. Feel free to customize.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Data Sources */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">Connect data sources</h3>
                    <p className="text-sm text-muted-foreground">Select which sources this agent should monitor.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Connected sources</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {DATA_SOURCES.map((source) => {
                          const isSelected = formData.dataSources.includes(source.id);
                          return (
                            <button
                              key={source.id}
                              onClick={() => handleDataSourceToggle(source.id)}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border/50 hover:border-border'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                              </div>
                              <div className="text-left">
                                <span className="text-sm font-medium text-foreground">{source.name}</span>
                                <p className="text-xs text-muted-foreground">{source.type}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border/50">
                      <Label>Or upload data</Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Use uploads for early-stage or one-off data.
                      </p>
                      <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border/50 hover:border-border cursor-pointer transition-colors">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Upload PDF, CSV, or DOCX</span>
                        <input
                          type="file"
                          accept=".pdf,.csv,.docx"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      {formData.uploadedFiles.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {formData.uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-foreground">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              {file.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Link Goal */}
              {currentStep === 5 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">Link to a product goal</h3>
                    <p className="text-sm text-muted-foreground">
                      Linking helps track why the goal is moving — or not — over time.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select a goal (optional)</Label>
                      <Select
                        value={formData.linkedGoalId}
                        onValueChange={(value) => updateFormData('linkedGoalId', value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Choose a goal..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No goal linked</SelectItem>
                          {mockGoals.map((goal) => (
                            <SelectItem key={goal.id} value={goal.id}>
                              {goal.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
                      <div className="flex gap-3">
                        <Link className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Why link to a goal?</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            When an agent surfaces insights, you'll see how they connect to your strategic objectives.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Schedule */}
              {currentStep === 6 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">Set run frequency</h3>
                    <p className="text-sm text-muted-foreground">How often should this agent check for new insights?</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Run frequency</Label>
                      <RadioGroup
                        value={formData.runFrequency}
                        onValueChange={(value) => updateFormData('runFrequency', value)}
                        className="space-y-2"
                      >
                        {RUN_FREQUENCIES.map((freq) => (
                          <label
                            key={freq.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              formData.runFrequency === freq.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border/50 hover:border-border'
                            }`}
                          >
                            <RadioGroupItem value={freq.id} />
                            <span className="text-sm font-medium text-foreground">{freq.label}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                    
                    <div className="pt-4 border-t border-border/50">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={formData.notifyOnInsights}
                          onCheckedChange={(checked) => updateFormData('notifyOnInsights', !!checked)}
                        />
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">Notify me when new insights are found</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Review */}
              {currentStep === 7 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">Review your agent</h3>
                    <p className="text-sm text-muted-foreground">Double-check everything before creating.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Agent Name</p>
                      <p className="font-medium text-foreground">{formData.name || '—'}</p>
                    </div>
                    
                    {formData.description && (
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                        <p className="text-sm text-foreground">{formData.description}</p>
                      </div>
                    )}
                    
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Template</p>
                      <p className="font-medium text-foreground">{selectedTemplate?.name || '—'}</p>
                    </div>
                    
                    <details className="group">
                      <summary className="p-4 rounded-xl bg-muted/30 border border-border/30 cursor-pointer list-none">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Prompt</p>
                            <p className="text-sm text-foreground line-clamp-1">{formData.prompt || '—'}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                        </div>
                      </summary>
                      <div className="px-4 pb-4 text-sm text-foreground whitespace-pre-wrap">
                        {formData.prompt}
                      </div>
                    </details>
                    
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Data Sources</p>
                      <p className="text-sm text-foreground">
                        {formData.dataSources.length > 0 
                          ? DATA_SOURCES.filter(s => formData.dataSources.includes(s.id)).map(s => s.name).join(', ')
                          : '—'}
                        {formData.uploadedFiles.length > 0 && ` + ${formData.uploadedFiles.length} uploaded file(s)`}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Linked Goal</p>
                      <p className="text-sm text-foreground">
                        {formData.linkedGoalId && formData.linkedGoalId !== 'none'
                          ? mockGoals.find(g => g.id === formData.linkedGoalId)?.title
                          : 'None'}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Frequency</p>
                      <p className="text-sm text-foreground">
                        {RUN_FREQUENCIES.find(f => f.id === formData.runFrequency)?.label}
                        {formData.notifyOnInsights && ' • Notifications enabled'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer with navigation */}
        <div className="px-6 py-4 border-t border-border/50 bg-muted/30 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'text-muted-foreground/50 cursor-not-allowed'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
                canProceed()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Check className="w-4 h-4" />
              Create Agent
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
