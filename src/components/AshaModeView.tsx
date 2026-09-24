import React, { useState, useEffect } from 'react';
import { Patient, Language, SyncQueueItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Users,
  Wifi,
  WifiOff,
  RefreshCw,
  MapPin,
  Baby,
  Activity,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  Phone,
  Volume2,
  UserPlus,
  ShieldAlert,
  AlertTriangle,
  Stethoscope,
  Clock,
  Send,
} from 'lucide-react';

interface AshaModeViewProps {
  onStartAshaIntake: (patient: Partial<Patient>, mode: 'maternal' | 'ncd' | 'general') => void;
  language: Language;
}

export const AshaModeView: React.FC<AshaModeViewProps> = ({ onStartAshaIntake }) => {
  const { language, isMarathi, isHindi } = useLanguage();
  const [selectedVillage, setSelectedVillage] = useState('Velu Sub-Centre (Haveli / Bhor)');
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<SyncQueueItem[]>([
    {
      id: 'OFF-01',
      entityType: 'TRIAGE',
      payload: {
        patientName: 'Sunita Gaikwad',
        age: 26,
        gender: 'Female',
        phone: '+91 98221 44556',
        chiefComplaint: 'ANC 2nd Trimester, mild dizziness, BP 130/85',
        vitals: { bp: '130/85', spo2: 98, pulse: 78, weight: 52 },
        triageCategory: 'MEDIUM',
        urgency: 'PRIORITY',
        facilityId: 'FAC-PHC-BHOR',
        facilityName: 'Bhor Primary Health Centre (PHC)',
      },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      retryCount: 0,
      status: 'PENDING',
    },
    {
      id: 'OFF-02',
      entityType: 'FOLLOWUP',
      payload: {
        id: 'HRF-MH-003',
        status: 'COMPLETED',
        notes: 'Home visit conducted in Velu. Patient taking Amlodipine regularly. BP 138/86 mmHg.',
      },
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      retryCount: 0,
      status: 'PENDING',
    },
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Quick Patient Form
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Female' | 'Male'>('Female');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<'maternal' | 'ncd' | 'general'>('maternal');

  // Vitals & Clinical Screen
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [spo2, setSpo2] = useState('98');
  const [bloodGlucose, setBloodGlucose] = useState('110');
  const [weightKg, setWeightKg] = useState('55');

  // Maternal Specifics
  const [gestationalWeeks, setGestationalWeeks] = useState('24');
  const [ancVisitNum, setAncVisitNum] = useState<'ANC-1' | 'ANC-2' | 'ANC-3' | 'ANC-4'>('ANC-2');
  const [hasSevereAnemia, setHasSevereAnemia] = useState(false);
  const [hasHighBP, setHasHighBP] = useState(false);
  const [hasSwelling, setHasSwelling] = useState(false);

  // Child Specifics
  const [childAgeMonths, setChildAgeMonths] = useState('9');
  const [vaccineType, setVaccineType] = useState('Measles-Rubella (MR-1) + Vitamin A');
  const [isMalnourished, setIsMalnourished] = useState(false);

  const handleSyncOfflineData = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const res = await fetch('/api/rural/sync/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: offlineQueue,
          ashaWorkerId: 'ASHA-001',
          ashaWorkerName: 'Vandana Tai Jadhav (Accredited Health Activist)',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOfflineQueue([]);
        setSyncMessage(
          isMarathi
            ? `यशस्वी! उपकेंद्रातील ${data.syncedCount} नोंदी प्राथमिक आरोग्य केंद्र सर्व्हरशी सिंक झाल्या.`
            : `Success! Synchronized ${data.syncedCount} offline records with central PHC database.`
        );
        setTimeout(() => setSyncMessage(null), 5000);
      }
    } catch (err) {
      console.error('Offline sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLaunchIntake = () => {
    if (!patientName.trim()) {
      alert(isMarathi ? 'कृपया रुग्णाचे नाव प्रविष्ट करा' : 'Please enter patient name');
      return;
    }

    const calculatedTriage =
      hasHighBP || parseInt(bpSystolic) >= 150 || hasSevereAnemia
        ? 'CRITICAL'
        : hasSwelling || parseInt(bpSystolic) >= 135 || isMalnourished
        ? 'MEDIUM'
        : 'STABLE';

    const vitalsPayload = {
      bp: `${bpSystolic}/${bpDiastolic}`,
      spo2: parseInt(spo2) || 98,
      glucose: parseInt(bloodGlucose) || 110,
      weight: parseFloat(weightKg) || 55,
      maternalDetails:
        selectedWorkflow === 'maternal'
          ? {
              gestationalWeeks: parseInt(gestationalWeeks) || 20,
              ancVisit: ancVisitNum,
              highRiskFlags: [
                hasSevereAnemia ? 'Severe Anemia (Hb < 7)' : null,
                hasHighBP ? 'Gestational Hypertension (BP > 140/90)' : null,
                hasSwelling ? 'Pedal Edema' : null,
              ].filter(Boolean),
            }
          : undefined,
      childDetails:
        selectedWorkflow === 'general' && parseInt(patientAge) <= 5
          ? {
              ageMonths: parseInt(childAgeMonths) || 9,
              vaccineDue: vaccineType,
              isSamMam: isMalnourished,
            }
          : undefined,
    };

    const newRecord: Partial<Patient> = {
      id: `ASHA-${Date.now().toString().slice(-4)}`,
      token: `A-0${Math.floor(45 + Math.random() * 50)}`,
      name: patientName,
      age: parseInt(patientAge) || 28,
      gender: patientGender,
      phone: patientPhone || '+91 98000 00000',
      registeredAt: new Date().toISOString(),
    };

    if (isOfflineSimulated) {
      const offlineItem: SyncQueueItem = {
        id: `OFF-${Date.now().toString().slice(-4)}`,
        entityType: 'TRIAGE',
        payload: {
          patientName,
          age: parseInt(patientAge) || 28,
          gender: patientGender,
          phone: patientPhone || '+91 98000 00000',
          chiefComplaint: `Community ${selectedWorkflow.toUpperCase()} intake by ASHA in ${selectedVillage}`,
          vitals: vitalsPayload,
          triageCategory: calculatedTriage,
          urgency: calculatedTriage === 'CRITICAL' ? 'EMERGENCY' : 'ROUTINE',
          facilityId: 'FAC-PHC-BHOR',
          facilityName: 'Bhor Primary Health Centre (PHC)',
        },
        timestamp: new Date().toISOString(),
        retryCount: 0,
        status: 'PENDING',
      };
      setOfflineQueue(prev => [offlineItem, ...prev]);
      alert(
        isMarathi
          ? `[ऑफलाइन मोड] रुग्ण ${patientName} ची नोंद स्थानिक मेमरीमध्ये सेव्ह झाली. इंटरनेट उपलब्ध झाल्यावर सिंक करा.`
          : `[Offline Mode] Patient ${patientName} saved to local device storage. Sync when online connectivity resumes.`
      );
      setPatientName('');
      return;
    }

    onStartAshaIntake(newRecord, selectedWorkflow);
  };

  return (
    <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-xs space-y-6">
      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-200">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">
                {isMarathi
                  ? 'आशा आरोग्य साथी (आशा / एएनएम समुदाय मंच)'
                  : isHindi
                  ? 'आशा स्वास्थ्य साथी (सामुदायिक स्वास्थ्य कार्यकर्ता)'
                  : 'ASHA Health Companion (Frontline Rural Healthcare Hub)'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                COMMUNITY ↔ PHC LINK
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Vandana Tai Jadhav (ASHA) • Velu Sub-Centre & Bhor Primary Health Centre Linkage
            </p>
          </div>
        </div>

        {/* Village Picker & Offline Mode Toggle & Sync Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Offline Mode Simulation Switch */}
          <button
            onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isOfflineSimulated
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
            title="Simulate remote sub-centre with zero 4G connectivity"
          >
            {isOfflineSimulated ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                <span>Simulating Offline Sub-Centre</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Online (4G / Fiber)</span>
              </>
            )}
          </button>

          {/* Sub-Centre Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <select
              value={selectedVillage}
              onChange={e => setSelectedVillage(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none text-xs"
            >
              <option value="Velu Sub-Centre (Haveli / Bhor)">Velu Sub-Centre</option>
              <option value="Kapurhol Sub-Centre (Bhor)">Kapurhol Sub-Centre</option>
              <option value="Nasrapur Rural Health Post">Nasrapur Post</option>
            </select>
          </div>

          {/* Batch Sync Button */}
          <button
            onClick={handleSyncOfflineData}
            disabled={isSyncing || offlineQueue.length === 0}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              offlineQueue.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing
                ? 'Syncing...'
                : `${isMarathi ? 'सिंक रांग' : 'Sync Queue'} (${offlineQueue.length})`}
            </span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-semibold">{syncMessage}</span>
        </div>
      )}

      {/* Protocol Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {isMarathi ? 'सामुदायिक आरोग्य तपासणी प्रोटोकॉल निवडा' : 'Select Community Care Protocol'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setSelectedWorkflow('maternal')}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
              selectedWorkflow === 'maternal'
                ? 'bg-rose-50 border-rose-500 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
              <Baby className="w-4 h-4 text-rose-600" />
              <span>{isMarathi ? 'माता व बाल आरोग्य (ANC)' : 'Maternal & Child Health (ANC)'}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Antenatal checkup, pre-eclampsia screening, severe anemia (Hb), and iron-folic acid tracker.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedWorkflow('ncd')}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
              selectedWorkflow === 'ncd'
                ? 'bg-teal-50 border-teal-500 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <span>{isMarathi ? 'असंचारी आजार (NCD स्क्रीनिंग)' : 'NCD Screening (BP & Sugar)'}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Hypertension check, random blood glucose, and chronic lifestyle risk factors.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedWorkflow('general')}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
              selectedWorkflow === 'general'
                ? 'bg-indigo-50 border-indigo-500 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>{isMarathi ? 'सामान्य आजार व ताप ट्रायज' : 'General Illness & Fever Triage'}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Seasonal acute fever, child malnutrition (SAM/MAM), immunization dropouts, or referral.
            </p>
          </button>
        </div>
      </div>

      {/* Patient Details & Vitals Recording */}
      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
          <span>{isMarathi ? 'रुग्ण माहिती व शारीरिक मापदंड नोंद' : 'Patient Registration & Frontline Vitals'}</span>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" />
            Marathi Voice Prompts Enabled
          </span>
        </h4>

        {/* Basic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              {isMarathi ? 'रुग्णाचे नाव' : 'Patient Full Name'}
            </label>
            <input
              type="text"
              placeholder="e.g. Kavita Shinde"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              {isMarathi ? 'वय' : 'Age'}
            </label>
            <input
              type="number"
              placeholder="e.g. 27"
              value={patientAge}
              onChange={e => setPatientAge(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              {isMarathi ? 'लिंग' : 'Gender'}
            </label>
            <select
              value={patientGender}
              onChange={e => setPatientGender(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>

        {/* Phone */}
        <div className="max-w-xs">
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
            {isMarathi ? 'मोबाईल क्रमांक (SMS/108 सूचना)' : 'Mobile Phone'}
          </label>
          <input
            type="text"
            placeholder="+91 98000 00000"
            value={patientPhone}
            onChange={e => setPatientPhone(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Vitals inputs */}
        <div className="pt-2 border-t border-slate-200">
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
            {isMarathi ? 'शारीरिक मापदंड (ASHA किट द्वारे तपासणी)' : 'Recorded Clinical Vitals'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <span className="block text-[10px] font-bold text-slate-500">BP Systolic</span>
              <input
                type="number"
                value={bpSystolic}
                onChange={e => setBpSystolic(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500">BP Diastolic</span>
              <input
                type="number"
                value={bpDiastolic}
                onChange={e => setBpDiastolic(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500">SpO2 (%)</span>
              <input
                type="number"
                value={spo2}
                onChange={e => setSpo2(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500">Blood Sugar (mg/dL)</span>
              <input
                type="number"
                value={bloodGlucose}
                onChange={e => setBloodGlucose(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500">Weight (kg)</span>
              <input
                type="number"
                value={weightKg}
                onChange={e => setWeightKg(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Maternal Checkboxes if Maternal mode */}
        {selectedWorkflow === 'maternal' && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
            <div className="font-extrabold text-rose-950 flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-rose-700" />
              <span>{isMarathi ? 'मातृत्व उच्च-जोखिम तपासणी सूची (High Risk ANC Check)' : 'High Risk Pregnancy Checklist'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <label className="flex items-center gap-2 font-semibold text-rose-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSevereAnemia}
                  onChange={e => setHasSevereAnemia(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>Severe Anemia (Hb &lt; 7 g/dL)</span>
              </label>

              <label className="flex items-center gap-2 font-semibold text-rose-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHighBP}
                  onChange={e => setHasHighBP(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>Gestational High BP (&gt; 140/90)</span>
              </label>

              <label className="flex items-center gap-2 font-semibold text-rose-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSwelling}
                  onChange={e => setHasSwelling(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>Pedal Edema (पायावर सूज)</span>
              </label>
            </div>
          </div>
        )}

        {/* Launch Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isOfflineSimulated
                ? 'Offline Sub-centre storage active'
                : 'Directly queues patient into Bhor PHC live triage list'}
            </span>
          </div>

          <button
            onClick={handleLaunchIntake}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs transition flex items-center gap-2 shadow-md shadow-emerald-200"
          >
            <UserPlus className="w-4 h-4" />
            <span>
              {isOfflineSimulated
                ? isMarathi ? 'स्थानिक मेमरीमध्ये सेव्ह करा' : 'Save to Offline Sub-Centre'
                : isMarathi ? 'नोंदणी करा व ओपीडी रांगेत जोडा' : 'Register & Queue at PHC'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
