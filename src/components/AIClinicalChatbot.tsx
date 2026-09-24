import React, { useState, useEffect, useRef } from 'react';
import {
  Patient,
  Language,
  ClinicalInterview,
  InterviewMessage,
  ClinicalReport,
  Intake,
  MedicalDocument,
  DoctorUser,
} from '../types';
import {
  getSupportedLanguages,
  getLanguageConfig,
  detectLanguageFromText,
  LanguageConfig,
} from '../services/languageRegistry';
import { speechRecognitionService } from '../services/speechRecognitionService';
import { textToSpeechService, TTSState } from '../services/textToSpeechService';
import { searchDoctors, fetchDoctorsDirectory } from '../services/doctorSearchService';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  HeartPulse,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  User,
  ShieldCheck,
  Check,
  Globe,
  Play,
  Pause,
  RotateCcw,
  Search,
  Building2,
  X,
  PhoneCall,
  Activity,
  Layers,
} from 'lucide-react';

interface AIClinicalChatbotProps {
  patient: Patient;
  language: Language;
  mode: 'general' | 'ayush';
  onReportGenerated: (report: ClinicalReport, intake: Intake) => void;
  onBack: () => void;
}

export const AIClinicalChatbot: React.FC<AIClinicalChatbotProps> = ({
  patient,
  language: initialLanguage,
  mode,
  onReportGenerated,
  onBack,
}) => {
  const { language: siteLanguage, setLanguage: setSiteLanguage, t } = useLanguage();

  // Multilingual registry & active language selection
  const supportedLanguages = getSupportedLanguages();
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>('auto');
  const [activeLanguageCode, setActiveLanguageCode] = useState<string>(
    siteLanguage || (initialLanguage === 'hi' ? 'hi' : initialLanguage === 'mr' ? 'mr' : 'en')
  );
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Sync if site-level language changes while in auto mode
  useEffect(() => {
    if (siteLanguage && selectedLanguageCode === 'auto') {
      setActiveLanguageCode(siteLanguage);
    }
  }, [siteLanguage, selectedLanguageCode]);

  // Active Session
  const [interview, setInterview] = useState<ClinicalInterview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Input Controls
  const [inputText, setInputText] = useState('');
  const [lastInputMethod, setLastInputMethod] = useState<'text' | 'voice'>('text');
  const [isListening, setIsListening] = useState(false);
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Text-To-Speech Audio State
  const [ttsState, setTtsState] = useState<TTSState>(textToSpeechService.getState());
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
  const [lastSpokenMessageId, setLastSpokenMessageId] = useState<string | null>(null);

  // Sidebar / Drawer
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);

  // Document Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docUploadType, setDocUploadType] = useState<'Prescription' | 'Lab Report' | 'Discharge Summary'>('Prescription');
  const [docPreviewText, setDocPreviewText] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Safety & Nurse Alert state
  const [isNurseAlerted, setIsNurseAlerted] = useState(false);
  const [langSearchQuery, setLangSearchQuery] = useState('');

  // Doctor Handoff Modal
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ClinicalReport | null>(null);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [hospitalSearchQuery, setHospitalSearchQuery] = useState('');
  const [doctorList, setDoctorList] = useState<DoctorUser[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorUser | null>(null);
  const [isHandingOff, setIsHandingOff] = useState(false);
  const [handoffSuccessMessage, setHandoffSuccessMessage] = useState<string | null>(null);

  // Auto-scroll chat to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interview?.messages, isSending]);

  // Setup TTS callback listeners
  useEffect(() => {
    textToSpeechService.setCallbacks({
      onStart: (id) => {
        setLastSpokenMessageId(id);
        setShowAutoplayPrompt(false);
        setTtsState(textToSpeechService.getState());
      },
      onEnd: () => {
        setTtsState(textToSpeechService.getState());
      },
      onAutoplayBlocked: () => {
        setShowAutoplayPrompt(true);
        setTtsState(textToSpeechService.getState());
      },
      onStateChange: (state) => {
        setTtsState(state);
      },
    });

    return () => {
      textToSpeechService.stop();
      speechRecognitionService.stopListening();
    };
  }, []);

  // Initialize Anna session
  useEffect(() => {
    let isMounted = true;

    async function startSession() {
      setIsLoading(true);
      try {
        const langToUse = selectedLanguageCode === 'auto' ? activeLanguageCode : selectedLanguageCode;
        const res = await fetch('/api/anna/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: patient.id,
            language: langToUse,
            mode,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.interview) {
            setInterview(data.interview);

            // Automatically speak Anna's first greeting (TEXT INPUT -> VOICE OUTPUT principle)
            const firstMsg = data.interview.messages?.[0];
            if (firstMsg) {
              const langConfig = getLanguageConfig(firstMsg.language || langToUse);
              textToSpeechService.speak(firstMsg.message, langConfig.bcp47, firstMsg.id);
            }
          }
        }
      } catch (err) {
        console.error('Error starting Anna interview:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    startSession();

    // Fetch doctors for handoff
    fetchDoctorsDirectory().then(docs => {
      if (isMounted) {
        setDoctorList(docs);
        if (docs.length > 0) setSelectedDoctor(docs[0]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [patient.id, mode]);

  // Handle Speech Recognition Toggle
  const toggleSpeechRecognition = async () => {
    if (isListening) {
      speechRecognitionService.stopListening();
      setIsListening(false);
      return;
    }

    setSpeechError(null);
    const targetLang = selectedLanguageCode === 'auto' ? activeLanguageCode : selectedLanguageCode;
    const config = getLanguageConfig(targetLang);

    const started = await speechRecognitionService.startListening(config.bcp47, {
      onStart: () => {
        setIsListening(true);
        setSpeechError(null);
        textToSpeechService.stop(); // Stop Anna speaking when patient begins talking
      },
      onResult: (result) => {
        setInputText(result.transcript);
        if (result.isFinal) {
          setIsListening(false);
          // Send recognized transcript automatically
          handleSendMessage(result.transcript, 'voice');
        }
      },
      onError: (errMsg, isPermission) => {
        setIsListening(false);
        setSpeechError(errMsg);
        // Seamless fallback: focus text input for accessible typing
        setTimeout(() => textInputRef.current?.focus(), 150);
      },
      onEnd: () => {
        setIsListening(false);
      },
      onAudioLevel: (level) => {
        setMicAudioLevel(level);
      },
    });

    if (!started) {
      setIsListening(false);
    }
  };

  // Send message (from text input or voice)
  const handleSendMessage = async (textToSend?: string, inputMethod: 'text' | 'voice' = 'text') => {
    const rawText = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!rawText || !interview || isSending) return;

    setLastInputMethod(inputMethod);
    setInputText('');
    setSpeechError(null);
    setIsSending(true);

    // Dynamic Language Detection (if in Auto mode)
    let messageLang = activeLanguageCode;
    if (selectedLanguageCode === 'auto') {
      const detected = detectLanguageFromText(rawText);
      if (detected.confidence >= 0.75) {
        messageLang = detected.code;
        setActiveLanguageCode(detected.code);
      }
    } else {
      messageLang = selectedLanguageCode;
    }

    try {
      const res = await fetch('/api/anna/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: interview.id,
          message: rawText,
          inputType: inputMethod,
          language: messageLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.interview) {
          setInterview(data.interview);

          // Update active language if server detected another (e.g. conversational switch)
          if (data.detectedLanguage) {
            setActiveLanguageCode(data.detectedLanguage);
            if (data.detectedLanguage !== siteLanguage) {
              setSiteLanguage(data.detectedLanguage as any);
            }
          }

          // CRITICAL ACCESSIBILITY PRINCIPLE:
          // When patient sends message (typed or spoken), Anna speaks her reply automatically!
          const nextMsg: InterviewMessage = data.nextMessage;
          if (nextMsg) {
            const langCodeForSpeech = nextMsg.language || messageLang;
            const langConf = getLanguageConfig(langCodeForSpeech);
            textToSpeechService.speak(nextMsg.message, langConf.bcp47, nextMsg.id);
          }
        }
      }
    } catch (err) {
      console.error('Error sending message to Anna:', err);
    } finally {
      setIsSending(false);
      setTimeout(() => textInputRef.current?.focus(), 100);
    }
  };

  // Upload prescription / lab document to Anna
  const handleUploadDocument = async () => {
    if (!interview || !docPreviewText.trim()) return;
    setIsUploadingDoc(true);

    try {
      const res = await fetch('/api/anna/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: interview.id,
          docName: `${docUploadType} — ${patient.name}`,
          docType: docUploadType,
          previewText: docPreviewText.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.interview) {
          setInterview(data.interview);
          setIsUploadModalOpen(false);
          setDocPreviewText('');

          // Anna speaks confirmation of uploaded document
          if (data.nextMessage) {
            const conf = getLanguageConfig(data.nextMessage.language || activeLanguageCode);
            textToSpeechService.speak(data.nextMessage.message, conf.bcp47, data.nextMessage.id);
          }
        }
      }
    } catch (err) {
      console.error('Error uploading document:', err);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Generate Structured Clinical Report
  const handleGenerateReport = async () => {
    if (!interview || isGeneratingReport) return;
    setIsGeneratingReport(true);

    try {
      const res = await fetch('/api/anna/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId: interview.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          setGeneratedReport(data.report);
          setIsHandoffModalOpen(true);

          // Anna vocal confirmation
          const conf = getLanguageConfig(activeLanguageCode);
          const confirmText = activeLanguageCode === 'hi'
            ? 'आपकी संपूर्ण क्लिनिकल रिपोर्ट तैयार कर ली गई है। आप डॉक्टर का चयन करके इसे सीधे परामर्श कक्ष में भेज सकते हैं।'
            : 'Your comprehensive clinical intake report is generated. You can now select your doctor and deliver it directly to their workspace.';
          textToSpeechService.speak(confirmText, conf.bcp47, 'report-ready');
        }
      }
    } catch (err) {
      console.error('Failed to generate clinical report:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Deliver report to selected doctor
  const handleDeliverToDoctor = async () => {
    if (!generatedReport || !selectedDoctor || isHandingOff) return;
    setIsHandingOff(true);
    setHandoffSuccessMessage(null);

    try {
      const res = await fetch('/api/anna/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: generatedReport.id,
          doctorId: selectedDoctor.id,
          patientNote: `Intake conducted via Anna AI Clinical Assistant in ${getLanguageConfig(activeLanguageCode).name}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHandoffSuccessMessage(data.message || `Delivered to ${selectedDoctor.fullName}`);

        // Callback to parent kiosk workflow
        setTimeout(() => {
          const fakeIntake: Intake = {
            id: generatedReport.intakeId,
            patientId: patient.id,
            sessionId: `SES-${Date.now()}`,
            token: patient.token,
            patientName: patient.name,
            age: patient.age,
            gender: patient.gender,
            language: activeLanguageCode as any,
            department: selectedDoctor.department || 'General Medicine / Triage',
            mode,
            chiefComplaint: generatedReport.chiefComplaint,
            historyOfPresentIllness: generatedReport.historyOfPresentIllness,
            pastMedicalHistory: generatedReport.pastMedicalHistory.join(', '),
            pastSurgicalHistory: generatedReport.pastSurgicalHistory.join(', '),
            medications: generatedReport.drugHistory,
            allergies: generatedReport.allergies,
            familyHistory: generatedReport.familyHistory.map(f => `${f.relationship}: ${f.condition}`).join(', '),
            personalHistory: generatedReport.personalHistory.diet || 'Regular',
            reviewOfSystems: generatedReport.reviewOfSystems,
            ayushData: generatedReport.ayurvedaAssessment || {},
            documents: generatedReport.documents,
            timeline: [],
            redFlags: generatedReport.redFlags,
            aiSummary: {
              version: 1,
              text: generatedReport.summary.quickClinicalSummary,
              sections: {
                chiefComplaint: generatedReport.chiefComplaint,
                historyOfPresentIllness: generatedReport.historyOfPresentIllness,
                pastMedicalHistory: generatedReport.pastMedicalHistory.join(', '),
                pastSurgicalHistory: generatedReport.pastSurgicalHistory.join(', '),
                currentMedications: generatedReport.drugHistory.map(m => m.name),
                drugAllergies: generatedReport.allergies.map(a => a.substance),
                familyHistory: '',
                personalHistory: '',
                reviewOfSystems: '',
                previousInvestigations: '',
                redFlags: generatedReport.redFlags.map(r => r.ruleTriggered),
                importantNotes: '',
              },
              sources: [],
              isDraft: false,
            },
            consent: { given: true, timestamp: new Date().toISOString(), version: 'v2.1', language: activeLanguageCode as any },
            rawAnswers: [],
            status: generatedReport.triagePriority === 'HIGH' ? 'RED_FLAG' : 'READY_FOR_REVIEW',
            clinicalReportId: generatedReport.id,
            interviewId: interview?.id,
            reportStatus: 'AWAITING_DOCTOR_REVIEW',
            assignedDoctorId: selectedDoctor.id,
            assignedDoctorName: selectedDoctor.fullName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          onReportGenerated(generatedReport, fakeIntake);
        }, 1600);
      }
    } catch (err) {
      console.error('Failed to handoff report:', err);
    } finally {
      setIsHandingOff(false);
    }
  };

  // Filtered doctor list for handoff search
  const filteredDoctors = doctorList.filter(d => {
    const matchName = !doctorSearchQuery || d.fullName.toLowerCase().includes(doctorSearchQuery.toLowerCase()) || (d.specialization && d.specialization.toLowerCase().includes(doctorSearchQuery.toLowerCase()));
    const matchHospital = !hospitalSearchQuery || (d.hospitalName && d.hospitalName.toLowerCase().includes(hospitalSearchQuery.toLowerCase())) || (d.department && d.department.toLowerCase().includes(hospitalSearchQuery.toLowerCase()));
    return matchName && matchHospital;
  });

  const activeLangConfig = getLanguageConfig(activeLanguageCode);
  const isCriticalAlert = (interview?.redFlags || []).some(r => r.severity === 'CRITICAL');
  const hasPriorityAlert = (interview?.redFlags || []).length > 0;

  return (
    <div className="flex-1 flex flex-col bg-slate-100 h-full overflow-hidden select-none">
      {/* 1. ANNA CLINICAL INTAKE TOP BAR */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* Anna Avatar with Live Status Pulse */}
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-teal-700/20 border-2 border-white">
              A
            </div>
            {/* Live Indicator Dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                isListening
                  ? 'bg-red-500 animate-ping'
                  : ttsState.isSpeaking
                  ? 'bg-teal-500 animate-pulse'
                  : isSending
                  ? 'bg-amber-400 animate-spin'
                  : 'bg-emerald-500'
              }`}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                Anna
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                Medical Clinical Intake
              </span>
              {mode === 'ayush' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900">
                  AYUSH Pariksha
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Patient: <strong className="text-slate-800">{patient.name}</strong> ({patient.age}y {patient.gender})</span>
              <span>•</span>
              <span className="font-mono text-teal-700 font-bold">{patient.token}</span>
            </div>
          </div>
        </div>

        {/* Top Controls: Multilingual Selector, Audio Controls, Live Summary Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Anna Live Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold">
            {isListening ? (
              <div className="flex items-center gap-1.5 text-rose-600 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>Listening...</span>
                <div className="flex items-end gap-0.5 h-3 ml-1">
                  <span className="w-0.5 bg-rose-500 animate-bounce h-2" />
                  <span className="w-0.5 bg-rose-500 animate-bounce h-3 delay-75" />
                  <span className="w-0.5 bg-rose-500 animate-bounce h-1.5 delay-150" />
                </div>
              </div>
            ) : ttsState.isSpeaking ? (
              <div className="flex items-center gap-1.5 text-teal-700">
                <Volume2 className="w-3.5 h-3.5 animate-pulse text-teal-600" />
                <span>Speaking ({ttsState.provider === 'gemini' ? 'Gemini Voice' : 'Voice'})</span>
                <div className="flex items-end gap-0.5 h-3 ml-1">
                  <span className="w-0.5 bg-teal-600 animate-bounce h-2.5" />
                  <span className="w-0.5 bg-teal-600 animate-bounce h-3.5 delay-100" />
                  <span className="w-0.5 bg-teal-600 animate-bounce h-2 delay-200" />
                </div>
              </div>
            ) : isSending ? (
              <div className="flex items-center gap-1.5 text-amber-600">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                <span>Thinking...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Ready</span>
              </div>
            )}
          </div>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLangDropdownOpen(!isLangDropdownOpen);
                setLangSearchQuery('');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer shadow-xs"
              title="Change consultation language"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>
                {selectedLanguageCode === 'auto'
                  ? `Auto (${activeLangConfig.nativeName})`
                  : activeLangConfig.nativeName}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 max-h-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col p-1.5">
                <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>Language Registry</span>
                  <span className="text-[10px] text-teal-700 font-bold">{supportedLanguages.length} Languages</span>
                </div>

                {/* Search Bar for Languages */}
                <div className="p-1.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search language..."
                      value={langSearchQuery}
                      onChange={e => setLangSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-600"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="overflow-y-auto max-h-64 space-y-0.5">
                  {/* Auto Detect Option */}
                  {!langSearchQuery && (
                    <button
                      onClick={() => {
                        setSelectedLanguageCode('auto');
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                        selectedLanguageCode === 'auto' ? 'bg-teal-50 text-teal-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>Auto Detect (Automatic)</span>
                      </div>
                      {selectedLanguageCode === 'auto' && <Check className="w-3.5 h-3.5 text-teal-700" />}
                    </button>
                  )}

                  {!langSearchQuery && <div className="my-1 border-t border-slate-100" />}

                  {/* Filtered dynamic languages */}
                  {supportedLanguages
                    .filter(l => {
                      if (!langSearchQuery.trim()) return true;
                      const q = langSearchQuery.toLowerCase();
                      return l.name.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q) || l.code.toLowerCase().includes(q);
                    })
                    .map(l => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setSelectedLanguageCode(l.code);
                          setActiveLanguageCode(l.code);
                          setSiteLanguage(l.code as any);
                          setIsLangDropdownOpen(false);
                          if (interview) {
                            interview.language = l.code;
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-xl transition cursor-pointer ${
                          selectedLanguageCode === l.code || (selectedLanguageCode === 'auto' && activeLanguageCode === l.code)
                            ? 'bg-teal-50 font-black text-teal-900'
                            : 'text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{l.nativeName}</span>
                          <span className="text-[11px] text-slate-400">({l.name})</span>
                        </div>
                        {selectedLanguageCode === l.code && <Check className="w-3.5 h-3.5 text-teal-700" />}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Audio Pause / Resume (when speaking) */}
          {ttsState.isSpeaking && (
            <button
              onClick={() => {
                if (ttsState.isPaused) {
                  textToSpeechService.resume();
                } else {
                  textToSpeechService.pause();
                }
              }}
              className="p-2 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition cursor-pointer"
              title={ttsState.isPaused ? 'Resume voice' : 'Pause voice'}
            >
              {ttsState.isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            </button>
          )}

          {/* Audio Mute/Unmute */}
          <button
            onClick={() => {
              textToSpeechService.toggleMute();
              setTtsState(textToSpeechService.getState());
            }}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              ttsState.isMuted
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'
            }`}
            title={ttsState.isMuted ? 'Unmute Anna Voice' : 'Mute Anna Voice'}
          >
            {ttsState.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Toggle Live Summary Drawer */}
          <button
            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isSummaryOpen
                ? 'bg-teal-700 border-teal-700 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clinical Findings</span>
            {interview && interview.completionScore > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-teal-800 text-white rounded text-[10px] font-black">
                {interview.completionScore}%
              </span>
            )}
          </button>

          {/* Back to Kiosk */}
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
            title="Return to check-in"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Nurse Alert Confirmation Banner */}
      {isNurseAlerted && (
        <div className="bg-emerald-700 text-white px-4 py-2 text-xs flex items-center justify-between shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span className="font-bold">On-duty triage nurse and medical officer have been notified for immediate vitals evaluation.</span>
          </div>
          <button
            onClick={() => setIsNurseAlerted(false)}
            className="text-emerald-200 hover:text-white text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. AUTOPLAY BLOCKED INLINE BANNER (Prompt if browser blocked automatic voice) */}
      {showAutoplayPrompt && !ttsState.isMuted && (
        <div className="bg-teal-700 text-white px-4 py-2 text-xs flex items-center justify-between shrink-0 shadow-sm transition-all animate-fadeIn">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>Anna is speaking. Your browser requires a tap to play audio.</span>
          </div>
          <button
            onClick={() => {
              setShowAutoplayPrompt(false);
              const lastMsg = interview?.messages?.[interview.messages.length - 1];
              if (lastMsg) {
                const conf = getLanguageConfig(lastMsg.language || activeLanguageCode);
                textToSpeechService.speak(lastMsg.message, conf.bcp47, lastMsg.id, true);
              }
            }}
            className="px-3 py-1 bg-white text-teal-900 rounded-lg font-black text-xs hover:bg-teal-50 cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Tap Play to hear Anna</span>
          </button>
        </div>
      )}

      {/* 3. URGENT RED FLAG TRIAGE BANNER (If acute/emergency symptoms triggered) */}
      {isCriticalAlert && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-200 shrink-0" />
            <div>
              <span className="font-black uppercase tracking-wider">CRITICAL CLINICAL PRIORITY:</span>{' '}
              <span>Potential acute symptom pattern identified. Urgent clinical evaluation required.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="tel:108"
              className="px-3 py-1 bg-white text-rose-700 rounded-lg font-black hover:bg-rose-50 cursor-pointer flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3" />
              <span>108 Emergency</span>
            </a>
            <button
              onClick={() => {
                setIsNurseAlerted(true);
                setTimeout(() => setIsNurseAlerted(false), 6000);
              }}
              className="px-3 py-1 bg-rose-800 hover:bg-rose-900 text-white rounded-lg font-bold cursor-pointer transition"
            >
              Alert On-Duty Nurse
            </button>
          </div>
        </div>
      )}

      {/* 4. MAIN CONTENT AREA (Conversation on Left/Center, Live Findings Drawer on Right) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* CONVERSATION AREA */}
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mb-3" />
                <p className="text-sm font-bold text-slate-700">Connecting to Anna...</p>
                <p className="text-xs text-slate-400 mt-1">Preparing personalized clinical history context</p>
              </div>
            ) : (
              <>
                {/* Clinical Disclaimer & Scope Badge */}
                <div className="max-w-2xl mx-auto mb-4 p-3 rounded-2xl bg-teal-50/70 border border-teal-200/70 text-[11px] text-teal-900 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>
                    Anna collects clinical history, symptom timelines, and verified documents for your doctor. Anna does not prescribe or provide medical diagnoses.
                  </span>
                </div>

                {interview?.messages.map((msg, idx) => {
                  const isBot = msg.sender === 'bot';
                  const isLastMsg = idx === (interview.messages.length - 1);
                  const isCurrentlySpeaking = ttsState.isSpeaking && ttsState.activeMessageId === msg.id;

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} max-w-3xl mx-auto w-full`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%]">
                        {isBot && (
                          <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center text-xs font-black shrink-0 mb-1 shadow-xs">
                            A
                          </div>
                        )}

                        <div
                          className={`p-4 rounded-3xl text-sm leading-relaxed shadow-xs transition-all ${
                            isBot
                              ? msg.isRedFlagAlert
                                ? 'bg-amber-50 border-2 border-amber-300 text-amber-950 rounded-bl-xs'
                                : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                              : 'bg-teal-700 text-white rounded-br-xs font-medium'
                          }`}
                        >
                          {/* Bot Message Header: Sender name, Language tag, Voice Controls */}
                          {isBot && (
                            <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-slate-100 text-[10px] font-bold text-slate-400">
                              <span className="text-teal-800 uppercase tracking-wider font-extrabold flex items-center gap-1">
                                <span>Anna</span>
                                {msg.language && (
                                  <span className="font-normal text-slate-500 lowercase">
                                    • {getLanguageConfig(msg.language).name}
                                  </span>
                                )}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {/* Voice Replay Button */}
                                <button
                                  onClick={() => {
                                    if (isCurrentlySpeaking) {
                                      textToSpeechService.pause();
                                    } else {
                                      const conf = getLanguageConfig(msg.language || activeLanguageCode);
                                      textToSpeechService.speak(msg.message, conf.bcp47, msg.id, true);
                                    }
                                  }}
                                  className={`p-1 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                    isCurrentlySpeaking
                                      ? 'bg-teal-100 text-teal-800'
                                      : 'hover:bg-slate-100 text-slate-500'
                                  }`}
                                  title={isCurrentlySpeaking ? 'Pause audio' : 'Replay audio'}
                                >
                                  {isCurrentlySpeaking ? (
                                    <>
                                      <Pause className="w-3 h-3 text-teal-700" />
                                      <span className="text-[10px]">Speaking...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3 text-slate-600" />
                                      <span className="text-[10px]">Play Voice</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Message Body */}
                          <p className="whitespace-pre-line">{msg.message}</p>

                          {/* Patient Message Footer: Mode Badge */}
                          {!isBot && (
                            <div className="mt-1 pt-1 border-t border-teal-600/40 text-[9px] text-teal-200 flex items-center justify-end gap-1">
                              <span>{lastInputMethod === 'voice' ? '🎤 Spoken' : '⌨ Typed'}</span>
                              <span>•</span>
                              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Option Suggestion Chips (for Bot's latest message) */}
                      {isBot && isLastMsg && msg.quickOptions && msg.quickOptions.length > 0 && (
                        <div className="mt-2.5 ml-10 flex flex-wrap gap-1.5 max-w-[85%]">
                          {msg.quickOptions.map((opt, i) => (
                            <button
                              key={i}
                              disabled={isSending}
                              onClick={() => {
                                if (opt === 'Confirm & Generate Clinical Report' || opt === 'विवरण की पुष्टि करें और रिपोर्ट बनाएं' || opt === 'अहवाल तयार करा') {
                                  handleGenerateReport();
                                } else {
                                  handleSendMessage(opt, 'text');
                                }
                              }}
                              className="px-3 py-1.5 bg-white hover:bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold shadow-xs hover:border-teal-400 transition cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Typing / Processing Indicator */}
                {isSending && (
                  <div className="flex items-center gap-2 max-w-3xl mx-auto w-full">
                    <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center text-xs font-black shrink-0">
                      A
                    </div>
                    <div className="px-4 py-3 bg-white rounded-3xl rounded-bl-xs border border-slate-200 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                      <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                      <span>Anna is understanding and compiling clinical response...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Speech Error Banner (with Try Again & Type Instead fallback) */}
          {speechError && (
            <div className="mx-4 sm:mx-8 mb-2 p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{speechError}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSpeechRecognition}
                  className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg font-bold text-[11px] cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    setSpeechError(null);
                    textInputRef.current?.focus();
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-amber-300 text-amber-900 rounded-lg font-bold text-[11px] cursor-pointer"
                >
                  Type Instead
                </button>
              </div>
            </div>
          )}

          {/* 5. FIRST-CLASS ACCESSIBLE INPUT BAR */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 shadow-lg">
            <div className="max-w-3xl mx-auto flex items-center gap-2">
              {/* Document / Prescription OCR Button */}
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="p-3 bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 rounded-2xl border border-slate-200 transition cursor-pointer"
                title="Scan Prescription or Medical Document"
              >
                <Camera className="w-5 h-5" />
              </button>

              {/* Text Input (First-class citizen, fully accessible for mute/hearing/typing) */}
              <div className="flex-1 relative">
                <input
                  ref={textInputRef}
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(undefined, 'text');
                    }
                  }}
                  placeholder={
                    isListening
                      ? 'Listening... Speak naturally in your language'
                      : activeLanguageCode === 'hi'
                      ? 'अपनी स्वास्थ्य समस्या या उत्तर लिखें... (Accessible Text Input)'
                      : 'Type your response here... (Accessible Text Input)'
                  }
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-teal-600 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 placeholder:text-slate-400 transition"
                />

                {/* Subtitle / Language indicator inside input */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase select-none pointer-events-none">
                  {activeLanguageCode}
                </div>
              </div>

              {/* Microphone Toggle Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-3 rounded-2xl font-bold transition flex items-center justify-center cursor-pointer shadow-xs ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                    : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200'
                }`}
                title={isListening ? 'Tap to stop speaking' : 'Tap to speak'}
              >
                {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-teal-700" />}
              </button>

              {/* Send Button */}
              <button
                type="button"
                disabled={!inputText.trim() || isSending}
                onClick={() => handleSendMessage(undefined, 'text')}
                className="p-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-2xl transition cursor-pointer shadow-md shadow-teal-700/20"
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Micro-bar: Accessibility & Multilingual Assistance note */}
            <div className="max-w-3xl mx-auto mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Text input & voice are equally supported. Anna speaks all answers automatically.</span>
              <span className="font-semibold text-teal-700">
                🌐 {activeLangConfig.name} ({activeLangConfig.nativeName})
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT DRAWER: LIVE CLINICAL FINDINGS & SUMMARY */}
        {isSummaryOpen && (
          <aside className="w-80 sm:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-xl z-10 transition-all">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                <h3 className="font-extrabold text-sm text-slate-900">Live Clinical Summary</h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isCriticalAlert
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : hasPriorityAlert
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isCriticalAlert ? 'URGENT' : hasPriorityAlert ? 'PRIORITY' : 'ROUTINE'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Progress completion bar */}
              <div>
                <div className="flex justify-between font-bold text-slate-600 mb-1 text-[11px]">
                  <span>Intake Completeness</span>
                  <span>{interview?.completionScore || 10}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-teal-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${interview?.completionScore || 10}%` }}
                  />
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-black text-slate-400 uppercase text-[10px] block mb-1">
                  Chief Complaint
                </span>
                <p className="text-slate-900 font-bold">
                  {interview?.chiefComplaint || 'Pending patient description...'}
                </p>
                {interview?.hpi?.onset && (
                  <div className="mt-1 text-[11px] text-slate-600">
                    <strong>Onset:</strong> {interview.hpi.onset}
                  </div>
                )}
                {interview?.hpi?.severity && (
                  <div className="text-[11px] text-slate-600">
                    <strong>Severity:</strong> {interview.hpi.severity}
                  </div>
                )}
              </div>

              {/* Active Medications (Verbal or OCR) */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-black text-slate-400 uppercase text-[10px] block mb-1">
                  Reported Medications ({interview?.drugHistory.length || 0})
                </span>
                {interview?.drugHistory && interview.drugHistory.length > 0 ? (
                  <ul className="space-y-1">
                    {interview.drugHistory.map((m, i) => (
                      <li key={i} className="text-slate-800 font-semibold flex items-center justify-between">
                        <span>• {m.name}</span>
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-mono">
                          {m.dosage}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic">None reported yet</p>
                )}
              </div>

              {/* Allergies & ADRs */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-black text-slate-400 uppercase text-[10px] block mb-1">
                  Drug & Food Allergies ({interview?.allergies.length || 0})
                </span>
                {interview?.allergies && interview.allergies.length > 0 ? (
                  <ul className="space-y-1">
                    {interview.allergies.map((a, i) => (
                      <li key={i} className="text-rose-800 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                        <span>{a.substance} ({a.reaction || 'Reaction'})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic">No allergies reported</p>
                )}
              </div>

              {/* Attached Documents / OCR Verification */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-slate-400 uppercase text-[10px]">
                    Attached Documents ({interview?.documents.length || 0})
                  </span>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="text-[10px] font-bold text-teal-700 hover:underline cursor-pointer"
                  >
                    + Add Scan
                  </button>
                </div>
                {interview?.documents && interview.documents.length > 0 ? (
                  <div className="space-y-1.5">
                    {interview.documents.map((doc, i) => (
                      <div key={i} className="p-2 bg-white rounded-xl border border-slate-200 text-[11px] flex items-center justify-between">
                        <span className="font-semibold text-slate-800 truncate">{doc.name}</span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1 rounded font-bold">OCR OK</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No prescriptions attached</p>
                )}
              </div>

              {/* Red-Flag Alerts */}
              {interview?.redFlags && interview.redFlags.length > 0 && (
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-950">
                  <span className="font-black uppercase text-[10px] text-rose-700 block mb-1">
                    ⚠️ Red-Flag Safety Alerts
                  </span>
                  <ul className="space-y-1">
                    {interview.redFlags.map((r, i) => (
                      <li key={i} className="text-[11px] font-bold">
                        • {r.ruleTriggered}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom CTA: Generate Clinical Report */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport || !interview?.chiefComplaint}
                className="w-full py-3 bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 disabled:opacity-40 text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGeneratingReport ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compiling Pre-Consult Report...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Generate Clinical Report & Handoff</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* 6. DOCUMENT UPLOAD & OCR SCAN MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-700" />
                <h3 className="font-extrabold text-base text-slate-900">Upload Prescription / Lab Report</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Prescription', 'Lab Report', 'Discharge Summary'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDocUploadType(type)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        docUploadType === type
                          ? 'border-teal-600 bg-teal-50 text-teal-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Prescription Text / Medical Findings (OCR Simulation)
                </label>
                <textarea
                  rows={4}
                  value={docPreviewText}
                  onChange={e => setDocPreviewText(e.target.value)}
                  placeholder="e.g. Rx: Tab Telmisartan 40mg OD, Tab Rosuvastatin 10mg HS. BP: 142/90 mmHg. Total Cholesterol: 218 mg/dL."
                  className="w-full p-3 border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                />
              </div>

              {/* Sample quick presets */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="text-slate-400 font-semibold self-center">Sample OCRs:</span>
                <button
                  type="button"
                  onClick={() => setDocPreviewText('Rx: Tab Telmisartan 40mg OD for Hypertension, Tab Metformin 500mg BD for Diabetes. Known Penicillin allergy.')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                >
                  Cardiac & Diabetes Rx
                </button>
                <button
                  type="button"
                  onClick={() => setDocPreviewText('Lipid Profile Report: Total Cholesterol 240 mg/dL, Triglycerides 190 mg/dL, LDL 152 mg/dL.')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                >
                  Lab Lipid Panel
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!docPreviewText.trim() || isUploadingDoc}
                  onClick={handleUploadDocument}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  {isUploadingDoc ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Scan & Add to Anna</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. DOCTOR SELECTION & HANDOFF MODAL */}
      {isHandoffModalOpen && generatedReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-700" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Doctor Handoff & Clinical Pre-Consultation Delivery
                </h3>
              </div>
              <button
                onClick={() => setIsHandoffModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Report Header summary */}
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-teal-900 uppercase tracking-wider text-[10px]">
                    Structured Clinical Intake Summary
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-teal-700 text-white">
                    {generatedReport.triagePriority} PRIORITY
                  </span>
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {generatedReport.summary.quickClinicalSummary}
                </p>
                <div className="mt-2 text-[10px] text-teal-800 font-semibold italic">
                  Note: AI-Assisted Clinical Intake Summary — Attending physician clinical verification required.
                </div>
              </div>

              {/* Search Doctor by Name & Hospital */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5 text-[11px]">
                  Search Doctor & Hospital / Clinic
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Doctor Name / Specialization..."
                      value={doctorSearchQuery}
                      onChange={e => setDoctorSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-teal-600"
                    />
                  </div>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Hospital / OPD Clinic..."
                      value={hospitalSearchQuery}
                      onChange={e => setHospitalSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                {/* Doctor Selection List */}
                <div className="space-y-2 max-h-52 overflow-y-auto p-1">
                  {filteredDoctors.map(doc => {
                    const isSelected = selectedDoctor?.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={doc.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80'}
                            alt={doc.fullName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs">{doc.fullName}</h4>
                            <p className="text-[11px] text-slate-500">{doc.specialization} • {doc.department}</p>
                            <p className="text-[10px] text-teal-700 font-medium">{doc.hospitalName || 'Outpatient Clinic'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {handoffSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{handoffSuccessMessage}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Selected: <strong className="text-slate-900">{selectedDoctor?.fullName || 'Choose doctor'}</strong>
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsHandoffModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!selectedDoctor || isHandingOff}
                  onClick={handleDeliverToDoctor}
                  className="px-6 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-teal-700/20"
                >
                  {isHandingOff ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending to Doctor Workspace...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Clinical Report to Doctor</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Also export as AnnaClinicalIntake for clear identity
export const AnnaClinicalIntake = AIClinicalChatbot;
export default AIClinicalChatbot;
