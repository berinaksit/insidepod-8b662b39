import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onSettingsClick?: () => void;
  onLogoClick?: () => void;
  onProjectsClick?: () => void;
}

export function Header({
  onSettingsClick,
  onLogoClick,
  onProjectsClick
}: HeaderProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50"
    >
      <button onClick={onLogoClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-5 h-5 rounded-xl flex items-center justify-center bg-foreground">
          <span className="text-background font-display text-lg"></span>
        </div>
        <span className="font-display text-lg sm:text-xl text-foreground">Pōd</span>
      </button>

      <div className="flex items-center gap-3 sm:gap-6">
        <button 
          onClick={onProjectsClick} 
          className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Projects
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Account
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
