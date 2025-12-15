import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMedicinesDB } from '@/hooks/useMedicinesDB';
import { BarChart3, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getWeeklyAdherenceScore, getTodayStats } = useMedicinesDB();
  const [weeklyStats, setWeeklyStats] = useState({ score: 0, taken: 0, total: 0, streak: 0 });
  const todayStats = getTodayStats();

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getWeeklyAdherenceScore();
      setWeeklyStats(stats);
    };
    fetchStats();
  }, [getWeeklyAdherenceScore]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header userName={user?.user_metadata?.name || 'Friend'} />
      
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Adherence Reports</h1>
            <p className="text-muted-foreground">Track your medication habits</p>
          </div>
        </div>

        <Card className="card-float gradient-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">Weekly Adherence Score</p>
              <p className={`text-5xl font-bold ${getScoreColor(weeklyStats.score)}`}>{weeklyStats.score}%</p>
              <Progress value={weeklyStats.score} className="mt-4 h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="card-float">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{weeklyStats.taken}/{weeklyStats.total}</p>
              <p className="text-sm text-muted-foreground">Doses This Week</p>
            </CardContent>
          </Card>

          <Card className="card-float">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{weeklyStats.streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
        </div>

        <Card className="card-float">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Taken</span>
              <span className="font-semibold text-success">{todayStats.taken}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-semibold text-warning">{todayStats.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Missed</span>
              <span className="font-semibold text-destructive">{todayStats.missed}</span>
            </div>
          </CardContent>
        </Card>

        {weeklyStats.score < 80 && (
          <Card className="border-warning bg-warning/10">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Improve Your Adherence</p>
                <p className="text-sm text-muted-foreground">
                  Try setting reminders and keeping medicines in a visible spot to improve your score.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav activeTab="reports" onAddClick={() => navigate('/')} />
    </div>
  );
};

export default Reports;
