import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useMedicinesDB } from '@/hooks/useMedicinesDB';
import { supabase } from '@/integrations/supabase/client';
import { Calendar as CalendarIcon, Clock, Pill, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfDay, endOfDay } from 'date-fns';

interface HistoryLog {
  id: string;
  medicine_name: string;
  time_slot: string;
  status: string;
  scheduled_time: string;
  taken_time: string | null;
}

const Schedule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { medicines } = useMedicinesDB();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && selectedDate) {
      fetchHistoryForDate(selectedDate);
    }
  }, [user, selectedDate]);

  const fetchHistoryForDate = async (date: Date) => {
    if (!user) return;
    setLoading(true);

    const startDate = startOfDay(date).toISOString();
    const endDate = endOfDay(date).toISOString();

    const { data: logs, error } = await supabase
      .from('dose_logs')
      .select(`
        id,
        time_slot,
        status,
        scheduled_time,
        taken_time,
        medicine_id
      `)
      .eq('user_id', user.id)
      .gte('scheduled_time', startDate)
      .lte('scheduled_time', endDate)
      .order('scheduled_time', { ascending: true });

    if (!error && logs) {
      const { data: medicinesData } = await supabase
        .from('medicines')
        .select('id, name')
        .eq('user_id', user.id);

      const medicineMap = new Map(medicinesData?.map(m => [m.id, m.name]) || []);
      
      const enrichedLogs = logs.map(log => ({
        ...log,
        medicine_name: medicineMap.get(log.medicine_id) || 'Unknown Medicine'
      }));

      setHistoryLogs(enrichedLogs);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return <CheckCircle2 className="w-5 h-5 text-mint" />;
      case 'missed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'suspected':
        return <AlertCircle className="w-5 h-5 text-sunny" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'taken': return 'Taken';
      case 'missed': return 'Missed';
      case 'suspected': return 'Suspicious';
      default: return 'Pending';
    }
  };

  const getTimeSlotEmoji = (slot: string) => {
    switch (slot) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'night': return '🌙';
      default: return '💊';
    }
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header userName={user?.user_metadata?.name || 'Friend'} />
      
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Medicine History</h1>
            <p className="text-muted-foreground">View your medication history</p>
          </div>
        </div>

        {/* Calendar */}
        <Card className="card-float">
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date > new Date()}
              className="rounded-md pointer-events-auto"
            />
          </CardContent>
        </Card>

        {/* History for selected date */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {getTimeSlotEmoji(isToday ? 'morning' : '')} 
            {isToday ? "Today's Doses" : format(selectedDate, 'MMMM d, yyyy')}
          </h2>

          {loading ? (
            <Card className="text-center py-8">
              <CardContent>
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-muted-foreground">Loading history...</p>
              </CardContent>
            </Card>
          ) : historyLogs.length > 0 ? (
            <div className="space-y-3">
              {historyLogs.map((log) => (
                <Card key={log.id} className="card-float">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Pill className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{log.medicine_name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            {getTimeSlotEmoji(log.time_slot)} {log.time_slot.charAt(0).toUpperCase() + log.time_slot.slice(1)}
                            <span className="mx-1">•</span>
                            {format(new Date(log.scheduled_time), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className={cn(
                          "text-sm font-medium",
                          log.status === 'taken' && "text-mint",
                          log.status === 'missed' && "text-destructive",
                          log.status === 'suspected' && "text-sunny",
                          log.status === 'pending' && "text-muted-foreground"
                        )}>
                          {getStatusLabel(log.status)}
                        </span>
                      </div>
                    </div>
                    {log.taken_time && (
                      <p className="text-xs text-muted-foreground mt-2 ml-13">
                        Taken at {format(new Date(log.taken_time), 'h:mm a')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No records for this date</h3>
                <p className="text-muted-foreground">
                  {isToday ? 'No medicines scheduled for today.' : 'No medicine history found for this date.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <BottomNav activeTab="calendar" onAddClick={() => navigate('/')} />
    </div>
  );
};

export default Schedule;
