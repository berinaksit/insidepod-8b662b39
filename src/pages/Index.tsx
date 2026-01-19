import { useState } from 'react';
import { Header } from '@/components/Header';
import { HomeView } from '@/views/HomeView';
import { GoalsView } from '@/views/GoalsView';
import { AgentsView } from '@/views/AgentsView';
import { SettingsView } from '@/views/SettingsView';
import { CreateAgentView } from '@/views/CreateAgentView';
import { ProjectSelectionView } from '@/views/ProjectSelectionView';
import { ProjectWorkspaceView } from '@/views/ProjectWorkspaceView';
import { AnimatePresence, motion } from 'framer-motion';
import { useDocuments } from '@/contexts/DocumentsContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { GlobalUploadModal } from '@/components/GlobalUploadModal';
import { FirstDocumentModal } from '@/components/FirstDocumentModal';

export type View = 'home' | 'goals' | 'agents' | 'dashboard' | 'settings' | 'create-agent' | 'projects' | 'project-workspace';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('projects');
  const { 
    showUploadModal, 
    setShowUploadModal, 
    showFirstDocumentModal, 
    setShowFirstDocumentModal 
  } = useDocuments();
  const { activeProjectId, setActiveProjectId } = useProjects();

  const handleFirstDocumentCreateAgent = () => {
    setShowFirstDocumentModal(false);
    setCurrentView('create-agent');
  };

  const handleFirstDocumentLater = () => {
    setShowFirstDocumentModal(false);
  };

  const handleProjectSelect = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView('project-workspace');
  };

  const handleBackToProjects = () => {
    setActiveProjectId(null);
    setCurrentView('projects');
  };

  const handleLogoClick = () => {
    // If in a project, go to project workspace; otherwise go to project selection
    if (activeProjectId) {
      setCurrentView('home');
    } else {
      setCurrentView('projects');
    }
  };

  const renderView = () => {
    // If no project is active, show project selection (except for settings)
    if (!activeProjectId && currentView !== 'settings') {
      return <ProjectSelectionView onProjectSelect={handleProjectSelect} />;
    }

    switch (currentView) {
      case 'projects':
        return <ProjectSelectionView onProjectSelect={handleProjectSelect} />;
      case 'project-workspace':
        return <ProjectWorkspaceView onBack={handleBackToProjects} />;
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
      case 'settings':
        return <SettingsView onNavigate={setCurrentView} />;
      default:
        return <HomeView currentTab={currentView} onTabChange={setCurrentView} />;
    }
  };

  // Show minimal header for project selection
  const isInProjectSelection = !activeProjectId && currentView !== 'settings';

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col min-h-screen">
        <Header 
          onSettingsClick={() => setCurrentView('settings')} 
          onLogoClick={handleLogoClick}
          showProjectSwitch={!!activeProjectId}
          onProjectSwitch={handleBackToProjects}
        />
        
        <main className="flex-1 overflow-auto px-[150px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (activeProjectId || '')}
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
