import React, { useState, useEffect } from 'react';
import {
  Intake,
  Language,
  ClinicalReport,
  DoctorUser,
  ReportShare,
  HospitalConnectionRequest,
  ProcedureRecord,
  HospitalUser,
} from '../types';
import { useTranslation } from '../i18n';
import { PreConsultationReportView } from './PreConsultationReportView';
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Filter,
  Check,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  RefreshCw,
  Eye,
  User,
  Activity,
  History,
  AlertCircle,
  FileCode,
  Send,
  Save,
  Inbox,
  Share2,
  Award,
  ChevronDown,
  Plus,
  PlusCircle,
  X,
  CheckSquare,
  UserCheck,
  ArrowLeft,
  Video,
  Siren,
  SlidersHorizontal,
  ShieldAlert,
} from 'lucide-react';
import { RiskScoreBadge } from './RiskScoreBadge';
import { LongitudinalContinuityTimeline } from './LongitudinalContinuityTimeline';
import { DrugInteractionPanel } from './DrugInteractionPanel';
import { TeleconsultationModal } from './TeleconsultationModal';
import { AmbulanceDispatchModal } from './AmbulanceDispatchModal';
import { DoctorProgressReportModal } from './DoctorProgressReportModal';
import { buildLongitudinalTimeline } from '../services/continuityService';
import { calculateRiskStratificationScore } from '../services/riskStratificationService';
import { checkMedicationSafety } from '../services/drugSafetyService';

interface DoctorWorkspaceProps {
  language?: Language;
  onViewFhir: (intakeId: string) => void;
  selectedPatientId?: string | null;
  onBack?: () => void;
}

export const DoctorWorkspace: React.FC<DoctorWorkspaceProps> = ({
  language: propLanguage,
  onViewFhir,
  selectedPatientId,
  onBack,
}) => {
  const { language: ctxLanguage, t } = useTranslation();
  const language = propLanguage || ctxLanguage;

  // Workspace sub-navigation
  const [activeTab, setActiveTab] = useState<
    'overview' | 'queue' | 'shared_reports' | 'alerts' | 'procedures' | 'hospital_affiliation' | 'ayush'
  >('queue');

  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIntake, setSelectedIntake] = useState<Intake | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'RED_FLAG' | 'READY_FOR_REVIEW' | 'VERIFIED'>('ALL');
  const [priorityCategoryFilter, setPriorityCategoryFilter] = useState<'ALL' | 'Urgent' | 'Priority' | 'Routine'>('ALL');
  const [queueScope, setQueueScope] = useState<'MY_PATIENTS' | 'ALL'>('MY_PATIENTS');

  // Teleconsultation & Emergency Modals
  const [isTeleconsultOpen, setIsTeleconsultOpen] = useState(false);
  const [isAmbulanceOpen, setIsAmbulanceOpen] = useState(false);
  const [isProgressReportOpen, setIsProgressReportOpen] = useState(false);

  // Doctor Clinical Priority Override Modal
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideCategory, setOverrideCategory] = useState<'Urgent' | 'Priority' | 'Routine'>('Priority');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // Detail View Sub-Tab
  const [detailTab, setDetailTab] = useState<'report' | 'summary' | 'history' | 'documents' | 'timeline' | 'ayush' | 'audit'>('report');
  const [currentReport, setCurrentReport] = useState<ClinicalReport | null>(null);

  // Doctor Edit Mode for AI Summary
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editableNotes, setEditableNotes] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Vivek Sharma, MD');
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Doctor Profile & Switcher
  const [doctorsList, setDoctorsList] = useState<DoctorUser[]>([]);
  const [currentDoctor, setCurrentDoctor] = useState<DoctorUser | null>(null);
  const [isDoctorProfileModalOpen, setIsDoctorProfileModalOpen] = useState(false);

  // Shared Reports Inbox
  const [sharedReports, setSharedReports] = useState<ReportShare[]>([]);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [selectedShare, setSelectedShare] = useState<ReportShare | null>(null);
  const [selectedShareReport, setSelectedShareReport] = useState<ClinicalReport | null>(null);
  const [isLoadingShareReport, setIsLoadingShareReport] = useState(false);
  const [shareFilterQuery, setShareFilterQuery] = useState('');

  // Procedures
  const [proceduresList, setProceduresList] = useState<ProcedureRecord[]>([]);
  const [isLoadingProcedures, setIsLoadingProcedures] = useState(false);
  const [procedureFilter, setProcedureFilter] = useState<'ALL' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newProcPatientToken, setNewProcPatientToken] = useState('');
  const [newProcPatientName, setNewProcPatientName] = useState('');
  const [newProcName, setNewProcName] = useState('12-Lead Electrocardiogram (ECG)');
  const [newProcCategory, setNewProcCategory] = useState<'DIAGNOSTIC' | 'THERAPEUTIC' | 'SURGICAL' | 'AYUSH' | 'NURSING'>('DIAGNOSTIC');
  const [newProcDept, setNewProcDept] = useState('Cardiology');
  const [newProcNotes, setNewProcNotes] = useState('');
  const [isSubmittingProc, setIsSubmittingProc] = useState(false);

  // Hospital Affiliation
  const [hospitalRequests, setHospitalRequests] = useState<HospitalConnectionRequest[]>([]);
  const [hospitalsList, setHospitalsList] = useState<HospitalUser[]>([]);
  const [isLoadingAffiliations, setIsLoadingAffiliations] = useState(false);
  const [isAffiliationModalOpen, setIsAffiliationModalOpen] = useState(false);
  const [reqHospitalId, setReqHospitalId] = useState('');
  const [reqDept, setReqDept] = useState('Cardiology');
  const [isSubmittingAffiliation, setIsSubmittingAffiliation] = useState(false);

  // Load Queue on mount
  const loadQueue = async (scope = queueScope, docId = currentDoctor?.id) => {
    setIsLoading(true);
    try {
      const url = scope === 'MY_PATIENTS' && docId ? `/api/doctor/queue?doctorId=${docId}` : '/api/doctor/queue';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setIntakes(data);

        // If a specific patient ID was passed, auto-select it
        if (selectedPatientId) {
          const match = data.find(i => i.patientId === selectedPatientId || i.id === selectedPatientId);
          if (match) {
            setSelectedIntake(match);
            setActiveTab('queue');
          } else if (data.length > 0) {
            setSelectedIntake(data[0]);
          }
        } else if (!selectedIntake && data.length > 0) {
          setSelectedIntake(data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load doctor queue:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Load registered doctors
  const loadDoctors = async () => {
    try {
      const res = await fetch('/api/doctors');
      if (res.ok) {
        const docs: DoctorUser[] = await res.json();
        setDoctorsList(docs);
        if (docs.length > 0 && !currentDoctor) {
          setCurrentDoctor(docs[0]);
          setDoctorName(docs[0].fullName);
          loadQueue('MY_PATIENTS', docs[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load doctors:', e);
    }
  };

  // Load shared reports inbox
  const loadSharedReports = async (docId?: string) => {
    const id = docId || currentDoctor?.id;
    setIsLoadingShared(true);
    try {
      const url = id ? `/api/doctor/shared-reports?doctorId=${id}` : '/api/doctor/shared-reports';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSharedReports(data);
          if (data.length > 0 && !selectedShare) {
            handleSelectShare(data[0]);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load shared reports:', e);
    } finally {
      setIsLoadingShared(false);
    }
  };

  const handleSelectShare = async (share: ReportShare) => {
    setSelectedShare(share);
    setIsLoadingShareReport(true);
    // If status is DELIVERED, mark as VIEWED
    if (share.status === 'DELIVERED') {
      try {
        await fetch(`/api/reports/shares/${share.id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'VIEWED' }),
        });
        setSharedReports(prev => prev.map(s => (s.id === share.id ? { ...s, status: 'VIEWED' } : s)));
      } catch (e) {
        console.error('Failed to mark share as VIEWED:', e);
      }
    }

    try {
      const rRes = await fetch(`/api/patients/${share.patientId}/clinical-report`);
      if (rRes.ok) {
        const rData = await rRes.json();
        setSelectedShareReport(rData);
      } else {
        setSelectedShareReport(null);
      }
    } catch (e) {
      console.error('Failed to fetch shared report data:', e);
      setSelectedShareReport(null);
    } finally {
      setIsLoadingShareReport(false);
    }
  };

  const handleApproveSharedReport = async (notes: string) => {
    if (!selectedShareReport) return;
    try {
      const res = await fetch(`/api/clinical-reports/${selectedShareReport.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorNotes: notes,
          doctorName: currentDoctor?.fullName || doctorName,
          status: 'FINALIZED',
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedShareReport(updated);
        if (selectedShare) {
          await fetch(`/api/reports/shares/${selectedShare.id}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'REVIEWED' }),
          });
          setSharedReports(prev => prev.map(s => (s.id === selectedShare.id ? { ...s, status: 'REVIEWED' } : s)));
        }
        showToast('Shared pre-consultation report approved & finalized in ABDM.');
      }
    } catch (e) {
      console.error('Error approving shared report:', e);
    }
  };

  // Clinical Priority Score Doctor Override
  const handlePriorityOverride = async () => {
    if (!selectedIntake) return;
    setIsSubmittingOverride(true);
    try {
      const res = await fetch(`/api/intakes/${selectedIntake.id}/priority-override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newCategory: overrideCategory,
          doctorNotes: overrideNotes,
          doctorId: currentDoctor?.id || 'DOC-001',
          doctorName: currentDoctor?.fullName || doctorName,
        }),
      });
      const data = await res.json();
      if (data.success && data.priorityScore) {
        const updatedIntake = { ...selectedIntake, priorityScore: data.priorityScore };
        setSelectedIntake(updatedIntake);
        setIntakes(prev => prev.map(i => i.id === updatedIntake.id ? updatedIntake : i));
        if (currentReport) {
          setCurrentReport({ ...currentReport, priorityScore: data.priorityScore });
        }
        setIsOverrideModalOpen(false);
        setOverrideNotes('');
        showToast(`Clinical priority successfully updated to "${overrideCategory}" with doctor audit note.`);
      }
    } catch (err) {
      console.error('Failed to override priority:', err);
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  // Load procedures
  const loadProcedures = async () => {
    setIsLoadingProcedures(true);
    try {
      const res = await fetch('/api/procedures');
      if (res.ok) {
        const data = await res.json();
        setProceduresList(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load procedures:', e);
    } finally {
      setIsLoadingProcedures(false);
    }
  };

  // Create new procedure
  const handleScheduleProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcPatientToken.trim()) return;
    setIsSubmittingProc(true);
    try {
      const res = await fetch('/api/procedures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientToken: newProcPatientToken.trim(),
          patientName: newProcPatientName.trim() || 'Patient',
          procedureName: newProcName,
          category: newProcCategory,
          department: newProcDept,
          scheduledDate: new Date().toISOString(),
          orderedByDoctorId: currentDoctor?.id,
          orderedByDoctorName: currentDoctor?.fullName || doctorName,
          hospitalName: currentDoctor?.hospitalName || 'OPD Medical Center',
          notes: newProcNotes,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setProceduresList(prev => [created, ...prev]);
        setIsScheduleModalOpen(false);
        setNewProcPatientToken('');
        setNewProcPatientName('');
        setNewProcNotes('');
        showToast(`Procedure '${created.procedureName}' scheduled successfully.`);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to schedule procedure.');
      }
    } catch (e) {
      console.error('Error scheduling procedure:', e);
    } finally {
      setIsSubmittingProc(false);
    }
  };

  // Update procedure status
  const handleUpdateProcedureStatus = async (procId: string, newStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => {
    try {
      const res = await fetch(`/api/procedures/${procId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProceduresList(prev => prev.map(p => (p.id === procId ? updated : p)));
        showToast(`Procedure status updated to ${newStatus}.`);
      }
    } catch (e) {
      console.error('Failed to update procedure status:', e);
    }
  };

  // Load hospital affiliations
  const loadHospitalAffiliations = async () => {
    setIsLoadingAffiliations(true);
    try {
      const [reqsRes, hospsRes] = await Promise.all([
        fetch('/api/doctor/hospital-requests'),
        fetch('/api/hospitals'),
      ]);
      if (reqsRes.ok) {
        const data = await reqsRes.json();
        setHospitalRequests(Array.isArray(data) ? data : []);
      }
      if (hospsRes.ok) {
        const hData = await hospsRes.json();
        setHospitalsList(Array.isArray(hData) ? hData : []);
        if (hData.length > 0 && !reqHospitalId) {
          setReqHospitalId(hData[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load affiliations:', e);
    } finally {
      setIsLoadingAffiliations(false);
    }
  };

  // Request new hospital affiliation
  const handleRequestAffiliation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqHospitalId) return;
    setIsSubmittingAffiliation(true);
    try {
      const selectedHosp = hospitalsList.find(h => h.id === reqHospitalId);
      const res = await fetch('/api/doctor/hospital-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: reqHospitalId,
          hospitalName: selectedHosp?.name || 'Partner Hospital',
          department: reqDept,
          doctorName: currentDoctor?.fullName || doctorName,
          specialization: currentDoctor?.specialization || 'General Medicine',
          qualification: currentDoctor?.qualification || 'MBBS, MD',
          regNumber: currentDoctor?.registrationNumber || (currentDoctor as any)?.regNumber || 'NMC-2024-88912',
          experienceYears: currentDoctor?.experienceYears || 8,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setHospitalRequests(prev => [created, ...prev]);
        setIsAffiliationModalOpen(false);
        showToast(`Affiliation request sent to ${created.hospitalName}. Status: PENDING.`);
      }
    } catch (e) {
      console.error('Error submitting affiliation request:', e);
    } finally {
      setIsSubmittingAffiliation(false);
    }
  };

  // Switch active doctor
  const handleSwitchDoctor = (doc: DoctorUser) => {
    setCurrentDoctor(doc);
    setDoctorName(doc.fullName);
    setIsDoctorProfileModalOpen(false);
    showToast(`Switched active session to ${doc.fullName} (${doc.specialization})`);
    loadQueue(queueScope, doc.id);
    loadSharedReports(doc.id);
  };

  useEffect(() => {
    loadDoctors();
    loadQueue();
    loadSharedReports();
  }, [selectedPatientId]);

  useEffect(() => {
    if (activeTab === 'shared_reports') loadSharedReports();
    if (activeTab === 'procedures') loadProcedures();
    if (activeTab === 'hospital_affiliation') loadHospitalAffiliations();
  }, [activeTab]);

  // Sync selected intake notes
  useEffect(() => {
    if (selectedIntake) {
      setEditableNotes(selectedIntake.aiSummary?.doctorNotes || '');
      setIsEditingDraft(false);

      // Fetch structured clinical report if available
      fetch(`/api/patients/${selectedIntake.patientId}/clinical-report`)
        .then(r => (r.ok ? r.json() : null))
        .then(rep => setCurrentReport(rep))
        .catch(() => setCurrentReport(null));
    } else {
      setCurrentReport(null);
    }
  }, [selectedIntake]);

  // Handle Approve Clinical Report
  const handleApproveClinicalReport = async (notes: string) => {
    if (!currentReport) return;
    try {
      const res = await fetch(`/api/clinical-reports/${currentReport.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName,
          doctorNotes: notes,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentReport(updated);
        showToast('Pre-consultation clinical report approved and finalized in ABDM.');
        loadQueue();
      }
    } catch (err) {
      console.error('Failed to approve report:', err);
    }
  };

  // Handle Verify Summary
  const handleVerifySummary = async () => {
    if (!selectedIntake) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/doctor/intakes/${selectedIntake.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName,
          doctorNotes: editableNotes,
        }),
      });
      const updated = await res.json();
      setSelectedIntake(updated);
      showToast('Intake clinical summary verified and approved by physician.');
      loadQueue();
    } catch (e) {
      console.error('Verification failed:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Save Edited Draft
  const handleSaveDraft = async () => {
    if (!selectedIntake) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/doctor/intakes/${selectedIntake.id}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorNotes: editableNotes,
        }),
      });
      const updated = await res.json();
      setSelectedIntake(updated);
      setIsEditingDraft(false);
      showToast('Clinical draft notes updated.');
      loadQueue();
    } catch (e) {
      console.error('Draft update failed:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle HIS Dispatch
  const handleSyncHis = async () => {
    if (!selectedIntake) return;
    try {
      const res = await fetch(`/api/integration/his/${selectedIntake.id}`, { method: 'POST' });
      const data = await res.json();
      showToast(`Synchronized with Hospital Information System (Txn: ${data.hisTransactionId})`);
    } catch (e) {
      console.error('HIS sync failed:', e);
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Filter queue
  const filteredIntakes = intakes.filter(item => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.token.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.chiefComplaint.toLowerCase().includes(filterQuery.toLowerCase());

    if (!matchesSearch) return false;

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    if (!matchesStatus) return false;

    if (priorityCategoryFilter !== 'ALL') {
      const cat = item.priorityScore?.override?.newCategory || item.priorityScore?.category || (item.status === 'RED_FLAG' ? 'Urgent' : 'Routine');
      if (cat !== priorityCategoryFilter) return false;
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Toast alert */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 bg-teal-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs border border-teal-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Sub-Header / Doctor Workspace Navigation */}
      <div className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
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
          <Stethoscope className="w-4 h-4 text-teal-600" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
            {t.doctorWorkspaceNav || 'Physician Consultation Workspace'}
          </span>
          {/* Doctor Profile Pill & Switcher */}
          <button
            onClick={() => setIsDoctorProfileModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-[10px] font-mono font-bold text-slate-700 hover:text-teal-900 transition-all cursor-pointer"
            title="Click to switch doctor profile"
          >
            <UserCheck className="w-3 h-3 text-teal-600" />
            <span>{currentDoctor ? currentDoctor.fullName : doctorName}</span>
            {currentDoctor?.specialization && (
              <span className="text-slate-400">({currentDoctor.specialization})</span>
            )}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === 'queue' ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.patientQueue || 'Patient Queue'} ({intakes.length})
          </button>

          <button
            onClick={() => setActiveTab('shared_reports')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'shared_reports' ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.sharedReports || 'Shared Reports'}</span>
            {sharedReports.filter(s => s.status === 'DELIVERED').length > 0 ? (
              <span className="bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {sharedReports.filter(s => s.status === 'DELIVERED').length}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">({sharedReports.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('procedures')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'procedures' ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.proceduresOrders || 'Procedures & Orders'}</span>
            <span className="text-[10px] text-slate-400 font-mono">({proceduresList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hospital_affiliation')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'hospital_affiliation' ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.hospitalAffiliation || 'Hospital Affiliation'}</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === 'overview' ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.overview || 'Overview'}
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'alerts' ? 'bg-red-50 text-red-900 font-bold border border-red-200' : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>{t.priorityAlerts || 'Priority Alerts'} ({intakes.filter(i => i.status === 'RED_FLAG').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ayush')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
              activeTab === 'ayush' ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.ayushTab || 'AYUSH Module'}
          </button>
        </div>

        <button
          onClick={() => {
            loadQueue();
            loadSharedReports();
            loadProcedures();
            loadHospitalAffiliations();
          }}
          title={t.refreshData || 'Refresh All Data'}
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isLoadingShared ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* WORKSPACE VIEW: PATIENT QUEUE & SPLIT DETAIL */}
      {activeTab === 'queue' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Patient Queue List */}
          <div className="w-80 sm:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
            {/* Search & Filter */}
            <div className="p-3 border-b border-slate-200 space-y-2 bg-slate-50/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.searchQueuePlaceholder || 'Search token, name, or symptom...'}
                  value={filterQuery}
                  onChange={e => setFilterQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Queue Scope Switcher */}
              <div className="flex p-0.5 bg-slate-200/80 rounded-lg text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setQueueScope('MY_PATIENTS');
                    loadQueue('MY_PATIENTS', currentDoctor?.id);
                  }}
                  className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                    queueScope === 'MY_PATIENTS'
                      ? 'bg-white text-teal-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.myPatients || 'My Patients'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQueueScope('ALL');
                    loadQueue('ALL', currentDoctor?.id);
                  }}
                  className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                    queueScope === 'ALL'
                      ? 'bg-white text-teal-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.allOpdQueue || 'All OPD Queue'}
                </button>
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-1 text-[10px] font-bold">
                {(['ALL', 'RED_FLAG', 'READY_FOR_REVIEW', 'VERIFIED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-1 rounded transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-teal-700 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st === 'ALL'
                      ? (t.allFilter || 'All')
                      : st === 'RED_FLAG'
                      ? (t.alertsFilter || 'Alerts')
                      : st === 'READY_FOR_REVIEW'
                      ? (t.readyFilter || 'Ready')
                      : (t.verifiedFilter || 'Verified')}
                  </button>
                ))}
              </div>

              {/* Priority Stratification Filter */}
              <div className="flex items-center gap-1 text-[10px] font-bold pt-1 border-t border-slate-200/60">
                <span className="text-[9px] uppercase font-bold text-slate-400 mr-1">{t.riskLabel || 'Risk'}:</span>
                {(['ALL', 'Urgent', 'Priority', 'Routine'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPriorityCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                      priorityCategoryFilter === cat
                        ? cat === 'Urgent'
                          ? 'bg-rose-700 text-white font-black'
                          : cat === 'Priority'
                          ? 'bg-amber-600 text-white font-black'
                          : cat === 'Routine'
                          ? 'bg-emerald-700 text-white font-black'
                          : 'bg-slate-800 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'ALL'
                      ? (t.allFilter || 'All')
                      : cat === 'Urgent'
                      ? (t.urgentTier1 || 'Urgent')
                      : cat === 'Priority'
                      ? (t.priorityTier2 || 'Priority')
                      : (t.routineTier3 || 'Routine')}
                  </button>
                ))}
              </div>
            </div>

            {/* Queue Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredIntakes.map(item => {
                const isSelected = selectedIntake?.id === item.id;
                const isRedFlag = item.status === 'RED_FLAG';
                const isVerified = item.status === 'VERIFIED';
                const effectiveScore = item.priorityScore || calculateRiskStratificationScore({
                  chiefComplaint: item.chiefComplaint,
                  historyOfPresentIllness: item.historyOfPresentIllness,
                  redFlags: item.redFlags,
                  age: item.age,
                  pastMedicalHistory: item.pastMedicalHistory,
                  drugHistory: item.medications,
                  documents: item.documents,
                  vitals: item.vitals,
                });

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIntake(item)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-50/70 border-l-4 border-l-teal-600'
                        : 'hover:bg-slate-50'
                    } ${isRedFlag ? 'bg-red-50/30' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-black text-slate-900">
                          {item.token}
                        </span>
                        <RiskScoreBadge scoreData={effectiveScore} size="sm" />
                        {isRedFlag && (
                          <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-red-100 text-red-800 border border-red-200 animate-pulse">
                            RED FLAG
                          </span>
                        )}
                        {isVerified && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-green-100 text-green-800 border border-green-200">
                            VERIFIED
                          </span>
                        )}
                        {item.mode === 'ayush' && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-amber-100 text-amber-800">
                            AYUSH
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.createdAt.slice(11, 16)}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-slate-800">
                      {item.patientName} ({item.age}y, {item.gender[0]})
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.chiefComplaint || 'Awaiting complaint summary'}
                    </p>
                  </div>
                );
              })}

              {filteredIntakes.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matching patients in queue.
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Selected Patient Detail View */}
          {selectedIntake ? (
            <div className="flex-1 flex flex-col bg-white overflow-y-auto">
              {/* Patient Banner */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/40 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        {selectedIntake.patientName}
                      </h2>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                        {selectedIntake.token}
                      </span>
                      <span className="text-xs text-slate-500">
                        {selectedIntake.age} Years • {selectedIntake.gender}
                      </span>

                      {/* Clinical Priority Stratification Badge */}
                      <RiskScoreBadge
                        scoreData={
                          selectedIntake.priorityScore ||
                          calculateRiskStratificationScore({
                            chiefComplaint: selectedIntake.chiefComplaint,
                            historyOfPresentIllness: selectedIntake.historyOfPresentIllness,
                            redFlags: selectedIntake.redFlags,
                            age: selectedIntake.age,
                            pastMedicalHistory: selectedIntake.pastMedicalHistory,
                            drugHistory: selectedIntake.medications,
                            documents: selectedIntake.documents,
                            vitals: selectedIntake.vitals,
                          })
                        }
                        size="md"
                      />

                      {/* Override Button */}
                      <button
                        onClick={() => {
                          const currentCat = selectedIntake.priorityScore?.override?.newCategory || selectedIntake.priorityScore?.category || 'Priority';
                          setOverrideCategory(currentCat as any);
                          setOverrideNotes('');
                          setIsOverrideModalOpen(true);
                        }}
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-bold text-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                        title="Doctor Clinical Judgment Override for Priority Category"
                      >
                        <SlidersHorizontal className="w-3 h-3 text-slate-600" />
                        <span>{t.overridePriority || 'Override Risk'}</span>
                      </button>

                      {selectedIntake.status === 'RED_FLAG' && (
                        <span className="px-2 py-0.5 text-xs font-black uppercase rounded bg-red-600 text-white">
                          {t.priorityClinicalAlert || 'CRITICAL ALERT'}
                        </span>
                      )}
                      {selectedIntake.status === 'VERIFIED' && (
                        <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-green-600 text-white">
                          {t.verifiedByDoctor || 'VERIFIED BY PHYSICIAN'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Department: <strong className="text-slate-800">{selectedIntake.department}</strong> • Intake Session: <span className="font-mono">{selectedIntake.id}</span>
                      {selectedIntake.priorityScore?.override && (
                        <span className="ml-2 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                          Physician Override Active: {selectedIntake.priorityScore.override.doctorName}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Primary Action Controls for Physician */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Start Voice/Video Consultation */}
                    <button
                      onClick={() => setIsTeleconsultOpen(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Launch encrypted voice or video call with patient"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{t.teleconsult || 'Call Patient'}</span>
                    </button>

                    {/* Dispatch Emergency 108 */}
                    <button
                      onClick={() => setIsAmbulanceOpen(true)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Dispatch 108 Emergency Ambulance for patient"
                    >
                      <Siren className="w-3.5 h-3.5 animate-pulse" />
                      <span>{t.sosAmbulance || '108 Ambulance'}</span>
                    </button>

                    {/* Progress Report (Longitudinal Trends) */}
                    <button
                      onClick={() => setIsProgressReportOpen(true)}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="View Longitudinal Progress Report, Vitals Trends & Adherence"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t.dailyProgress || 'Progress Report'}</span>
                    </button>

                    <button
                      onClick={() => onViewFhir(selectedIntake.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
                    >
                      <FileCode className="w-3.5 h-3.5 text-teal-600" />
                      <span>FHIR R4 Bundle</span>
                    </button>

                    <button
                      onClick={handleSyncHis}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
                    >
                      <Building2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>{t.syncHis || 'Sync HIS'}</span>
                    </button>

                    {selectedIntake.status !== 'VERIFIED' && (
                      <button
                        onClick={handleVerifySummary}
                        disabled={isSaving}
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.verifyFinalize || 'Verify & Approve Summary'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Priority Red-Flag Banner inside Detail View */}
                {selectedIntake.redFlags && selectedIntake.redFlags.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-xl text-red-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <div>
                        <strong className="uppercase tracking-wide font-black">
                          {selectedIntake.redFlags[0].ruleTriggered}
                        </strong>
                        <p className="text-[11px] text-red-800 mt-0.5">
                          {selectedIntake.redFlags[0].symptomSummary}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-red-200 text-red-900 px-2 py-1 rounded font-bold uppercase">
                      Urgent Attention
                    </span>
                  </div>
                )}
              </div>

              {/* Sub-Tabs for Patient Detail */}
              <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-4 text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => setDetailTab('report')}
                  className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    detailTab === 'report' ? 'border-teal-600 text-teal-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>{t.structuredReportTab || 'Pre-Consultation Report'} {currentReport ? '(AI Ready)' : ''}</span>
                </button>
                <button
                  onClick={() => setDetailTab('summary')}
                  className={`py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    detailTab === 'summary' ? 'border-teal-600 text-teal-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.summaryTab || 'AI Clinical Summary & Review'}
                </button>
                <button
                  onClick={() => setDetailTab('history')}
                  className={`py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    detailTab === 'history' ? 'border-teal-600 text-teal-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.clinicalHistoryTab || 'Clinical History (HPI / PMH / Meds)'}
                </button>
                <button
                  onClick={() => setDetailTab('documents')}
                  className={`py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    detailTab === 'documents' ? 'border-teal-600 text-teal-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.documentsTab || 'Previous Documents & OCR'} ({selectedIntake.documents?.length || 0})
                </button>
                <button
                  onClick={() => setDetailTab('timeline')}
                  className={`py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    detailTab === 'timeline' ? 'border-teal-600 text-teal-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.timelineTab || 'Medical Timeline'} ({selectedIntake.timeline?.length || 0})
                </button>
                {selectedIntake.mode === 'ayush' && (
                  <button
                    onClick={() => setDetailTab('ayush')}
                    className={`py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                      detailTab === 'ayush' ? 'border-teal-600 text-teal-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t.ayushTab || 'AYUSH Dashavidha'}
                  </button>
                )}
              </div>

              {/* DETAIL CONTENT: STRUCTURED PRE-CONSULTATION REPORT */}
              {detailTab === 'report' && (
                <div className="p-6">
                  {currentReport ? (
                    <PreConsultationReportView
                      report={currentReport}
                      language={language}
                      isDoctorView={true}
                      onApproveByDoctor={handleApproveClinicalReport}
                    />
                  ) : (
                    <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700">No Structured Clinical Report Generated Yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        This patient can complete the AI Medical Clinical Interview at the MediKiosk to generate an ABDM-compliant intake report.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* DETAIL CONTENT: AI CLINICAL SUMMARY */}
              {detailTab === 'summary' && (
                <div className="p-6 space-y-6">
                  {/* Draft Notice vs Verified Notice */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 text-xs">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span className="font-bold text-slate-800">
                        {selectedIntake.status === 'VERIFIED'
                          ? `Physician Verified by ${selectedIntake.aiSummary.verifiedBy}`
                          : 'Pre-Consultation AI Draft (Doctor Verification Required)'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        v{selectedIntake.aiSummary?.version || 1}.0
                      </span>
                    </div>

                    {selectedIntake.status !== 'VERIFIED' && (
                      <button
                        onClick={() => setIsEditingDraft(!isEditingDraft)}
                        className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditingDraft ? 'Cancel Editing' : 'Edit Summary Draft'}</span>
                      </button>
                    )}
                  </div>

                  {/* Structured Clinical Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold uppercase text-slate-500 tracking-wider">Chief Complaint</span>
                      <p className="font-semibold text-slate-900 mt-1 text-sm">
                        {selectedIntake.aiSummary?.sections?.chiefComplaint || selectedIntake.chiefComplaint}
                      </p>
                      <span className="text-[10px] text-teal-700 italic mt-1 block">Source: Patient Verbal Intake</span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold uppercase text-slate-500 tracking-wider">History of Present Illness</span>
                      <p className="text-slate-800 mt-1 leading-relaxed">
                        {selectedIntake.aiSummary?.sections?.historyOfPresentIllness || selectedIntake.historyOfPresentIllness}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold uppercase text-slate-500 tracking-wider">Active Medications</span>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-800">
                        {selectedIntake.medications?.length ? (
                          selectedIntake.medications.map((m, i) => (
                            <li key={i}>{m.name} {m.dosage} ({m.frequency})</li>
                          ))
                        ) : (
                          <li>None reported</li>
                        )}
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold uppercase text-slate-500 tracking-wider">Drug Allergies</span>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-800">
                        {selectedIntake.allergies?.length ? (
                          selectedIntake.allergies.map((a, i) => (
                            <li key={i} className="text-red-700 font-semibold">{a.substance} ({a.reaction || 'Allergy'})</li>
                          ))
                        ) : (
                          <li>No known drug allergies reported</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Physician Notes & Edit Box */}
                  <div className="p-4 bg-teal-50/40 border border-teal-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-teal-900 tracking-wider">
                        Attending Physician Clinical Notes & Additions
                      </span>
                      {isEditingDraft && (
                        <button
                          onClick={handleSaveDraft}
                          disabled={isSaving}
                          className="flex items-center gap-1 px-3 py-1 bg-teal-600 text-white rounded text-xs font-bold hover:bg-teal-700"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save Changes</span>
                        </button>
                      )}
                    </div>

                    <textarea
                      rows={3}
                      disabled={!isEditingDraft && selectedIntake.status === 'VERIFIED'}
                      value={editableNotes}
                      onChange={e => setEditableNotes(e.target.value)}
                      placeholder="Doctor may append examination findings, differential diagnosis, or modified regimen here..."
                      className="w-full p-3 bg-white border border-teal-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800"
                    />
                  </div>

                  {/* Source Traceability Table */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 block">
                      Source Attribution & Clinical Evidence
                    </span>
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      {selectedIntake.aiSummary?.sources?.map((s, i) => (
                        <div key={i} className="flex items-start justify-between py-1 border-b border-slate-100 last:border-0">
                          <span className="font-medium text-slate-800">{s.statement}</span>
                          <span className="text-teal-700 font-mono bg-teal-50 px-1.5 py-0.5 rounded text-[10px]">
                            {s.source}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* DETAIL CONTENT: CLINICAL HISTORY */}
              {detailTab === 'history' && (
                <div className="p-6 space-y-4 text-xs">
                  {/* Pharmacology Surveillance & Interactions */}
                  <DrugInteractionPanel
                    alerts={checkMedicationSafety(
                      selectedIntake.medications || [],
                      (selectedIntake.allergies || []).map(a => a.substance)
                    )}
                  />

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h4 className="font-bold text-slate-900 uppercase mb-1">Past Medical History</h4>
                    <p className="text-slate-700 leading-relaxed">{selectedIntake.pastMedicalHistory || 'None reported'}</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h4 className="font-bold text-slate-900 uppercase mb-1">Past Surgical History</h4>
                    <p className="text-slate-700 leading-relaxed">{selectedIntake.pastSurgicalHistory || 'None reported'}</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h4 className="font-bold text-slate-900 uppercase mb-1">Family History</h4>
                    <p className="text-slate-700 leading-relaxed">{selectedIntake.familyHistory || 'None reported'}</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h4 className="font-bold text-slate-900 uppercase mb-1">Personal & Social History</h4>
                    <p className="text-slate-700 leading-relaxed">{selectedIntake.personalHistory || 'None reported'}</p>
                  </div>
                </div>
              )}

              {/* DETAIL CONTENT: DOCUMENTS & OCR */}
              {detailTab === 'documents' && (
                <div className="p-6 space-y-4 text-xs">
                  {selectedIntake.documents && selectedIntake.documents.length > 0 ? (
                    selectedIntake.documents.map((doc, idx) => (
                      <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{doc.name}</span>
                          <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                            {doc.type}
                          </span>
                        </div>
                        <p className="text-slate-500">Facility: {doc.facility || 'Clinical OPD'} • Prescriber: {doc.doctor || 'Attending Physician'}</p>
                        
                        <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700 space-y-1">
                          <p><strong>Extracted Diagnosis:</strong> {doc.extractedEntities.diagnosis || 'Digitized Record'}</p>
                          {doc.extractedEntities.medications?.length ? (
                            <p><strong>Prescribed Medications:</strong> {doc.extractedEntities.medications.map(m => `${m.name} ${m.dosage}`).join(', ')}</p>
                          ) : null}
                          {doc.extractedEntities.labTests?.length ? (
                            <p><strong>Laboratory Findings:</strong> {doc.extractedEntities.labTests.map(l => `${l.testName}: ${l.value} ${l.unit}`).join('; ')}</p>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      No previous documents attached to this intake session.
                    </div>
                  )}
                </div>
              )}

              {/* DETAIL CONTENT: TIMELINE */}
              {detailTab === 'timeline' && (
                <div className="p-6 space-y-4 text-xs">
                  <LongitudinalContinuityTimeline
                    events={buildLongitudinalTimeline(
                      {
                        id: selectedIntake.patientId,
                        token: selectedIntake.token,
                        name: selectedIntake.patientName,
                        age: selectedIntake.age,
                        gender: selectedIntake.gender,
                        phone: selectedIntake.patientPhone,
                        registeredAt: selectedIntake.createdAt,
                      },
                      selectedIntake,
                      currentReport,
                      selectedIntake.documents
                    )}
                  />
                </div>
              )}

              {/* DETAIL CONTENT: AYUSH DASHAVIDHA PARIKSHA */}
              {detailTab === 'ayush' && (
                <div className="p-6 space-y-4 text-xs">
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl">
                    <h3 className="font-bold text-amber-900 uppercase text-sm mb-2">
                      Dashavidha Pariksha (Tenfold Ayurvedic Assessment)
                    </h3>
                    <p className="text-slate-600 text-xs mb-4">
                      Captured via MediKiosk guided Ayurvedic module following Ministry of Ayush & AIIA clinical protocols.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-amber-200">
                        <span className="font-bold text-amber-900 uppercase text-[10px]">1. Prakriti (Constitution)</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedIntake.ayushData?.prakriti || 'Kapha-Vata'}</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200">
                        <span className="font-bold text-amber-900 uppercase text-[10px]">2. Agni (Digestive Fire)</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedIntake.ayushData?.agni || 'Manda Agni (Sluggish)'}</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200">
                        <span className="font-bold text-amber-900 uppercase text-[10px]">3. Koshtha (Bowel Habit)</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedIntake.ayushData?.koshtha || 'Krura Koshtha (Hard/Dry)'}</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200">
                        <span className="font-bold text-amber-900 uppercase text-[10px]">4. Ahara Shakti (Digestive Capacity)</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedIntake.ayushData?.aharaShakti || 'Avara (Reduced)'}</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200">
                        <span className="font-bold text-amber-900 uppercase text-[10px]">5. Nidana (Causative Factors)</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedIntake.ayushData?.nidana || 'Vishamashana, irregular meal timings'}</p>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200">
                        <span className="font-bold text-amber-900 uppercase text-[10px]">6. Samprapti (Pathogenesis)</span>
                        <p className="text-slate-800 font-semibold mt-0.5">{selectedIntake.ayushData?.samprapti || 'Agnimandya with Ama accumulation in Annavaha Srotas'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-sm">
              Select a patient from the queue to review pre-consultation summary.
            </div>
          )}
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-xs uppercase font-bold text-slate-500">Patients Today</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{intakes.length}</p>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-xs uppercase font-bold text-amber-600">Awaiting Doctor Review</span>
              <p className="text-3xl font-black text-amber-600 mt-1">
                {intakes.filter(i => i.status === 'READY_FOR_REVIEW').length}
              </p>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-xs uppercase font-bold text-red-600">Priority Red Flags</span>
              <p className="text-3xl font-black text-red-600 mt-1">
                {intakes.filter(i => i.status === 'RED_FLAG').length}
              </p>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-xs uppercase font-bold text-teal-600">Verified & Approved</span>
              <p className="text-3xl font-black text-teal-600 mt-1">
                {intakes.filter(i => i.status === 'VERIFIED').length}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3">Patients Requiring Immediate Attention</h3>
            <div className="divide-y divide-slate-100">
              {intakes.filter(i => i.status === 'RED_FLAG' || i.status === 'READY_FOR_REVIEW').map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900 mr-2">{item.token}</span>
                    <span className="font-bold text-sm text-slate-800">{item.patientName}</span>
                    <span className="text-xs text-slate-500 ml-2">({item.chiefComplaint})</span>
                  </div>
                  <button
                    onClick={() => { setSelectedIntake(item); setActiveTab('queue'); }}
                    className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700"
                  >
                    Open Case
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRIORITY ALERTS TAB */}
      {activeTab === 'alerts' && (
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-4 max-w-5xl mx-auto w-full">
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-xs">
            <h3 className="font-bold text-sm mb-1">Critical Red-Flag Clinical Queue</h3>
            <p>
              Cases triggered by acute chest pain, neurological deficit, or severe dyspnea rules requiring immediate triage.
            </p>
          </div>

          <div className="space-y-3">
            {intakes.filter(i => i.status === 'RED_FLAG').map(item => (
              <div key={item.id} className="p-5 bg-white border border-red-300 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-black text-sm text-red-700">{item.token}</span>
                    <span className="font-bold text-base text-slate-900">{item.patientName}</span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold uppercase">
                      CRITICAL
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{item.chiefComplaint}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Triggered: {item.redFlags?.[0]?.ruleTriggered || 'Acute symptom pattern'}
                  </p>
                </div>

                <button
                  onClick={() => { setSelectedIntake(item); setActiveTab('queue'); }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Review Priority Case
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AYUSH TAB */}
      {activeTab === 'ayush' && (
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              All India Institute of Ayurveda (AIIA) - Clinical Protocol
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              MediKiosk integrates standard Ayurvedic Rogi Roga Pariksha, focusing on Dashavidha Pariksha (Prakriti, Vikriti, Sara, Samhanana, Pramana, Satmya, Sattva, Ahara Shakti, Vyayama Shakti, Vaya) alongside Agni and Koshtha evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Agni Assessment</h4>
              <p className="text-xs text-slate-500">
                Evaluates Mandagni, Tikshnagni, Vishamagni, and Samagni through patient intake questions.
              </p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Koshtha Assessment</h4>
              <p className="text-xs text-slate-500">
                Determines Krura, Mridu, or Madhyama bowel tendencies to aid prescribing and Virechana suitability.
              </p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <h4 className="font-bold text-slate-900 text-sm mb-1">FHIR Ayurvedic Extension</h4>
              <p className="text-xs text-slate-500">
                Maps Prakriti and Dosha observations into standard Observation resources with Ayush terminology codes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SHARED REPORTS INBOX TAB */}
      {activeTab === 'shared_reports' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Shared Reports List */}
          <div className="w-80 sm:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200 space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Shared Reports Inbox
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {sharedReports.length} Received
                </span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient, complaint, token..."
                  value={shareFilterQuery}
                  onChange={e => setShareFilterQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {isLoadingShared ? (
                <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Loading shared cases...</span>
                </div>
              ) : sharedReports.length === 0 ? (
                <div className="py-16 px-6 text-center text-slate-400 space-y-2">
                  <Inbox className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">Inbox is empty</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Patients who complete triage at the MediKiosk and select &quot;Send to Doctor&quot; will have their pre-consultation reports delivered directly here.
                  </p>
                </div>
              ) : (
                sharedReports
                  .filter(s => {
                    const q = shareFilterQuery.toLowerCase();
                    return (
                      s.patientName.toLowerCase().includes(q) ||
                      s.patientToken.toLowerCase().includes(q) ||
                      s.chiefComplaint.toLowerCase().includes(q)
                    );
                  })
                  .map(share => {
                    const isSelected = selectedShare?.id === share.id;
                    const isDelivered = share.status === 'DELIVERED';
                    const isHigh = share.triagePriority === 'HIGH';

                    return (
                      <div
                        key={share.id}
                        onClick={() => handleSelectShare(share)}
                        className={`p-4 transition-all cursor-pointer border-l-4 text-xs space-y-1.5 ${
                          isSelected
                            ? 'bg-teal-50/70 border-teal-600'
                            : isDelivered
                            ? 'bg-amber-50/40 border-amber-500 hover:bg-slate-50'
                            : 'border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900">{share.patientToken}</span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${
                              share.status === 'REVIEWED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : share.status === 'VIEWED'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : 'bg-amber-50 text-amber-900 border-amber-400 animate-pulse'
                            }`}
                          >
                            {share.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{share.patientName}</span>
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                              isHigh ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {share.triagePriority}
                          </span>
                        </div>

                        <p className="text-slate-600 font-semibold line-clamp-1">{share.chiefComplaint}</p>

                        {share.patientNotes && (
                          <p className="text-[11px] text-teal-800 bg-teal-50/80 px-2 py-1 rounded-lg border border-teal-100 italic">
                            &quot;{share.patientNotes}&quot;
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>Sent: {new Date(share.sharedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>{share.hospitalName || 'OPD'}</span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Right Panel: Full Report View */}
          <div className="flex-1 bg-slate-50 overflow-y-auto p-6">
            {isLoadingShareReport ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                <span>Loading pre-consultation case report...</span>
              </div>
            ) : selectedShareReport ? (
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Direct Patient Transmission</span>
                    <span className="text-slate-500">• Received from MediKiosk Terminal</span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">
                    Delivered: {selectedShare?.sharedAt ? new Date(selectedShare.sharedAt).toLocaleString() : ''}
                  </span>
                </div>

                <PreConsultationReportView
                  report={selectedShareReport}
                  language={language}
                  isDoctorView={true}
                  onApproveByDoctor={handleApproveSharedReport}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <FileText className="w-12 h-12 text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">No report selected</p>
                <p className="text-xs text-slate-400 max-w-sm text-center">
                  Select a shared report from the inbox on the left to review the structured intake and sign off.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CLINICAL PROCEDURES TAB */}
      {activeTab === 'procedures' && (
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-900">Clinical Procedures & Diagnostic Orders</h2>
              <p className="text-xs text-slate-500">Schedule, monitor, and record findings for diagnostic and therapeutic orders</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {(['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setProcedureFilter(f)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      procedureFilter === f ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f === 'ALL' ? 'All' : f.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Procedure</span>
              </button>
            </div>
          </div>

          {/* Procedures List */}
          {isLoadingProcedures ? (
            <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>Loading procedures...</span>
            </div>
          ) : proceduresList.length === 0 ? (
            <div className="py-16 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 space-y-2">
              <CheckSquare className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">No clinical procedures scheduled</p>
              <p className="text-xs text-slate-400">Click &quot;Schedule Procedure&quot; to order diagnostics or therapy for active OPD patients.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proceduresList
                .filter(p => (procedureFilter === 'ALL' ? true : p.status === procedureFilter))
                .map(proc => (
                  <div key={proc.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {proc.category} • {proc.department}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{proc.procedureName}</h4>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${
                          proc.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : proc.status === 'IN_PROGRESS'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {proc.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase block">Patient</span>
                        <span className="font-bold text-slate-800">{proc.patientName}</span>
                        <span className="font-mono text-slate-500 text-[11px] block">{proc.patientToken}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase block">Ordered By</span>
                        <span className="font-semibold text-slate-800">{proc.orderedByDoctorName}</span>
                        <span className="text-[11px] text-slate-500 block">{proc.hospitalName || 'OPD'}</span>
                      </div>
                    </div>

                    {proc.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {proc.notes}
                      </p>
                    )}

                    {/* Status Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(proc.scheduledDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {proc.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleUpdateProcedureStatus(proc.id, 'IN_PROGRESS')}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Start Procedure
                          </button>
                        )}
                        {proc.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleUpdateProcedureStatus(proc.id, 'COMPLETED')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Mark Completed
                          </button>
                        )}
                        {proc.status === 'COMPLETED' && (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* HOSPITAL AFFILIATION TAB */}
      {activeTab === 'hospital_affiliation' && (
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
          {/* Active Doctor Hospital Profile Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 font-black text-base">
                  {currentDoctor?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{currentDoctor?.fullName || doctorName}</h3>
                  <p className="text-xs text-teal-800 font-semibold">{currentDoctor?.specialization} • {currentDoctor?.qualification}</p>
                  <p className="text-[11px] text-slate-400">NMC Registration: {currentDoctor?.registrationNumber || (currentDoctor as any)?.regNumber} • {currentDoctor?.experienceYears || 8} Yrs Experience</p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Licensed Medical Practitioner</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                  Affiliated: {currentDoctor?.hospitalName || 'AIIMS Hospital'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Primary Hospital</span>
                <span className="font-bold text-slate-900 text-sm">{currentDoctor?.hospitalName || 'AIIMS, New Delhi'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">OPD Department</span>
                <span className="font-bold text-slate-900 text-sm">{currentDoctor?.specialization || 'Cardiology'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">ABDM Health Professional Registry</span>
                <span className="font-mono text-emerald-800 font-bold">HPR-IND-2024-VERIFIED</span>
              </div>
            </div>
          </div>

          {/* Connection Requests History */}
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hospital Affiliation Requests</h3>
                <p className="text-xs text-slate-500">Credentials submitted for hospital medical board verification</p>
              </div>

              <button
                onClick={() => setIsAffiliationModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Request Affiliation</span>
              </button>
            </div>

            {isLoadingAffiliations ? (
              <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                <span>Loading affiliations...</span>
              </div>
            ) : hospitalRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No active hospital connection requests found. Click &quot;Request Affiliation&quot; to apply.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {hospitalRequests.map(req => (
                  <div key={req.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{req.hospitalName}</span>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          Dept: {req.department}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Submitted: {new Date(req.requestedAt).toLocaleDateString()}
                        {req.decidedAt && ` • Decided: ${new Date(req.decidedAt).toLocaleDateString()}`}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : req.status === 'REJECTED'
                          ? 'bg-red-50 text-red-800 border-red-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCTOR PROFILE / SWITCHER MODAL */}
      {isDoctorProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Switch Doctor Profile</h3>
              </div>
              <button
                onClick={() => setIsDoctorProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select a registered attending physician to view their assigned consultations and shared reports:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {doctorsList.map(doc => {
                const isActive = currentDoctor?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSwitchDoctor(doc)}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer text-xs flex items-center justify-between ${
                      isActive
                        ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{doc.fullName}</span>
                      <span className="text-teal-800 font-semibold text-[11px] block">{doc.specialization}</span>
                      <span className="text-slate-500 text-[10px]">{doc.hospitalName || 'OPD Medical Wing'} • Reg: {doc.registrationNumber || (doc as any)?.regNumber}</span>
                    </div>

                    {isActive && (
                      <span className="px-2 py-0.5 bg-teal-600 text-white text-[10px] font-bold rounded-lg uppercase">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsDoctorProfileModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE PROCEDURE MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Schedule Clinical Procedure</h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleProcedure} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Patient Token # *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., T-101 or P-001"
                  value={newProcPatientToken}
                  onChange={e => setNewProcPatientToken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Patient Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Patient Name"
                  value={newProcPatientName}
                  onChange={e => setNewProcPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                    Category
                  </label>
                  <select
                    value={newProcCategory}
                    onChange={e => setNewProcCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="DIAGNOSTIC">Diagnostic</option>
                    <option value="THERAPEUTIC">Therapeutic</option>
                    <option value="SURGICAL">Surgical</option>
                    <option value="AYUSH">AYUSH Panchakarma</option>
                    <option value="NURSING">Nursing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newProcDept}
                    onChange={e => setNewProcDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Procedure Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProcName}
                  onChange={e => setNewProcName(e.target.value)}
                  placeholder="e.g., 12-Lead ECG, Spirometry, Ultrasound Abdomen"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Preparation & Clinical Instructions
                </label>
                <textarea
                  rows={2}
                  value={newProcNotes}
                  onChange={e => setNewProcNotes(e.target.value)}
                  placeholder="e.g., Patient must be fasting for 6 hours; stat ECG"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProc}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  {isSubmittingProc ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST AFFILIATION MODAL */}
      {isAffiliationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Request Hospital Affiliation</h3>
              </div>
              <button
                onClick={() => setIsAffiliationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestAffiliation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Select Hospital *
                </label>
                <select
                  value={reqHospitalId}
                  onChange={e => setReqHospitalId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {hospitalsList.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Department
                </label>
                <input
                  type="text"
                  required
                  value={reqDept}
                  onChange={e => setReqDept(e.target.value)}
                  placeholder="e.g., Cardiology, General Medicine, Pulmonology"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                <p>
                  <strong>Doctor:</strong> {currentDoctor?.fullName || doctorName}
                </p>
                <p>
                  <strong>NMC Reg:</strong> {currentDoctor?.registrationNumber || (currentDoctor as any)?.regNumber || 'NMC-2024-88912'}
                </p>
                <p>
                  <strong>Specialization:</strong> {currentDoctor?.specialization || 'Cardiology'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAffiliationModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAffiliation}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  {isSubmittingAffiliation ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCTOR CLINICAL PRIORITY OVERRIDE MODAL */}
      {isOverrideModalOpen && selectedIntake && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Physician Risk Priority Override</h3>
              </div>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-600">Patient: <strong className="text-slate-900">{selectedIntake.patientName}</strong> ({selectedIntake.token})</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  AI Stratification Score: <strong>{selectedIntake.priorityScore?.score ?? 45}/100</strong> • Current Category: <span className="font-bold text-teal-700">{selectedIntake.priorityScore?.override?.newCategory || selectedIntake.priorityScore?.category || 'Routine'}</span>
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1.5">
                  Select Reclassified Clinical Priority *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Urgent', 'Priority', 'Routine'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setOverrideCategory(cat)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                        overrideCategory === cat
                          ? cat === 'Urgent'
                            ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-300'
                            : cat === 'Priority'
                            ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-300'
                            : 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs">{cat}</div>
                      <div className="text-[9px] font-normal text-slate-500 mt-0.5">
                        {cat === 'Urgent' ? 'Immediate Attn' : cat === 'Priority' ? 'Within 30m' : 'Standard'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                  Physician Clinical Justification & Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideNotes}
                  onChange={e => setOverrideNotes(e.target.value)}
                  placeholder="State clinical observation, updated vitals, or specific pathology motivating this priority change..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  This override will be logged in the immutable ABDM audit trail under Dr. {currentDoctor?.fullName || doctorName}.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingOverride || !overrideNotes.trim()}
                  onClick={handlePriorityOverride}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isSubmittingOverride ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording Override...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Audit Override</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCTOR LONGITUDINAL PROGRESS REPORT MODAL */}
      {isProgressReportOpen && selectedIntake && (
        <DoctorProgressReportModal
          patientId={selectedIntake.patientId || selectedIntake.id}
          onClose={() => setIsProgressReportOpen(false)}
        />
      )}

      {/* TELEMEDICINE CONSULTATION MODAL */}
      {selectedIntake && (
        <TeleconsultationModal
          isOpen={isTeleconsultOpen}
          onClose={() => setIsTeleconsultOpen(false)}
          patientName={selectedIntake.patientName}
          patientId={selectedIntake.patientId}
          report={currentReport || undefined}
        />
      )}

      {/* EMERGENCY 108 AMBULANCE DISPATCH MODAL */}
      {selectedIntake && (
        <AmbulanceDispatchModal
          isOpen={isAmbulanceOpen}
          onClose={() => setIsAmbulanceOpen(false)}
          patientName={selectedIntake.patientName}
          patientId={selectedIntake.patientId}
          patientPhone={selectedIntake.patientPhone || '+91 98765 43210'}
          defaultEmergencyType={selectedIntake.chiefComplaint}
          priority={selectedIntake.status === 'RED_FLAG' ? 'CRITICAL' : 'URGENT'}
        />
      )}
    </div>
  );
};
