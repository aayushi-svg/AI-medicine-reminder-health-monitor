export interface Medicine {
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
  color: 'primary' | 'secondary' | 'accent' | 'lavender' | 'sunny' | 'care' | string;
}

export interface DoseLog {
  id: string;
  medicine_id: string;
  scheduled_time: string;
  taken_time: string | null;
  status: 'pending' | 'taken' | 'missed' | 'suspected';
  time_slot: 'morning' | 'afternoon' | 'night';
  response_time_seconds: number | null;
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
