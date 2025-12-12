import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { AdherenceCard } from '@/components/dashboard/AdherenceCard';
import { TimeSlotSection } from '@/components/dashboard/TimeSlotSection';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { AddMedicineForm } from '@/components/forms/AddMedicineForm';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { useMedicines } from '@/hooks/useMedicines';
import { Plus, Sparkles } from 'lucide-react';
import { HeartIcon, PlantIcon } from '@/components/icons/MedicineIcons';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const {
    medicines,
    addMedicine,
    markDose,
    getDailySchedule,
    getAdherenceScore,
    getTodayStats,
  } = useMedicines();

  const dailySchedule = getDailySchedule();
  const adherenceScore = getAdherenceScore();
  const todayStats = getTodayStats();

  const handleMarkTaken = (logId: string) => {
    markDose(logId, 'taken');
  };

  const handleMarkMissed = (logId: string) => {
    markDose(logId, 'missed');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header userName="Friend" />
      
      <main className="container py-6 space-y-8">
        {/* Welcome Section - Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-foreground">Good Morning!</span>
            <HeartIcon className="w-5 h-5 text-care-foreground animate-pulse-soft" />
          </div>
          <p className="text-muted-foreground">Time to stay healthy 💚</p>
        </div>

        {/* Adherence Score */}
        <AdherenceCard 
          score={adherenceScore} 
          taken={todayStats.taken} 
          total={todayStats.total} 
        />

        {/* Quick Stats */}
        <QuickStats
          weeklyScore={85}
          streak={7}
          steps={6543}
          sleepHours={7.5}
        />

        {/* Today's Medicines */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Today's Medicines</h2>
                <p className="text-sm text-muted-foreground">{todayStats.pending} pending • {todayStats.taken} taken</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          </div>

          {dailySchedule.length > 0 ? (
            <div className="space-y-8">
              {dailySchedule.map((schedule) => (
                <TimeSlotSection
                  key={schedule.timeSlot}
                  schedule={schedule}
                  onMarkTaken={handleMarkTaken}
                  onMarkMissed={handleMarkMissed}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                <PlantIcon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No medicines scheduled</h3>
              <p className="text-muted-foreground mb-6">Add your first medicine to get started!</p>
              <Button onClick={() => setShowAddForm(true)} size="lg">
                <Plus className="w-5 h-5" />
                Add Medicine
              </Button>
            </div>
          )}
        </div>

        {/* Encouragement Message */}
        <div className="bg-care/30 rounded-2xl p-6 text-center">
          <div className="flex justify-center mb-3">
            <HeartIcon className="w-8 h-8 text-care-foreground animate-pulse-soft" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">You're doing great! 🌟</h3>
          <p className="text-muted-foreground">Keep up the healthy habits. Your body thanks you!</p>
        </div>
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => setShowAddForm(true)}
      />

      {showAddForm && (
        <AddMedicineForm
          onAdd={addMedicine}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default Index;
