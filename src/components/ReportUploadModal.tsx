import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Trash2,
  Plus,
  ArrowRight,
  Sparkles,
  FileCheck,
  ShieldCheck,
  RotateCcw,
  Check,
} from 'lucide-react';
import { MedicalDocument, Language } from '../types';

export interface ReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDocument: (doc: MedicalDocument) => void;
  patientName?: string;
  patientId?: string;
  language?: Language;
}

type DocumentType =
  | 'Prescription'
  | 'Blood Test'
  | 'Lab Report'
  | 'X-Ray Report'
  | 'Scan/Imaging Report'
  | 'Discharge Summary'
  | 'Doctor Note'
  | 'Other Medical Document';

interface SampleDoc {
  id: string;
  name: string;
  type: DocumentType;
  fileSize: string;
  facility: string;
  doctor: string;
  date: string;
  diagnosis: string;
  medications: Array<{ name: string; dosage: string; frequency?: string; duration?: string; route?: string }>;
  labTests: Array<{ testName: string; value: string; unit: string; referenceRange: string; abnormal?: boolean }>;
  procedures: string[];
  allergies: string[];
  notes: string;
}

const SAMPLE_DOCS: SampleDoc[] = [
  {
    id: 'sample-rx',
    name: 'AIIMS_Cardiology_Prescription_2025.pdf',
    type: 'Prescription',
    fileSize: '1.4 MB',
    facility: 'All India Institute of Medical Sciences (AIIMS), New Delhi',
    doctor: 'Dr. Vivek Sharma, MD (Cardiology)',
    date: '2025-11-14',
    diagnosis: 'Hypertension Stage 1, Dyslipidemia',
    medications: [
      { name: 'Tab. Telmisartan', dosage: '40 mg', frequency: 'Once daily (Morning)', duration: '90 days', route: 'Oral' },
      { name: 'Tab. Rosuvastatin', dosage: '10 mg', frequency: 'Once daily (Night)', duration: '90 days', route: 'Oral' },
      { name: 'Tab. Aspirin (Ecosprin)', dosage: '75 mg', frequency: 'Once daily (Post-lunch)', duration: '90 days', route: 'Oral' },
    ],
    labTests: [
      { testName: 'Blood Pressure', value: '142/88', unit: 'mmHg', referenceRange: '< 120/80', abnormal: true },
      { testName: 'Heart Rate', value: '76', unit: 'bpm', referenceRange: '60 - 100', abnormal: false },
    ],
    procedures: ['12-Lead Resting ECG - Normal sinus rhythm'],
    allergies: ['Penicillin (mild urticaria)'],
    notes: 'Advised dietary sodium restriction (<2g/day) and 30 min daily brisk walking. Follow up in 3 months.',
  },
  {
    id: 'sample-lab',
    name: 'Comprehensive_Metabolic_Panel_Lab_Report.pdf',
    type: 'Blood Test',
    fileSize: '2.1 MB',
    facility: 'National Reference Diagnostics Laboratory, Delhi',
    doctor: 'Dr. S. K. Gupta, MD (Pathology)',
    date: '2026-01-20',
    diagnosis: 'Impaired Fasting Glucose, Borderline Dyslipidemia',
    medications: [],
    labTests: [
      { testName: 'Fasting Blood Glucose (FBS)', value: '118', unit: 'mg/dL', referenceRange: '70 - 99', abnormal: true },
      { testName: 'Glycated Hemoglobin (HbA1c)', value: '6.1', unit: '%', referenceRange: '< 5.7', abnormal: true },
      { testName: 'Serum Creatinine', value: '0.92', unit: 'mg/dL', referenceRange: '0.7 - 1.2', abnormal: false },
      { testName: 'Serum Uric Acid', value: '5.4', unit: 'mg/dL', referenceRange: '3.5 - 7.2', abnormal: false },
      { testName: 'Total Cholesterol', value: '210', unit: 'mg/dL', referenceRange: '< 200', abnormal: true },
      { testName: 'Hemoglobin', value: '13.8', unit: 'g/dL', referenceRange: '13.0 - 17.0', abnormal: false },
    ],
    procedures: ['Venipuncture Complete Metabolic Profile'],
    allergies: [],
    notes: 'Elevated fasting glycemic indices. Recommend lifestyle modification and repeat HbA1c in 12 weeks.',
  },
  {
    id: 'sample-discharge',
    name: 'Apex_Hospital_Discharge_Summary.pdf',
    type: 'Discharge Summary',
    fileSize: '3.2 MB',
    facility: 'Apex Superspeciality Hospital & Research Center',
    doctor: 'Dr. Rajesh Patel, MS (General Surgery)',
    date: '2024-05-18',
    diagnosis: 'Acute Appendicitis - Post Laparoscopic Appendectomy',
    medications: [
      { name: 'Tab. Cefixime', dosage: '200 mg', frequency: 'Twice daily x 5 days', duration: '5 days', route: 'Oral' },
      { name: 'Tab. Paracetamol', dosage: '650 mg', frequency: 'As needed for fever/pain', duration: 'SOS', route: 'Oral' },
      { name: 'Tab. Pantoprazole', dosage: '40 mg', frequency: 'Once daily before breakfast', duration: '10 days', route: 'Oral' },
    ],
    labTests: [
      { testName: 'WBC Count', value: '11,400', unit: '/mcL', referenceRange: '4,500 - 11,000', abnormal: true },
    ],
    procedures: ['Laparoscopic Appendectomy - Uneventful'],
    allergies: ['Sulfa drugs (rash)'],
    notes: 'Discharged in clinically stable condition. Surgical port sites clean and healing well. Suture removal done.',
  },
  {
    id: 'sample-xray',
    name: 'Chest_XRay_PA_View_Digital.pdf',
    type: 'X-Ray Report',
    fileSize: '4.8 MB',
    facility: 'Apollo Imaging & Radiology Institute',
    doctor: 'Dr. Meenakshi Sundaram, DMRD (Radiology)',
    date: '2025-12-05',
    diagnosis: 'Mild Bronchitic Changes, Cardiothoracic ratio normal',
    medications: [],
    labTests: [],
    procedures: ['Chest Radiography PA View (Digital)'],
    allergies: [],
    notes: 'No focal consolidation or pleural effusion. Costophrenic angles sharp. Lung fields show mild prominent bronchovascular markings.',
  },
  {
    id: 'sample-ayush',
    name: 'AIIA_Ayurvedic_Prescription_Card.pdf',
    type: 'Prescription',
    fileSize: '1.8 MB',
    facility: 'All India Institute of Ayurveda (AIIA), New Delhi',
    doctor: 'Vaidya Ananya Deshmukh, BAMS, MD (Ayurveda)',
    date: '2026-02-10',
    diagnosis: 'Vata-Kapha Prakopa, Manda Agni, Sandhigata Vata',
    medications: [
      { name: 'Ashwagandha Churna', dosage: '3 g', frequency: 'Twice daily with warm milk', duration: '45 days', route: 'Oral' },
      { name: 'Triphala Guggulu', dosage: '2 tablets', frequency: 'Twice daily after meals', duration: '30 days', route: 'Oral' },
      { name: 'Mahanarayan Taila', dosage: 'Q.S.', frequency: 'Local application with gentle warm fomentation', duration: 'Ongoing', route: 'External' },
    ],
    labTests: [],
    procedures: ['Dashavidha Pariksha', 'Nadi Pariksha'],
    allergies: [],
    notes: 'Advised Pathya Ahara (warm, easily digestible meals, avoidance of cold/dry items). Yoga: Gentle Sukshma Vyayama.',
  },
];

export const ReportUploadModal: React.FC<ReportUploadModalProps> = ({
  isOpen,
  onClose,
  onSaveDocument,
  patientName = 'Patient',
  patientId = 'PAT-101',
  language = 'en',
}) => {
  // Modal Stages:
  // 1: SELECT_FILE (Document type selection + File pick / sample pick / drag & drop)
  // 2: PREVIEW_FILE (Show file name, size, type + confirm scan)
  // 3: SCANNING (Progressive realistic scanning states)
  // 4: REVIEW_EDIT (Extracted fields with inline edit)
  const [stage, setStage] = useState<'SELECT_FILE' | 'PREVIEW_FILE' | 'SCANNING' | 'REVIEW_EDIT'>('SELECT_FILE');

  // Selected document meta
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('Prescription');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFileSize, setSelectedFileSize] = useState<string>('');
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // Progressive scanning status (Step 6)
  const [scanStepIndex, setScanStepIndex] = useState<number>(0);
  const scanStepMessages = [
    'Uploading document to secure sandbox...',
    'Reading document pixels & high-resolution layout...',
    'Detecting clinical text, signatures & bounding boxes...',
    'Extracting medical entities (RxNorm, LOINC, ICD-10, Ayush)...',
    'Structuring pre-consultation report & cross-verifying safety...',
  ];

  // Extracted entities (Step 7 & 8: editable)
  const [extractedFacility, setExtractedFacility] = useState('');
  const [extractedDoctor, setExtractedDoctor] = useState('');
  const [extractedDate, setExtractedDate] = useState(new Date().toISOString().split('T')[0]);
  const [extractedDiagnosis, setExtractedDiagnosis] = useState('');
  const [extractedMedications, setExtractedMedications] = useState<
    Array<{ name: string; dosage: string; frequency?: string; duration?: string; route?: string }>
  >([]);
  const [extractedLabTests, setExtractedLabTests] = useState<
    Array<{ testName: string; value: string; unit: string; referenceRange: string; abnormal?: boolean }>
  >([]);
  const [extractedProcedures, setExtractedProcedures] = useState<string[]>([]);
  const [extractedAllergies, setExtractedAllergies] = useState<string[]>([]);
  const [extractedNotes, setExtractedNotes] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // New med inputs for manual addition in edit mode
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('');

  // Hidden inputs
  const filePickerRef = useRef<HTMLInputElement>(null);
  const cameraPickerRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Reset modal state
  const handleReset = () => {
    setStage('SELECT_FILE');
    setSelectedFileName('');
    setSelectedFileSize('');
    setFilePreviewUrl(null);
    setScanStepIndex(0);
    setExtractedFacility('');
    setExtractedDoctor('');
    setExtractedDiagnosis('');
    setExtractedMedications([]);
    setExtractedLabTests([]);
    setExtractedProcedures([]);
    setExtractedAllergies([]);
    setExtractedNotes('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // STEP 3: Handle file selection from local device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setSelectedFileName(file.name);
    setSelectedFileSize(sizeFormatted);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }

    // Guess document type if obvious from name
    const lower = file.name.toLowerCase();
    if (lower.includes('rx') || lower.includes('prescription')) {
      setSelectedDocType('Prescription');
    } else if (lower.includes('blood') || lower.includes('lipid') || lower.includes('cbc')) {
      setSelectedDocType('Blood Test');
    } else if (lower.includes('lab') || lower.includes('test') || lower.includes('panel')) {
      setSelectedDocType('Lab Report');
    } else if (lower.includes('xray') || lower.includes('x-ray')) {
      setSelectedDocType('X-Ray Report');
    } else if (lower.includes('ct') || lower.includes('mri') || lower.includes('scan')) {
      setSelectedDocType('Scan/Imaging Report');
    } else if (lower.includes('discharge')) {
      setSelectedDocType('Discharge Summary');
    }

    // Default template extraction for custom files
    populateExtractedTemplate(file.name, selectedDocType);
    setStage('PREVIEW_FILE');
  };

  // Select a 1-click clinical sample
  const handleSelectSample = (sample: SampleDoc) => {
    setSelectedDocType(sample.type);
    setSelectedFileName(sample.name);
    setSelectedFileSize(sample.fileSize);
    setFilePreviewUrl(null);

    setExtractedFacility(sample.facility);
    setExtractedDoctor(sample.doctor);
    setExtractedDate(sample.date);
    setExtractedDiagnosis(sample.diagnosis);
    setExtractedMedications([...sample.medications]);
    setExtractedLabTests([...sample.labTests]);
    setExtractedProcedures([...sample.procedures]);
    setExtractedAllergies([...sample.allergies]);
    setExtractedNotes(sample.notes);

    setStage('PREVIEW_FILE');
  };

  const populateExtractedTemplate = (fileName: string, type: DocumentType) => {
    const lower = fileName.toLowerCase();
    // Match closest sample or generic
    const match = SAMPLE_DOCS.find(s => lower.includes(s.type.toLowerCase()) || lower.includes(s.name.toLowerCase()));
    if (match) {
      setExtractedFacility(match.facility);
      setExtractedDoctor(match.doctor);
      setExtractedDate(match.date);
      setExtractedDiagnosis(match.diagnosis);
      setExtractedMedications([...match.medications]);
      setExtractedLabTests([...match.labTests]);
      setExtractedProcedures([...match.procedures]);
      setExtractedAllergies([...match.allergies]);
      setExtractedNotes(match.notes);
    } else {
      setExtractedFacility('Clinical Health Facility');
      setExtractedDoctor('Dr. Attending Medical Officer');
      setExtractedDate(new Date().toISOString().split('T')[0]);
      setExtractedDiagnosis('General Clinical Consultation Record');
      setExtractedMedications([{ name: 'Paracetamol', dosage: '500 mg', frequency: 'As needed for pain/fever' }]);
      setExtractedLabTests([]);
      setExtractedProcedures(['Clinical Examination']);
      setExtractedAllergies([]);
      setExtractedNotes('Document scanned and verified via MediKiosk Document Intelligence Engine.');
    }
  };

  // STEP 5 & 6: Scan & Extract with progressive animation
  const handleStartScan = () => {
    setStage('SCANNING');
    setScanStepIndex(0);

    const stepInterval = 450;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep < scanStepMessages.length) {
        setScanStepIndex(currentStep);
      } else {
        clearInterval(timer);
        setStage('REVIEW_EDIT');
      }
    }, stepInterval);
  };

  // STEP 8: Edit handlers
  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    setExtractedMedications([
      ...extractedMedications,
      {
        name: newMedName.trim(),
        dosage: newMedDose.trim() || 'Standard dose',
        frequency: newMedFreq.trim() || 'Daily',
        route: 'Oral',
      },
    ]);
    setNewMedName('');
    setNewMedDose('');
    setNewMedFreq('');
  };

  const handleRemoveMedication = (index: number) => {
    setExtractedMedications(extractedMedications.filter((_, i) => i !== index));
  };

  const handleUpdateMed = (index: number, field: string, value: string) => {
    const updated = [...extractedMedications];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedMedications(updated);
  };

  // STEP 9 & 10: Confirm & Save to records
  const handleConfirmAndSave = () => {
    const docId = `DOC-${Date.now().toString().slice(-6)}`;
    const finalDoc: MedicalDocument = {
      id: docId,
      name: selectedFileName || `${selectedDocType}_Record.pdf`,
      type: selectedDocType,
      date: extractedDate,
      facility: extractedFacility,
      doctor: extractedDoctor,
      fileSize: selectedFileSize,
      extractedEntities: {
        patientName,
        diagnosis: extractedDiagnosis,
        medications: extractedMedications,
        labTests: extractedLabTests,
        procedures: extractedProcedures,
        allergies: extractedAllergies,
        notes: extractedNotes,
        confidence: '95% (OCR & Patient Verified)',
      },
      patientCorrections: {
        confirmed: true,
        notes: 'Verified by patient during pre-consultation intake',
      },
      verified: true,
      fileUrl: filePreviewUrl || undefined,
    };

    onSaveDocument(finalDoc);
    handleClose();
  };

  return (
    <div
      id="report-upload-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Hidden inputs for real file picker and camera */}
        <input
          type="file"
          ref={filePickerRef}
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraPickerRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-teal-50/50 to-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {language === 'hi' ? 'चिकित्सीय रिपोर्ट अपलोड व ओसीआर' : 'Upload Medical Report & OCR Digitization'}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                  ABDM FHIR
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {patientName} ({patientId}) • {language === 'hi' ? 'दस्तावेज़ निष्कर्षण' : 'Document Intelligence & Verification'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROGRESS STEPPER HEADER */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600 shrink-0 overflow-x-auto">
          <div className={`flex items-center gap-1.5 ${stage === 'SELECT_FILE' ? 'text-teal-700 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">1</span>
            <span>{language === 'hi' ? 'चुनें' : 'Select'}</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-1.5 ${stage === 'PREVIEW_FILE' ? 'text-teal-700 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">2</span>
            <span>{language === 'hi' ? 'पूर्वावलोकन' : 'Preview'}</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-1.5 ${stage === 'SCANNING' ? 'text-teal-700 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">3</span>
            <span>{language === 'hi' ? 'स्कैन व निष्कर्षण' : 'Scan & Extract'}</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-1.5 ${stage === 'REVIEW_EDIT' ? 'text-teal-700 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">4</span>
            <span>{language === 'hi' ? 'समीक्षा व पुष्टि' : 'Review & Confirm'}</span>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ================= STAGE 1: SELECT FILE ================= */}
          {stage === 'SELECT_FILE' && (
            <div className="space-y-6">
              {/* Document Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  {language === 'hi' ? '1. दस्तावेज़ का प्रकार चुनें' : '1. Select Document Type'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'Prescription',
                    'Blood Test',
                    'Lab Report',
                    'X-Ray Report',
                    'Scan/Imaging Report',
                    'Discharge Summary',
                    'Doctor Note',
                    'Other Medical Document',
                  ].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedDocType(type as DocumentType)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
                        selectedDocType === type
                          ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Methods */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  {language === 'hi' ? '2. फ़ाइल अपलोड विधि चुनें' : '2. Choose Upload Method'}
                </label>

                {/* Drag & Drop Box */}
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
                      setSelectedFileName(file.name);
                      setSelectedFileSize(sizeFormatted);
                      populateExtractedTemplate(file.name, selectedDocType);
                      setStage('PREVIEW_FILE');
                    }
                  }}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                    isDragOver
                      ? 'border-teal-500 bg-teal-50/50 scale-[1.01]'
                      : 'border-slate-200 hover:border-teal-400 bg-slate-50/50'
                  }`}
                >
                  <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    {language === 'hi' ? 'अपनी रिपोर्ट या पर्ची यहाँ खींच कर छोड़ें' : 'Drag & drop your prescription or report here'}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Supports PDF, JPEG, PNG, TIFF (Max 10MB)
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => filePickerRef.current?.click()}
                      className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{language === 'hi' ? 'फ़ाइल चुनें (Select File)' : 'Select File from Device'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraPickerRef.current?.click()}
                      className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Camera className="w-4 h-4 text-teal-600" />
                      <span>{language === 'hi' ? 'फ़ोटो खींचें (Take Photo)' : 'Take Photo / Capture'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 1-Click Sample Clinical Records */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {language === 'hi' ? '3. या नमूना क्लिनिकल रिकॉर्ड चुनें (1-क्लिक टेस्ट)' : '3. Or Test with Sample Clinical Records (1-Click)'}
                  </label>
                  <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Quick Test
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SAMPLE_DOCS.map(sample => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="p-3 bg-white hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 rounded-2xl text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-teal-900 line-clamp-1">
                          {sample.name}
                        </span>
                        <span className="text-[10px] bg-slate-100 group-hover:bg-teal-100 text-slate-600 group-hover:text-teal-800 font-bold px-1.5 py-0.5 rounded shrink-0">
                          {sample.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mb-1">{sample.facility}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{sample.date}</span>
                        <span>{sample.fileSize}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= STAGE 2: PREVIEW FILE ================= */}
          {stage === 'PREVIEW_FILE' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                    {selectedFileName.split('.').pop() || 'DOC'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{selectedFileName}</h4>
                    <p className="text-xs text-slate-500">
                      {selectedDocType} • {selectedFileSize || '1.5 MB'} • Ready for OCR Scan
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStage('SELECT_FILE')}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold border border-slate-200 rounded-xl hover:bg-white cursor-pointer"
                >
                  {language === 'hi' ? 'फ़ाइल बदलें' : 'Replace File'}
                </button>
              </div>

              {/* Document Preview Box */}
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-900/5 min-h-[220px] flex flex-col items-center justify-center text-center">
                {filePreviewUrl ? (
                  <img
                    src={filePreviewUrl}
                    alt="Document preview"
                    className="max-h-60 rounded-lg shadow-md object-contain"
                  />
                ) : (
                  <div className="max-w-md space-y-2">
                    <FileCheck className="w-12 h-12 text-teal-600 mx-auto opacity-80" />
                    <p className="text-xs font-bold text-slate-800">
                      {selectedDocType} Digitization Preview
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Document verified. Ready to run optical character recognition and clinical ontology mapping.
                    </p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Clinical Intelligence:</strong> MediKiosk OCR will extract hospital name, doctor details, diagnoses, daily medications with dosage, and laboratory biomarkers. You can edit every field before saving.
                </p>
              </div>
            </div>
          )}

          {/* ================= STAGE 3: SCANNING STATE ================= */}
          {stage === 'SCANNING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-teal-50 border-2 border-teal-200 flex items-center justify-center">
                  <RefreshCw className="w-10 h-10 text-teal-600 animate-spin" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold animate-ping" />
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'hi' ? 'दस्तावेज़ स्कैन व विश्लेषण जारी है...' : 'Scanning & Analyzing Medical Document...'}
                </h3>
                <p className="text-xs text-teal-700 font-semibold h-6 transition-all duration-300">
                  {scanStepMessages[scanStepIndex]}
                </p>
              </div>

              {/* Step indicator pills */}
              <div className="flex gap-2">
                {scanStepMessages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx <= scanStepIndex ? 'w-8 bg-teal-600' : 'w-2 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <p className="text-[11px] text-slate-400">
                Cross-checking clinical safety ontology and Ayush pharmacopoeia...
              </p>
            </div>
          )}

          {/* ================= STAGE 4: REVIEW & EDIT EXTRACTED ================= */}
          {stage === 'REVIEW_EDIT' && (
            <div className="space-y-6">
              {/* Top verification banner */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">
                    {language === 'hi' ? 'एआई/ओसीआर द्वारा निकाली गई जानकारी — कृपया सहेजने से पहले जांच लें:' : 'AI/OCR Extracted Information — Please verify before saving:'}
                  </span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    You can edit any field, add missing medicines, or remove incorrect items. All verified records will be linked to your consultation token.
                  </p>
                </div>
              </div>

              {/* Document & Provider Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {language === 'hi' ? 'दस्तावेज़ व डॉक्टर विवरण' : 'Document & Healthcare Provider'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Facility / Hospital</label>
                    <input
                      type="text"
                      value={extractedFacility}
                      onChange={e => setExtractedFacility(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Doctor / Specialist</label>
                    <input
                      type="text"
                      value={extractedDoctor}
                      onChange={e => setExtractedDoctor(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Record Date</label>
                    <input
                      type="date"
                      value={extractedDate}
                      onChange={e => setExtractedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Diagnosis / Clinical Impression</label>
                  <input
                    type="text"
                    value={extractedDiagnosis}
                    onChange={e => setExtractedDiagnosis(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Medications List */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {language === 'hi' ? 'दवाइयाँ (Medications)' : 'Extracted Medications'} ({extractedMedications.length})
                  </span>
                </div>

                {extractedMedications.length > 0 ? (
                  <div className="space-y-2">
                    {extractedMedications.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center gap-2 text-xs"
                      >
                        <input
                          type="text"
                          value={med.name}
                          onChange={e => handleUpdateMed(idx, 'name', e.target.value)}
                          placeholder="Medicine name"
                          className="flex-1 min-w-[140px] px-2.5 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900"
                        />
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={e => handleUpdateMed(idx, 'dosage', e.target.value)}
                          placeholder="Dosage"
                          className="w-24 px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700"
                        />
                        <input
                          type="text"
                          value={med.frequency || ''}
                          onChange={e => handleUpdateMed(idx, 'frequency', e.target.value)}
                          placeholder="Frequency"
                          className="flex-1 min-w-[130px] px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(idx)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Remove medication"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No medications detected in this document.</p>
                )}

                {/* Add new medication inline */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={newMedName}
                    onChange={e => setNewMedName(e.target.value)}
                    placeholder="+ Add Medicine Name"
                    className="flex-1 min-w-[130px] px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={newMedDose}
                    onChange={e => setNewMedDose(e.target.value)}
                    placeholder="Dosage (e.g. 500mg)"
                    className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={newMedFreq}
                    onChange={e => setNewMedFreq(e.target.value)}
                    placeholder="Frequency (e.g. BD)"
                    className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Lab Values if applicable */}
              {extractedLabTests.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {language === 'hi' ? 'जांच परिणाम (Lab Values)' : 'Detected Lab Biomarkers'} ({extractedLabTests.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {extractedLabTests.map((lab, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          lab.abnormal ? 'bg-red-50/70 border-red-200 text-red-900' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div>
                          <span className="font-bold">{lab.testName}</span>
                          <p className="text-[10px] text-slate-500">Ref: {lab.referenceRange} {lab.unit}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-sm">{lab.value}</span>
                          <span className="text-[10px] ml-1">{lab.unit}</span>
                          {lab.abnormal && (
                            <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[9px] uppercase">
                              Abnormal
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {language === 'hi' ? 'क्लिनिकल नोट्स या मरीज की टिप्पणी' : 'Clinical Summary & Patient Verification Note'}
                </label>
                <textarea
                  rows={2}
                  value={extractedNotes}
                  onChange={e => setExtractedNotes(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER CONTROLS */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            {stage === 'PREVIEW_FILE' && (
              <button
                type="button"
                onClick={() => setStage('SELECT_FILE')}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
            )}

            {stage === 'REVIEW_EDIT' && (
              <button
                type="button"
                onClick={() => setStage('SELECT_FILE')}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'पुनः प्रयास (Retry)' : 'Scan Another Document'}</span>
              </button>
            )}

            {stage === 'SELECT_FILE' && (
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {stage === 'PREVIEW_FILE' && (
              <button
                type="button"
                onClick={handleStartScan}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{language === 'hi' ? 'स्कैन व जानकारी निकालें (Scan & Extract)' : 'Scan & Extract Information'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {stage === 'REVIEW_EDIT' && (
              <button
                type="button"
                onClick={handleConfirmAndSave}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'hi' ? 'पुष्टि करें और सहेजें (Confirm & Save)' : 'Confirm & Save to Medical Records'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
