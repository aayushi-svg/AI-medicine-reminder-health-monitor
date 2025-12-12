import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, Loader2, FileText, Sparkles, X, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExtractedMedicine {
  name: string;
  dosage: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  beforeFood: boolean;
  daysRemaining: number;
}

interface PrescriptionScannerProps {
  onMedicinesExtracted: (medicines: ExtractedMedicine[]) => void;
  onClose: () => void;
}

export const PrescriptionScanner: React.FC<PrescriptionScannerProps> = ({ 
  onMedicinesExtracted, 
  onClose 
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [extractedMedicines, setExtractedMedicines] = useState<ExtractedMedicine[]>([]);
  const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractMedicineNames = (text: string): string[] => {
    // Common medicine name patterns
    const lines = text.split('\n').filter(line => line.trim());
    const medicines: string[] = [];
    
    // Look for patterns that might be medicine names
    const medicinePatterns = [
      /^[A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)*(?:\s+\d+\s*(?:mg|ml|mcg|g|IU))?/gm,
      /Tab\.|Cap\.|Syp\.|Inj\./gi,
    ];

    lines.forEach(line => {
      const cleanLine = line.trim();
      // Skip very short lines or lines that are mostly numbers
      if (cleanLine.length < 3 || /^\d+$/.test(cleanLine)) return;
      
      // Check if line looks like a medicine name
      if (/^[A-Z]/i.test(cleanLine) && cleanLine.length > 2 && cleanLine.length < 50) {
        // Remove dosage from name for cleaner extraction
        const nameOnly = cleanLine.replace(/\d+\s*(?:mg|ml|mcg|g|IU|tablets?|capsules?)/gi, '').trim();
        if (nameOnly.length > 2) {
          medicines.push(nameOnly);
        }
      }
    });

    // Remove duplicates and limit to reasonable number
    return [...new Set(medicines)].slice(0, 10);
  };

  const scanPrescription = async () => {
    if (!image) return;

    setScanning(true);
    setStep('scanning');
    setProgress(0);

    try {
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();

      setExtractedText(text);
      const medicineNames = extractMedicineNames(text);

      if (medicineNames.length === 0) {
        toast({
          title: 'No medicines found',
          description: 'Could not detect medicine names. Please try a clearer image or enter manually.',
          variant: 'destructive',
        });
        setStep('upload');
      } else {
        const medicines: ExtractedMedicine[] = medicineNames.map(name => ({
          name,
          dosage: '',
          morning: true,
          afternoon: false,
          night: false,
          beforeFood: true,
          daysRemaining: 7,
        }));
        setExtractedMedicines(medicines);
        setStep('review');
        toast({
          title: `Found ${medicineNames.length} medicines! 🎉`,
          description: 'Please review and fill in the details.',
        });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: 'Scan failed',
        description: 'Could not process the image. Please try again.',
        variant: 'destructive',
      });
      setStep('upload');
    } finally {
      setScanning(false);
    }
  };

  const updateMedicine = (index: number, field: keyof ExtractedMedicine, value: any) => {
    setExtractedMedicines(prev => prev.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  const removeMedicine = (index: number) => {
    setExtractedMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    const validMedicines = extractedMedicines.filter(med => med.name && med.dosage);
    if (validMedicines.length === 0) {
      toast({
        title: 'Please fill in dosage',
        description: 'At least one medicine needs a dosage to continue.',
        variant: 'destructive',
      });
      return;
    }
    onMedicinesExtracted(validMedicines);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Prescription Scanner
          </CardTitle>
          <CardDescription>
            Upload your prescription to automatically extract medicine names
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'upload' && (
            <>
              <div 
                className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {image ? (
                  <img src={image} alt="Prescription" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                    <p className="text-foreground font-medium">Click to upload prescription</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {image && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setImage(null)}
                  >
                    Choose Different
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={scanPrescription}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Scan Prescription
                  </Button>
                </div>
              )}
            </>
          )}

          {step === 'scanning' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="font-medium text-foreground mb-2">Scanning prescription...</p>
              <Progress value={progress} className="max-w-xs mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
            </div>
          )}

          {step === 'review' && (
            <>
              <div className="bg-primary/5 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 inline mr-1 text-primary" />
                  We found {extractedMedicines.length} medicines. Please fill in the details for each.
                </p>
              </div>

              <div className="space-y-4">
                {extractedMedicines.map((medicine, index) => (
                  <Card key={index} className="border shadow-sm">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">{medicine.name}</Label>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMedicine(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Input
                        placeholder="Dosage (e.g., 500mg, 1 tablet)"
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      />

                      <div className="flex gap-2 flex-wrap">
                        {(['morning', 'afternoon', 'night'] as const).map(time => (
                          <Button
                            key={time}
                            type="button"
                            variant={medicine[time] ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateMedicine(index, time, !medicine[time])}
                          >
                            {time.charAt(0).toUpperCase() + time.slice(1)}
                          </Button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={medicine.beforeFood ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateMedicine(index, 'beforeFood', true)}
                        >
                          Before Food
                        </Button>
                        <Button
                          type="button"
                          variant={!medicine.beforeFood ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateMedicine(index, 'beforeFood', false)}
                        >
                          After Food
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Days:</Label>
                        <Input
                          type="number"
                          className="w-20"
                          value={medicine.daysRemaining}
                          onChange={(e) => updateMedicine(index, 'daysRemaining', parseInt(e.target.value) || 7)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button onClick={handleConfirm} className="w-full" size="lg">
                <Check className="w-5 h-5 mr-2" />
                Add {extractedMedicines.length} Medicines
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
