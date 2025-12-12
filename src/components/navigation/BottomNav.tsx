import React from 'react';
import { Home, Plus, Calendar, BarChart3, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onAddClick }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'calendar', icon: Calendar, label: 'Schedule' },
    { id: 'add', icon: Plus, label: 'Add', isAction: true },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 pb-safe">
      <div className="container">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            if (item.isAction) {
              return (
                <Button
                  key={item.id}
                  onClick={onAddClick}
                  className="w-14 h-14 rounded-full -mt-6 shadow-button btn-bounce"
                  size="icon"
                >
                  <Plus className="w-7 h-7" />
                </Button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all",
                  activeTab === item.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-6 h-6 transition-transform",
                  activeTab === item.id && "scale-110"
                )} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
