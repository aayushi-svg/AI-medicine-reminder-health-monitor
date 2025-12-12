import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { AdherenceCard } from '@/components/dashboard/AdherenceCard';
import { TimeSlotSection } from '@/components/dashboard/TimeSlotSection';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { AddMedicineForm } from '@/components/forms/AddMedicineForm';
import { PrescriptionScanner } from '@/components/ocr/PrescriptionScanner';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { useMedicinesDB } from '@/hooks/useMedicinesDB';
import { useNotifications } from '@/hooks/useNotifications';
import { Plus, Sparkles, Camera, Bell, Loader2 } from 'lucide-react';
import { HeartIcon, PlantIcon } from '@/components/icons/MedicineIcons';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { permission, requestPermission } = useNotifications();
  
  const {
    medicines,
    loading,
    addMedicine,
    addMultipleMedicines,
    markDose,
    getDailySchedule,
    getTodayStats,
  } = useMedicinesDB();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (activeTab === 'profile') navigate('/profile');
  }, [activeTab, navigate]);

  const dailySchedule = getDailySchedule();
  const todayStats = getTodayStats();

  const handleMarkTaken = (logId: string) => markDose(logId, 'taken');
  const handleMarkMissed = (logId: string) => markDose(logId, 'missed');

  const handleMedicinesExtracted = async (meds: any[]) => {
    const formattedMeds = meds.map(med => ({
      name: med.name,
      dosage: med.dosage,
      morning: med.morning,
      morning_time: '08:00',
      afternoon: med.afternoon,
      afternoon_time: '14:00',
      night: med.night,
      night_time: '20:00',
      before_food: med.beforeFood,
      days_remaining: med.daysRemaining,
      start_date: new Date().toISOString().split('T')[0],
    }));
    await addMultipleMedicines(formattedMeds);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header userName={user?.user_metadata?.name || 'Friend'} />
      
      <main className="container py-6 space-y-8">
        {permission !== 'granted' && (
          <Button onClick={requestPermission} variant="outline" className="w-full">
            <Bell className="w-4 h-4 mr-2" /> Enable Notifications
          </Button>
        )}

        <AdherenceCard score={85} taken={todayStats.taken} total={todayStats.total} />
        <QuickStats weeklyScore={85} streak={7} steps={6543} sleepHours={7.5} />

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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowScanner(true)}>
                <Camera className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
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
              <p className="text-muted-foreground mb-6">Add your first medicine or scan a prescription!</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setShowScanner(true)} variant="outline">
                  <Camera className="w-5 h-5 mr-2" /> Scan Prescription
                </Button>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-5 h-5 mr-2" /> Add Manually
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-care/30 rounded-2xl p-6 text-center">
          <HeartIcon className="w-8 h-8 text-care-foreground mx-auto mb-3 animate-pulse-soft" />
          <h3 className="text-lg font-bold text-foreground mb-1">You're doing great! 🌟</h3>
          <p className="text-muted-foreground">Keep up the healthy habits!</p>
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onAddClick={() => setShowAddForm(true)} />
      
      {showAddForm && <AddMedicineForm onAdd={addMedicine} onClose={() => setShowAddForm(false)} />}
      {showScanner && <PrescriptionScanner onMedicinesExtracted={handleMedicinesExtracted} onClose={() => setShowScanner(false)} />}
    </div>
  );
};

export default Index;
