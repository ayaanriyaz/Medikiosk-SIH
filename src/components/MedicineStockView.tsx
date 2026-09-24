import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { MedicineStockItem } from '../types';
import {
  Pill,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  Phone,
  Building2,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const MedicineStockView: React.FC = () => {
  const { t, localize, isMarathi, isHindi } = useLanguage();
  const [medicines, setMedicines] = useState<MedicineStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [facilityFilter, setFacilityFilter] = useState<string>('ALL');

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rural/medicines');
      const data = await res.json();
      if (data.status === 'success') {
        setMedicines(data.medicines || []);
      }
    } catch (err) {
      console.error('Error fetching medicines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const filteredMedicines = medicines.filter(med => {
    if (statusFilter !== 'ALL' && med.status !== statusFilter) return false;
    if (facilityFilter !== 'ALL' && med.facilityId !== facilityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        med.medicineName.toLowerCase().includes(q) ||
        med.genericName.toLowerCase().includes(q) ||
        med.facilityName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> AVAILABLE
          </span>
        );
      case 'LIMITED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> LIMITED STOCK
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> OUT OF STOCK
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-100">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {t.medicineAvailability || localize('Essential Medicines')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live Pharmacy Synced
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {isMarathi
                  ? 'प्राथमिक आरोग्य केंद्र व ग्रामीण रुग्णालय औषध साठा माहिती • तुटवडा असल्यास पर्यायी केंद्राची माहिती'
                  : isHindi
                  ? 'प्राथमिक स्वास्थ्य केंद्र और ग्रामीण अस्पताल दवा स्टॉक • कमी होने पर नजदीकी विकल्प उपलब्ध'
                  : 'Transparent availability of essential medicines across rural facilities with automated alternative nearby routing'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMedicines}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isMarathi ? 'रीफ्रेश' : isHindi ? 'रिफ्रेश' : localize('Refresh')}
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Status Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
            {['ALL', 'AVAILABLE', 'LIMITED', 'OUT_OF_STOCK'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  statusFilter === st ? 'bg-emerald-700 text-white shadow-xs' : 'hover:bg-slate-200'
                }`}
              >
                {st === 'ALL'
                  ? (isMarathi ? 'सर्व' : isHindi ? 'सभी' : localize('All'))
                  : st === 'AVAILABLE'
                  ? (isMarathi ? 'उपलब्ध' : isHindi ? 'उपलब्ध' : localize('In Stock'))
                  : st === 'LIMITED'
                  ? (isMarathi ? 'मर्यादित' : isHindi ? 'सीमित' : localize('Limited'))
                  : (isMarathi ? 'तुटवडा' : isHindi ? 'स्टॉक खत्म' : localize('Out'))}
              </button>
            ))}
          </div>

          {/* Facility Filter */}
          <select
            value={facilityFilter}
            onChange={e => setFacilityFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          >
            <option value="ALL">{isMarathi ? 'सर्व प्राथमिक व ग्रामीण रुग्णालये' : isHindi ? 'सभी प्राथमिक व ग्रामीण अस्पताल' : 'All Public Facilities'}</option>
            <option value="FAC-PHC-BHOR">Bhor PHC (Primary)</option>
            <option value="FAC-RH-BHOR">Bhor Rural Hospital (Secondary)</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isMarathi ? 'औषध किंवा जनरिक नाव शोधा (उदा. पॅरासिटामॉल, इन्सुलिन)...' : isHindi ? 'दवा या जेनेरिक नाम खोजें (उदा. पैरासिटामोल)...' : 'Search medicine or generic name...'}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedicines.map(med => (
          <div
            key={med.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs transition flex flex-col justify-between space-y-4 ${
              med.status === 'OUT_OF_STOCK'
                ? 'border-rose-200 bg-rose-50/20'
                : med.status === 'LIMITED'
                ? 'border-amber-200'
                : 'border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                  {med.dosageForm} • {med.strength}
                </span>
                {getStatusBadge(med.status)}
              </div>

              <h4 className="text-base font-black text-slate-900 leading-snug">{med.medicineName}</h4>
              <div className="text-xs text-slate-500 font-medium">
                Generic: <span className="text-slate-800 font-semibold">{med.genericName}</span>
              </div>

              <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5 pt-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{med.facilityName}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500">In Stock:</span>
                <span className="font-extrabold text-slate-900">
                  {med.quantityAvailable.toLocaleString()} units
                </span>
              </div>

              {/* Alternative Nearby Facility Routing if OUT OF STOCK or LIMITED */}
              {med.alternativeFacility && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1 mt-2">
                  <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    {isMarathi ? 'नजीकचे पर्यायी केंद्र (उपलब्ध साठा):' : 'Alternative Nearby Facility Stock:'}
                  </div>
                  <div className="font-bold text-amber-950">
                    {med.alternativeFacility.facilityName} ({med.alternativeFacility.distanceKm} km away)
                  </div>
                  <div className="text-amber-800 flex items-center gap-1 text-[11px]">
                    <Phone className="w-3 h-3" />
                    <span>Helpline: {med.alternativeFacility.phone}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>Updated: {new Date(med.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-emerald-700 font-bold">Free Govt Dispensation</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
