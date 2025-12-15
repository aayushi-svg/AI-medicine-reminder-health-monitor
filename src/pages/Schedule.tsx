import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMedicinesDB } from '@/hooks/useMedicinesDB';
import { Calendar, Clock, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

const Schedule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { medicines } = useMedicinesDB();

  const getTimeSlotInfo = (slot: 'morning' | 'afternoon' | 'night') => {
    const info = {
      morning: { label: 'Morning', icon: '🌅', time: '8:00 AM', color: 'bg-sunny/20 text-sunny-foreground' },
      afternoon: { label: 'Afternoon', icon: '☀️', time: '2:00 PM', color: 'bg-accent/20 text-accent-foreground' },
      night: { label: 'Night', icon: '🌙', time: '8:00 PM', color: 'bg-lavender/20 text-lavender-foreground' },
    };
    return info[slot];
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header userName={user?.user_metadata?.name || 'Friend'} />
      
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Medicine Schedule</h1>
            <p className="text-muted-foreground">Your daily medication routine</p>
          </div>
        </div>

        {medicines.length > 0 ? (
          <div className="space-y-4">
            {medicines.map((medicine) => (
              <Card key={medicine.id} className="card-float">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-primary" />
                    {medicine.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">{medicine.dosage}</p>
                  <div className="flex flex-wrap gap-2">
                    {medicine.morning && (
                      <span className={cn("pill-badge", getTimeSlotInfo('morning').color)}>
                        {getTimeSlotInfo('morning').icon} Morning
                      </span>
                    )}
                    {medicine.afternoon && (
                      <span className={cn("pill-badge", getTimeSlotInfo('afternoon').color)}>
                        {getTimeSlotInfo('afternoon').icon} Afternoon
                      </span>
                    )}
                    {medicine.night && (
                      <span className={cn("pill-badge", getTimeSlotInfo('night').color)}>
                        {getTimeSlotInfo('night').icon} Night
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {medicine.days_remaining} days left
                    </span>
                    <span>{medicine.before_food ? '🍽️ Before food' : '🍽️ After food'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No medicines scheduled</h3>
              <p className="text-muted-foreground">Add medicines from the home page to see your schedule here.</p>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav activeTab="calendar" onAddClick={() => navigate('/')} />
    </div>
  );
};

export default Schedule;
