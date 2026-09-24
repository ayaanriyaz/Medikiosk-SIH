import React, { useState, useEffect } from 'react';
import { Patient, Language, ClinicalReport, Intake } from '../types';
import { AIClinicalChatbot } from './AIClinicalChatbot';
import { MultilingualHealthcareChatbot } from './MultilingualHealthcareChatbot';
import { Stethoscope, Building2, User, RefreshCw, CheckCircle2, ChevronDown } from 'lucide-react';

interface AIChatbotWorkspaceProps {
  language: Language;
  onNavigateToDoctor?: (patientId: string) => void;
  onBack?: () => void;
}

export const AIChatbotWorkspace: React.FC<AIChatbotWorkspaceProps> = ({
  language,
  onNavigateToDoctor,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'anna' | 'navigator'>('anna');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isPatientPickerOpen, setIsPatientPickerOpen] = useState(false);
  const [completedReport, setCompletedReport] = useState<ClinicalReport | null>(null);

  // Fetch patients
  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await fetch('/api/patients');
        if (res.ok) {
          const list = await res.json();
          if (list && list.length > 0) {
            setPatients(list);
            setSelectedPatient(list[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load patients for Anna workspace:', err);
      } finally {
        setIsLoadingPatients(false);
      }
    }

    loadPatients();
  }, []);

  const handleReportGenerated = (report: ClinicalReport, intake: Intake) => {
    setCompletedReport(report);
    if (onNavigateToDoctor) {
      setTimeout(() => onNavigateToDoctor(report.patientId), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Sub-header Switcher: Anna Clinical Intake vs OPD Navigator */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('anna')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'anna'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Anna — AI Clinical Intake Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('navigator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'navigator'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Rural OPD & Hospital Navigator</span>
          </button>
        </div>

        {/* Patient Switcher (when in Anna Mode) */}
        {activeTab === 'anna' && selectedPatient && (
          <div className="relative">
            <button
              onClick={() => setIsPatientPickerOpen(!isPatientPickerOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition cursor-pointer shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>
                Intake For: <strong>{selectedPatient.name}</strong> ({selectedPatient.token})
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isPatientPickerOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 max-h-72 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                  Select Patient Record
                </div>
                {patients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPatient(p);
                      setIsPatientPickerOpen(false);
                      setCompletedReport(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-between ${
                      selectedPatient.id === p.id
                        ? 'bg-teal-50 font-black text-teal-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-500">{p.age}y {p.gender} • Token {p.token}</div>
                    </div>
                    {selectedPatient.id === p.id && (
                      <span className="w-2 h-2 rounded-full bg-teal-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'anna' ? (
          isLoadingPatients ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mb-3" />
              <p className="text-sm font-bold text-slate-700">Loading Patient Context...</p>
            </div>
          ) : selectedPatient ? (
            <AIClinicalChatbot
              key={selectedPatient.id}
              patient={selectedPatient}
              language={language}
              mode="general"
              onReportGenerated={handleReportGenerated}
              onBack={onBack || (() => {})}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-500">
              <p className="text-sm font-bold">No patient record selected. Please choose a patient above.</p>
            </div>
          )
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full">
            <MultilingualHealthcareChatbot />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatbotWorkspace;
