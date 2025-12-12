import React from 'react';
import { SunIcon, AfternoonIcon, MoonIcon } from '@/components/icons/MedicineIcons';
import { MedicineCard } from './MedicineCard';
import { DailySchedule } from '@/types/medicine';
import { cn } from '@/lib/utils';

interface TimeSlotSectionProps {
  schedule: DailySchedule;
  onMarkTaken: (logId: string) => void;
  onMarkMissed: (logId: string) => void;
}

export const TimeSlotSection: React.FC<TimeSlotSectionProps> = ({
  schedule,
  onMarkTaken,
  onMarkMissed,
}) => {
  const getTimeSlotConfig = () => {
    switch (schedule.timeSlot) {
      case 'morning':
        return {
          icon: <SunIcon className="w-6 h-6" />,
          label: 'Morning',
          gradient: 'gradient-morning',
          color: 'text-sunny-foreground',
        };
      case 'afternoon':
        return {
          icon: <AfternoonIcon className="w-6 h-6" />,
          label: 'Afternoon',
          gradient: 'gradient-afternoon',
          color: 'text-secondary-foreground',
        };
      case 'night':
        return {
          icon: <MoonIcon className="w-6 h-6" />,
          label: 'Night',
          gradient: 'gradient-night',
          color: 'text-lavender-foreground',
        };
    }
  };

  const config = getTimeSlotConfig();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", config.gradient, config.color)}>
          {config.icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{config.label} Doses</h2>
          <p className="text-sm text-muted-foreground">{schedule.time} • {schedule.medicines.length} medicine{schedule.medicines.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {schedule.medicines.map(({ medicine, log }, index) => (
          <div key={log.id} style={{ animationDelay: `${index * 100}ms` }}>
            <MedicineCard
              medicine={medicine}
              log={log}
              onMarkTaken={onMarkTaken}
              onMarkMissed={onMarkMissed}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
