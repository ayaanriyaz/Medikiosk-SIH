import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ReferralRecord, HealthcareFacility } from '../types';
import {
  GitFork,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  FileText,
  User,
  Send,
  Plus,
  Search,
  Filter,
  Stethoscope,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

interface ReferralManagementViewProps {
  onSelectPatient?: (patientId: string) => void;
  userRole?: 'DOCTOR' | 'STAFF' | 'PATIENT' | 'ADMIN';
}

export const ReferralManagementView: React.FC<ReferralManagementViewProps> = ({
  onSelectPatient,
  userRole = 'DOCTOR',
}) => {
  const { isMarathi, isHindi } = useLanguage();
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Referral Form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('32');
  const [newPatientGender, setNewPatientGender] = useState('Female');
  const [newPatientPhone, setNewPatientPhone] = useState('+91 98220 54321');
  const [newDestFacilityId, setNewDestFacilityId] = useState('FAC-SGH-PUNE');
  const [newSpecialty, setNewSpecialty] = useState('High-Risk Obstetrics');
  const [newPriority, setNewPriority] = useState<'CRITICAL' | 'URGENT' | 'PRIORITY' | 'ROUTINE'>('URGENT');
  const [newReason, setNewReason] = useState('');
  const [newDiagnostics, setNewDiagnostics] = useState('Complete Hemogram, Liver Function Tests');

  const fetchReferrals = async () => {
    setIsLoading(true);
    try {
      const [refRes, facRes] = await Promise.all([
        fetch('/api/rural/referrals'),
        fetch('/api/rural/facilities'),
      ]);
      const refData = await refRes.json();
      const facData = await facRes.json();
      if (refData.status === 'success') setReferrals(refData.referrals || []);
      if (facData.status === 'success') setFacilities(facData.facilities || []);
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string, outcomeSummary?: string, counterAdvice?: string) => {
    try {
      const res = await fetch(`/api/rural/referrals/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          outcomeSummary,
          counterReferralAdvice: counterAdvice,
          doctorName: 'Dr. Ananya Deshmukh',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchReferrals();
      }
    } catch (err) {
      console.error('Update referral status error:', err);
    }
  };

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newReason.trim()) {
      alert('Please provide patient name and clinical reason');
      return;
    }

    const destFacility = facilities.find(f => f.id === newDestFacilityId);

    try {
      const res = await fetch('/api/rural/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: newPatientName,
          patientAge: parseInt(newPatientAge) || 30,
          patientGender: newPatientGender,
          patientPhone: newPatientPhone,
          referringFacilityId: 'FAC-PHC-BHOR',
          referringFacilityName: 'Bhor Primary Health Centre (PHC)',
          referringDoctorName: 'Dr. Ananya Deshmukh (Medical Officer)',
          destinationFacilityId: newDestFacilityId,
          destinationFacilityName: destFacility?.name || 'Sassoon General Hospital & B.J. Medical College, Pune',
          destinationDepartment: newSpecialty,
          specialty: newSpecialty,
          clinicalReason: newReason,
          priority: newPriority,
          requiredDiagnostics: newDiagnostics.split(',').map(s => s.trim()).filter(Boolean),
          referralNotes: 'Initial referral via MediKiosk Rural Connected Care Platform.',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setIsCreateModalOpen(false);
        setNewPatientName('');
        setNewReason('');
        fetchReferrals();
      }
    } catch (err) {
      console.error('Create referral error:', err);
    }
  };

  const filteredReferrals = referrals.filter(ref => {
    if (activeStatusFilter !== 'ALL' && ref.status !== activeStatusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ref.patientName.toLowerCase().includes(q) ||
        ref.id.toLowerCase().includes(q) ||
        ref.specialty.toLowerCase().includes(q) ||
        ref.destinationFacilityName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CREATED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-300">CREATED</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">ACCEPTED</span>;
      case 'IN_TRANSIT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
            <Truck className="w-3 h-3 animate-bounce" /> IN TRANSIT
          </span>
        );
      case 'ARRIVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-300">ARRIVED</span>;
      case 'CONSULTATION_COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">COMPLETED</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-300">RETURNED TO PHC</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
              <GitFork className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {isMarathi
                    ? 'संदर्भ सेवा व रुग्ण सातत्य व्यवस्थापन (Referral Tracking)'
                    : isHindi
                    ? 'रेफरल एवं निरंतर देखभाल प्रबंधन'
                    : 'Rural Referral & Care Continuity Network'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Level 1 → Level 3 Linked
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {isMarathi
                  ? 'उपकेंद्र → प्राथमिक आरोग्य केंद्र → ग्रामीण रुग्णालय → जिल्हा रुग्णालय (औंध) → ससून रुग्णालय (पुणे)'
                  : 'Sub-Centre → PHC → Rural Hospital → District Hospital (Aundh) → Sassoon General Hospital (Pune)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchReferrals}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isMarathi ? 'रीफ्रेश' : 'Refresh'}
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              {isMarathi ? 'नवीन संदर्भ तयार करा' : isHindi ? 'नया रेफरल बनाएं' : 'Create New Referral'}
            </button>
          </div>
        </div>

        {/* Counter-referral loop explanation card */}
        <div className="mt-5 p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-indigo-700 mt-0.5 shrink-0" />
          <div className="text-xs text-indigo-950 leading-relaxed font-medium">
            <strong>
              {isMarathi ? 'काउंटर-रेफरल सुरक्षितता चक्र:' : 'Counter-Referral Care Loop:'}
            </strong>{' '}
            {isMarathi
              ? 'मोठ्या रुग्णालयात (उदा. ससून किंवा औंध) उपचार पूर्ण झाल्यानंतर डॉक्टरांचे डिस्चार्ज व पुढील औषधोपचार मूळ प्राथमिक आरोग्य केंद्राला आणि स्थानिक आशा ताईला डिजिटल स्वरूपात प्राप्त होतात.'
              : 'When patients complete specialist care at tertiary hospitals (Sassoon/District Hospital), counter-referral treatment advice automatically syncs back to their local PHC medical officer and ASHA worker for community follow-up.'}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
            {['ALL', 'IN_TRANSIT', 'ACCEPTED', 'CONSULTATION_COMPLETED'].map(st => (
              <button
                key={st}
                onClick={() => setActiveStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeStatusFilter === st ? 'bg-indigo-700 text-white shadow-xs' : 'hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? (isMarathi ? 'सर्व संदर्भ' : 'All') : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isMarathi ? 'रुग्ण, आयडी किंवा रुग्णालय शोधा...' : 'Search patient, ID, or hospital...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Referrals Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReferrals.map(ref => (
          <div
            key={ref.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {ref.id}
                </span>
                <span className="text-base font-black text-slate-900">{ref.patientName}</span>
                <span className="text-xs text-slate-500 font-semibold">
                  ({ref.patientAge}y / {ref.patientGender}) • {ref.patientPhone}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    ref.priority === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : ref.priority === 'URGENT'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {ref.priority}
                </span>
                {getStatusBadge(ref.status)}
              </div>
            </div>

            {/* Facility Path: From -> To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {isMarathi ? 'पाठवणारे केंद्र (Referring Centre)' : 'Originating Facility'}
                </div>
                <div className="font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  {ref.referringFacilityName}
                </div>
                <div className="text-slate-600 mt-0.5">Doctor: {ref.referringDoctorName}</div>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200/80">
                <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                  {isMarathi ? 'संदर्भ रुग्णालय व विभाग (Destination)' : 'Destination Specialist Center'}
                </div>
                <div className="font-extrabold text-indigo-950 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                  {ref.destinationFacilityName}
                </div>
                <div className="text-indigo-800 mt-0.5">Specialty: {ref.specialty}</div>
              </div>
            </div>

            {/* Clinical Reason & Diagnostics */}
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="font-bold text-slate-700">{isMarathi ? 'वैद्यकीय कारण:' : 'Clinical Reason:'} </span>
                <span className="text-slate-900 font-medium">{ref.clinicalReason}</span>
              </div>
              {ref.requiredDiagnostics && ref.requiredDiagnostics.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-slate-500 font-semibold">{isMarathi ? 'आवश्यक तपासण्या:' : 'Required Labs:'}</span>
                  {ref.requiredDiagnostics.map((d, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-800">
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Counter-referral instructions if completed */}
            {ref.counterReferralAdvice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  {isMarathi ? 'ससून रुग्णालयाकडून प्राप्त काउंटर-रेफरल सल्ला:' : 'Specialist Counter-Referral Advice Received:'}
                </div>
                <div className="text-emerald-950">{ref.counterReferralAdvice}</div>
                {ref.outcomeSummary && (
                  <div className="text-emerald-800 font-medium pt-1">
                    Outcome: {ref.outcomeSummary}
                  </div>
                )}
              </div>
            )}

            {/* Status Lifecycle Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">
                Created on: {new Date(ref.createdAt).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-1.5">
                {ref.status === 'CREATED' && (
                  <button
                    onClick={() => handleUpdateStatus(ref.id, 'ACCEPTED')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    Accept Referral
                  </button>
                )}

                {ref.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus(ref.id, 'IN_TRANSIT')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Truck className="w-3.5 h-3.5" /> Start Transit (108)
                  </button>
                )}

                {ref.status === 'IN_TRANSIT' && (
                  <button
                    onClick={() => handleUpdateStatus(ref.id, 'ARRIVED')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    Confirm Patient Arrival
                  </button>
                )}

                {ref.status === 'ARRIVED' && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        ref.id,
                        'CONSULTATION_COMPLETED',
                        'Specialist review and intervention completed at Tertiary Center.',
                        'Discharged back to PHC Bhor for weekly blood pressure and glucose monitoring.'
                      )
                    }
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    Complete & Issue Counter-Referral
                  </button>
                )}

                {onSelectPatient && (
                  <button
                    onClick={() => onSelectPatient(ref.patientId)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    View Patient Record
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Referral Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {isMarathi ? 'नवीन संदर्भ नोंदवा (Create Referral)' : 'Create Clinical Referral'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={newPatientName}
                    onChange={e => setNewPatientName(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newPatientPhone}
                    onChange={e => setNewPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    value={newPatientAge}
                    onChange={e => setNewPatientAge(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={newPatientGender}
                    onChange={e => setNewPatientGender(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:outline-none"
                  >
                    <option value="CRITICAL">Critical (108 Ambulance)</option>
                    <option value="URGENT">Urgent (Within 24h)</option>
                    <option value="PRIORITY">Priority (Scheduled)</option>
                    <option value="ROUTINE">Routine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination Facility</label>
                <select
                  value={newDestFacilityId}
                  onChange={e => setNewDestFacilityId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none"
                >
                  <option value="FAC-SGH-PUNE">Sassoon General Hospital & B.J. Medical College, Pune</option>
                  <option value="FAC-DH-AUNDH">District Hospital Aundh, Pune</option>
                  <option value="FAC-RH-BHOR">Bhor Rural Hospital</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Specialty / Department</label>
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={e => setNewSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Reason for Referral</label>
                <textarea
                  required
                  rows={3}
                  value={newReason}
                  onChange={e => setNewReason(e.target.value)}
                  placeholder="Detail primary clinical findings, treatment administered, and reason for tertiary referral..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Required Diagnostics (comma separated)</label>
                <input
                  type="text"
                  value={newDiagnostics}
                  onChange={e => setNewDiagnostics(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-extrabold shadow-md shadow-indigo-200"
                >
                  Create & Transmit Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
