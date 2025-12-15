import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
interface Medicine {
  id: string;
  name: string;
  dosage: string;
  morning: boolean;
  morning_time: string;
  afternoon: boolean;
  afternoon_time: string;
  night: boolean;
  night_time: string;
  before_food: boolean;
  days_remaining: number;
  start_date: string;
  color: string;
}

interface DoseLog {
  id: string;
  medicine_id: string;
  scheduled_time: string;
  taken_time: string | null;
  created_at?: string;
  user_id?: string;
  status: 'pending' | 'taken' | 'missed' | 'suspected';
  time_slot: 'morning' | 'afternoon' | 'night';
  response_time_seconds: number | null;
}

interface DailySchedule {
  timeSlot: 'morning' | 'afternoon' | 'night';
  time: string;
  medicines: {
    medicine: Medicine;
    log: DoseLog;
  }[];
}

const COLORS = ['primary', 'secondary', 'accent', 'lavender', 'sunny', 'care'];

export const useMedicinesDB = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedicines = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching medicines:', error);
    } else {
      setMedicines(data || []);
    }
  }, [user]);

  const fetchDoseLogs = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('dose_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('scheduled_time', `${today}T00:00:00`)
      .lte('scheduled_time', `${today}T23:59:59`);

    if (error) {
      console.error('Error fetching dose logs:', error);
    } else {
      setDoseLogs((data || []) as DoseLog[]);
    }
  }, [user]);

  const generateTodayLogs = useCallback(async (medicineList: Medicine[]) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const newLogs: Omit<DoseLog, 'id'>[] = [];

    for (const medicine of medicineList) {
      if (medicine.morning) {
        newLogs.push({
          medicine_id: medicine.id,
          scheduled_time: `${today}T${medicine.morning_time}:00`,
          taken_time: null,
          status: 'pending',
          time_slot: 'morning',
          response_time_seconds: null,
        });
      }
      if (medicine.afternoon) {
        newLogs.push({
          medicine_id: medicine.id,
          scheduled_time: `${today}T${medicine.afternoon_time}:00`,
          taken_time: null,
          status: 'pending',
          time_slot: 'afternoon',
          response_time_seconds: null,
        });
      }
      if (medicine.night) {
        newLogs.push({
          medicine_id: medicine.id,
          scheduled_time: `${today}T${medicine.night_time}:00`,
          taken_time: null,
          status: 'pending',
          time_slot: 'night',
          response_time_seconds: null,
        });
      }
    }

    if (newLogs.length > 0) {
      const { error } = await supabase
        .from('dose_logs')
        .upsert(
          newLogs.map(log => ({
            ...log,
            user_id: user.id,
          })),
          { onConflict: 'id' }
        );

      if (error) {
        console.error('Error generating dose logs:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchMedicines(), fetchDoseLogs()]).finally(() => setLoading(false));
    }
  }, [user, fetchMedicines, fetchDoseLogs]);

  const addMedicine = useCallback(async (medicine: Omit<Medicine, 'id' | 'color'>) => {
    if (!user) return null;

    const newMedicine = {
      ...medicine,
      user_id: user.id,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    const { data, error } = await supabase
      .from('medicines')
      .insert(newMedicine)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to add medicine', variant: 'destructive' });
      return null;
    }

    setMedicines(prev => [...prev, data]);
    await generateTodayLogs([data]);
    await fetchDoseLogs();
    toast({ title: 'Medicine added! 💊', description: `${medicine.name} has been added to your schedule.` });
    return data;
  }, [user, generateTodayLogs, fetchDoseLogs]);

  const addMultipleMedicines = useCallback(async (medicineList: Omit<Medicine, 'id' | 'color'>[]) => {
    if (!user) return;

    const newMedicines = medicineList.map(med => ({
      ...med,
      user_id: user.id,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const { data, error } = await supabase
      .from('medicines')
      .insert(newMedicines)
      .select();

    if (error) {
      toast({ title: 'Error', description: 'Failed to add medicines', variant: 'destructive' });
      return;
    }

    setMedicines(prev => [...prev, ...(data || [])]);
    await generateTodayLogs(data || []);
    await fetchDoseLogs();
    toast({ title: 'Medicines added! 💊', description: `${medicineList.length} medicines have been added.` });
  }, [user, generateTodayLogs, fetchDoseLogs]);

  const markDose = useCallback(async (logId: string, status: 'taken' | 'missed' | 'suspected', responseTimeSeconds?: number) => {
    if (!user) return;

    const updateData: any = {
      status,
      taken_time: status === 'taken' ? new Date().toISOString() : null,
    };

    if (responseTimeSeconds !== undefined) {
      updateData.response_time_seconds = responseTimeSeconds;
    }

    const { error } = await supabase
      .from('dose_logs')
      .update(updateData)
      .eq('id', logId)
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update dose status', variant: 'destructive' });
      return;
    }

    setDoseLogs(prev => prev.map(log =>
      log.id === logId ? { ...log, ...updateData } : log
    ));

    if (status === 'taken') {
      toast({ title: 'Great job! 🎉', description: 'Dose marked as taken.' });
    }
  }, [user]);

  const getDailySchedule = useCallback((): DailySchedule[] => {
    const schedule: DailySchedule[] = [
      { timeSlot: 'morning', time: '8:00 AM', medicines: [] },
      { timeSlot: 'afternoon', time: '1:00 PM', medicines: [] },
      { timeSlot: 'night', time: '9:00 PM', medicines: [] },
    ];

    doseLogs.forEach(log => {
      const medicine = medicines.find(m => m.id === log.medicine_id);
      if (medicine) {
        const slot = schedule.find(s => s.timeSlot === log.time_slot);
        if (slot) {
          slot.medicines.push({ medicine, log });
        }
      }
    });

    return schedule.filter(s => s.medicines.length > 0);
  }, [medicines, doseLogs]);

  const getAdherenceScore = useCallback(async () => {
    if (!user) return 100;

    const { data } = await supabase
      .from('profiles')
      .select('adherence_score')
      .eq('user_id', user.id)
      .maybeSingle();

    return data?.adherence_score || 100;
  }, [user]);

  const getWeeklyAdherenceScore = useCallback(async () => {
    if (!user) return { score: 100, taken: 0, total: 0, streak: 0 };

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: logs, error } = await supabase
      .from('dose_logs')
      .select('status, scheduled_time')
      .eq('user_id', user.id)
      .gte('scheduled_time', weekAgo.toISOString())
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Error fetching weekly logs:', error);
      return { score: 100, taken: 0, total: 0, streak: 0 };
    }

    const total = logs?.length || 0;
    const taken = logs?.filter(log => log.status === 'taken').length || 0;
    const score = total > 0 ? Math.round((taken / total) * 100) : 100;

    // Calculate streak (consecutive days with all doses taken)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const dayLogs = logs?.filter(log => 
        log.scheduled_time.startsWith(dateStr)
      ) || [];

      if (dayLogs.length === 0) continue;
      
      const allTaken = dayLogs.every(log => log.status === 'taken');
      if (allTaken) {
        streak++;
      } else {
        break;
      }
    }

    return { score, taken, total, streak };
  }, [user]);

  const getTodayStats = useCallback(() => {
    return {
      total: doseLogs.length,
      taken: doseLogs.filter(log => log.status === 'taken').length,
      missed: doseLogs.filter(log => log.status === 'missed').length,
      pending: doseLogs.filter(log => log.status === 'pending').length,
    };
  }, [doseLogs]);

  const notifyCaretaker = useCallback(async (medicineName: string, scheduledTime: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('notify-caretaker', {
        body: {
          user_id: user.id,
          medicine_name: medicineName,
          scheduled_time: scheduledTime,
          notification_type: 'missed_dose',
        },
      });

      if (error) {
        console.error('Error notifying caretaker:', error);
      } else {
        console.log('Caretaker notified successfully');
      }
    } catch (err) {
      console.error('Failed to notify caretaker:', err);
    }
  }, [user]);

  return {
    medicines,
    doseLogs,
    loading,
    addMedicine,
    addMultipleMedicines,
    markDose,
    getDailySchedule,
    getAdherenceScore,
    getWeeklyAdherenceScore,
    getTodayStats,
    notifyCaretaker,
    refetch: () => Promise.all([fetchMedicines(), fetchDoseLogs()]),
  };
};
