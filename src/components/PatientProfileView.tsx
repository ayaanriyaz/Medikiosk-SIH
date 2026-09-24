import React, { useState } from 'react';
import { Patient, ClinicalReport, Intake } from '../types';
import {
  User,
  HeartPulse,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  Pill,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Phone,
  MapPin,
  Flame,
  Award,
  Download,
  Eye,
} from 'lucide-react';

interface PatientProfileViewProps {
  patient: Patient;
  onBack: () => void;
  onStartInterview: (patient: Patient) => void;
  onViewReport: (patient: Patient) => void;
  onNavigateToDoctor: (patientId: string) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patient,
  onBack,
  onStartInterview,
  onViewReport,
  onNavigateToDoctor,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals_symptoms' | 'history_meds' | 'labs' | 'ayurveda' | 'timeline'>('overview');

  const isCritical = patient.status === 'Critical' || (patient.vitals && (
    (patient.vitals.pulse && patient.vitals.pulse > 105) ||
    (patient.vitals.spo2 && patient.vitals.spo2 < 94) ||
    (patient.vitals.bp && parseInt(patient.vitals.bp.split('/')[0]) >= 150)
  ));

  return (
    <div className="flex flex-col space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Directory</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onStartInterview(patient)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start AI Clinical Interview</span>
          </button>

          <button
            onClick={() => onViewReport(patient)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-teal-600" />
            <span>View Clinical Report</span>
          </button>

          <button
            onClick={() => onNavigateToDoctor(patient.id)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Stethoscope className="w-4 h-4 text-teal-400" />
            <span>Open in Doctor Workspace</span>
          </button>
        </div>
      </div>

      {/* Patient Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {patient.name}
                </h2>
                <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-bold rounded-lg font-mono">
                  {patient.id}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg font-mono">
                  Token: {patient.token}
                </span>
                <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border ${
                  patient.status === 'Critical' || isCritical
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : patient.status === 'Pending Review'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {patient.status || 'Active'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 mt-2">
                <span><strong>Age:</strong> {patient.age} yrs</span>
                <span>•</span>
                <span><strong>Gender:</strong> {patient.gender}</span>
                {patient.bloodGroup && (
                  <>
                    <span>•</span>
                    <span className="text-red-700 font-bold">Blood Group: {patient.bloodGroup}</span>
                  </>
                )}
                {patient.city && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {patient.city}, {patient.state || 'India'}</span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {patient.phone}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  ABHA: {patient.abhaId || 'Not linked'}
                </span>
                {patient.aadhaarLast4 && (
                  <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    Aadhaar: •••• •••• {patient.aadhaarLast4}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Doctor & Hospital Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs min-w-[260px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Healthcare Team
            </span>
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">{patient.assignedDoctorName || 'Assigned Consultant'}</p>
                <p className="text-[11px] text-slate-500">{patient.department || 'General Medicine'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">{patient.assignedHospitalName || 'Affiliated Hospital'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Patient Overview', icon: User },
          { id: 'vitals_symptoms', label: 'Vitals & Current Symptoms', icon: HeartPulse },
          { id: 'history_meds', label: 'Medical History & Meds', icon: Pill },
          { id: 'labs', label: `Diagnostic Labs (${patient.labReports?.length || 0})`, icon: FileText },
          ...(patient.ayurvedaProfile ? [{ id: 'ayurveda', label: 'Ayurveda Profile', icon: Flame }] : []),
          { id: 'timeline', label: 'Health Timeline', icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Summary Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Primary Clinical Snapshot</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Active Symptoms</h4>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {patient.symptoms && patient.symptoms.length > 0 ? (
                      patient.symptoms.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-lg border border-teal-200">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No active complaints logged</span>
                    )}
                  </div>
                  {patient.duration && (
                    <p className="text-xs text-slate-500 mt-1.5">
                      <strong>Duration:</strong> {patient.duration}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Known Past Conditions</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {patient.pastConditions && patient.pastConditions.length > 0 ? (
                      patient.pastConditions.map((c, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-md">
                          {c}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">None reported</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Current Medications</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {patient.medications && patient.medications.length > 0 ? (
                      patient.medications.map((m, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-md border border-emerald-200">
                          {m}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No regular medications</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-red-600 uppercase flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Known Allergies</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {patient.allergies && patient.allergies.length > 0 ? (
                      patient.allergies.map((a, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-red-50 text-red-800 text-xs font-bold rounded-md border border-red-200">
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No known drug allergies (NKDA)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Vitals preview mini-bar */}
            {patient.vitals && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Latest Triage Vitals
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Blood Pressure</span>
                    <p className="text-base font-black text-slate-900 mt-0.5">{patient.vitals.bp || '120/80'}</p>
                    <span className="text-[10px] text-slate-400">mmHg</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Heart Rate</span>
                    <p className="text-base font-black text-slate-900 mt-0.5">{patient.vitals.pulse || 72}</p>
                    <span className="text-[10px] text-slate-400">bpm</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Body Temp</span>
                    <p className="text-base font-black text-slate-900 mt-0.5">{patient.vitals.temp || '98.6°F'}</p>
                    <span className="text-[10px] text-slate-400">Fahrenheit</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">SpO2</span>
                    <p className="text-base font-black text-slate-900 mt-0.5">{patient.vitals.spo2 || 98}%</p>
                    <span className="text-[10px] text-slate-400">Room Air</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Key Details & Affiliation */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Registration & ABDM Profile
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Registration Date</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(patient.registeredAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">ABHA Address</span>
                  <span className="font-mono text-teal-800 font-bold">{patient.abhaId || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Aadhaar Auth</span>
                  <span className="font-mono text-slate-700">•••• {patient.aadhaarLast4 || 'N/A'} (Verified)</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Contact</span>
                  <span className="font-semibold text-slate-800">{patient.phone}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Location</span>
                  <span className="font-semibold text-slate-800">{patient.city || 'Kanpur'}, {patient.state || 'Uttar Pradesh'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-5 rounded-2xl border border-teal-200 text-xs space-y-3">
              <h4 className="font-bold text-teal-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Next Clinical Steps</span>
              </h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Run the AI-driven adaptive questionnaire to capture complete symptom ontology and produce a doctor-ready pre-consultation report.
              </p>
              <button
                onClick={() => onStartInterview(patient)}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer text-center"
              >
                Launch Patient Chatbot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VITALS & SYMPTOMS */}
      {activeTab === 'vitals_symptoms' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Full Clinical Vitals</span>
            </h3>

            {patient.vitals ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Blood Pressure</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{patient.vitals.bp}</p>
                  <span className="text-[11px] text-slate-500">mmHg</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Pulse / Heart Rate</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{patient.vitals.pulse} bpm</p>
                  <span className="text-[11px] text-slate-500">Radial Pulse</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Temperature</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{patient.vitals.temp}</p>
                  <span className="text-[11px] text-slate-500">Oral / Digital</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Oxygen Saturation</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{patient.vitals.spo2}%</p>
                  <span className="text-[11px] text-slate-500">Pulse Oximetry</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Weight</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{patient.vitals.weight || '68 kg'}</p>
                  <span className="text-[11px] text-slate-500">Kilograms</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">BMI</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{patient.vitals.bmi || '22.4'}</p>
                  <span className="text-[11px] text-slate-500">kg/m²</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Vitals not recorded for this patient.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Reported Symptoms & Onset</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Chief Complaints:</span>
                <div className="flex flex-wrap gap-2">
                  {patient.symptoms?.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-900 rounded-xl border border-teal-200 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Duration & Progression:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  Symptoms persisting for <strong>{patient.duration || 'recent onset'}</strong>. Patient describes continuous/intermittent nature during daily activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEDICAL HISTORY & MEDS */}
      {activeTab === 'history_meds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Medical & Surgical History</span>
            </h3>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Past Medical Conditions</h4>
              {patient.pastConditions && patient.pastConditions.length > 0 ? (
                <ul className="space-y-2">
                  {patient.pastConditions.map((cond, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 p-2.5 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">No significant past illness reported</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Family Medical History</h4>
              {patient.familyHistory && patient.familyHistory.length > 0 ? (
                <ul className="space-y-2">
                  {patient.familyHistory.map((fam, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 p-2.5 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span>{fam}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">No hereditary conditions reported</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>Active Pharmacotherapy & Allergies</span>
            </h3>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Prescribed Medications</h4>
              {patient.medications && patient.medications.length > 0 ? (
                <ul className="space-y-2">
                  {patient.medications.map((med, idx) => (
                    <li key={idx} className="flex items-center justify-between text-xs p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-slate-800">
                      <span className="font-bold text-emerald-950">{med}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold px-2 py-0.5 bg-emerald-100 rounded">Regular</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">No active medications recorded</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-red-600 uppercase mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Allergies & Adverse Drug Reactions</span>
              </h4>
              {patient.allergies && patient.allergies.length > 0 ? (
                <div className="space-y-2">
                  {patient.allergies.map((allergy, idx) => (
                    <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{allergy}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No known drug allergies reported</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LAB REPORTS */}
      {activeTab === 'labs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Diagnostic Laboratory & Investigation Reports</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              {patient.labReports?.length || 0} Records Attached
            </span>
          </div>

          {patient.labReports && patient.labReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Test Name</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Reference Range</th>
                    <th className="py-3 px-4">Facility</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {patient.labReports.map(lab => (
                    <tr key={lab.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{lab.testName}</td>
                      <td className="py-3 px-4 text-slate-600">{lab.date}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{lab.result}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{lab.normalRange}</td>
                      <td className="py-3 px-4 text-slate-500">{lab.facility || 'Verified Diagnostic Lab'}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          lab.status === 'Abnormal'
                            ? 'bg-amber-100 text-amber-800'
                            : lab.status === 'Normal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {lab.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No laboratory reports found for this patient.</p>
          )}
        </div>
      )}

      {/* TAB 5: AYURVEDA PROFILE */}
      {activeTab === 'ayurveda' && patient.ayurvedaProfile && (
        <div className="bg-amber-50/40 p-6 rounded-2xl border border-amber-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-700" />
            <span>Ayurveda (AYUSH) Clinical Assessment</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-amber-200/80">
              <span className="text-[10px] font-bold uppercase text-amber-800 block">Deha Prakriti</span>
              <p className="text-base font-black text-amber-950 mt-1">{patient.ayurvedaProfile.prakriti || 'Vata-Pitta'}</p>
              <span className="text-[11px] text-amber-700">Constitutional Baseline</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-amber-200/80">
              <span className="text-[10px] font-bold uppercase text-amber-800 block">Agni Status</span>
              <p className="text-base font-black text-amber-950 mt-1">{patient.ayurvedaProfile.agni || 'Mandagni'}</p>
              <span className="text-[11px] text-amber-700">Digestive / Metabolic Fire</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-amber-200/80">
              <span className="text-[10px] font-bold uppercase text-amber-800 block">Dosha Vikriti</span>
              <p className="text-base font-black text-amber-950 mt-1">{patient.ayurvedaProfile.vikriti || 'Vata-Kapha Vriddhi'}</p>
              <span className="text-[11px] text-amber-700">Pathological Imbalance</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-amber-200/80">
              <span className="text-[10px] font-bold uppercase text-amber-800 block">Samprapti Ghataka</span>
              <p className="text-xs font-semibold text-amber-950 mt-1 leading-snug">{patient.ayurvedaProfile.samprapti || 'Sroto-rodha in Rasavaha Srotas'}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>Consultation & Health Timeline</span>
          </h3>

          <div className="space-y-4 pl-2 border-l-2 border-slate-200 ml-2">
            {patient.timeline && patient.timeline.length > 0 ? (
              patient.timeline.map((item, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[11px] top-1 w-4 h-4 rounded-full bg-teal-500 border-2 border-white" />
                  <span className="text-[11px] font-bold text-teal-800">{item.date}</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{item.notes}</p>
                </div>
              ))
            ) : (
              <div className="relative pl-6">
                <div className="absolute -left-[11px] top-1 w-4 h-4 rounded-full bg-teal-500 border-2 border-white" />
                <span className="text-[11px] font-bold text-teal-800">{new Date(patient.registeredAt).toLocaleDateString()}</span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">Initial Kiosk Profile Registered</h4>
                <p className="text-xs text-slate-600 mt-0.5">Profile imported into MediKiosk digital health record network.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
