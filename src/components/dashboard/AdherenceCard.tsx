import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HeartIcon, PlantIcon } from '@/components/icons/MedicineIcons';

interface AdherenceCardProps {
  score: number;
  taken: number;
  total: number;
}

export const AdherenceCard: React.FC<AdherenceCardProps> = ({ score, taken, total }) => {
  const getScoreColor = () => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getEncouragement = () => {
    if (score >= 90) return "You're doing amazing! 🌟";
    if (score >= 70) return "Great job! Keep it up! 💪";
    if (score >= 50) return "You're making progress! 🌱";
    return "Every step counts! 💚";
  };

  return (
    <Card className="overflow-hidden card-float">
      <div className="gradient-hero p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 font-medium">Your Adherence Score</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-bold">{score}</span>
              <span className="text-2xl opacity-80">/100</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
            <HeartIcon className="w-10 h-10 text-primary-foreground animate-pulse-soft" />
          </div>
        </div>
        <p className="mt-3 text-sm font-medium">{getEncouragement()}</p>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
              <PlantIcon className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Progress</p>
              <p className="font-semibold text-foreground">{taken} of {total} doses taken</p>
            </div>
          </div>
          <div className="text-right">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-success rounded-full transition-all duration-500"
                style={{ width: `${total > 0 ? (taken / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
