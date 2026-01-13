import { motion } from 'framer-motion';
import { Settings, Database, Link2, Bell, Shield, Upload } from 'lucide-react';
import { useDocuments } from '@/contexts/DocumentsContext';
import { View } from '@/pages/Index';

interface SettingsViewProps {
  onNavigate?: (view: View) => void;
}

export function SettingsView({ onNavigate }: SettingsViewProps) {
  const { documents, openUploadModal } = useDocuments();

  const handleDataSourcesClick = () => {
    openUploadModal('settings');
  };

  const settingsSections = [
    {
      icon: Database,
      title: 'Data Sources',
      description: 'Connect your analytics, research, and customer data',
      count: documents.length,
      onClick: handleDataSourcesClick,
    },
    {
      icon: Link2,
      title: 'Integrations',
      description: 'Configure third-party tool connections',
      count: 7,
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Manage alerts and digest preferences',
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Access controls and data privacy settings',
    },
  ];

  return (
    <div className="min-h-full px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="font-display text-2xl text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground">
          Configure your Inside Pōd workspace
        </p>
      </motion.div>
      
      <div className="space-y-3 max-w-2xl">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          
          return (
            <motion.button
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={section.onClick}
              className="w-full flex items-center gap-4 p-5 bg-card border border-border/50 rounded-2xl hover:border-border hover:shadow-lg hover:shadow-primary/5 transition-all text-left group"
            >
              <div className="p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{section.title}</h3>
                  {section.count !== undefined && section.count > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                      {section.count} {section.title === 'Data Sources' ? 'uploaded' : 'connected'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
              
              {section.title === 'Data Sources' ? (
                <Upload className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              ) : (
                <Settings className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
