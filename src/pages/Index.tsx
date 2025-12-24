import { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { HomeView } from '@/views/HomeView';
import { GoalsView } from '@/views/GoalsView';
import { AgentsView } from '@/views/AgentsView';
import { SettingsView } from '@/views/SettingsView';
import { AnimatePresence, motion } from 'framer-motion';

type View = 'home' | 'goals' | 'agents' | 'settings';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'goals':
        return <GoalsView />;
      case 'agents':
        return <AgentsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - hidden on mobile by default */}
      <div className="hidden lg:block">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isOpen={true}
          onClose={() => {}}
        />
      </div>
      
      {/* Mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto">
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
    </div>
  );
};

export default Index;
