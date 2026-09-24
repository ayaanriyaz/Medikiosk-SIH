import React, { useState, useEffect } from 'react';
import {
  AdminOverview,
  RedFlagAlert,
  KioskStatus,
  StaffMember,
  AuditLog,
  Language,
  HospitalUser,
  HospitalConnectionRequest,
} from '../types';
import {
  Building2,
  Activity,
  AlertTriangle,
  Monitor,
  Users,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  FileCheck,
  ArrowUpRight,
  Stethoscope,
  UserCheck,
  Check,
  X,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HospitalOperationsProps {
  language?: Language;
  onNavigateToPatient: (intakeId: string) => void;
  onBack?: () => void;
}

export const HospitalOperations: React.FC<HospitalOperationsProps> = ({
  language,
  onNavigateToPatient,
  onBack,
}) => {
  const { t } = useLanguage();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [alerts, setAlerts] = useState<RedFlagAlert[]>([]);
  const [kiosks, setKiosks] = useState<KioskStatus[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'kiosks' | 'alerts' | 'affiliations' | 'staff' | 'audit'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hospital management state
  const [hospitals, setHospitals] = useState<HospitalUser[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalUser | null>(null);
  const [affiliationRequests, setAffiliationRequests] = useState<HospitalConnectionRequest[]>([]);
  const [isLoadingAffiliations, setIsLoadingAffiliations] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Hospital Patients & Relations
  const [hospitalPatients, setHospitalPatients] = useState<any[]>([]);
  const [hospitalDoctors, setHospitalDoctors] = useState<any[]>([]);
  const [isLoadingHospitalPatients, setIsLoadingHospitalPatients] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadHospitalPatients = async (hospId: string) => {
    setIsLoadingHospitalPatients(true);
    try {
      const res = await fetch(`/api/hospitals/${hospId}/patients`);
      if (res.ok) {
        const data = await res.json();
        setHospitalPatients(data.patients || []);
        setHospitalDoctors(data.doctors || []);
      }
    } catch (e) {
      console.error('Failed to load hospital patients:', e);
    } finally {
      setIsLoadingHospitalPatients(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await fetch('/api/hospitals');
      if (res.ok) {
        const data: HospitalUser[] = await res.json();
        setHospitals(data);
        if (data.length > 0 && !selectedHospital) {
          setSelectedHospital(data[0]);
          loadHospitalRequests(data[0].id);
          loadHospitalPatients(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load hospitals:', e);
    }
  };

  const loadHospitalRequests = async (hospId: string) => {
    setIsLoadingAffiliations(true);
    try {
      const res = await fetch(`/api/hospitals/${hospId}/requests`);
      if (res.ok) {
        const data = await res.json();
        setAffiliationRequests(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load hospital affiliation requests:', e);
    } finally {
      setIsLoadingAffiliations(false);
    }
  };

  const handleDecideRequest = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/hospitals/requests/${requestId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAffiliationRequests(prev => prev.map(r => (r.id === requestId ? updated : r)));
        showToast(`Doctor affiliation request marked as ${status}.`);
      }
    } catch (e) {
      console.error('Failed to update request:', e);
    }
  };

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [ovRes, altRes, kskRes, stfRes, audRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/alerts'),
        fetch('/api/admin/kiosks'),
        fetch('/api/admin/staff'),
        fetch('/api/admin/audit'),
      ]);

      const [ovData, altData, kskData, stfData, audData] = await Promise.all([
        ovRes.json(),
        altRes.json(),
        kskRes.json(),
        stfRes.json(),
        audRes.json(),
      ]);

      setOverview(ovData);
      setAlerts(altData);
      setKiosks(kskData);
      setStaff(stfData);
      setAuditLogs(audData);
    } catch (e) {
      console.error('Failed to load operations data:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospital) {
      loadHospitalRequests(selectedHospital.id);
    }
  }, [selectedHospital]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/admin/alerts/${alertId}/ack`, { method: 'POST' });
      fetchDashboardData();
    } catch (e) {
      console.error('Failed to ack alert:', e);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-teal-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs border border-teal-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Operations Bar */}
      <div className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              type="button"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.back || 'Back'}</span>
            </button>
          )}
          <Building2 className="w-4 h-4 text-teal-600" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
            {t.hospitalOpsNav || 'Hospital Operations & OPD Flow Center'}
          </span>

          {/* Hospital Switcher */}
          {hospitals.length > 0 && (
            <div className="relative">
              <select
                value={selectedHospital?.id || ''}
                onChange={e => {
                  const hosp = hospitals.find(h => h.id === e.target.value);
                  if (hosp) {
                    setSelectedHospital(hosp);
                    loadHospitalRequests(hosp.id);
                    loadHospitalPatients(hosp.id);
                  }
                }}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.city})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === 'overview' ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.overview || 'Overview & Flow'}
          </button>
          <button
            onClick={() => {
              setActiveTab('patients');
              if (selectedHospital) loadHospitalPatients(selectedHospital.id);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'patients' ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.hospitalPatients || 'Hospital Patients'} ({hospitalPatients.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('kiosks')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === 'kiosks' ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.kiosksNav || 'Kiosks'} ({kiosks.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
              activeTab === 'alerts' ? 'bg-red-50 text-red-900 font-bold border border-red-200' : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>{t.priorityAlerts || 'Alerts'} ({alerts.filter(a => a.status === 'UNREVIEWED').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('affiliations')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'affiliations' ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.doctorAffiliations || 'Doctor Affiliations'}</span>
            {affiliationRequests.filter(r => r.status === 'PENDING_APPROVAL').length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {affiliationRequests.filter(r => r.status === 'PENDING_APPROVAL').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === 'staff' ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.staffNav || 'Staff Directory'}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === 'audit' ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.auditLogNav || 'Audit Log'}
          </button>
        </div>

        <button
          onClick={() => {
            fetchDashboardData();
            if (selectedHospital) loadHospitalRequests(selectedHospital.id);
          }}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isLoadingAffiliations ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Metric Cards */}
        {overview && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Patients Registered</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{overview.patientsToday}</p>
              <span className="text-[10px] text-teal-700 font-semibold mt-1 block">Live single-source db</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-amber-600 tracking-wider">Active In-Queue</span>
              <p className="text-3xl font-black text-amber-600 mt-1">{overview.readyForReview}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Awaiting doctor review</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-red-600 tracking-wider">Critical Red Flags</span>
              <p className="text-3xl font-black text-red-600 mt-1">{overview.priorityAlerts}</p>
              <span className="text-[10px] text-red-600 font-semibold mt-1 block">High priority triage</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-teal-600 tracking-wider">Doctor Verified Rate</span>
              <p className="text-3xl font-black text-teal-600 mt-1">{overview.doctorVerificationRate}%</p>
              <span className="text-[10px] text-slate-400 mt-1 block">Avg intake time: 4.2 min</span>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB: FLOW VISUALIZATION */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* OPD Patient Journey Pipeline */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900">Hospital Patient Flow Pipeline</h3>
                <span className="text-xs text-slate-500">Live Stage Distribution</span>
              </div>

              <div className="grid grid-cols-5 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">1. Check-In</span>
                  <p className="text-lg font-black text-slate-900 mt-1">4</p>
                  <span className="text-[10px] text-slate-400">ABHA / Token</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">2. Intake (Kiosk)</span>
                  <p className="text-lg font-black text-teal-700 mt-1">3</p>
                  <span className="text-[10px] text-slate-400">Conversational</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">3. OCR Digitize</span>
                  <p className="text-lg font-black text-blue-700 mt-1">5 Docs</p>
                  <span className="text-[10px] text-slate-400">Prescriptions</span>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-xs font-bold text-amber-900">4. Ready for OPD</span>
                  <p className="text-lg font-black text-amber-700 mt-1">{overview?.readyForReview || 2}</p>
                  <span className="text-[10px] text-amber-700">AI Draft Ready</span>
                </div>

                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                  <span className="text-xs font-bold text-teal-900">5. Consulted</span>
                  <p className="text-lg font-black text-teal-700 mt-1">{overview?.completed || 1}</p>
                  <span className="text-[10px] text-teal-700">Verified & FHIR</span>
                </div>
              </div>
            </div>

            {/* Red Flag Alerts Quick Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h3 className="font-bold text-sm text-slate-900">Active High-Priority Alerts</h3>
                </div>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900"
                >
                  View All ({alerts.length})
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {alerts.slice(0, 3).map(a => (
                  <div key={a.alertId} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-900 mr-2">{a.token}</span>
                      <strong className="text-slate-800">{a.patientName}</strong>
                      <span className="text-slate-500 ml-2">— {a.ruleTriggered}</span>
                      <p className="text-[11px] text-red-700 mt-0.5">{a.symptomSummary}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                        {a.severity}
                      </span>
                      {a.status === 'UNREVIEWED' ? (
                        <button
                          onClick={() => handleAcknowledgeAlert(a.alertId)}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded text-[11px] font-bold hover:bg-slate-800"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">Acknowledged</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HOSPITAL PATIENTS & DOCTOR RELATIONS TAB */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            {/* Hospital Care Team (Doctors) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>Hospital Medical Staff & Consultant Roster</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Doctors credentialed at {selectedHospital?.name || 'this facility'}
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-200 font-mono">
                  {hospitalDoctors.length} Clinicians
                </span>
              </div>

              {hospitalDoctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {hospitalDoctors.map(doc => (
                    <div key={doc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {doc.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-bold text-slate-900 truncate">{doc.fullName}</p>
                        <p className="text-teal-700 font-semibold">{doc.specialization}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span>Reg: {doc.registrationNumber || 'MCI-Verified'}</span>
                          <span>•</span>
                          <span>{doc.experienceYears || 10}+ yrs exp</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No doctors registered for this facility.</p>
              )}
            </div>

            {/* Patients Under Hospital Care */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Patients Registered at {selectedHospital?.name || 'Hospital'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified relationship: Patient → Assigned Doctor → Hospital Facility
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-mono">
                  {hospitalPatients.length} Active Patients
                </span>
              </div>

              {isLoadingHospitalPatients ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                  <span className="text-xs">Loading hospital patient records...</span>
                </div>
              ) : hospitalPatients.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <span className="text-xs">No patients currently associated with this hospital.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="py-3 px-4">Patient</th>
                        <th className="py-3 px-3">Age / Gender</th>
                        <th className="py-3 px-3">Token & ID</th>
                        <th className="py-3 px-4">Assigned Consultant</th>
                        <th className="py-3 px-4">Chief Complaint / Symptoms</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {hospitalPatients.map((pat: any) => {
                        const isCrit = pat.status === 'Critical' || (pat.vitals?.pulse && pat.vitals.pulse > 105);
                        return (
                          <tr key={pat.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{pat.name}</p>
                              <p className="text-[11px] text-slate-400">{pat.city || 'Kanpur'}, {pat.state || 'UP'}</p>
                            </td>
                            <td className="py-3 px-3 text-slate-700">
                              {pat.age} yrs • {pat.gender}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px]">
                              <span className="font-bold text-slate-900 block">{pat.token}</span>
                              <span className="text-slate-400">{pat.id}</span>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-teal-800 text-[11px] flex items-center gap-1">
                                <Stethoscope className="w-3 h-3 text-teal-600" />
                                <span>{pat.assignedDoctorName || 'Assigned Physician'}</span>
                              </p>
                              <p className="text-[10px] text-slate-400">{pat.department || 'General Medicine'}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-slate-700 font-medium truncate max-w-xs">
                                {pat.symptoms?.join(', ') || 'Consultation Intake'}
                              </p>
                              {pat.duration && (
                                <span className="text-[10px] text-slate-400">Duration: {pat.duration}</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                                isCrit
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {pat.status || 'Active'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => onNavigateToPatient(pat.id)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 font-bold rounded-lg text-[11px] transition-all cursor-pointer"
                              >
                                View Record
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'kiosks' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {kiosks.map(kiosk => (
              <div key={kiosk.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-teal-600" />
                    <h4 className="font-bold text-sm text-slate-900">{kiosk.name}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      kiosk.status === 'ONLINE'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {kiosk.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Location: {kiosk.location}</p>
                {kiosk.activePatientToken && (
                  <p className="text-xs text-teal-800 font-semibold mt-2">
                    Active Intake Token: <span className="font-mono">{kiosk.activePatientToken}</span>
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-2">Last heartbeat: Just now</p>
              </div>
            ))}
          </div>
        )}

        {/* ALERTS TAB */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alerts.map(a => (
              <div key={a.alertId} className="bg-white p-5 rounded-2xl border border-red-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-sm text-red-700">{a.token}</span>
                    <strong className="text-sm text-slate-900">{a.patientName}</strong>
                    <span className="text-[10px] font-bold uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded">
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{a.ruleTriggered}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.symptomSummary}</p>
                </div>

                <div className="flex items-center gap-3">
                  {a.status === 'UNREVIEWED' && (
                    <button
                      onClick={() => handleAcknowledgeAlert(a.alertId)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                    >
                      Acknowledge Alert
                    </button>
                  )}
                  <button
                    onClick={() => onNavigateToPatient(a.intakeId)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700"
                  >
                    Open Case
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AFFILIATIONS TAB */}
        {activeTab === 'affiliations' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Doctor Affiliation & Credentialing Board
                </h3>
                <p className="text-xs text-slate-500">
                  Review licensed medical practitioners requesting clinical rights at {selectedHospital?.name || 'this hospital'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                  {affiliationRequests.length} Total Requests
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                  {affiliationRequests.filter(r => r.status === 'PENDING_APPROVAL').length} Pending Board Review
                </span>
              </div>
            </div>

            {isLoadingAffiliations ? (
              <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                <span>Loading hospital affiliation requests...</span>
              </div>
            ) : affiliationRequests.length === 0 ? (
              <div className="py-16 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 space-y-2">
                <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">No affiliation requests for {selectedHospital?.name}</p>
                <p className="text-xs text-slate-400">
                  When physicians apply for OPD or clinical privileges through MediKiosk, their credentials will be staged here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {affiliationRequests.map(req => (
                  <div
                    key={req.id}
                    className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-teal-600" />
                          <h4 className="font-bold text-sm text-slate-900">{req.doctorName}</h4>
                          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            Dept: {req.department}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {req.specialization} • {req.qualification} • NMC Reg: {req.regNumber} ({req.experienceYears} yrs experience)
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : req.status === 'REJECTED'
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
                        }`}
                      >
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Submitted: {new Date(req.requestedAt).toLocaleString()}
                        {req.decidedAt && ` • Decided: ${new Date(req.decidedAt).toLocaleString()}`}
                      </span>

                      {req.status === 'PENDING_APPROVAL' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecideRequest(req.id, 'REJECTED')}
                            className="px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleDecideRequest(req.id, 'APPROVED')}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Grant Privileges</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-500">
                          {req.status === 'APPROVED' ? 'Active Credentialed Practitioner' : 'Application Closed'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STAFF TAB */}
        {activeTab === 'staff' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staff.map(s => (
              <div key={s.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{s.name}</h4>
                  <p className="text-xs text-slate-500">{s.role} • {s.department}</p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-600">
              System Audit Trail & Access Logs
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto text-xs">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3.5 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{log.user}</span>
                      <span className="text-[10px] font-mono uppercase bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                        {log.role}
                      </span>
                      <span className="font-semibold text-teal-700">{log.action}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-4">
                    {log.timestamp.slice(11, 19)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
