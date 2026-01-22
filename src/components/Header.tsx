import { motion } from 'framer-motion';
import { Bell, User, Settings, LogOut, FolderOpen } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  return <motion.header initial={{
    opacity: 0,
    y: -20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.4
  }} className="flex items-center justify-between px-6 py-4 border-b border-border/50">
      <button onClick={onLogoClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-5 h-5 rounded-xl flex items-center justify-center bg-foreground">
          <span className="text-background font-display text-lg"></span>
        </div>
        <span className="font-display text-xl text-foreground">Pōd</span>
      </button>

      <div className="flex items-center gap-2">
        <button onClick={onProjectsClick} className="p-2.5 rounded-xl hover:bg-muted transition-colors" title="Projects">
          <FolderOpen className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </button>

        <button className="p-2.5 rounded-xl hover:bg-muted transition-colors relative">
          <Bell className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2.5 rounded-xl hover:bg-muted transition-colors">
              <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive">
              <LogOut className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>;
}