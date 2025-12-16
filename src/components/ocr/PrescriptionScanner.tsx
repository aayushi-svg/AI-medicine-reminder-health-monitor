import React, { useState, useRef } from 'react';
import { createWorker, PSM } from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, Loader2, FileText, Sparkles, X, Check, Plus } from 'lucide-react';
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

// Common medicine suffixes and keywords
const MEDICINE_SUFFIXES = [
  'cin', 'mycin', 'cillin', 'cycline', 'azole', 'prazole', 'tidine', 'sartan',
  'pril', 'olol', 'dipine', 'statin', 'formin', 'gliptin', 'floxacin', 'mab',
  'nib', 'vir', 'pine', 'zepam', 'pam', 'lone', 'sone', 'ate', 'ide', 'ine'
];

const MEDICINE_KEYWORDS = [
  'tab', 'tablet', 'cap', 'capsule', 'syrup', 'syp', 'inj', 'injection',
  'drops', 'cream', 'ointment', 'gel', 'lotion', 'suspension', 'susp'
];

const COMMON_MEDICINES = [
  'paracetamol', 'acetaminophen', 'ibuprofen', 'aspirin', 'amoxicillin',
  'azithromycin', 'ciprofloxacin', 'metformin', 'atorvastatin', 'omeprazole',
  'pantoprazole', 'amlodipine', 'losartan', 'metoprolol', 'lisinopril',
  'cetirizine', 'loratadine', 'montelukast', 'salbutamol', 'prednisolone',
  'dexamethasone', 'ranitidine', 'domperidone', 'ondansetron', 'diclofenac',
  'naproxen', 'tramadol', 'gabapentin', 'sertraline', 'fluoxetine',
  'alprazolam', 'clonazepam', 'vitamin', 'calcium', 'iron', 'folic',
  'multivitamin', 'zinc', 'b12', 'b-complex', 'd3', 'crocin', 'dolo',
  'combiflam', 'calpol', 'disprin', 'brufen', 'voveran', 'zifi', 'augmentin',
  'azee', 'pan', 'pantop', 'rablet', 'ecosprin', 'telmisartan', 'atenolol',
  'norvasc', 'telma', 'stamlo', 'glycomet', 'metformin', 'glimepiride',
  'insulin', 'lantus', 'humalog', 'novarapid', 'mixtard', 'levothyroxine',
  'thyroxine', 'eltroxin', 'thyronorm', 'antacid', 'gelusil', 'digene',
  'mucaine', 'syrup', 'allegra', 'montair', 'asthalin', 'budecort', 'seroflo',
  'deriphyllin', 'alex', 'benadryl', 'grilinctus', 'ascoril', 'chericof'
];

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
  const [manualName, setManualName] = useState('');
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

  const cleanMedicineName = (name: string): string => {
    // Remove common prefixes and clean up
    let cleaned = name
      .replace(/^(tab\.?|cap\.?|syp\.?|inj\.?|tablet|capsule|syrup|injection)\s*/i, '')
      .replace(/\d+\s*(mg|ml|mcg|g|iu|tablets?|capsules?|units?)\s*/gi, '')
      .replace(/[^\w\s-]/g, '')
      .trim();
    
    // Capitalize first letter
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  };

  const isMedicineLikely = (word: string): boolean => {
    const lower = word.toLowerCase();
    
    // Check against common medicines
    if (COMMON_MEDICINES.some(med => lower.includes(med) || med.includes(lower))) {
      return true;
    }
    
    // Check for medicine suffixes
    if (MEDICINE_SUFFIXES.some(suffix => lower.endsWith(suffix))) {
      return true;
    }
    
    // Check if preceded by medicine keywords in context
    return false;
  };

  const extractMedicineNames = (text: string): string[] => {
    const medicines: Set<string> = new Set();
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Process each line
    lines.forEach((line, lineIndex) => {
      const lowerLine = line.toLowerCase();
      
      // Method 1: Check for medicine keywords (Tab., Cap., etc.)
      const keywordPattern = /(?:tab\.?|cap\.?|syp\.?|inj\.?|tablet|capsule|syrup|injection)\s*([a-z][a-z0-9\s-]{2,30})/gi;
      let match;
      while ((match = keywordPattern.exec(line)) !== null) {
        const name = cleanMedicineName(match[1]);
        if (name.length >= 3 && name.length <= 30) {
          medicines.add(name);
        }
      }
      
      // Method 2: Check each word against common medicines database
      const words = line.split(/[\s,;:]+/);
      words.forEach((word, wordIndex) => {
        const cleanWord = word.replace(/[^\w]/g, '');
        if (cleanWord.length >= 3 && isMedicineLikely(cleanWord)) {
          // Get more context - include next word if it's part of medicine name
          let fullName = cleanWord;
          if (wordIndex < words.length - 1) {
            const nextWord = words[wordIndex + 1].replace(/[^\w]/g, '');
            // Check if next word is a dosage or continuation
            if (!/^\d+/.test(nextWord) && nextWord.length >= 2 && nextWord.length <= 15) {
              const combined = cleanWord + ' ' + nextWord;
              if (COMMON_MEDICINES.some(med => combined.toLowerCase().includes(med))) {
                fullName = combined;
              }
            }
          }
          medicines.add(cleanMedicineName(fullName));
        }
      });
      
      // Method 3: Pattern matching for common prescription formats
      // "1. Medicine Name 500mg" or "Medicine Name - 1 tablet"
      const numberedPattern = /^\d+[\.\)]\s*([a-z][a-z\s-]{2,25}?)(?:\s*[-:]?\s*\d|$)/i;
      const numberedMatch = line.match(numberedPattern);
      if (numberedMatch) {
        const name = cleanMedicineName(numberedMatch[1]);
        if (name.length >= 3) {
          medicines.add(name);
        }
      }
    });

    // Filter out non-medicine words
    const filtered = Array.from(medicines).filter(name => {
      const lower = name.toLowerCase();
      // Exclude common non-medicine words
      const excludeWords = ['patient', 'doctor', 'hospital', 'clinic', 'date', 'name', 
        'address', 'age', 'sex', 'male', 'female', 'diagnosis', 'prescription', 'rx',
        'morning', 'evening', 'night', 'after', 'before', 'food', 'meal', 'days',
        'times', 'daily', 'weekly', 'once', 'twice', 'thrice'];
      return !excludeWords.some(exc => lower === exc || lower.includes(exc));
    });

    return filtered.slice(0, 15); // Limit to 15 medicines
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

      // Set parameters for better prescription OCR
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-. ',
        preserve_interword_spaces: '1',
      });

      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();

      console.log('OCR Raw Text:', text); // Debug log
      setExtractedText(text);
      const medicineNames = extractMedicineNames(text);
      console.log('Extracted Medicines:', medicineNames); // Debug log

      if (medicineNames.length === 0) {
        toast({
          title: 'No medicines detected',
          description: 'You can manually add medicine names below.',
        });
        // Go to review anyway so user can add manually
        setExtractedMedicines([]);
        setStep('review');
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
          title: `Found ${medicineNames.length} medicines!`,
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

  const addManualMedicine = () => {
    if (manualName.trim().length < 2) {
      toast({
        title: 'Enter medicine name',
        description: 'Please enter a valid medicine name.',
        variant: 'destructive',
      });
      return;
    }
    
    setExtractedMedicines(prev => [...prev, {
      name: manualName.trim(),
      dosage: '',
      morning: true,
      afternoon: false,
      night: false,
      beforeFood: true,
      daysRemaining: 7,
    }]);
    setManualName('');
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
                    <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Tip: Use a clear, well-lit image for better results
                    </p>
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
                  {extractedMedicines.length > 0 
                    ? `Found ${extractedMedicines.length} medicines. Review and fill in details.`
                    : 'No medicines detected. Add them manually below.'}
                </p>
              </div>

              {/* Manual add section */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add medicine name manually..."
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addManualMedicine()}
                />
                <Button onClick={addManualMedicine} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {extractedMedicines.map((medicine, index) => (
                  <Card key={index} className="border shadow-sm">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Input
                          value={medicine.name}
                          onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                          className="font-medium border-0 p-0 h-auto text-base focus-visible:ring-0"
                        />
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

              {extractedMedicines.length > 0 && (
                <Button onClick={handleConfirm} className="w-full" size="lg">
                  <Check className="w-5 h-5 mr-2" />
                  Add {extractedMedicines.length} Medicines
                </Button>
              )}

              {/* Show raw OCR text for debugging */}
              {extractedText && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">View raw scanned text</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {extractedText}
                  </pre>
                </details>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
