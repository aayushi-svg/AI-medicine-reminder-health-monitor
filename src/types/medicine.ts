export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  morning: boolean;
  morningTime?: string;
  afternoon: boolean;
  afternoonTime?: string;
  night: boolean;
  nightTime?: string;
  beforeFood: boolean;
  daysRemaining: number;
  startDate: string;
  color: 'primary' | 'secondary' | 'accent' | 'lavender' | 'sunny' | 'care';
}

export interface DoseLog {
  id: string;
  medicineId: string;
  scheduledTime: string;
  takenTime?: string;
  status: 'pending' | 'taken' | 'missed' | 'suspected';
  timeSlot: 'morning' | 'afternoon' | 'night';
}

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  caretakerEmail?: string;
  adherenceScore: number;
}

export interface DailySchedule {
  timeSlot: 'morning' | 'afternoon' | 'night';
  time: string;
  medicines: {
    medicine: Medicine;
    log: DoseLog;
  }[];
}
