import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, FileCode, CheckCircle2, RefreshCw } from 'lucide-react';

interface FhirModalProps {
  intakeId: string | null;
  onClose: () => void;
}

export const FhirModal: React.FC<FhirModalProps> = ({ intakeId, onClose }) => {
  const [bundleData, setBundleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (intakeId) {
      setIsLoading(true);
      fetch(`/api/integration/fhir/${intakeId}`)
        .then(res => res.json())
        .then(data => {
          setBundleData(data);
        })
        .catch(err => console.error('Failed to load FHIR bundle:', err))
        .finally(() => setIsLoading(false));
    }
  }, [intakeId]);

  if (!intakeId) return null;

  const handleCopy = () => {
    if (bundleData) {
      navigator.clipboard.writeText(JSON.stringify(bundleData.bundle, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownload = () => {
    if (bundleData) {
      const blob = new Blob([JSON.stringify(bundleData.bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fhir-bundle-${intakeId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-sm">ABDM FHIR R4 Bundle Preview</h3>
              <p className="text-[11px] text-slate-400">
                National Health Authority (NHA) Standard Document Structure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Bar */}
        <div className="px-4 py-2 bg-teal-50 border-b border-teal-200 text-teal-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Demonstration FHIR bundle mapped to ABDM Document Bundle profile.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-teal-950 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-teal-950 cursor-pointer ml-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* JSON Content */}
        <div className="p-4 flex-1 overflow-y-auto bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating FHIR R4 standard bundle...</span>
            </div>
          ) : bundleData ? (
            <pre className="whitespace-pre-wrap">{JSON.stringify(bundleData.bundle, null, 2)}</pre>
          ) : (
            <div className="p-8 text-center text-slate-400">Bundle data unavailable</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
