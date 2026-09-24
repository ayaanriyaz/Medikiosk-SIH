import React, { useState } from 'react';
import { ClinicalPriorityScore } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, ChevronRight, X, Edit3 } from 'lucide-react';

interface RiskScoreBadgeProps {
  scoreData?: ClinicalPriorityScore;
  onOverride?: () => void;
  canOverride?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskScoreBadge: React.FC<RiskScoreBadgeProps> = ({
  scoreData,
  onOverride,
  canOverride = false,
  size = 'md',
}) => {
  const [showModal, setShowModal] = useState(false);

  if (!scoreData) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        Score: Routine (30)
      </span>
    );
  }

  const effectiveCategory = scoreData.override?.newCategory || scoreData.category;
  const isOverridden = !!scoreData.override;

  const colorScheme =
    effectiveCategory === 'Urgent'
      ? {
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          text: 'text-rose-700',
          badgeBg: 'bg-rose-600',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
        }
      : effectiveCategory === 'Priority'
      ? {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-800',
          badgeBg: 'bg-amber-500',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
        }
      : {
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          text: 'text-emerald-800',
          badgeBg: 'bg-emerald-600',
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
        };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-2 rounded-xl border font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-xs ${
          colorScheme.bg
        } ${colorScheme.border} ${colorScheme.text} ${
          size === 'sm'
            ? 'px-2 py-0.5 text-[11px]'
            : size === 'lg'
            ? 'px-4 py-2 text-sm'
            : 'px-3 py-1.5 text-xs'
        }`}
        title="Click to view explainable Clinical Priority Score breakdown"
      >
        {colorScheme.icon}
        <span className="font-extrabold uppercase tracking-wide">
          {effectiveCategory}
        </span>
        <span className="px-1.5 py-0.5 rounded-md bg-white/80 font-mono text-[11px] font-black border border-current/20">
          {scoreData.score}/100
        </span>
        {isOverridden && (
          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-sm font-semibold border border-indigo-200">
            MD Override
          </span>
        )}
        <Info className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {/* Breakdown Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-sm ${colorScheme.badgeBg}`}
                >
                  {scoreData.score}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Clinical Priority Score (Risk Stratification)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Pre-consultation algorithm: Level{' '}
                    <strong className={colorScheme.text}>{effectiveCategory}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
              {/* Doctor Override notice if exists */}
              {isOverridden && scoreData.override && (
                <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-indigo-900">
                    <span>Doctor Priority Adjustment</span>
                    <span className="text-[11px] text-indigo-600 font-normal">
                      {new Date(scoreData.override.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-indigo-800">
                    Original Score: <strong>{scoreData.category}</strong> → Revised to:{' '}
                    <strong>{scoreData.override.newCategory}</strong> by {scoreData.override.doctorName}.
                  </p>
                  <p className="text-indigo-700 italic">
                    Reason: "{scoreData.override.doctorNotes}"
                  </p>
                </div>
              )}

              {/* Factors list */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Scoring Factors Breakdown
                </h4>
                <div className="space-y-2">
                  {scoreData.factors.length > 0 ? (
                    scoreData.factors.map((factor, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5 flex-1">
                          <p className="font-bold text-slate-900">{factor.factor}</p>
                          <p className="text-[11px] text-slate-600">{factor.explanation}</p>
                        </div>
                        <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 shrink-0">
                          +{factor.points} pts
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      Standard baseline presentation without acute danger flags or high-risk comorbidity markers.
                    </div>
                  )}
                </div>
              </div>

              {/* Threshold legend */}
              <div className="p-3.5 bg-slate-100 rounded-2xl text-xs space-y-1.5 border border-slate-200">
                <div className="font-bold text-slate-700">Category Scale:</div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg">
                    <div className="font-bold">Routine</div>
                    <div className="text-[10px] text-emerald-600">0 – 39 pts</div>
                  </div>
                  <div className="p-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                    <div className="font-bold">Priority</div>
                    <div className="text-[10px] text-amber-600">40 – 69 pts</div>
                  </div>
                  <div className="p-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
                    <div className="font-bold">Urgent</div>
                    <div className="text-[10px] text-rose-600">70 – 100 pts</div>
                  </div>
                </div>
              </div>

              {/* Regulatory & Safety Disclaimer */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                <strong>Safety Governance Protocol:</strong> This score is an automated algorithmic triage assistance metric derived from patient-reported symptoms, preliminary vitals, and medical documents. It is intended solely to prioritize clinical attention and <strong>never replaces the clinical judgment or diagnostic examination of a licensed medical practitioner</strong>.
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {canOverride && onOverride ? (
                <button
                  onClick={() => {
                    setShowModal(false);
                    onOverride();
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Clinical Override</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Assisting Physician Workflow</span>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
