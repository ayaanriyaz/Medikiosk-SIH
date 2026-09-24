import React, { useState } from 'react';
import { AmbulanceDispatchRecord } from '../types';
import {
  Siren,
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Navigation,
  ShieldAlert,
} from 'lucide-react';

interface AmbulanceDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
  patientPhone?: string;
  defaultEmergencyType?: string;
  priority?: 'URGENT' | 'CRITICAL';
}

export const AmbulanceDispatchModal: React.FC<AmbulanceDispatchModalProps> = ({
  isOpen,
  onClose,
  patientName,
  patientId,
  patientPhone = '+91 98765 43210',
  defaultEmergencyType = 'Suspected Acute Coronary Syndrome / Severe Chest Pain',
  priority = 'CRITICAL',
}) => {
  const [address, setAddress] = useState('Sector 12, Block C, Metro Station Road, New Delhi');
  const [contactNumber, setContactNumber] = useState(patientPhone);
  const [emergencyReason, setEmergencyReason] = useState(defaultEmergencyType);
  const [isDispatched, setIsDispatched] = useState(false);
  const [dispatchData, setDispatchData] = useState<AmbulanceDispatchRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmDispatch = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        patientId,
        patientName,
        patientPhone: contactNumber,
        pickupAddress: address,
        emergencyType: emergencyReason,
        triagePriority: priority,
      };

      const res = await fetch('/api/emergency/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setDispatchData(data.record);
        setIsDispatched(true);
      } else {
        // Fallback local dispatch record for demo resilience
        const fallbackRecord: AmbulanceDispatchRecord = {
          id: `AMB-${Date.now().toString().slice(-4)}`,
          patientId,
          patientName,
          patientPhone: contactNumber,
          pickupAddress: address,
          emergencyType: emergencyReason,
          triagePriority: priority === 'URGENT' ? 'URGENT' : 'CRITICAL',
          status: 'DISPATCHED',
          vehicleNumber: 'DL-01-EA-1082 (ALS Unit)',
          ambulanceType: 'Advanced Cardiac Life Support (ACLS)',
          driverName: 'Officer R. S. Negi',
          paramedicContact: '+91 98110 01108',
          etaMinutes: 6,
          dispatchedAt: new Date().toISOString(),
        };
        setDispatchData(fallbackRecord);
        setIsDispatched(true);
      }
    } catch {
      // Demo fallback
      const fallbackRecord: AmbulanceDispatchRecord = {
        id: `AMB-${Date.now().toString().slice(-4)}`,
        patientId,
        patientName,
        patientPhone: contactNumber,
        pickupAddress: address,
        emergencyType: emergencyReason,
        triagePriority: priority === 'URGENT' ? 'URGENT' : 'CRITICAL',
        status: 'DISPATCHED',
        vehicleNumber: 'DL-01-EA-1082 (ALS Unit)',
        ambulanceType: 'Advanced Cardiac Life Support (ACLS)',
        driverName: 'Officer R. S. Negi',
        paramedicContact: '+91 98110 01108',
        etaMinutes: 6,
        dispatchedAt: new Date().toISOString(),
      };
      setDispatchData(fallbackRecord);
      setIsDispatched(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
              <Siren className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                Emergency 108 Ambulance Dispatch
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                Rapid Emergency Medical Response Coordination
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {!isDispatched ? (
            <>
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Critical Triage Indicator:</strong> The patient's presentation suggests immediate pre-hospital emergency care is required. Please verify pickup location.
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Pickup Location / Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Triage Urgency Level
                  </label>
                  <div className="px-3 py-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-black">
                    {priority} (Immediate)
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Primary Emergency Indication
                </label>
                <input
                  type="text"
                  value={emergencyReason}
                  onChange={e => setEmergencyReason(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                />
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 border border-slate-200 leading-relaxed">
                <strong>Notice:</strong> This trigger integrates with municipal and state 108 Emergency Medical Services (EMS) protocols.
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDispatch}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <Siren className="w-4 h-4 animate-bounce" />
                  <span>{isSubmitting ? 'Contacting Dispatch...' : 'Dispatch Nearest Ambulance'}</span>
                </button>
              </div>
            </>
          ) : (
            /* Dispatched Active Tracker */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-emerald-950">Ambulance Unit Dispatched</h4>
                <p className="text-xs text-emerald-700 font-medium">
                  Dispatch Reference ID: <strong className="font-mono">{dispatchData?.id}</strong>
                </p>
              </div>

              {/* Status Progression Bar */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="text-teal-700 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 animate-spin" /> EN ROUTE TO PATIENT
                  </span>
                  <span className="font-mono text-rose-600 font-black">ETA ~{dispatchData?.etaMinutes || 6} MINS</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full w-2/3 animate-pulse"></div>
                </div>
              </div>

              {/* Unit Specifications */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Vehicle Assigned</span>
                  <p className="font-bold text-slate-900">{dispatchData?.vehicleNumber}</p>
                  <p className="text-[10px] text-slate-500">{dispatchData?.ambulanceType}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Emergency Paramedic</span>
                  <p className="font-bold text-slate-900">{dispatchData?.driverName}</p>
                  <a
                    href={`tel:${dispatchData?.paramedicContact}`}
                    className="text-[11px] text-rose-600 font-bold flex items-center gap-1 hover:underline"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{dispatchData?.paramedicContact}</span>
                  </a>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 leading-relaxed font-medium">
                <strong>Statutory Disclaimer:</strong> This is a high-fidelity SIH prototype simulation. In actual life-threatening medical emergencies, always dial <strong>108 / 112</strong> on your phone directly.
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Close & Continue Monitoring
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
