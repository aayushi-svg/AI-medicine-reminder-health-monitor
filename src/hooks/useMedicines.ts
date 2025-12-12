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
    morningTime: '08:00',
    afternoon: false,
    night: false,
    beforeFood: false,
    daysRemaining: 25,
    startDate: '2024-01-01',
    color: 'sunny',
  },
  {
    id: '2',
    name: 'Omega-3',
    dosage: '500mg',
    morning: false,
    afternoon: true,
    afternoonTime: '13:00',
    night: false,
    beforeFood: false,
    daysRemaining: 18,
    startDate: '2024-01-05',
    color: 'secondary',
  },
  {
    id: '3',
    name: 'Multivitamin',
    dosage: '1 tablet',
    morning: true,
    morningTime: '08:00',
    afternoon: false,
    night: false,
    beforeFood: true,
    daysRemaining: 30,
    startDate: '2024-01-01',
    color: 'primary',
  },
  {
    id: '4',
    name: 'Melatonin',
    dosage: '3mg',
    morning: false,
    afternoon: false,
    night: true,
    nightTime: '21:00',
    beforeFood: false,
    daysRemaining: 14,
    startDate: '2024-01-10',
    color: 'lavender',
  },
];

const generateDoseLogs = (medicines: Medicine[]): DoseLog[] => {
  const logs: DoseLog[] = [];
  const today = new Date().toISOString().split('T')[0];
  
  medicines.forEach(medicine => {
    if (medicine.morning && medicine.morningTime) {
      logs.push({
        id: `${medicine.id}-morning-${today}`,
        medicineId: medicine.id,
        scheduledTime: `${today}T${medicine.morningTime}`,
        status: 'pending',
        timeSlot: 'morning',
      });
    }
    if (medicine.afternoon && medicine.afternoonTime) {
      logs.push({
        id: `${medicine.id}-afternoon-${today}`,
        medicineId: medicine.id,
        scheduledTime: `${today}T${medicine.afternoonTime}`,
        status: 'pending',
        timeSlot: 'afternoon',
      });
    }
    if (medicine.night && medicine.nightTime) {
      logs.push({
        id: `${medicine.id}-night-${today}`,
        medicineId: medicine.id,
        scheduledTime: `${today}T${medicine.nightTime}`,
        status: 'pending',
        timeSlot: 'night',
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
        ? { ...log, status, takenTime: status === 'taken' ? new Date().toISOString() : undefined }
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
      const medicine = medicines.find(m => m.id === log.medicineId);
      if (medicine) {
        const slot = schedule.find(s => s.timeSlot === log.timeSlot);
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
    const todayLogs = doseLogs.filter(log => log.scheduledTime.startsWith(today));
    
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
