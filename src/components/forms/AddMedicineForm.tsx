import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Pill } from 'lucide-react';
import { Medicine } from '@/types/medicine';

interface AddMedicineFormProps {
  onAdd: (medicine: Omit<Medicine, 'id' | 'color'>) => void;
  onClose: () => void;
}

export const AddMedicineForm: React.FC<AddMedicineFormProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    morning: false,
    morning_time: '08:00',
    afternoon: false,
    afternoon_time: '13:00',
    night: false,
    night_time: '21:00',
    before_food: false,
    days_remaining: 30,
    start_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dosage) return;
    if (!formData.morning && !formData.afternoon && !formData.night) return;
    
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <CardHeader className="sticky top-0 bg-card z-10 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Add New Medicine</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-base font-semibold">Medicine Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Vitamin D3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 h-12 text-base"
                />
              </div>
              
              <div>
                <Label htmlFor="dosage" className="text-base font-semibold">Dosage</Label>
                <Input
                  id="dosage"
                  placeholder="e.g., 1000 IU or 1 tablet"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="mt-2 h-12 text-base"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Schedule Times</Label>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-sunny/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌅</span>
                    <span className="font-medium">Morning</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {formData.morning && (
                      <Input
                        type="time"
                        value={formData.morning_time}
                        onChange={(e) => setFormData({ ...formData, morning_time: e.target.value })}
                        className="w-28 h-10"
                      />
                    )}
                    <Switch
                      checked={formData.morning}
                      onCheckedChange={(checked) => setFormData({ ...formData, morning: checked })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">☀️</span>
                    <span className="font-medium">Afternoon</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {formData.afternoon && (
                      <Input
                        type="time"
                        value={formData.afternoon_time}
                        onChange={(e) => setFormData({ ...formData, afternoon_time: e.target.value })}
                        className="w-28 h-10"
                      />
                    )}
                    <Switch
                      checked={formData.afternoon}
                      onCheckedChange={(checked) => setFormData({ ...formData, afternoon: checked })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-lavender/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌙</span>
                    <span className="font-medium">Night</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {formData.night && (
                      <Input
                        type="time"
                        value={formData.night_time}
                        onChange={(e) => setFormData({ ...formData, night_time: e.target.value })}
                        className="w-28 h-10"
                      />
                    )}
                    <Switch
                      checked={formData.night}
                      onCheckedChange={(checked) => setFormData({ ...formData, night: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍽️</span>
                <span className="font-medium">Take before food</span>
              </div>
              <Switch
                checked={formData.before_food}
                onCheckedChange={(checked) => setFormData({ ...formData, before_food: checked })}
              />
            </div>

            <div>
              <Label htmlFor="days" className="text-base font-semibold">Duration (days)</Label>
              <Input
                id="days"
                type="number"
                min={1}
                value={formData.days_remaining}
                onChange={(e) => setFormData({ ...formData, days_remaining: parseInt(e.target.value) || 1 })}
                className="mt-2 h-12 text-base"
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Plus className="w-5 h-5" />
              Add Medicine
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
