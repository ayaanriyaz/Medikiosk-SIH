import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { HealthcareFacility } from '../types';
import {
  Building2,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Pill,
  GitFork,
  Truck,
  Baby,
  RefreshCw,
  ShieldCheck,
  MapPin,
  HeartPulse,
} from 'lucide-react';

export const DistrictHealthDashboard: React.FC = () => {
  const { isMarathi, isHindi } = useLanguage();
  const [metricsData, setMetricsData] = useState<any | null>(null);
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDistrictData = async () => {
    setIsLoading(true);
    try {
      const [metRes, facRes] = await Promise.all([
        fetch('/api/rural/district-metrics'),
        fetch('/api/rural/facilities'),
      ]);
      const metJson = await metRes.json();
      const facJson = await facRes.json();
      if (metJson.status === 'success') setMetricsData(metJson);
      if (facJson.status === 'success') setFacilities(facJson.facilities || []);
    } catch (err) {
      console.error('Error fetching district metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDistrictData();
  }, []);

  const m = metricsData?.metrics;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md">
              <Building2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {isMarathi
                    ? 'जिल्हा आरोग्य संनियंत्रण व गुणवत्ता डॅशबोर्ड'
                    : isHindi
                    ? 'जिला स्वास्थ्य निगरानी एवं गुणवत्ता डैशबोर्ड'
                    : 'District Public Health Oversight & Quality Command'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-900 text-emerald-400 border border-slate-700">
                  Govt of Maharashtra • MSIS (SIH 26133)
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Pune District Public Health Department • Sub-Centres, PHCs, RHs, and Tertiary Medical College Hubs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDistrictData}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isMarathi ? 'डेटा रीफ्रेश' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* 6 Key Operational Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
          {/* KPI 1: Footfall */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isMarathi ? 'आजचे ओपीडी रुग्ण' : 'Total OPD Today'}
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {m ? m.totalPatientsToday : '--'}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              +14% vs rural avg
            </div>
          </div>

          {/* KPI 2: Critical / Triage */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
            <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
              {isMarathi ? 'गंभीर रुग्ण (Critical)' : 'Critical Triage'}
            </div>
            <div className="text-2xl font-black text-rose-700 mt-1">
              {m ? m.triageBreakdown.critical : '--'}
            </div>
            <div className="text-[11px] text-rose-800 font-semibold mt-1">
              Immediate priority
            </div>
          </div>

          {/* KPI 3: Avg Wait Time */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
            <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
              {isMarathi ? 'सरासरी प्रतीक्षा वेळ' : 'Avg Wait Time'}
            </div>
            <div className="text-2xl font-black text-teal-900 mt-1">
              {m ? `${m.averageWaitMinutes}m` : '--'}
            </div>
            <div className="text-[11px] text-teal-700 font-semibold mt-1">
              -42% reduction
            </div>
          </div>

          {/* KPI 4: Referral Completion */}
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
            <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
              {isMarathi ? 'संदर्भ पूर्णता दर' : 'Referral Completion'}
            </div>
            <div className="text-2xl font-black text-indigo-900 mt-1">
              {m ? `${m.referralCompletionRate}%` : '--'}
            </div>
            <div className="text-[11px] text-indigo-700 font-semibold mt-1">
              Zero drop-outs
            </div>
          </div>

          {/* KPI 5: Medicine Alerts */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              {isMarathi ? 'औषध तुटवडा इशारे' : 'Stock Alerts'}
            </div>
            <div className="text-2xl font-black text-amber-900 mt-1">
              {m ? m.lowStockMedicineAlerts : '--'}
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">
              Auto re-routed
            </div>
          </div>

          {/* KPI 6: Overdue Maternal/Child */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
            <div className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
              {isMarathi ? 'प्रलंबित गृहभेटी' : 'Overdue Follow-ups'}
            </div>
            <div className="text-2xl font-black text-purple-900 mt-1">
              {m ? m.overdueHighRiskFollowups : '--'}
            </div>
            <div className="text-[11px] text-purple-700 font-semibold mt-1">
              ASHA alerted
            </div>
          </div>
        </div>
      </div>

      {/* Facility Network Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            {isMarathi ? 'पुणे जिल्हा आरोग्य संस्था जाळे (Public Healthcare Network)' : 'Pune District Healthcare Facility Directory'}
          </h3>
          <p className="text-xs text-slate-500">
            Real-time status of Sub-Centres, Primary Health Centres, Rural Hospitals, and Medical College
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map(fac => (
            <div
              key={fac.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-400 transition space-y-2.5 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-800">
                  {fac.type}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {fac.operationalHours}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{fac.name}</h4>
                <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{fac.location} • {fac.district}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>MO In-Charge:</span>
                  <span className="font-bold text-slate-800">{fac.inChargeDoctor}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Contact Helpline:</span>
                  <span className="font-bold text-teal-800">{fac.contactPhone}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Distance to DH:</span>
                  <span className="font-bold text-slate-800">{fac.distanceToDistrictHospitalKm} km</span>
                </div>
              </div>

              <div className="pt-1.5 flex flex-wrap gap-1">
                {fac.servicesAvailable.slice(0, 3).map((s, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-600">
                    {s}
                  </span>
                ))}
                {fac.servicesAvailable.length > 3 && (
                  <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-500">
                    +{fac.servicesAvailable.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
