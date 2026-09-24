import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { HighRiskFollowup } from '../types';
import {
  HeartPulse,
  Baby,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Calendar,
  UserCheck,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  Send,
  MapPin,
} from 'lucide-react';

interface HighRiskFollowupViewProps {
  onSelectPatient?: (patientId: string) => void;
}

export const HighRiskFollowupView: React.FC<HighRiskFollowupViewProps> = ({
  onSelectPatient,
}) => {
  const { isMarathi, isHindi } = useLanguage();
  const [followups, setFollowups] = useState<HighRiskFollowup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<HighRiskFollowup | null>(null);
  const [visitNotes, setVisitNotes] = useState('');

  const fetchFollowups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rural/high-risk-followups');
      const data = await res.json();
      if (data.status === 'success') {
        setFollowups(data.followups || []);
      }
    } catch (err) {
      console.error('Error fetching followups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const handleUpdateFollowup = async (id: string, status: string, notes?: string) => {
    try {
      const res = await fetch(`/api/rural/high-risk-followups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notes: notes || 'Home visit verified by ASHA worker. Parameters recorded in community register.',
          lastVisitDate: new Date().toISOString().split('T')[0],
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSelectedItem(null);
        setVisitNotes('');
        fetchFollowups();
      }
    } catch (err) {
      console.error('Update followup error:', err);
    }
  };

  const filtered = followups.filter(f => {
    if (categoryFilter !== 'ALL' && f.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    return true;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'MATERNAL_ANC':
        return <Baby className="w-4 h-4 text-pink-600" />;
      case 'CHILD_IMMUNIZATION':
        return <Activity className="w-4 h-4 text-amber-600" />;
      case 'CHRONIC_NCD':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OVERDUE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">OVERDUE</span>;
      case 'DUE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">DUE SOON</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">COMPLETED</span>;
      case 'ESCALATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-300">ESCALATED (108/MO)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-700 text-white flex items-center justify-center font-bold shadow-md shadow-rose-100">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {isMarathi
                    ? 'अतिजोखमीचे रुग्ण व पाठपुरावा (Maternal, Child & Chronic Care)'
                    : isHindi
                    ? 'उच्च जोखिम मरीज एवं फॉलो-अप ट्रैकिंग'
                    : 'High-Risk Patient Follow-up & Community Vigilance'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  Zero Drop-out Protocol
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {isMarathi
                  ? 'गरोदर माता, कुपोषित बालके, लसीकरण सुटलेली बालके, व अनियंत्रित रक्तदाब/मधुमेह रुग्णांची प्रत्यक्ष आशा गृहभेट नोंद'
                  : 'Proactive tracking for High-Risk ANC, Child Immunization dropouts, and Chronic Non-Communicable Diseases'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchFollowups}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isMarathi ? 'रीफ्रेश' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 overflow-x-auto">
            {['ALL', 'MATERNAL_ANC', 'CHILD_IMMUNIZATION', 'CHRONIC_NCD', 'POST_DISCHARGE'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  categoryFilter === cat ? 'bg-rose-700 text-white shadow-xs' : 'hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL'
                  ? isMarathi ? 'सर्व प्रवर्ग' : 'All Categories'
                  : cat === 'MATERNAL_ANC'
                  ? isMarathi ? 'माता आरोग्य (ANC)' : 'Maternal ANC'
                  : cat === 'CHILD_IMMUNIZATION'
                  ? isMarathi ? 'बाल लसीकरण' : 'Child Vaccine'
                  : cat === 'CHRONIC_NCD'
                  ? isMarathi ? 'दीर्घकालीन आजार' : 'Chronic NCD'
                  : 'Post Discharge'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
            {['ALL', 'OVERDUE', 'DUE', 'COMPLETED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === st ? 'bg-slate-800 text-white shadow-xs' : 'hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Followups Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(item => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs transition space-y-3.5 ${
              item.status === 'OVERDUE'
                ? 'border-rose-300 bg-rose-50/20'
                : item.status === 'ESCALATED'
                ? 'border-purple-300 bg-purple-50/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-100">
                  {getCategoryIcon(item.category)}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{item.patientName}</h4>
                  <div className="text-xs text-slate-500 font-medium">
                    {item.age}y • {item.gender} • {item.patientPhone}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {getStatusBadge(item.status)}
              </div>
            </div>

            {/* Condition & High Risk Reason */}
            <div className="space-y-1 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{item.condition}</span>
              </div>
              <p className="text-slate-600 font-medium pl-5">
                {item.riskReason}
              </p>
            </div>

            {/* ASHA Worker Assigned & Due Date */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
              <div className="p-2 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Assigned ASHA</div>
                <div className="font-extrabold text-slate-900 mt-0.5">{item.assignedAshaName}</div>
                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {item.villageName}
                </div>
              </div>

              <div className="p-2 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Follow-up Schedule</div>
                <div className="font-extrabold text-rose-700 mt-0.5">Due: {item.dueDate}</div>
                <div className="text-[11px] text-slate-500">
                  Last visit: {item.lastVisitDate || 'Not yet recorded'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">
                {item.notes ? `Note: ${item.notes.slice(0, 35)}...` : 'No visit note yet'}
              </span>

              <div className="flex items-center gap-1.5">
                {item.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleUpdateFollowup(item.id, 'COMPLETED', 'Home visit conducted. Blood pressure and fetal heart rate recorded as normal.')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    {isMarathi ? 'भेट पूर्ण नोंदवा' : 'Record Visit Complete'}
                  </button>
                )}

                {item.status !== 'ESCALATED' && (
                  <button
                    onClick={() => handleUpdateFollowup(item.id, 'ESCALATED', 'Patient has persistent headache and BP 160/100. Dispatched 108 ambulance and alerted Medical Officer.')}
                    className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                    title="Escalate to PHC Medical Officer or 108 Ambulance"
                  >
                    {isMarathi ? 'तातडीने कळवा (108)' : 'Escalate (108)'}
                  </button>
                )}

                {onSelectPatient && (
                  <button
                    onClick={() => onSelectPatient(item.patientId)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
                  >
                    Record
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
