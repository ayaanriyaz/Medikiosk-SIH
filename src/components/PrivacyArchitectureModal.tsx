import React from 'react';
import { ShieldCheck, Lock, Cpu, EyeOff, FileKey, X, Server, CheckCircle2 } from 'lucide-react';

interface PrivacyArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyArchitectureModal: React.FC<PrivacyArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                Privacy-Preserving Healthcare Architecture
              </h3>
              <p className="text-xs text-teal-200/80 font-medium">
                National Health Stack & DISHA / ABDM Privacy Principles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pillars List */}
        <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-sm">
                1. Edge Speech & Multilingual Voice Processing
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Patient voice intake operates via browser-local Web Speech engine and edge inference. <strong>Zero raw patient audio recordings are saved or retained on cloud servers</strong>, ensuring complete acoustic privacy.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
              <EyeOff className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-sm">
                2. De-Identified Optical Record Digitization (OCR)
              </h4>
              <p className="text-slate-600 leading-relaxed">
                When prescription or lab documents are scanned, non-clinical identifiers are isolated. Medical entities (medications, diagnoses, vitals) are structured strictly into FHIR R4 resources without unconsented metadata leakage.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <FileKey className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-sm">
                3. ABDM Consent Manager Integration & Encryption
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Data transfer from MediKiosk to consulting doctors requires explicit patient consent recorded with timestamp and version. Payloads are encrypted end-to-end with purpose-bound artifact destruction policies.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Server className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-900 text-sm">
                4. Ephemeral Case-Taking Scratchpad
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Conversational turns during clinical intake assist in creating the draft report. Once the physician verifies or the encounter terminates, raw interview transcripts are purged from volatile working memory.
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Compliant with Indian Digital Personal Data Protection Act (DPDPA 2023) & DISHA guidelines.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
