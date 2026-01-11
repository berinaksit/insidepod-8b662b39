import { useState } from 'react';
import { Header } from '@/components/Header';
import { HomeView } from '@/views/HomeView';
import { GoalsView } from '@/views/GoalsView';
import { AgentsView } from '@/views/AgentsView';
import { SettingsView } from '@/views/SettingsView';
import { AnimatePresence, motion } from 'framer-motion';

export type View = 'home' | 'goals' | 'agents' | 'dashboard' | 'settings';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView currentTab={currentView} onTabChange={setCurrentView} />;
      case 'goals':
        return <HomeView currentTab={currentView} onTabChange={setCurrentView} />;
      case 'agents':
        return <HomeView currentTab={currentView} onTabChange={setCurrentView} />;
      case 'settings':
        return <SettingsView />;
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
    </div>
  );
};

export default Index;
