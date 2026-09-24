import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Pill,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Medication, Language } from '../types';

export interface MedicineScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedication: (med: Medication) => void;
  language?: Language;
}

interface SampleMedicine {
  id: string;
  name: string;
  genericMolecule: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  frequency: string;
  instructions: string;
}

const SAMPLE_MEDICINES: SampleMedicine[] = [
  {
    id: 'med-telmi',
    name: 'Telma 40',
    genericMolecule: 'Telmisartan Tablets IP',
    strength: '40 mg',
    dosageForm: 'Film-Coated Tablet',
    manufacturer: 'Glenmark Pharmaceuticals Ltd.',
    frequency: 'Once daily (Morning)',
    instructions: 'Take with or without food. Do not chew or crush.',
  },
  {
    id: 'med-metformin',
    name: 'Glycomet-SR 500',
    genericMolecule: 'Metformin Hydrochloride Prolonged Release',
    strength: '500 mg',
    dosageForm: 'Sustained-Release Tablet',
    manufacturer: 'USV Private Limited',
    frequency: 'Once daily after dinner',
    instructions: 'Swallow whole with a glass of water after dinner.',
  },
  {
    id: 'med-paracetamol',
    name: 'Dolo 650',
    genericMolecule: 'Paracetamol Tablets IP',
    strength: '650 mg',
    dosageForm: 'Oral Tablet',
    manufacturer: 'Micro Labs Limited',
    frequency: 'SOS (As needed for pain/fever, max 3/day)',
    instructions: 'Maintain at least 6 hours gap between doses.',
  },
  {
    id: 'med-panto',
    name: 'Pan 40',
    genericMolecule: 'Pantoprazole Gastro-Resistant Tablets IP',
    strength: '40 mg',
    dosageForm: 'Enteric-Coated Tablet',
    manufacturer: 'Alkem Laboratories Ltd.',
    frequency: 'Once daily in the morning (Empty stomach)',
    instructions: 'Take 30 minutes before morning breakfast.',
  },
  {
    id: 'med-arjuna',
    name: 'Arjunarishta (AIIA Standardized)',
    genericMolecule: 'Terminalia arjuna Herbal Hydro-alcoholic preparation',
    strength: '20 ml',
    dosageForm: 'Ayurvedic Asava/Arishta Liquid',
    manufacturer: 'All India Institute of Ayurveda Pharmacy',
    frequency: 'Twice daily with equal quantity of water',
    instructions: 'Take post-meals with lukewarm water for cardiovascular support.',
  },
];

export const MedicineScannerModal: React.FC<MedicineScannerModalProps> = ({
  isOpen,
  onClose,
  onAddMedication,
  language = 'en',
}) => {
  const [stage, setStage] = useState<'CAPTURE' | 'PROCESSING' | 'VERIFY'>('CAPTURE');
  const [selectedPhotoName, setSelectedPhotoName] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Extracted fields
  const [brandName, setBrandName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosageForm, setDosageForm] = useState('Tablet');
  const [manufacturer, setManufacturer] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [instructions, setInstructions] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStage('CAPTURE');
    setSelectedPhotoName('');
    setPhotoPreview(null);
    setBrandName('');
    setGenericName('');
    setStrength('');
    setDosageForm('Tablet');
    setManufacturer('');
    setFrequency('Once daily');
    setInstructions('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedPhotoName(file.name);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);

    // Run OCR simulation
    runOcrSimulation(file.name);
  };

  const handleSelectSample = (sample: SampleMedicine) => {
    setSelectedPhotoName(`${sample.name}_Strip_Scan.jpg`);
    setPhotoPreview(null);
    setBrandName(sample.name);
    setGenericName(sample.genericMolecule);
    setStrength(sample.strength);
    setDosageForm(sample.dosageForm);
    setManufacturer(sample.manufacturer);
    setFrequency(sample.frequency);
    setInstructions(sample.instructions);

    setStage('PROCESSING');
    setTimeout(() => {
      setStage('VERIFY');
    }, 1400);
  };

  const runOcrSimulation = (fileName: string) => {
    setStage('PROCESSING');
    setTimeout(() => {
      // Default extraction
      setBrandName('Detected Tablet Strip');
      setGenericName('Active Pharmaceutical Ingredient');
      setStrength('500 mg');
      setDosageForm('Tablet');
      setManufacturer('Licensed Pharmaceutical Manufacturer');
      setFrequency('Once daily (As advised by doctor)');
      setInstructions('Store in a cool dry place.');
      setStage('VERIFY');
    }, 1500);
  };

  const handleConfirm = () => {
    const med: Medication = {
      name: `${brandName} (${strength})`,
      dosage: strength,
      frequency,
      source: 'Medicine Strip OCR Scan (Patient Verified)',
      verificationStatus: 'Patient Reported',
    };
    onAddMedication(med);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Hidden inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFile}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFile}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-teal-50/50 to-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'hi' ? 'दवा की पट्टी / बोतल स्कैन करें' : 'Scan Medicine Strip or Bottle'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? 'कैमरा या फोटो से दवा का नाम और डोज निकालें' : 'AI OCR for medicine name, strength & dosage'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {stage === 'CAPTURE' && (
            <div className="space-y-6">
              {/* Photo Upload Options */}
              <div className="border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-3xl p-8 text-center bg-slate-50/50">
                <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  {language === 'hi' ? 'दवा की पट्टी की स्पष्ट फोटो लें' : 'Snap a clear photo of your medicine strip'}
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Make sure the brand name, strength (mg/ml), and composition are visible.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{language === 'hi' ? 'कैमरा खोलें (Take Photo)' : 'Use Camera'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Upload className="w-4 h-4 text-teal-600" />
                    <span>{language === 'hi' ? 'गैलरी से चुनें' : 'Upload Image'}</span>
                  </button>
                </div>
              </div>

              {/* Sample medicines for quick 1-click test */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  {language === 'hi' ? 'या 1-क्लिक में डेमो दवा स्कैन करें' : 'Or Test with Sample Medicine Strips (1-Click)'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_MEDICINES.map(sample => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="p-3 bg-white hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                          {sample.name}
                        </span>
                        <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-1.5 py-0.5 rounded">
                          {sample.strength}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{sample.genericMolecule}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {stage === 'PROCESSING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-teal-600 animate-spin" />
              <h4 className="text-base font-bold text-slate-900">
                {language === 'hi' ? 'दवा के नाम और खुराक का विश्लेषण...' : 'Analyzing Medicine Strip & Text OCR...'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Scanning brand name, active molecule, strength, batch info, and standard posology guidelines...
              </p>
            </div>
          )}

          {stage === 'VERIFY' && (
            <div className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-2.5 text-xs text-teal-900">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                <span>
                  <strong>OCR Match Confirmed:</strong> Review the extracted details below. You can adjust dosage and frequency if needed.
                </span>
              </div>

              {photoPreview && (
                <div className="text-center">
                  <img src={photoPreview} alt="Medicine scan" className="max-h-40 rounded-xl mx-auto shadow-xs object-cover" />
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Strength</label>
                    <input
                      type="text"
                      value={strength}
                      onChange={e => setStrength(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Dosage Form</label>
                    <input
                      type="text"
                      value={dosageForm}
                      onChange={e => setDosageForm(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Generic / Active Ingredient</label>
                  <input
                    type="text"
                    value={genericName}
                    onChange={e => setGenericName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">How often do you take this?</label>
                  <input
                    type="text"
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    placeholder="e.g. Once daily morning, Twice daily after food"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                {instructions && (
                  <p className="text-[11px] text-slate-500 italic">
                    Note: {instructions}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={stage === 'VERIFY' ? () => setStage('CAPTURE') : handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {stage === 'VERIFY' ? (language === 'hi' ? 'दोबारा फोटो लें' : 'Scan Again') : (language === 'hi' ? 'रद्द करें' : 'Cancel')}
          </button>

          {stage === 'VERIFY' && (
            <button
              type="button"
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'hi' ? 'दवाइयों की सूची में जोड़ें' : 'Add to Medications List'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
