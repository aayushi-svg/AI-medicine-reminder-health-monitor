import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Heart, AlertTriangle, Check, Clock, User, Shield, Pill } from 'lucide-react';

interface PatientData {
  patientName: string;
  adherenceScore: number;
  medicines: {
    id: string;
    name: string;
    dosage: string;
  }[];
  recentLogs: {
    id: string;
    medicine_name: string;
    status: string;
    scheduled_time: string;
  }[];
}

const CaretakerDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No sharing token provided');
      setLoading(false);
      return;
    }
    fetchPatientData();
  }, [token]);

  const fetchPatientData = async () => {
    try {
      // Find the share record
      const { data: shareData, error: shareError } = await supabase
        .from('caretaker_shares')
        .select('patient_user_id, is_active')
        .eq('share_token', token)
        .maybeSingle();

      if (shareError || !shareData) {
        setError('Invalid or expired sharing link');
        setLoading(false);
        return;
      }

      if (!shareData.is_active) {
        setError('This sharing link has been deactivated');
        setLoading(false);
        return;
      }

      const patientId = shareData.patient_user_id;

      // Fetch patient profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, adherence_score')
        .eq('user_id', patientId)
        .maybeSingle();

      // Fetch medicines
      const { data: medicines } = await supabase
        .from('medicines')
        .select('id, name, dosage')
        .eq('user_id', patientId);

      // Fetch recent dose logs
      const { data: logs } = await supabase
        .from('dose_logs')
        .select(`
          id,
          status,
          scheduled_time,
          medicine_id,
          medicines(name)
        `)
        .eq('user_id', patientId)
        .order('scheduled_time', { ascending: false })
        .limit(20);

      const formattedLogs = logs?.map(log => ({
        id: log.id,
        medicine_name: (log.medicines as any)?.name || 'Unknown',
        status: log.status,
        scheduled_time: log.scheduled_time,
      })) || [];

      setPatientData({
        patientName: profile?.name || 'Patient',
        adherenceScore: profile?.adherence_score || 0,
        medicines: medicines || [],
        recentLogs: formattedLogs,
      });
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Access Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return <Check className="w-4 h-4 text-primary" />;
      case 'missed':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'suspected':
        return <AlertTriangle className="w-4 h-4 text-sunny-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Caretaker Dashboard</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              Monitoring {patientData?.patientName} <Heart className="w-4 h-4 text-care-foreground" />
            </p>
          </div>
        </div>

        {/* Adherence Score */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-care-foreground" />
              Adherence Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary">
                {patientData?.adherenceScore}%
              </div>
              <Progress value={patientData?.adherenceScore} className="flex-1" />
            </div>
          </CardContent>
        </Card>

        {/* Current Medicines */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-secondary" />
              Current Medicines
            </CardTitle>
            <CardDescription>Active prescriptions being tracked</CardDescription>
          </CardHeader>
          <CardContent>
            {patientData?.medicines && patientData.medicines.length > 0 ? (
              <div className="grid gap-3">
                {patientData.medicines.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="font-medium">{med.name}</span>
                    <span className="text-sm text-muted-foreground">{med.dosage}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No medicines tracked</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest dose logs</CardDescription>
          </CardHeader>
          <CardContent>
            {patientData?.recentLogs && patientData.recentLogs.length > 0 ? (
              <div className="space-y-3">
                {patientData.recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium">{log.medicine_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.scheduled_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium capitalize ${
                      log.status === 'taken' ? 'text-primary' :
                      log.status === 'missed' ? 'text-destructive' :
                      log.status === 'suspected' ? 'text-sunny-foreground' :
                      'text-muted-foreground'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No activity yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CaretakerDashboard;
