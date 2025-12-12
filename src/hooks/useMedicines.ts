import { useState, useCallback } from 'react';
import { Medicine, DoseLog, DailySchedule } from '@/types/medicine';

const COLORS: Medicine['color'][] = ['primary', 'secondary', 'accent', 'lavender', 'sunny', 'care'];

// Mock initial data
const initialMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Vitamin D3',
    dosage: '1000 IU',
    morning: true,
    morning_time: '08:00',
    afternoon: false,
    afternoon_time: '14:00',
    night: false,
    night_time: '20:00',
    before_food: false,
    days_remaining: 25,
    start_date: '2024-01-01',
    color: 'sunny',
  },
  {
    id: '2',
    name: 'Omega-3',
    dosage: '500mg',
    morning: false,
    morning_time: '08:00',
    afternoon: true,
    afternoon_time: '13:00',
    night: false,
    night_time: '20:00',
    before_food: false,
    days_remaining: 18,
    start_date: '2024-01-05',
    color: 'secondary',
  },
  {
    id: '3',
    name: 'Multivitamin',
    dosage: '1 tablet',
    morning: true,
    morning_time: '08:00',
    afternoon: false,
    afternoon_time: '14:00',
    night: false,
    night_time: '20:00',
    before_food: true,
    days_remaining: 30,
    start_date: '2024-01-01',
    color: 'primary',
  },
  {
    id: '4',
    name: 'Melatonin',
    dosage: '3mg',
    morning: false,
    morning_time: '08:00',
    afternoon: false,
    afternoon_time: '14:00',
    night: true,
    night_time: '21:00',
    before_food: false,
    days_remaining: 14,
    start_date: '2024-01-10',
    color: 'lavender',
  },
];

const generateDoseLogs = (medicines: Medicine[]): DoseLog[] => {
  const logs: DoseLog[] = [];
  const today = new Date().toISOString().split('T')[0];
  
  medicines.forEach(medicine => {
    if (medicine.morning && medicine.morning_time) {
      logs.push({
        id: `${medicine.id}-morning-${today}`,
        medicine_id: medicine.id,
        scheduled_time: `${today}T${medicine.morning_time}`,
        taken_time: null,
        status: 'pending',
        time_slot: 'morning',
        response_time_seconds: null,
      });
    }
    if (medicine.afternoon && medicine.afternoon_time) {
      logs.push({
        id: `${medicine.id}-afternoon-${today}`,
        medicine_id: medicine.id,
        scheduled_time: `${today}T${medicine.afternoon_time}`,
        taken_time: null,
        status: 'pending',
        time_slot: 'afternoon',
        response_time_seconds: null,
      });
    }
    if (medicine.night && medicine.night_time) {
      logs.push({
        id: `${medicine.id}-night-${today}`,
        medicine_id: medicine.id,
        scheduled_time: `${today}T${medicine.night_time}`,
        taken_time: null,
        status: 'pending',
        time_slot: 'night',
        response_time_seconds: null,
      });
    }
  });
  
  return logs;
};

export const useMedicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(() => generateDoseLogs(initialMedicines));

  const addMedicine = useCallback((medicine: Omit<Medicine, 'id' | 'color'>) => {
    const newMedicine: Medicine = {
      ...medicine,
      id: Date.now().toString(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setMedicines(prev => [...prev, newMedicine]);
    
    // Generate logs for new medicine
    const newLogs = generateDoseLogs([newMedicine]);
    setDoseLogs(prev => [...prev, ...newLogs]);
    
    return newMedicine;
  }, []);

  const markDose = useCallback((logId: string, status: 'taken' | 'missed' | 'suspected') => {
    setDoseLogs(prev => prev.map(log => 
      log.id === logId 
        ? { ...log, status, taken_time: status === 'taken' ? new Date().toISOString() : null }
        : log
    ));
  }, []);

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

  const getAdherenceScore = useCallback(() => {
    const completedLogs = doseLogs.filter(log => log.status === 'taken' || log.status === 'missed' || log.status === 'suspected');
    if (completedLogs.length === 0) return 100;
    
    const takenCount = completedLogs.filter(log => log.status === 'taken').length;
    const suspectedCount = completedLogs.filter(log => log.status === 'suspected').length;
    
    return Math.round(((takenCount + suspectedCount * 0.5) / completedLogs.length) * 100);
  }, [doseLogs]);

  const getTodayStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = doseLogs.filter(log => log.scheduled_time.startsWith(today));
    
    return {
      total: todayLogs.length,
      taken: todayLogs.filter(log => log.status === 'taken').length,
      missed: todayLogs.filter(log => log.status === 'missed').length,
      pending: todayLogs.filter(log => log.status === 'pending').length,
    };
  }, [doseLogs]);

  return {
    medicines,
    doseLogs,
    addMedicine,
    markDose,
    getDailySchedule,
    getAdherenceScore,
    getTodayStats,
  };
};
