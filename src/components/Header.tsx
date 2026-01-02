import { motion } from 'framer-motion';
import { Menu, Bell, User } from 'lucide-react';
interface HeaderProps {
  onMenuClick?: () => void;
}
export function Header({
  onMenuClick
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
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors lg:hidden">
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-xl flex items-center justify-center bg-slate-950">
            <span className="text-primary-foreground font-display text-lg">
          </span>
          </div>
          <span className="font-display text-xl text-foreground">Inside Pōd</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2.5 rounded-xl hover:bg-muted transition-colors relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full" />
        </button>
        
        <button className="p-2.5 rounded-xl hover:bg-muted transition-colors">
          <User className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </motion.header>;
}