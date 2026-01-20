import { motion } from 'framer-motion';
import { Bell, User, Settings, LogOut, FolderOpen, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectSelector } from '@/components/ProjectSelector';
import { generateExecutiveSummaryPDF } from '@/components/ExecutiveSummaryExport';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDocuments } from '@/contexts/DocumentsContext';
import { mockInsights } from '@/data/mockData';
import { Goal } from '@/components/CreateGoalModal';

interface HeaderProps {
  onSettingsClick?: () => void;
  onLogoClick?: () => void;
  onProjectsClick?: () => void;
  showProjectSelector?: boolean;
}

export function Header({ onSettingsClick, onLogoClick, onProjectsClick, showProjectSelector = false }: HeaderProps) {
  const { generatedInsights, documents } = useDocuments();
  
  const handleDownloadExecutiveSummary = () => {
    // Load goals from localStorage
    const GOALS_STORAGE_KEY = 'insidepod_goals_v2';
    let goals: Goal[] = [];
    try {
      const stored = localStorage.getItem(GOALS_STORAGE_KEY);
      if (stored) {
        goals = JSON.parse(stored).map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt),
        }));
      }
    } catch (e) {
      console.warn('Failed to load goals:', e);
    }
    
    const allInsights = [...generatedInsights, ...mockInsights];
    generateExecutiveSummaryPDF({
      insights: allInsights,
      goals,
      documents
    });
  };
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between px-6 py-4 border-b border-border/50"
    >
      <button 
        onClick={onLogoClick}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-5 h-5 rounded-xl flex items-center justify-center bg-foreground">
          <span className="text-background font-display text-lg"></span>
        </div>
        <span className="font-display text-xl text-foreground">Inside Pōd</span>
      </button>

      <div className="flex items-center gap-2">
        {showProjectSelector && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleDownloadExecutiveSummary}
                    className="p-2.5 rounded-xl hover:bg-muted transition-colors"
                  >
                    <Download className="w-5 h-5 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download executive summary</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ProjectSelector />
          </>
        )}
        <button 
          onClick={onProjectsClick}
          className="p-2.5 rounded-xl hover:bg-muted transition-colors"
          title="Projects"
        >
          <FolderOpen className="w-5 h-5 text-muted-foreground" />
        </button>

        <button className="p-2.5 rounded-xl hover:bg-muted transition-colors relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2.5 rounded-xl hover:bg-muted transition-colors">
              <User className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}