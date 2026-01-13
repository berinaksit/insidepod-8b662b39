import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDocuments } from '@/contexts/DocumentsContext';
import { Agent, AgentType, AgentFrequency } from '@/types';
import { toast } from 'sonner';

interface EditAgentModalProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const agentTypes = [
  { value: 'risk-scanner', label: 'Risk Scanner' },
  { value: 'retention-monitor', label: 'Retention Monitor' },
  { value: 'adoption-tracker', label: 'Adoption Tracker' },
  { value: 'insight-synthesizer', label: 'Insight Synthesizer' },
  { value: 'trend-summarizer', label: 'Trend Summarizer' },
  { value: 'custom', label: 'Custom' },
];

const frequencies: AgentFrequency[] = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Manual'];

// Default connected sources (always available)
const defaultDataSources = [
  { id: 'salesforce', name: 'Salesforce_CRM Data', type: 'connected' },
  { id: 'drive', name: 'Drive_User Interviews', type: 'connected' },
  { id: 'meeting', name: 'Meeting transcript_Sales 2025', type: 'connected' },
];

export function EditAgentModal({ agent, open, onOpenChange }: EditAgentModalProps) {
  const { documents, updateAgent, deleteAgent, openUploadModal } = useDocuments();
  
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentType, setAgentType] = useState<AgentType>('custom');
  const [prompt, setPrompt] = useState('');
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<AgentFrequency>('Manual');
  const [isActive, setIsActive] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset form when agent changes
  useEffect(() => {
    if (agent) {
      setAgentName(agent.name);
      setAgentDescription(agent.description);
      setAgentType(agent.type);
      setPrompt(agent.prompt);
      setSelectedDataSources(agent.dataSources || []);
      setFrequency(agent.frequency);
      setIsActive(agent.isActive);
      setUploadedFile(agent.attachedFile || null);
    }
  }, [agent]);

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
        setUploadedFile({ name: file.name, type: file.type });
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSave = async () => {
    if (!agent) return;
    if (!agentName.trim() || !prompt.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSaving(true);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Get linked document IDs (only uploaded documents)
    const linkedDocumentIds = selectedDataSources.filter(id => 
      documents.some(doc => doc.id === id)
    );
    
    updateAgent(agent.id, {
      name: agentName.trim(),
      description: agentDescription.trim(),
      type: agentType,
      prompt: prompt.trim(),
      dataSources: selectedDataSources,
      frequency,
      isActive,
      linkedDocumentIds,
      attachedFile: uploadedFile || undefined,
    });
    
    toast.success('Agent updated successfully');
    setIsSaving(false);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!agent || agent.isPreset) return;
    deleteAgent(agent.id);
    toast.success(`Agent "${agent.name}" deleted`);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const isFormValid = agentName.trim() !== '' && prompt.trim() !== '';

  if (!agent) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Agent</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div>
                <Label className="text-sm font-medium">Agent Status</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isActive ? 'Agent is active and will run on schedule' : 'Agent is deactivated'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>

            {/* Agent Name */}
            <div className="space-y-2">
              <Label htmlFor="editAgentName" className="text-sm font-medium">
                Agent name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editAgentName"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name"
                className="bg-background"
              />
            </div>

            {/* Agent Description */}
            <div className="space-y-2">
              <Label htmlFor="editAgentDescription" className="text-sm font-medium">
                Agent description
              </Label>
              <Textarea
                id="editAgentDescription"
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                placeholder="Describe what this agent does..."
                className="bg-background min-h-[80px] resize-none"
              />
            </div>

            {/* Agent Type */}
            <div className="space-y-2">
              <Label htmlFor="editAgentType" className="text-sm font-medium">
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
              <Label htmlFor="editPrompt" className="text-sm font-medium">
                Prompt <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="editPrompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter the prompt for this agent..."
                className="bg-background min-h-[120px] resize-none"
              />
            </div>

            {/* Data Source */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Data source</Label>
                <button
                  type="button"
                  onClick={() => openUploadModal('edit-agent')}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  + Upload new document
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allDataSources.map((source) => (
                  <div key={source.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`edit-${source.id}`}
                      checked={selectedDataSources.includes(source.id)}
                      onCheckedChange={() => handleDataSourceToggle(source.id)}
                    />
                    <label
                      htmlFor={`edit-${source.id}`}
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
              <Label htmlFor="editFrequency" className="text-sm font-medium">
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

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {/* Delete button - only for custom agents */}
              {!agent.isPreset ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete agent
                </Button>
              ) : (
                <div /> // Empty div for spacing
              )}
              
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={!isFormValid || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. The agent and all its configuration will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
