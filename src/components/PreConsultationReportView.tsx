import React, { useState, useEffect } from 'react';
import { ClinicalReport, Language, DoctorUser, ReportShare, Medication, Allergy } from '../types';
import {
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  Stethoscope,
  Building2,
  Calendar,
  Sparkles,
  Download,
  Share2,
  ArrowRight,
  Edit3,
  Save,
  Check,
  HeartPulse,
  Send,
  Search,
  X,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Video,
  Siren,
  Lock,
  Activity,
  FileCheck,
} from 'lucide-react';
import { searchDoctors, fetchDoctorsDirectory, DoctorSearchResult } from '../services/doctorSearchService';
import { deliverReportToDoctor } from '../services/reportDeliveryService';
import { updateReportField } from '../services/reportAnalysisService';
import { RiskScoreBadge } from './RiskScoreBadge';
import { LongitudinalContinuityTimeline } from './LongitudinalContinuityTimeline';
import { DrugInteractionPanel } from './DrugInteractionPanel';
import { TeleconsultationModal } from './TeleconsultationModal';
import { AmbulanceDispatchModal } from './AmbulanceDispatchModal';
import { PostMedicationFeedbackModal } from './PostMedicationFeedbackModal';
import { PrivacyArchitectureModal } from './PrivacyArchitectureModal';
import { buildLongitudinalTimeline } from '../services/continuityService';
import { calculateRiskStratificationScore } from '../services/riskStratificationService';
import { checkMedicationSafety } from '../services/drugSafetyService';

interface PreConsultationReportViewProps {
  report: ClinicalReport;
  language: Language;
  onProceedToDoctor?: () => void;
  isDoctorView?: boolean;
  onApproveByDoctor?: (notes: string) => Promise<void>;
  onRegenerateReport?: () => void;
}

export const PreConsultationReportView: React.FC<PreConsultationReportViewProps> = ({
  report: initialReport,
  language,
  onProceedToDoctor,
  isDoctorView = false,
  onApproveByDoctor,
  onRegenerateReport,
}) => {
  const [report, setReport] = useState<ClinicalReport>(initialReport);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmedReadyToSend, setIsConfirmedReadyToSend] = useState(false);

  // Editable drafts
  const [draftCC, setDraftCC] = useState(report.chiefComplaint);
  const [draftOnset, setDraftOnset] = useState(report.hpiDetails?.onset || '');
  const [draftSeverity, setDraftSeverity] = useState(report.hpiDetails?.severity || '');
  const [draftRadiation, setDraftRadiation] = useState(report.hpiDetails?.radiation || '');
  const [draftMeds, setDraftMeds] = useState<Medication[]>([...report.drugHistory]);
  const [draftAllergies, setDraftAllergies] = useState<Allergy[]>([...report.allergies]);
  const [draftPastHistory, setDraftPastHistory] = useState<string>(report.pastMedicalHistory.join(', '));

  // New item inputs
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newAllergySubstance, setNewAllergySubstance] = useState('');

  // Doctor sign-off
  const [doctorNotes, setDoctorNotes] = useState(report.doctorNotes || '');
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(report.status === 'FINALIZED');

  // Send to Doctor Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [doctorsList, setDoctorsList] = useState<DoctorUser[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // User input filters (Doctor Name & Hospital / Clinic Name)
  const [searchDoctorName, setSearchDoctorName] = useState('');
  const [searchHospitalName, setSearchHospitalName] = useState('');
  const [searchResults, setSearchResults] = useState<DoctorSearchResult[]>([]);

  // Doctor selection & confirmation state (NEVER default to first doctor!)
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorUser | null>(null);
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);
  const [patientNote, setPatientNote] = useState('');
  const [isSendingShare, setIsSendingShare] = useState(false);
  const [sharesList, setSharesList] = useState<any[]>(report.sharedWith || []);
  const [shareSuccessToast, setShareSuccessToast] = useState<string | null>(null);

  // Expanded profile state in search list
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  // New modules dialogs
  const [isTeleconsultOpen, setIsTeleconsultOpen] = useState(false);
  const [isAmbulanceOpen, setIsAmbulanceOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  // Keep internal report in sync if prop changes
  useEffect(() => {
    setReport(initialReport);
    setDraftCC(initialReport.chiefComplaint);
    setDraftOnset(initialReport.hpiDetails?.onset || '');
    setDraftSeverity(initialReport.hpiDetails?.severity || '');
    setDraftRadiation(initialReport.hpiDetails?.radiation || '');
    setDraftMeds([...initialReport.drugHistory]);
    setDraftAllergies([...initialReport.allergies]);
    setDraftPastHistory(initialReport.pastMedicalHistory.join(', '));
  }, [initialReport]);

  // Load registered doctors when opening share modal
  const openShareModal = async () => {
    setIsShareModalOpen(true);
    setSelectedDoctor(null);
    setShowSendConfirmation(false);
    setIsLoadingDoctors(true);

    try {
      const docs = await fetchDoctorsDirectory();
      setDoctorsList(docs);
      // Run initial search with empty or current queries
      const results = searchDoctors(docs, {
        doctorName: searchDoctorName,
        hospitalName: searchHospitalName,
      });
      setSearchResults(results);

      // Check existing shares
      const sharesRes = await fetch(`/api/reports/${report.id}/shares`);
      if (sharesRes.ok) {
        const sData = await sharesRes.json();
        if (Array.isArray(sData) && sData.length > 0) {
          setSharesList(sData);
        }
      }
    } catch (e) {
      console.error('Failed to load doctors list:', e);
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  // Perform search matching Doctor Name AND Hospital Name
  const handlePerformSearch = () => {
    const results = searchDoctors(doctorsList, {
      doctorName: searchDoctorName,
      hospitalName: searchHospitalName,
    });
    setSearchResults(results);
    setSelectedDoctor(null);
    setShowSendConfirmation(false);
  };

  // Auto-filter as user types
  useEffect(() => {
    if (doctorsList.length > 0) {
      const results = searchDoctors(doctorsList, {
        doctorName: searchDoctorName,
        hospitalName: searchHospitalName,
      });
      setSearchResults(results);
    }
  }, [searchDoctorName, searchHospitalName, doctorsList]);

  // Save reviewed & edited report
  const handleSaveEdits = () => {
    const updated = updateReportField(report, {
      chiefComplaint: draftCC,
      hpiDetails: {
        ...(report.hpiDetails || {
          duration: 'Acute onset',
          progression: 'Stable',
          character: 'Ache / Discomfort',
          location: 'Local / Generalized',
          aggravating: 'Physical exertion',
          relieving: 'Rest',
          associatedSymptoms: 'None reported',
        }),
        onset: draftOnset,
        severity: draftSeverity,
        radiation: draftRadiation,
      },
      drugHistory: draftMeds.length > 0 ? draftMeds : [{ name: 'None reported', dosage: '-', frequency: '-' }],
      allergies: draftAllergies.length > 0 ? draftAllergies : [{ substance: 'No known drug allergies reported', reaction: '-' }],
      pastMedicalHistory: draftPastHistory.split(',').map(s => s.trim()).filter(Boolean),
    });

    setReport(updated);
    setIsEditing(false);
    setIsConfirmedReadyToSend(true);
  };

  const handleConfirmReport = () => {
    setIsEditing(false);
    setIsConfirmedReadyToSend(true);
  };

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    setDraftMeds([
      ...draftMeds.filter(m => !m.name.toLowerCase().includes('none')),
      { name: newMedName.trim(), dosage: newMedDose.trim() || 'As prescribed', frequency: 'Daily', source: 'Patient verified' },
    ]);
    setNewMedName('');
    setNewMedDose('');
  };

  const handleRemoveMedication = (index: number) => {
    setDraftMeds(draftMeds.filter((_, i) => i !== index));
  };

  const handleAddAllergy = () => {
    if (!newAllergySubstance.trim()) return;
    setDraftAllergies([
      ...draftAllergies.filter(a => !a.substance.toLowerCase().includes('no known')),
      { substance: newAllergySubstance.trim(), reaction: 'Patient verified allergy', source: 'Patient reported' },
    ]);
    setNewAllergySubstance('');
  };

  const handleRemoveAllergy = (index: number) => {
    setDraftAllergies(draftAllergies.filter((_, i) => i !== index));
  };

  // Deliver report to selected doctor
  const handleConfirmAndSend = async () => {
    if (!selectedDoctor) return;
    setIsSendingShare(true);

    try {
      const res = await deliverReportToDoctor(report, selectedDoctor, patientNote);
      if (res.success) {
        const updatedShares = [
          {
            id: res.shareId,
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.fullName,
            hospitalName: selectedDoctor.hospitalName,
            status: 'DELIVERED',
            sharedAt: new Date().toISOString(),
          },
          ...sharesList.filter(s => s.doctorId !== selectedDoctor.id),
        ];
        setSharesList(updatedShares);
        setShareSuccessToast(`Delivered to ${selectedDoctor.fullName} (${selectedDoctor.hospitalName || 'OPD'}). Status: DELIVERED`);
        setIsShareModalOpen(false);
        setSelectedDoctor(null);
        setShowSendConfirmation(false);
        setPatientNote('');
        setTimeout(() => setShareSuccessToast(null), 6000);
      }
    } catch (err) {
      console.error('Failed to deliver report:', err);
    } finally {
      setIsSendingShare(false);
    }
  };

  const handleDownloadSummary = () => {
    const textContent = `
MEDIKIOSK PRE-CONSULTATION CLINICAL REPORT
Report ID: ${report.id}
Generated: ${new Date(report.generatedAt).toLocaleString()}
Triage Priority: ${report.triagePriority}

PATIENT DEMOGRAPHICS
Name: ${report.demographics.name}
Age / Gender: ${report.demographics.age} Y / ${report.demographics.gender}
Token: ${report.demographics.token}
ABHA: ${report.demographics.abhaAddress || 'Not linked'}
Phone: ${report.demographics.phone || 'N/A'}

CHIEF COMPLAINT: ${report.chiefComplaint}
HISTORY OF PRESENT ILLNESS:
${report.historyOfPresentIllness}

MEDICATIONS:
${report.drugHistory.map(m => `- ${m.name} (${m.dosage}) ${m.frequency || ''}`).join('\n') || 'None reported'}

KNOWN ALLERGIES:
${report.allergies.map(a => `- ${a.substance}: ${a.reaction || 'Hypersensitivity'}`).join('\n') || 'No known allergies (NKDA)'}

PAST MEDICAL & SURGICAL:
${report.pastMedicalHistory.join(', ') || 'None reported'}

FAMILY HISTORY:
${report.familyHistory.map(f => `${f.relationship}: ${f.condition}`).join('; ') || 'Non-contributory'}

PHYSICIAN HIGHLIGHTS:
${report.summary.quickClinicalSummary}

DISCLAIMER: ${report.disclaimer || 'AI-generated clinical intake summary. Must be verified by a licensed physician.'}
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediKiosk_Report_${report.demographics.token || report.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleApprove = async () => {
    if (!onApproveByDoctor) return;
    setIsApproving(true);
    try {
      await onApproveByDoctor(doctorNotes);
      setIsApproved(true);
    } catch (e) {
      console.error('Failed to approve report:', e);
    } finally {
      setIsApproving(false);
    }
  };

  const isHighPriority = report.triagePriority === 'HIGH';

  const effectivePriorityScore = report.priorityScore || calculateRiskStratificationScore({
    chiefComplaint: report.chiefComplaint,
    historyOfPresentIllness: report.historyOfPresentIllness,
    redFlags: report.redFlags,
    age: report.demographics.age,
    pastMedicalHistory: report.pastMedicalHistory,
    drugHistory: report.drugHistory,
    documents: report.documents,
  });

  const effectiveDrugAlerts = report.drugSafetyAlerts && report.drugSafetyAlerts.length > 0
    ? report.drugSafetyAlerts
    : checkMedicationSafety(report.drugHistory, report.allergies.map(a => a.substance));

  const timelineEvents = buildLongitudinalTimeline(
    {
      id: report.patientId,
      token: report.demographics.token,
      name: report.demographics.name,
      age: report.demographics.age,
      gender: report.demographics.gender,
      abhaId: report.demographics.abhaAddress,
      phone: report.demographics.phone,
      registeredAt: report.generatedAt,
    },
    null,
    report,
    report.documents
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Toast Notification */}
      {shareSuccessToast && (
        <div className="p-3 bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg animate-fade-in print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{shareSuccessToast}</span>
          </div>
          <button onClick={() => setShareSuccessToast(null)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* REPORT REVIEW & VERIFICATION BANNER (BEFORE SENDING) */}
      {!isDoctorView && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs print:hidden space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isConfirmedReadyToSend 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {isConfirmedReadyToSend ? <CheckCircle2 className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isConfirmedReadyToSend ? 'Report Ready to Send' : 'Review Clinical Report Before Sending'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isConfirmedReadyToSend
                    ? 'All medical intake details confirmed. You can now select and route this report to your doctor.'
                    : 'Please review your symptoms, medications, and allergies. You can edit or remove any incorrect item.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Report</span>
                  </button>

                  {!isConfirmedReadyToSend ? (
                    <button
                      onClick={handleConfirmReport}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Report</span>
                    </button>
                  ) : (
                    <button
                      onClick={openShareModal}
                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Report to Doctor</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdits}
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Confirm</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOP ACTION BAR (Print, Download, Send to Doctor, Calls, Risk Score) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900">Pre-Consultation Clinical Record</h4>
              <RiskScoreBadge scoreData={effectivePriorityScore} size="sm" />
            </div>
            <p className="text-[10px] text-slate-500">ID: {report.id} • Triage: {report.triagePriority}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Teleconsultation Trigger */}
          <button
            onClick={() => setIsTeleconsultOpen(true)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Start secure encrypted voice or video consultation with doctor"
          >
            <Video className="w-3.5 h-3.5 text-indigo-600" />
            <span>Call Doctor</span>
          </button>

          {/* Emergency 108 Dispatch Trigger */}
          <button
            onClick={() => setIsAmbulanceOpen(true)}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Rapid Emergency Medical Dispatch"
          >
            <Siren className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>108 Ambulance</span>
          </button>

          {/* Post-Medication Follow-Up */}
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Submit adherence and symptom progression after medication"
          >
            <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
            <span>Follow-Up</span>
          </button>

          {/* Privacy Indicator */}
          <button
            onClick={() => setIsPrivacyOpen(true)}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
            title="View Edge Voice, Zero Retention, and DPDPA Compliance specifications"
          >
            <Lock className="w-3 h-3 text-teal-600" />
            <span>Edge Privacy</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadSummary}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {!isDoctorView && (
            <button
              onClick={openShareModal}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send to Doctor</span>
            </button>
          )}

          {sharesList.length > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Sent to {sharesList[0].doctorName || 'Doctor'}</span>
            </div>
          )}
        </div>
      </div>

      {/* EDITABLE REVIEW FORM (When isEditing is true) */}
      {isEditing && (
        <div className="p-5 bg-teal-50/40 rounded-3xl border-2 border-teal-300 shadow-xs space-y-4 text-xs animate-fade-in print:hidden">
          <div className="flex items-center justify-between pb-2 border-b border-teal-200">
            <span className="font-bold uppercase tracking-wider text-teal-900">
              Edit & Correct Intake Details
            </span>
            <span className="text-[11px] text-teal-700">Patient Self-Verification Mode</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Chief Complaint:</label>
              <input
                type="text"
                value={draftCC}
                onChange={e => setDraftCC(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Onset / Duration:</label>
              <input
                type="text"
                value={draftOnset}
                onChange={e => setDraftOnset(e.target.value)}
                placeholder="e.g., Started 3 days ago"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Severity / Pain Scale:</label>
              <input
                type="text"
                value={draftSeverity}
                onChange={e => setDraftSeverity(e.target.value)}
                placeholder="e.g., Moderate (5/10) or Severe"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Radiation / Location:</label>
              <input
                type="text"
                value={draftRadiation}
                onChange={e => setDraftRadiation(e.target.value)}
                placeholder="e.g., Radiating to left arm or None"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Edit Medications */}
          <div className="pt-2 border-t border-teal-200/60">
            <span className="font-bold text-slate-800 uppercase text-[10px] block mb-2">Active Medications:</span>
            <div className="space-y-1.5 mb-2">
              {draftMeds.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">{m.name} ({m.dosage})</span>
                  <button
                    onClick={() => handleRemoveMedication(idx)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Medication name (e.g., Telmisartan)"
                value={newMedName}
                onChange={e => setNewMedName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none"
              />
              <input
                type="text"
                placeholder="Dose (e.g., 40mg OD)"
                value={newMedDose}
                onChange={e => setNewMedDose(e.target.value)}
                className="w-32 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none"
              />
              <button
                onClick={handleAddMedication}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Edit Allergies */}
          <div className="pt-2 border-t border-teal-200/60">
            <span className="font-bold text-slate-800 uppercase text-[10px] block mb-2">Known Allergies:</span>
            <div className="space-y-1.5 mb-2">
              {draftAllergies.map((a, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-red-50 text-red-900 rounded-xl border border-red-200">
                  <span className="font-bold">{a.substance} ({a.reaction || 'Allergy'})</span>
                  <button
                    onClick={() => handleRemoveAllergy(idx)}
                    className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Allergy substance (e.g., Penicillin)"
                value={newAllergySubstance}
                onChange={e => setNewAllergySubstance(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none"
              />
              <button
                onClick={handleAddAllergy}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Allergy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLINICAL REPORT MAIN PAPER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 text-slate-800 font-sans print:shadow-none print:border-none print:p-0">
        {/* REPORT HEADER */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[10px] font-bold uppercase tracking-wider">
                ABDM / FHIR R4 Format
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isHighPriority ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-slate-100 text-slate-700'
              }`}>
                Triage: {report.triagePriority}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pre-Consultation Clinical Intake Summary
            </h1>
            <p className="text-xs text-slate-500">
              Prepared by MediKiosk AI Clinical Intake • MediKiosk OPD Triage Engine
            </p>
          </div>

          <div className="text-right text-xs space-y-0.5 text-slate-500">
            <div><span className="font-bold text-slate-800">Token:</span> {report.demographics.token}</div>
            <div><span className="font-bold text-slate-800">Date:</span> {new Date(report.generatedAt).toLocaleDateString()}</div>
            <div><span className="font-bold text-slate-800">Status:</span> {report.status}</div>
          </div>
        </div>

        {/* SECTION 1: PATIENT DEMOGRAPHICS */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Patient Name</span>
            <span className="font-bold text-slate-900 text-sm">{report.demographics.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Age / Gender</span>
            <span className="font-bold text-slate-900">{report.demographics.age} Y / {report.demographics.gender}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">ABHA Address</span>
            <span className="font-bold text-slate-900 font-mono text-[11px]">{report.demographics.abhaAddress || 'Not linked'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Contact Phone</span>
            <span className="font-bold text-slate-900">{report.demographics.phone || 'N/A'}</span>
          </div>
        </div>

        {/* RED FLAGS ALERT BANNER IF PRESENT */}
        {report.redFlags && report.redFlags.length > 0 && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>SAFETY RED FLAGS IDENTIFIED FOR IMMEDIATE CLINICAL TRIAGE:</span>
            </div>
            <ul className="list-disc pl-5 text-xs text-red-800 font-semibold space-y-0.5">
              {report.redFlags.map((r, idx) => (
                <li key={idx}>{r.ruleTriggered} - {r.actionRequired || 'Physician urgent review'}</li>
              ))}
            </ul>
          </div>
        )}

        {/* SECTION 2: CHIEF COMPLAINT & HPI */}
        <div className="space-y-3 text-xs">
          <div>
            <span className="font-black uppercase tracking-wider text-slate-400 block text-[10px] mb-1">
              Chief Complaint (CC)
            </span>
            <p className="text-sm font-bold text-slate-900">
              {report.chiefComplaint}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="font-black uppercase tracking-wider text-slate-400 block text-[10px]">
              History of Present Illness (HPI Narrative)
            </span>
            <p className="text-slate-800 leading-relaxed">
              {report.historyOfPresentIllness}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
              <div>
                <span className="text-slate-400 block">Onset:</span>
                <span className="font-bold text-slate-800">{report.hpiDetails?.onset || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Severity:</span>
                <span className="font-bold text-slate-800">{report.hpiDetails?.severity || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Character:</span>
                <span className="font-bold text-slate-800">{report.hpiDetails?.character || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Radiation:</span>
                <span className="font-bold text-red-700">{report.hpiDetails?.radiation || 'None reported'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: MEDICATIONS & ALLERGIES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase tracking-wider text-slate-400 text-[10px]">
                Active Medications ({report.drugHistory.length})
              </span>
              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                Patient Verified
              </span>
            </div>
            {report.drugHistory.length === 0 ? (
              <p className="text-slate-400 italic">No active medications reported</p>
            ) : (
              <div className="space-y-1">
                {report.drugHistory.map((m, idx) => (
                  <div key={idx} className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{m.name}</span>
                      <span className="text-[10px] text-slate-500">{m.dosage} • {m.frequency || 'Daily'}</span>
                    </div>
                    {m.source && (
                      <span className="text-[9px] bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded border border-teal-200">
                        {m.source}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="font-black uppercase tracking-wider text-slate-400 text-[10px] block">
              Known Drug Allergies ({report.allergies.length})
            </span>
            {report.allergies.length === 0 ? (
              <p className="text-slate-400 italic">No known drug allergies (NKDA)</p>
            ) : (
              <div className="space-y-1">
                {report.allergies.map((a, idx) => (
                  <div key={idx} className="p-2 bg-red-50 text-red-900 rounded-xl border border-red-200 font-semibold">
                    ⚠️ {a.substance} ({a.reaction || 'Hypersensitivity'})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: PAST MEDICAL, SURGICAL & FAMILY */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
              Past Medical & Surgical History
            </span>
            <p className="font-semibold text-slate-800">
              {report.pastMedicalHistory.length > 0 ? report.pastMedicalHistory.join(', ') : 'None reported'}
            </p>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase mb-1">
              Family & Lifestyle
            </span>
            <p className="font-semibold text-slate-800">
              Diet: {report.personalHistory?.diet || 'Regular'} • Sleep: {report.personalHistory?.sleep || 'Normal'}
            </p>
          </div>
        </div>

        {/* SECTION 5: AYUSH ASSESSMENT IF PRESENT */}
        {report.ayurvedaAssessment && (
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2 text-xs">
            <span className="font-black uppercase tracking-wider text-amber-900 block">
              Ayush Assessment (All India Institute of Ayurveda Parameters)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-amber-800 block font-semibold">Prakriti (Constitution):</span>
                <span className="font-bold text-slate-900">{report.ayurvedaAssessment.prakriti || 'Pitta-Kapha'}</span>
              </div>
              <div>
                <span className="text-amber-800 block font-semibold">Agni (Digestive Fire):</span>
                <span className="font-bold text-slate-900">{report.ayurvedaAssessment.agni || 'Manda / Sluggish'}</span>
              </div>
              <div>
                <span className="text-amber-800 block font-semibold">Koshtha (Bowel Habit):</span>
                <span className="font-bold text-slate-900">{report.ayurvedaAssessment.koshtha || 'Madhyama'}</span>
              </div>
              <div>
                <span className="text-amber-800 block font-semibold">Nidana (Causative Factors):</span>
                <span className="font-bold text-slate-900">{report.ayurvedaAssessment.nidana || 'Dietary irregularity'}</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: KEY CLINICAL POINTS FOR PHYSICIAN */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="font-bold uppercase tracking-wider text-teal-300">
              Pre-Consultation Highlights for Attending Physician
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {report.summary.quickClinicalSummary}
          </p>
          <ul className="list-disc pl-4 space-y-1 text-slate-300 pt-1">
            {report.summary.keyPointsForDoctor.map((pt, idx) => (
              <li key={idx}>{pt}</li>
            ))}
          </ul>
        </div>

        {/* SECTION 7: PHYSICIAN REVIEW & SIGN-OFF (FOR DOCTOR WORKSPACE) */}
        {isDoctorView && (
          <div className="p-5 bg-teal-50/60 border-2 border-teal-300 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-teal-950 text-sm">Physician Review & Clinical Sign-Off</h3>
              </div>
              <span className="text-[10px] font-bold text-teal-800 bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                Medical Officer Sign-off
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Doctor Consultation Notes & Additions:
              </label>
              <textarea
                rows={2}
                value={doctorNotes}
                onChange={e => setDoctorNotes(e.target.value)}
                placeholder="Enter attending doctor notes, provisional diagnosis, or adjusted care plan..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 italic">
                By approving, this report status changes from Draft to Finalized in ABDM.
              </span>

              <button
                onClick={handleApprove}
                disabled={isApproving || isApproved}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                {isApproving ? (
                  <span>Saving...</span>
                ) : isApproved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Report Approved & Finalized</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Approve & Finalize Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* LEGAL & ETHICAL DISCLAIMER */}
        <div className="pt-4 border-t border-slate-200 text-center space-y-1">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            {report.disclaimer}
          </p>
          <p className="text-[10px] text-slate-400">
            AarogyaSetu HealthOS / MediKiosk • Smart India Hackathon 2026 • PS-26047 Patient Case-Taking Software
          </p>
        </div>
      </div>

      {/* DRUG INTERACTION & CONTINUITY SAFETY PANEL */}
      <div className="print:hidden">
        <DrugInteractionPanel alerts={effectiveDrugAlerts} />
      </div>

      {/* LONGITUDINAL CONTINUITY TIMELINE */}
      <div className="print:hidden">
        <LongitudinalContinuityTimeline events={timelineEvents} />
      </div>

      {/* TELEMEDICINE CONSULTATION MODAL */}
      <TeleconsultationModal
        isOpen={isTeleconsultOpen}
        onClose={() => setIsTeleconsultOpen(false)}
        patientName={report.demographics.name}
        patientId={report.patientId}
        report={report}
      />

      {/* EMERGENCY 108 AMBULANCE DISPATCH MODAL */}
      <AmbulanceDispatchModal
        isOpen={isAmbulanceOpen}
        onClose={() => setIsAmbulanceOpen(false)}
        patientName={report.demographics.name}
        patientId={report.patientId}
        patientPhone={report.demographics.phone}
        defaultEmergencyType={report.chiefComplaint}
        priority={isHighPriority ? 'CRITICAL' : 'URGENT'}
      />

      {/* POST-MEDICATION ADHERENCE & FEEDBACK MODAL */}
      <PostMedicationFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        patientId={report.patientId}
        patientName={report.demographics.name}
      />

      {/* PRIVACY-PRESERVING ARCHITECTURE MODAL */}
      <PrivacyArchitectureModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* SEND REPORT TO DOCTOR MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Send Report to Doctor</h3>
                  <p className="text-[11px] text-slate-500">Search verified physician by name and hospital</p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SEND CONFIRMATION SCREEN (When a doctor is selected) */}
            {showSendConfirmation && selectedDoctor ? (
              <div className="space-y-4 py-2 text-xs">
                <div className="p-4 bg-teal-50/70 border-2 border-teal-400 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
                    <span>Confirm Report Delivery</span>
                  </div>
                  <p className="text-slate-700 font-medium">
                    You are about to send your clinical intake report to:
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-1">
                    <h4 className="font-black text-slate-900 text-sm">{selectedDoctor.fullName}</h4>
                    <p className="text-teal-800 font-bold text-[11px]">{selectedDoctor.specialization}</p>
                    <p className="text-slate-600 text-[11px] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedDoctor.hospitalName || 'Outpatient Clinic'}</span>
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      {selectedDoctor.city}, {selectedDoctor.state} • Reg: {selectedDoctor.registrationNumber}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Optional Note for Doctor:
                  </label>
                  <textarea
                    rows={2}
                    value={patientNote}
                    onChange={e => setPatientNote(e.target.value)}
                    placeholder="e.g., Symptoms worse at night, attaching ECG for review..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setShowSendConfirmation(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAndSend}
                    disabled={isSendingShare}
                    className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    {isSendingShare ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Report...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Confirm & Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* DOCTOR SEARCH & LIST SCREEN */
              <>
                {/* Search Inputs: Doctor Name and Hospital / Clinic Name */}
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Doctor Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Ananya Sharma"
                      value={searchDoctorName}
                      onChange={e => setSearchDoctorName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Hospital / Clinic Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ABC Multispeciality Hospital"
                      value={searchHospitalName}
                      onChange={e => setSearchHospitalName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    onClick={handlePerformSearch}
                    className="w-full py-2 bg-slate-100 hover:bg-teal-50 text-teal-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-200 hover:border-teal-300 transition-all cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-teal-600" />
                    <span>Search Doctor Directory</span>
                  </button>
                </div>

                {/* Matching Doctor Cards */}
                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-64 pr-1">
                  {isLoadingDoctors ? (
                    <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                      <span>Loading registered doctors...</span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No matching doctors found. Please check spelling of Doctor Name or Hospital.
                    </div>
                  ) : (
                    searchResults.map(doc => {
                      const isExpanded = expandedDocId === doc.id;
                      return (
                        <div
                          key={doc.id}
                          className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-400 bg-white shadow-xs space-y-2 text-xs transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-slate-900 text-xs sm:text-sm">{doc.fullName}</h4>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
                                  <ShieldCheck className="w-3 h-3" /> Verified Doctor
                                </span>
                              </div>
                              <p className="text-teal-800 font-bold text-[11px]">{doc.specialization}</p>
                              <p className="text-slate-600 text-[11px] flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{doc.hospitalName || 'Outpatient Clinic'}</span>
                              </p>
                              <p className="text-slate-400 text-[10px]">
                                {doc.city}, {doc.state}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedDoctor(doc);
                                setShowSendConfirmation(true);
                              }}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 shadow-xs cursor-pointer transition-all"
                            >
                              <span>Send Clinical Report</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          {/* View Profile details toggle */}
                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <button
                              onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                              className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isExpanded ? 'Hide Profile' : 'View Profile'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            <span className="text-slate-400">Reg: {doc.registrationNumber} • {doc.experienceYears || 5}+ yrs exp</span>
                          </div>

                          {isExpanded && (
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1 animate-fade-in">
                              <p><span className="font-bold">Qualification:</span> {doc.qualification}</p>
                              <p><span className="font-bold">Council:</span> {doc.council || 'State Medical Council'}</p>
                              {doc.bio && <p className="italic text-slate-500">{doc.bio}</p>}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setIsShareModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
