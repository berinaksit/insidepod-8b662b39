import { motion } from 'framer-motion';
import { Home, Bot, Settings, X } from 'lucide-react';
type View = 'home' | 'agents' | 'settings';
interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}
const navItems: {
  id: View;
  label: string;
  icon: React.ElementType;
}[] = [{
  id: 'home',
  label: 'Home',
  icon: Home
}, {
  id: 'agents',
  label: 'Agents',
  icon: Bot
}, {
  id: 'settings',
  label: 'Settings',
  icon: Settings
}];
export function Sidebar({
  currentView,
  onViewChange,
  isOpen,
  onClose
}: SidebarProps) {
  return <>
      {/* Mobile overlay */}
      {isOpen && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
      
      {/* Sidebar */}
      <motion.aside initial={false} animate={{
      x: isOpen ? 0 : '-100%'
    }} transition={{
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }} className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-50 lg:translate-x-0 lg:static lg:z-auto">
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display text-lg">P</span>
              </div>
              <span className="font-display text-xl text-sidebar-foreground">Inside Pōd</span>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-sidebar-accent transition-colors">
              <X className="w-4 h-4 text-sidebar-foreground" strokeWidth={3} />
            </button>
          </div>
          
          <nav className="flex-1 space-y-0.5">
            {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return <button key={item.id} onClick={() => {
              onViewChange(item.id);
              onClose();
            }} className={`
                    w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-200
                    ${isActive ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}
                  `}>
                  <Icon className="w-4 h-4" strokeWidth={3} />
                  <span className="font-medium">{item.label}</span>
                </button>;
          })}
          </nav>
          
          <div className="pt-3">
            <div className="px-3.5 py-2.5">
              <p className="text-xs text-sidebar-foreground/50 uppercase tracking-wider mb-0.5 font-medium">
                Last sync
              </p>
              <p className="text-sm text-sidebar-foreground/70 font-medium">
                2 minutes ago
              </p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>;
}