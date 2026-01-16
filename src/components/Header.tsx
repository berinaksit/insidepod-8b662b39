import { motion } from 'framer-motion';
import { Bell, User, Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onSettingsClick?: () => void;
  onLogoClick?: () => void;
}

export function Header({ onSettingsClick, onLogoClick }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between px-6 lg:px-8 py-5"
    >
      <button 
        onClick={onLogoClick}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-foreground">
          <span className="text-background font-semibold text-sm">P</span>
        </div>
        <span className="text-lg font-semibold text-foreground tracking-tight">Inside Pōd</span>
      </button>

      <div className="flex items-center gap-1">
        <button className="p-3 rounded-xl hover:bg-muted/60 transition-colors relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-foreground rounded-full" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-3 rounded-xl hover:bg-muted/60 transition-colors">
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
