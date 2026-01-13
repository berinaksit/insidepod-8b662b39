import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X } from 'lucide-react';
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

interface CreateAgentViewProps {
  onCancel: () => void;
  onCreate: () => void;
}

const agentTypes = [
  'Risk Scanner',
  'Retention Monitor',
  'Adoption Tracker',
  'Insight Synthesizer',
  'Custom',
];

const dataSources = [
  'Salesforce_CRM Data',
  'Drive_User Interviews',
  'Meeting transcript_Sales 2025',
];

const frequencies = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Manual'];

export function CreateAgentView({ onCancel, onCreate }: CreateAgentViewProps) {
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentType, setAgentType] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDataSourceToggle = (source: string) => {
    setSelectedDataSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just navigate back - actual creation logic can be added later
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
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
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
              <Select value={agentType} onValueChange={setAgentType}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent>
                  {agentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
              <Label className="text-sm font-medium">Data source</Label>
              <div className="space-y-2">
                {dataSources.map((source) => (
                  <div key={source} className="flex items-center gap-3">
                    <Checkbox
                      id={source}
                      checked={selectedDataSources.includes(source)}
                      onCheckedChange={() => handleDataSourceToggle(source)}
                    />
                    <label
                      htmlFor={source}
                      className="text-sm text-foreground cursor-pointer"
                    >
                      {source}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Data */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload data</Label>
              <div className="relative">
                {!uploadedFile ? (
                  <label className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
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
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
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
              <Select value={frequency} onValueChange={setFrequency}>
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid}
              className="px-6"
            >
              Create Agent
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
