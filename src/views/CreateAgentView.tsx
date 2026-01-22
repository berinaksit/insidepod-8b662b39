import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useDocuments } from '@/contexts/DocumentsContext';
import { AgentType, AgentFrequency } from '@/types';
import { toast } from 'sonner';

interface CreateAgentViewProps {
  onCancel: () => void;
  onCreate: () => void;
}

const agentTypes = [
  { value: 'risk-scanner', label: 'Risk Scanner' },
  { value: 'retention-monitor', label: 'Retention Monitor' },
  { value: 'adoption-tracker', label: 'Adoption Tracker' },
  { value: 'insight-synthesizer', label: 'Insight Synthesizer' },
  { value: 'custom', label: 'Custom' },
];

const frequencies: AgentFrequency[] = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Manual'];

// Default connected sources (always available)
const defaultDataSources = [
  { id: 'salesforce', name: 'Salesforce_CRM Data', type: 'connected' },
  { id: 'drive', name: 'Drive_User Interviews', type: 'connected' },
  { id: 'meeting', name: 'Meeting transcript_Sales 2025', type: 'connected' },
];

export function CreateAgentView({ onCancel, onCreate }: CreateAgentViewProps) {
  const { documents, addAgent, openUploadModal } = useDocuments();
  
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentType, setAgentType] = useState<AgentType>('custom');
  const [prompt, setPrompt] = useState('');
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<AgentFrequency>('Manual');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Combine uploaded documents with default sources
  const allDataSources = [
    ...documents.map(doc => ({
      id: doc.id,
      name: doc.aiTitle || doc.name,
      type: 'uploaded' as const,
    })),
    ...defaultDataSources,
  ];

  const handleDataSourceToggle = (sourceId: string) => {
    setSelectedDataSources((prev) =>
      prev.includes(sourceId)
        ? prev.filter((s) => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim() || !prompt.trim()) return;
    
    setIsCreating(true);
    
    // Simulate creation delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Get linked document IDs (only uploaded documents)
    const linkedDocumentIds = selectedDataSources.filter(id => 
      documents.some(doc => doc.id === id)
    );
    
    // Create the agent
    addAgent({
      name: agentName.trim(),
      description: agentDescription.trim(),
      type: agentType,
      prompt: prompt.trim(),
      dataSources: selectedDataSources,
      frequency,
      isActive: true,
      linkedDocumentIds,
    });
    
    toast.success(`Agent "${agentName}" created successfully!`);
    
    if (linkedDocumentIds.length > 0) {
      toast.info('Generating insights from your documents...', { duration: 2000 });
    }
    
    setIsCreating(false);
    onCreate();
  };

  const isFormValid = agentName.trim() !== '' && prompt.trim() !== '';

  return (
    <div className="min-h-full px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Create Agent</h1>
            <p className="text-muted-foreground">Configure a new AI agent to monitor your data</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border/30 rounded-2xl p-6 space-y-6">
            {/* Agent Name */}
            <div className="space-y-2">
              <Label htmlFor="agentName" className="text-sm font-medium">
                Agent name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="agentName"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name"
                className="bg-background"
                required
              />
            </div>

            {/* Agent Description */}
            <div className="space-y-2">
              <Label htmlFor="agentDescription" className="text-sm font-medium">
                Agent description
              </Label>
              <Textarea
                id="agentDescription"
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                placeholder="Describe what this agent does..."
                className="bg-background min-h-[80px] resize-none"
              />
            </div>

            {/* Agent Type */}
            <div className="space-y-2">
              <Label htmlFor="agentType" className="text-sm font-medium">
                Agent type
              </Label>
              <Select value={agentType} onValueChange={(v) => setAgentType(v as AgentType)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent>
                  {agentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-sm font-medium">
                Prompt <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter the prompt for this agent..."
                className="bg-background min-h-[120px] resize-none"
                required
              />
            </div>

            {/* Data Source */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Data source</Label>
                <button
                  type="button"
                  onClick={() => openUploadModal('create-agent')}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  + Upload new document
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allDataSources.map((source) => (
                  <div key={source.id} className="flex items-center gap-3">
                    <Checkbox
                      id={source.id}
                      checked={selectedDataSources.includes(source.id)}
                      onCheckedChange={() => handleDataSourceToggle(source.id)}
                    />
                    <label
                      htmlFor={source.id}
                      className="text-sm text-foreground cursor-pointer flex items-center gap-2"
                    >
                      {source.name}
                      {source.type === 'uploaded' && (
                        <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                          Uploaded
                        </span>
                      )}
                    </label>
                  </div>
                ))}
                {allDataSources.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No documents uploaded yet
                  </p>
                )}
              </div>
            </div>

            {/* Upload Data */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload data</Label>
              <div className="relative">
                {!uploadedFile ? (
                  <label className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
                    <span className="text-sm text-muted-foreground">
                      Upload PDF, CSV, or DOCX
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.csv,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <span className="text-sm text-foreground truncate">
                      {uploadedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/20 transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-sm font-medium">
                Frequency
              </Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as AgentFrequency)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {freq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isCreating}
              className="px-6"
            >
              {isCreating ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
