import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import { PillIcon, SunIcon, AfternoonIcon, MoonIcon } from '@/components/icons/MedicineIcons';
import { Medicine, DoseLog } from '@/types/medicine';
import { cn } from '@/lib/utils';

interface MedicineCardProps {
  medicine: Medicine;
  log: DoseLog;
  onMarkTaken: (logId: string) => void;
  onMarkMissed: (logId: string) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  log,
  onMarkTaken,
  onMarkMissed,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionTime, setActionTime] = useState<number | null>(null);

  const getTimeIcon = () => {
    switch (log.time_slot) {
      case 'morning':
        return <SunIcon className="w-5 h-5" />;
      case 'afternoon':
        return <AfternoonIcon className="w-5 h-5" />;
      case 'night':
        return <MoonIcon className="w-5 h-5" />;
    }
  };

  const getTimeGradient = () => {
    switch (log.time_slot) {
      case 'morning':
        return 'gradient-morning';
      case 'afternoon':
        return 'gradient-afternoon';
      case 'night':
        return 'gradient-night';
    }
  };

  const getColorClasses = () => {
    switch (medicine.color) {
      case 'primary':
        return 'bg-primary/10 text-primary';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground';
      case 'accent':
        return 'bg-accent text-accent-foreground';
      case 'lavender':
        return 'bg-lavender text-lavender-foreground';
      case 'sunny':
        return 'bg-sunny text-sunny-foreground';
      case 'care':
        return 'bg-care text-care-foreground';
    }
  };

  const handleTaken = () => {
    const now = Date.now();
    if (actionTime && now - actionTime < 3000) {
      // Suspicious - too fast
      setShowConfirmation(true);
    } else {
      onMarkTaken(log.id);
    }
    setActionTime(now);
  };

  const handleConfirm = (confirmed: boolean) => {
    if (confirmed) {
      onMarkTaken(log.id);
    }
    setShowConfirmation(false);
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return timeString;
    }
  };

  if (showConfirmation) {
    return (
      <Card className="animate-wiggle border-2 border-warning">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-warning/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Quick Confirmation</h4>
              <p className="text-sm text-muted-foreground">Did you really take {medicine.name} just now?</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="success" 
              className="flex-1"
              onClick={() => handleConfirm(true)}
            >
              Yes, I took it
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => handleConfirm(false)}
            >
              Not yet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "card-float animate-slide-up",
      log.status === 'taken' && "opacity-75",
      log.status === 'missed' && "border-destructive/50"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", getColorClasses())}>
              <PillIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{medicine.name}</h3>
              <p className="text-muted-foreground">{medicine.dosage}</p>
            </div>
          </div>
          <div className={cn("pill-badge", getTimeGradient())}>
            {getTimeIcon()}
            <span className="font-medium">{formatTime(log.scheduled_time)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className={cn(
            "pill-badge text-xs",
            medicine.before_food ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
          )}>
            {medicine.before_food ? '🍽️ Before food' : '🍽️ After food'}
          </span>
          <span className="pill-badge bg-muted text-muted-foreground text-xs">
            <Clock className="w-3 h-3" />
            {medicine.days_remaining} days left
          </span>
        </div>

        {log.status === 'pending' ? (
          <div className="flex gap-3">
            <Button
              variant="taken"
              className="flex-1 btn-bounce"
              onClick={handleTaken}
            >
              <Check className="w-5 h-5" />
              Taken
            </Button>
            <Button
              variant="missed"
              className="flex-1 btn-bounce"
              onClick={() => onMarkMissed(log.id)}
            >
              <X className="w-5 h-5" />
              Missed
            </Button>
          </div>
        ) : (
          <div className={cn(
            "py-3 px-4 rounded-xl text-center font-semibold",
            log.status === 'taken' && "bg-success/10 text-success",
            log.status === 'missed' && "bg-destructive/10 text-destructive",
            log.status === 'suspected' && "bg-warning/10 text-warning"
          )}>
            {log.status === 'taken' && '✅ Marked as Taken'}
            {log.status === 'missed' && '❌ Marked as Missed'}
            {log.status === 'suspected' && '⚠️ Suspected Confirmation'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
