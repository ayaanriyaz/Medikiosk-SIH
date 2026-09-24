import React from 'react';
import { DrugInteractionAlert } from '../types';
import { AlertOctagon, AlertTriangle, ShieldCheck, Pill, Stethoscope, ChevronRight } from 'lucide-react';

interface DrugInteractionPanelProps {
  alerts: DrugInteractionAlert[];
}

export const DrugInteractionPanel: React.FC<DrugInteractionPanelProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <span className="font-bold">Drug Continuity & Interaction Surveillance:</span> No acute high-risk drug-drug interactions detected across current reported medications.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-amber-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">Drug Interaction & Continuity Alerts</h4>
            <p className="text-xs text-slate-500">Automated pharmacology surveillance for attending physician review</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg border border-amber-200">
          {alerts.length} Flag{alerts.length > 1 ? 's' : ''} Identified
        </span>
      </div>

      {/* List of alerts */}
      <div className="space-y-3">
        {alerts.map((alert, idx) => {
          const isHigh = alert.severity === 'HIGH';
          const isMod = alert.severity === 'MODERATE';

          return (
            <div
              key={alert.id || idx}
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                isHigh
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : isMod
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-black text-sm">
                  <Pill className="w-4 h-4 text-slate-500" />
                  <span>
                    {alert.drug1} {alert.drug2 ? `+ ${alert.drug2}` : ''}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] tracking-wider ${
                    isHigh
                      ? 'bg-rose-600 text-white'
                      : isMod
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {alert.severity} Risk
                </span>
              </div>

              <div>
                <strong className="font-semibold text-slate-700">Mechanism:</strong>{' '}
                <span className="text-slate-800">{alert.mechanism}</span>
              </div>

              <div>
                <strong className="font-semibold text-slate-700">Clinical Impact:</strong>{' '}
                <span className="text-slate-800">{alert.clinicalEffect}</span>
              </div>

              <div className="pt-1.5 border-t border-current/10 flex items-start gap-1.5 text-teal-900 bg-teal-50/50 p-2 rounded-xl">
                <Stethoscope className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-teal-950">Recommended Action:</strong>{' '}
                  <span className="text-teal-900">{alert.management}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compulsory Disclaimer */}
      <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 leading-relaxed border border-slate-200">
        <strong className="text-slate-800">Physician Safety Governance Notice:</strong> This safety check is an advisory alert generated to assist licensed medical practitioners. It <strong>does NOT prescribe, modify, or stop any patient therapy</strong>. All therapeutic determinations must be verified during clinical examination.
      </div>
    </div>
  );
};
