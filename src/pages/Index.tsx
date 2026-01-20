import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HomeView } from '@/views/HomeView';
import { GoalsView } from '@/views/GoalsView';
import { AgentsView } from '@/views/AgentsView';
import { SettingsView } from '@/views/SettingsView';
import { CreateAgentView } from '@/views/CreateAgentView';
import { ProjectsView } from '@/views/ProjectsView';
import { AnimatePresence, motion } from 'framer-motion';
import { useDocuments } from '@/contexts/DocumentsContext';
import { GlobalUploadModal } from '@/components/GlobalUploadModal';
import { FirstDocumentModal } from '@/components/FirstDocumentModal';
import { generateExecutiveSummaryPDF } from '@/components/ExecutiveSummaryExport';
import { mockInsights } from '@/data/mockData';
import { Goal } from '@/components/CreateGoalModal';

export type View = 'home' | 'goals' | 'agents' | 'dashboard' | 'settings' | 'create-agent' | 'projects';

const GOALS_STORAGE_KEY = 'insidepod_goals_v2';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const { 
    showUploadModal, 
    setShowUploadModal, 
    showFirstDocumentModal, 
    setShowFirstDocumentModal,
    generatedInsights,
    documents
  } = useDocuments();

  // Load goals for executive summary
  const loadGoals = (): Goal[] => {
    try {
      const stored = localStorage.getItem(GOALS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt),
        }));
      }
    } catch (e) {
      console.warn('Failed to load goals from localStorage:', e);
    }
    return [];
  };

  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());

  // Listen for goal updates from HomeView
  useEffect(() => {
    const handleStorageChange = () => {
      setGoals(loadGoals());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const allInsights = [...generatedInsights, ...mockInsights];

  const handleDownloadSummary = () => {
    generateExecutiveSummaryPDF({
      insights: allInsights,
      goals,
      documents
    });
  };

  const handleFirstDocumentCreateAgent = () => {
    setShowFirstDocumentModal(false);
    setCurrentView('create-agent');
  };

  const handleFirstDocumentLater = () => {
    setShowFirstDocumentModal(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView currentTab={currentView} onTabChange={setCurrentView} />;
      case 'goals':
        return <HomeView currentTab={currentView} onTabChange={setCurrentView} />;
      case 'agents':
        return <HomeView currentTab={currentView} onTabChange={setCurrentView} />;
      case 'create-agent':
        return (
          <CreateAgentView
            onCancel={() => setCurrentView('agents')}
            onCreate={() => setCurrentView('home')}
          />
        );
      case 'projects':
        return <ProjectsView onBack={() => setCurrentView('home')} />;
      case 'settings':
        return <SettingsView onNavigate={setCurrentView} />;
      default:
        return <HomeView currentTab={currentView} onTabChange={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col min-h-screen">
        <Header 
          onSettingsClick={() => setCurrentView('settings')} 
          onLogoClick={() => setCurrentView('home')}
          onProjectsClick={() => setCurrentView('projects')}
          onDownloadSummary={handleDownloadSummary}
        />
        
        <main className="flex-1 overflow-auto px-[150px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Upload Modal */}
      <GlobalUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
      />

      {/* First Document Modal */}
      <FirstDocumentModal
        open={showFirstDocumentModal}
        onOpenChange={setShowFirstDocumentModal}
        onCreateAgent={handleFirstDocumentCreateAgent}
        onLater={handleFirstDocumentLater}
      />
    </div>
  );
};

export default Index;
