import React, { useState, useEffect } from 'react';
import { ClinicalReport, Intake } from '../types';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  FileText,
  User,
  Shield,
  MessageSquare,
  Sparkles,
  Maximize2,
  Save,
  CheckCircle,
} from 'lucide-react';

interface TeleconsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
  doctorName?: string;
  report?: ClinicalReport | null;
  intake?: Intake | null;
  callType?: 'VIDEO' | 'AUDIO';
}

export const TeleconsultationModal: React.FC<TeleconsultationModalProps> = ({
  isOpen,
  onClose,
  patientName,
  patientId,
  doctorName = 'Dr. Vivek Sharma, MD',
  report,
  intake,
  callType = 'VIDEO',
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'VIDEO');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [doctorCallNotes, setDoctorCallNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showReportSidebar, setShowReportSidebar] = useState(true);

  // Call duration counter
  useEffect(() => {
    let timer: any;
    if (isOpen) {
      // Simulate connection handshake
      const connectTimeout = setTimeout(() => {
        setIsConnected(true);
      }, 1200);

      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      return () => {
        clearTimeout(connectTimeout);
        clearInterval(timer);
      };
    } else {
      setCallDuration(0);
      setIsConnected(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveNotes = async () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Top Header */}
        <div className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-100">
                  Encrypted Teleconsultation Session
                </h3>
                <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] font-bold rounded-full border border-teal-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  {isConnected ? 'LIVE & ENCRYPTED' : 'CONNECTING...'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-slate-200">{patientName}</strong> • Attending: <span className="text-slate-300">{doctorName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-mono text-slate-300 font-bold">
              {formatTime(callDuration)}
            </div>
            <button
              onClick={() => setShowReportSidebar(!showReportSidebar)}
              className={`p-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                showReportSidebar ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Clinical Report</span>
            </button>
          </div>
        </div>

        {/* Main Center Area: Video Stage & Synced Clinical Summary */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Video Stage */}
          <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
            {/* Main Remote Video Viewport (Patient) */}
            <div className="w-full h-full rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-800 relative flex flex-col items-center justify-center overflow-hidden shadow-inner">
              <div className="text-center space-y-3">
                <div className="w-24 h-24 rounded-full bg-teal-600/20 border-2 border-teal-500/40 text-teal-300 flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                  {patientName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-200">{patientName}</h4>
                  <p className="text-xs text-slate-400 font-mono">Patient Room • WebRTC Secure Stream</p>
                </div>
              </div>

              {/* Patient Overlay Tag */}
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-700 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-semibold">{patientName}</span>
              </div>

              {/* PiP Local Video (Doctor Self-View) */}
              <div className="absolute top-4 right-4 w-36 h-28 sm:w-44 sm:h-32 rounded-2xl bg-slate-800 border-2 border-slate-700/80 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
                {isVideoEnabled ? (
                  <div className="w-full h-full bg-slate-700 flex flex-col items-center justify-center text-slate-300 relative">
                    <User className="w-8 h-8 text-teal-400 mb-1" />
                    <span className="text-[10px] font-bold">You (Physician)</span>
                    <span className="absolute bottom-2 right-2 text-[9px] bg-slate-900/80 px-1.5 py-0.5 rounded text-teal-300">HD</span>
                  </div>
                ) : (
                  <div className="text-center p-2">
                    <VideoOff className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400">Camera Off</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Synced Clinical Summary & Notes Sidebar */}
          {showReportSidebar && (
            <div className="w-full md:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col overflow-hidden text-xs">
              <div className="p-3.5 bg-slate-850 border-b border-slate-800 font-bold flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Real-Time Case-Taking Brief</span>
                </div>
                {report?.priorityScore && (
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                    report.priorityScore.category === 'Urgent'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {report.priorityScore.category} ({report.priorityScore.score} pts)
                  </span>
                )}
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-slate-300">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Chief Complaint</span>
                  <p className="mt-0.5 font-semibold text-slate-100">
                    {report?.chiefComplaint || intake?.chiefComplaint || 'Consultation in progress'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">History of Present Illness</span>
                  <p className="mt-0.5 text-slate-300 leading-relaxed">
                    {report?.historyOfPresentIllness || intake?.historyOfPresentIllness || 'Patient connected for clinical evaluation.'}
                  </p>
                </div>

                {report?.summary?.keyPointsForDoctor && report.summary.keyPointsForDoctor.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Key Pre-Consultation Observations</span>
                    <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-300">
                      {report.summary.keyPointsForDoctor.map((kp, i) => (
                        <li key={i}>{kp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Live Consultation Notes Box */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-teal-400">Attending Physician Notes</span>
                    {isSaved && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Saved to EHR
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Enter observation notes, provisional diagnosis, or advised prescription..."
                    value={doctorCallNotes}
                    onChange={e => setDoctorCallNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-teal-300 rounded-lg text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Note to Patient Record</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Call Controls Toolbar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4">
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-3 rounded-2xl transition-all cursor-pointer ${
              isAudioEnabled
                ? 'bg-slate-800 hover:bg-slate-750 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
            title={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className={`p-3 rounded-2xl transition-all cursor-pointer ${
              isVideoEnabled
                ? 'bg-slate-800 hover:bg-slate-750 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
            title={isVideoEnabled ? 'Turn Video Off' : 'Turn Video On'}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-rose-900/40 cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
