import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Calendar, Activity, Trophy } from 'lucide-react';

interface QuickStatsProps {
  weeklyScore: number;
  streak: number;
  steps: number;
  sleepHours: number;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  weeklyScore,
  streak,
  steps,
  sleepHours,
}) => {
  const stats = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Weekly Score',
      value: `${weeklyScore}%`,
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: 'Current Streak',
      value: `${streak} days`,
      color: 'bg-sunny text-sunny-foreground',
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: 'Steps Today',
      value: steps.toLocaleString(),
      color: 'bg-secondary text-secondary-foreground',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Sleep',
      value: `${sleepHours}h`,
      color: 'bg-lavender text-lavender-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={stat.label} className="card-float animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
          <CardContent className="p-4">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
