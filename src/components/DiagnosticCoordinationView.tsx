import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DiagnosticTestItem } from '../types';
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Building2,
  Search,
  Filter,
  Check,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface DiagnosticCoordinationViewProps {
  onBookSuccess?: (booking: any) => void;
}

export const DiagnosticCoordinationView: React.FC<DiagnosticCoordinationViewProps> = ({
  onBookSuccess,
}) => {
  const { isMarathi, isHindi } = useLanguage();
  const [tests, setTests] = useState<DiagnosticTestItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookedConfirmation, setBookedConfirmation] = useState<any | null>(null);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rural/diagnostics');
      const data = await res.json();
      if (data.status === 'success') {
        setTests(data.diagnostics || []);
      }
    } catch (err) {
      console.error('Error fetching diagnostics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleBookTest = async (test: DiagnosticTestItem) => {
    try {
      const res = await fetch('/api/rural/diagnostics/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: test.id,
          patientName: 'Kishore Deshpande',
          patientPhone: '+91 98220 11223',
          preferredDate: new Date().toISOString().split('T')[0],
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setBookedConfirmation(data.booking);
        fetchDiagnostics();
        if (onBookSuccess) onBookSuccess(data.booking);
      }
    } catch (err) {
      console.error('Book test error:', err);
    }
  };

  const filteredTests = tests.filter(test => {
    if (activeCategory !== 'ALL' && test.category !== activeCategory) return false;
    if (selectedFacility !== 'ALL' && test.facilityId !== selectedFacility) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        test.testName.toLowerCase().includes(q) ||
        test.facilityName.toLowerCase().includes(q) ||
        test.instructions?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Booking Success Alert */}
      {bookedConfirmation && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start justify-between shadow-xs">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
            <div className="text-xs text-emerald-950">
              <div className="font-extrabold text-sm text-emerald-900">
                {isMarathi ? 'प्रयोगशाळा चाचणी स्लॉट निश्चित झाला!' : 'Diagnostic Test Slot Confirmed!'}
              </div>
              <div className="mt-1 font-medium">
                <strong>Booking ID:</strong> {bookedConfirmation.bookingId} • <strong>Test:</strong> {bookedConfirmation.testName} • <strong>Turnaround:</strong> ~{bookedConfirmation.turnaroundHours} hours
              </div>
              <div className="mt-0.5 text-emerald-800">
                {bookedConfirmation.instructions}
              </div>
            </div>
          </div>
          <button
            onClick={() => setBookedConfirmation(null)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-2 py-1 bg-emerald-100 rounded-lg"
          >
            Close
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-700 text-white flex items-center justify-center font-bold shadow-md shadow-cyan-100">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {isMarathi
                    ? 'सार्वजनिक आरोग्य प्रयोगशाळा व चाचणी समन्वय'
                    : isHindi
                    ? 'सार्वजनिक स्वास्थ्य प्रयोगशाला एवं जांच समन्वय'
                    : 'Public Health Diagnostics & Lab Coordination'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
                  100% Free Govt Subsidized
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {isMarathi
                  ? 'प्राथमिक आरोग्य केंद्र, ग्रामीण रुग्णालय व जिल्हा रुग्णालय प्रयोगशाळा नेटवर्क'
                  : 'Real-time test slots, turnaround time visibility, and zero-paper booking across public facilities'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDiagnostics}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isMarathi ? 'रीफ्रेश' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 overflow-x-auto">
            {['ALL', 'BIOCHEMISTRY', 'PATHOLOGY', 'MICROBIOLOGY', 'IMAGING'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  activeCategory === cat ? 'bg-cyan-700 text-white shadow-xs' : 'hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? (isMarathi ? 'सर्व चाचण्या' : 'All Labs') : cat}
              </button>
            ))}
          </div>

          {/* Facility Picker */}
          <select
            value={selectedFacility}
            onChange={e => setSelectedFacility(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800"
          >
            <option value="ALL">{isMarathi ? 'सर्व आरोग्य संस्था (All Facilities)' : 'All Public Facilities'}</option>
            <option value="FAC-PHC-BHOR">Bhor PHC (Primary)</option>
            <option value="FAC-RH-BHOR">Bhor Rural Hospital (Secondary)</option>
            <option value="FAC-DH-AUNDH">District Hospital Aundh (Tertiary)</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isMarathi ? 'चाचणीचे नाव शोधा (उदा. HbA1c, मलेरिया)...' : 'Search test (e.g. HbA1c, Malaria)...'}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map(test => (
          <div
            key={test.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-cyan-400 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                  {test.category}
                </span>
                {test.isFreeGovtSubsidized && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    FREE (Govt)
                  </span>
                )}
              </div>

              <h4 className="text-base font-black text-slate-900 leading-snug">{test.testName}</h4>

              <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span>{test.facilityName}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{test.turnaroundHours}h report turnaround</span>
                </div>
              </div>

              {test.instructions && (
                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100">
                  <strong>Prep:</strong> {test.instructions}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  Slots Today:
                </span>
                <span
                  className={`text-sm font-black ${
                    test.slotsAvailableToday > 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {test.slotsAvailableToday > 0
                    ? `${test.slotsAvailableToday} Available`
                    : 'Full for Today'}
                </span>
              </div>

              <button
                disabled={test.slotsAvailableToday <= 0}
                onClick={() => handleBookTest(test)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-xs transition ${
                  test.slotsAvailableToday > 0
                    ? 'bg-cyan-700 hover:bg-cyan-800 text-white shadow-cyan-200'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isMarathi ? 'स्लॉट बुक करा' : 'Book Test Slot'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
