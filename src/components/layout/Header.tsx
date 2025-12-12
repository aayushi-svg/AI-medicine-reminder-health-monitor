import React from 'react';
import { Bell, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeartIcon, PillIcon } from '@/components/icons/MedicineIcons';

interface HeaderProps {
  userName?: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userName = 'Friend', onMenuClick }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <PillIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">MediCare</h1>
                <p className="text-xs text-muted-foreground">Your Health Buddy</p>
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 hidden md:block">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">{getGreeting()}, {userName}!</span>
              <HeartIcon className="w-5 h-5 text-care-foreground animate-pulse-soft" />
            </div>
            <p className="text-sm text-muted-foreground">Time to stay healthy 💚</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
