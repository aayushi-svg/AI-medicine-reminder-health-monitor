import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Save, Loader2, LogOut, Heart, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Profile {
  name: string;
  age: number | null;
  gender: string;
  medical_conditions: string;
  caretaker_email: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: '',
    age: null,
    gender: '',
    medical_conditions: '',
    caretaker_email: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile({
        name: data.name || '',
        age: data.age,
        gender: data.gender || '',
        medical_conditions: data.medical_conditions || '',
        caretaker_email: data.caretaker_email || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        medical_conditions: profile.medical_conditions,
        caretaker_email: profile.caretaker_email,
      })
      .eq('user_id', user.id);

    setSaving(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to save profile. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Saved! 💚', description: 'Your profile has been updated.' });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header userName={profile.name || 'Friend'} />

      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
            <p className="text-muted-foreground">Manage your health information</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-care-foreground" />
              Personal Information
            </CardTitle>
            <CardDescription>This helps us personalize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Your age"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">Medical Conditions</Label>
              <Textarea
                id="conditions"
                value={profile.medical_conditions}
                onChange={(e) => setProfile({ ...profile, medical_conditions: e.target.value })}
                placeholder="List any medical conditions (optional)"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-secondary" />
              Caretaker Settings
            </CardTitle>
            <CardDescription>Add a family member or caretaker to monitor your progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="caretaker">Caretaker Email</Label>
              <Input
                id="caretaker"
                type="email"
                value={profile.caretaker_email}
                onChange={(e) => setProfile({ ...profile, caretaker_email: e.target.value })}
                placeholder="caretaker@example.com"
              />
              <p className="text-sm text-muted-foreground">
                They will receive notifications about missed doses and weekly reports.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Profile</>}
          </Button>
          
          <Button onClick={handleLogout} variant="outline" size="lg" className="w-full">
            <LogOut className="w-5 h-5" /> Sign Out
          </Button>
        </div>
      </main>

      <BottomNav onAddClick={() => {}} />
    </div>
  );
};

export default Profile;
