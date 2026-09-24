import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DoctorProgressReportData } from '../types';
import {
  FileText,
  Activity,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Calendar,
  Pill,
  Building2,
  Stethoscope,
  X,
  Share2,
} from 'lucide-react';

interface DoctorProgressReportModalProps {
  patientId: string;
  onClose: () => void;
}

export const DoctorProgressReportModal: React.FC<DoctorProgressReportModalProps> = ({
  patientId,
  onClose,
}) => {
  const { isMarathi } = useLanguage();
  const [report, setReport] = useState<DoctorProgressReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/rural/progress-report/${patientId}`);
        const data = await res.json();
        if (data.status === 'success') {
          setReport(data.progressReport);
        }
      } catch (err) {
        console.error('Error fetching progress report:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">
            {isMarathi ? 'रुग्ण प्रगती अहवाल तयार होत आहे...' : 'Synthesizing Longitudinal Progress Report...'}
          </p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-md shadow-teal-200">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {isMarathi ? 'दीर्घकालीन वैद्यकीय प्रगती अहवाल' : 'Doctor Longitudinal Progress Report'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-300">
                  NHM PROTOCOL
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Standardized Longitudinal Evaluation • Bhor PHC & Sassoon Hospital Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Print Clinical Summary"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Patient Identity Banner */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Name</div>
            <div className="text-base font-black text-slate-900">{report.patientName}</div>
            <div className="text-slate-500 font-medium">
              ID: {report.patientId} • {report.age} Years • {report.gender}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adherence Score</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="text-xl font-black text-emerald-600">{report.medicationAdherencePercent}%</div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                High Adherence
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Monitoring</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {report.chronicConditions.map((cond, i) => (
                <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10px] font-extrabold">
                  {cond}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Vitals Trend Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-700" />
              {isMarathi ? 'शारीरिक मापदंड प्रवृत्ती (Vitals Trend Over Time)' : 'Longitudinal Physiological Trends'}
            </h4>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Blood Pressure Controlled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {report.vitalsTrend.map((v, i) => (
              <div key={i} className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1 text-xs">
                <div className="text-[11px] font-extrabold text-teal-800 flex items-center justify-between">
                  <span>{v.date}</span>
                  {i === report.vitalsTrend.length - 1 && (
                    <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-900 text-[9px] font-black">
                      LATEST
                    </span>
                  )}
                </div>
                <div className="text-lg font-black text-slate-900">
                  {v.bpSystolic}/{v.bpDiastolic} <span className="text-xs font-normal text-slate-500">mmHg</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Weight: <strong>{v.weightKg} kg</strong></span>
                  <span>Pulse: <strong>{v.pulse} bpm</strong></span>
                </div>
                {v.fastingGlucose && (
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                    Glucose: <strong>{v.fastingGlucose} mg/dL</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic History Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-700" />
            {isMarathi ? 'प्रयोगशाळा तपासणी इतिहास' : 'Diagnostic Investigations Timeline'}
          </h4>

          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden text-xs">
            {report.diagnosticHistory.map((d, i) => (
              <div key={i} className="p-3 bg-white flex items-center justify-between hover:bg-slate-50">
                <div>
                  <div className="font-extrabold text-slate-900">{d.testName}</div>
                  <div className="text-[11px] text-slate-500">{d.date} • Ref: {d.referenceRange}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 text-sm">{d.value}</div>
                  <span
                    className={`inline-block text-[10px] font-black px-2 py-0.5 rounded ${
                      d.status === 'NORMAL'
                        ? 'bg-emerald-100 text-emerald-800'
                        : d.status === 'ELEVATED'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consultation Milestones & Counter Referral */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-700" />
            {isMarathi ? 'उपचार टप्पे व संदर्भ इतिहास' : 'Consultation Milestones & Network Linkages'}
          </h4>

          <div className="space-y-2 text-xs">
            {report.consultationMilestones.map((m, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                  <span>{m.date} • {m.facility}</span>
                  <span className="text-slate-500">{m.doctorName}</span>
                </div>
                <div className="text-slate-700 font-medium">{m.summary}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Evolution Assessment */}
        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl text-xs space-y-1">
          <div className="font-extrabold text-teal-950 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-teal-800" />
            <span>Doctor Clinical Assessment:</span>
          </div>
          <p className="text-teal-900 leading-relaxed font-medium">
            {report.clinicalEvolutionNotes}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-xs transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
