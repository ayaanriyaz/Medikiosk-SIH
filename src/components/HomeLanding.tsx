import React from 'react';
import { Workspace, Language } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import {
  FileText,
  Stethoscope,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Activity,
  UserCheck,
  Building2,
  Users,
  GitFork,
  Pill,
  FlaskConical,
  HeartPulse,
  Bot,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface HomeLandingProps {
  setWorkspace: (ws: Workspace) => void;
  language?: Language;
  setLanguage?: (lang: Language) => void;
  onQuickDemoStart?: () => void;
}

export const HomeLanding: React.FC<HomeLandingProps> = ({
  setWorkspace,
}) => {
  const { t, localize, isMarathi, isHindi } = useLanguage();
  const { doctor, hospital } = useAuth();

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 text-teal-100 px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-600 text-white px-2 py-0.5 rounded font-black uppercase text-[10px]">
            {t.homeTopBannerTag || 'SIH 26133'}
          </span>
          <span className="font-semibold text-slate-200">
            {t.homeTopBannerTitle || 'Maharashtra Rural Connected Healthcare & Care Access Platform'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-teal-300">
          <span>{t.homeBadgeFhir || 'Sub-Centres ↔ PHCs ↔ RHs ↔ Tertiary'}</span>
          <span>•</span>
          <span>{isMarathi ? 'मराठी / हिन्दी / English' : t.homeBadgeBilingual || 'Marathi / Hindi / English'}</span>
          <span>•</span>
          <span>{t.homeBadgeVoice || 'Voice-First AI & Offline Sync'}</span>
        </div>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-10 py-10 max-w-6xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.homeNextGenBadge || 'One Patient. One Connected Care Journey.'}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            {t.homeHeroTitle1 || 'Rural Healthcare Access, '}
            <span className="text-teal-700">{t.homeHeroTitle2 || 'Connected End-to-End'}</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-8 max-w-2xl mx-auto">
            {t.homeHeroDesc ||
              'Empowering rural citizens, frontline ASHA workers, and Primary Health Centres with live triage queues, 108 emergency referrals, diagnostic booking, and essential medicine stock routing.'}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setWorkspace('patient')}
              className="px-7 py-3.5 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 text-white rounded-2xl font-bold text-base shadow-xl shadow-teal-700/20 transition-all flex items-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <UserCheck className="w-5 h-5 text-teal-200" />
              <span>{isMarathi ? 'रुग्ण नोंदणी सुरू करा' : isHindi ? 'रोगी पंजीकरण शुरू करें' : 'Start Patient Check-In'}</span>
            </button>

            <button
              onClick={() => setWorkspace('live-queue')}
              className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-base shadow-lg transition flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>{t.liveWaitingQueue || 'Live Waiting Queue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setWorkspace('ai-chatbot')}
              className="px-7 py-3.5 bg-white hover:bg-teal-50 text-teal-800 border-2 border-teal-600 rounded-2xl font-bold text-base shadow-md transition flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Bot className="w-5 h-5 text-teal-600" />
              <span>{t.annaAiAssistant || 'Anna AI Clinical Assistant'}</span>
            </button>
          </div>
        </div>

        {/* 6 Essential Roles & Workspaces Grid */}
        <div className="w-full mb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-700" />
              <span>{t.selectRoleWorkspace || 'Role-Based Access & Public Health Workspaces'}</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              {t.subCentresPhcBhor || 'Sub-Centres • PHC Bhor • District Hospital • MSIS'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. PATIENT KIOSK */}
            <div
              onClick={() => setWorkspace('patient')}
              className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-teal-500 hover:shadow-md cursor-pointer transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                    {t.citizenAccess || 'CITIZEN ACCESS'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-teal-50 group-hover:bg-teal-700 text-teal-700 group-hover:text-white flex items-center justify-center transition">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-teal-700 transition">
                  {t.roleCardPatientTitle || 'Patient Kiosk & Intake'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.patientCardDesc || 'Low-literacy assisted registration with bilingual voice prompts, ABHA number linking, and symptom triage.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-teal-700">
                <span>{t.roleCardPatientAction || 'Enter Patient Kiosk'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. LIVE WAITING QUEUE */}
            <div
              onClick={() => setWorkspace('live-queue')}
              className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-emerald-500 hover:shadow-md cursor-pointer transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {t.opdManagement || 'OPD MANAGEMENT'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-700 text-emerald-700 group-hover:text-white flex items-center justify-center transition">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-emerald-700 transition">
                  {t.liveQueueNav || 'Live Waiting Queue & Triage'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.liveQueueCardDesc || 'Real-time token display, triage categorization (Critical, Medium, Stable), and doctor consultation rooms.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700">
                <span>{t.openQueue || 'Open Live Queue'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. ASHA HEALTH WORKER */}
            <div
              onClick={() => setWorkspace('asha-mode')}
              className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-teal-500 hover:shadow-md cursor-pointer transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200">
                    {t.communityFrontline || 'COMMUNITY FRONTLINE'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 group-hover:bg-purple-700 text-purple-700 group-hover:text-white flex items-center justify-center transition">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-purple-700 transition">
                  {t.ashaWorkerNav || 'ASHA & ANM Worker Companion'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.ashaCardDesc || 'Sub-centre doorstep registration, maternal ANC tracking, child vaccines, and offline local caching with batch sync.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-purple-700">
                <span>{t.startAshaHub || 'Open ASHA Hub'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 4. DOCTOR WORKSPACE */}
            <div
              onClick={() => {
                if (doctor) {
                  setWorkspace('doctor-dashboard');
                } else {
                  setWorkspace('doctor-login');
                }
              }}
              className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-teal-500 hover:shadow-md cursor-pointer transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                    {t.clinicalDiagnosis || 'CLINICAL DIAGNOSIS'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-teal-50 group-hover:bg-teal-700 text-teal-700 group-hover:text-white flex items-center justify-center transition">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-teal-700 transition">
                  {t.roleCardDoctorTitle || 'Doctor Clinical Workspace'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.doctorCardDesc || 'EHR review, vitals trends, prescription generation, referral initiation, and longitudinal progress reports.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-teal-700">
                <span>{doctor ? (t.openDoctorDashboard || 'Open Active Dashboard') : (t.doctorSignIn || 'Doctor Sign In')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 5. REFERRAL MANAGEMENT & 108 AMBULANCE */}
            <div
              onClick={() => setWorkspace('referrals')}
              className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-indigo-500 hover:shadow-md cursor-pointer transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {t.continuumOfCare || 'CONTINUUM OF CARE'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 group-hover:bg-indigo-700 text-indigo-700 group-hover:text-white flex items-center justify-center transition">
                    <GitFork className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-indigo-700 transition">
                  {t.referralNav || 'Two-Way Referral & 108 Linkage'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.referralCardDesc || 'Real-time referral tracking to Sassoon Hospital, counter-referrals, ambulance dispatch, and bed booking.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-700">
                <span>{t.emergencyReferrals || 'Emergency Referrals'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 6. DISTRICT HEALTH COMMAND (MSIS) */}
            <div
              onClick={() => setWorkspace('district-dashboard')}
              className="p-5 bg-white border border-slate-200 rounded-3xl hover:border-slate-800 hover:shadow-md cursor-pointer transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-900 text-emerald-400">
                    {t.publicHealthMsis || 'PUBLIC HEALTH (MSIS)'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-slate-900 text-slate-800 group-hover:text-white flex items-center justify-center transition">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-slate-900 transition">
                  {t.districtNav || 'District Health Oversight Dashboard'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t.districtCardDesc || 'District-wide public health indicators: daily footfall, average wait times, drug stock alerts, and high-risk maternal alerts.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-slate-800">
                <span>{t.openDistrictDashboard || 'Open District Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Strip: Medicines, Diagnostics, High Risk, Chatbot */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          <button
            onClick={() => setWorkspace('medicines')}
            className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-xs transition text-left flex items-center gap-3 cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">{t.medicineStockNav || 'Medicine Stock'}</div>
              <div className="text-[10px] text-slate-500">{t.liveInventoryNearby || 'Live inventory & nearby routing'}</div>
            </div>
          </button>

          <button
            onClick={() => setWorkspace('diagnostics')}
            className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-xs transition text-left flex items-center gap-3 cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">{t.diagnosticsNav || 'Diagnostic Labs'}</div>
              <div className="text-[10px] text-slate-500">{t.freeSubsidizedSlots || 'Free subsidized tests & slots'}</div>
            </div>
          </button>

          <button
            onClick={() => setWorkspace('high-risk-followup')}
            className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-xs transition text-left flex items-center gap-3 cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">{t.highRiskNav || 'High-Risk Followup'}</div>
              <div className="text-[10px] text-slate-500">{t.maternalAncChild || 'Maternal ANC & Child SAM/MAM'}</div>
            </div>
          </button>

          <button
            onClick={() => setWorkspace('ai-chatbot')}
            className="p-3.5 bg-white rounded-2xl border border-teal-200 hover:border-teal-500 hover:shadow-xs transition text-left flex items-center gap-3 cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">{t.annaAiAssistant || 'Anna — Clinical Intake AI'}</div>
              <div className="text-[10px] text-teal-700 font-semibold">{t.multilingualVoiceHandoff || 'Multilingual voice & doctor handoff'}</div>
            </div>
          </button>
        </div>

        {/* The MediKiosk Solution Banner */}
        <div className="w-full bg-white p-6 sm:p-8 rounded-3xl border border-teal-100 shadow-xs mb-12">
          <div className="flex items-center gap-2 mb-2 text-teal-800 font-extrabold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>{t.solutionBadge || 'Strengthening Public Healthcare'}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            {t.solutionTitle || 'A Unified Care Continuum for Rural Maharashtra'}
          </h3>
          <p className="text-xs text-slate-600 mb-6 max-w-3xl leading-relaxed">
            {t.solutionDesc ||
              'By establishing direct digital links between village Sub-Centres, PHCs, Rural Hospitals, and District Hospitals, MediKiosk eliminates referral leakage and reduces rural patient travel time.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
              <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs mb-2">
                ✓
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1">
                {t.solPoint1Title || 'Reduced OPD Crowding'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.solPoint1Desc || 'Pre-intake and dynamic digital triage reduce physical doctor consultation bottlenecks by over 60%.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
              <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs mb-2">
                ✓
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1">
                {t.solPoint2Title || 'Zero Referral Leakage'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.solPoint2Desc || 'Two-way referral loops ensure patients sent to tertiary hubs like Sassoon Hospital have booked beds, ambulance transport, and counter-referrals.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
              <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs mb-2">
                ✓
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1">
                {t.solPoint3Title || 'Pharmacy Stock Transparency'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.solPoint3Desc || 'Real-time visibility into essential drug inventories prevents patients from traveling to unstocked PHCs.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
              <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs mb-2">
                ✓
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1">
                {t.solPoint4Title || 'Offline-First ASHA Companion'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.solPoint4Desc || 'Doorstep screening for high-risk maternal ANC and children with zero-connectivity local storage and 1-click batch synchronization.'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between px-4 sm:px-10 shrink-0 text-[11px] text-slate-500 font-medium">
        <div>
          {isMarathi
            ? 'महाराष्ट्र शासन • सार्वजनिक आरोग्य विभाग • एसआयएच २६१३३'
            : 'Government of Maharashtra • Public Health Department • SIH 26133'}
        </div>
        <div className="flex items-center gap-4 uppercase tracking-wider text-[10px]">
          <span className="text-teal-700 font-bold">ABDM / ABHA READY</span>
          <span className="text-slate-300">|</span>
          <span className="text-teal-700 font-bold">FHIR R4 STANDARD</span>
          <span className="text-slate-300">|</span>
          <span className="text-teal-700 font-bold">OFFLINE SYNC ENABLED</span>
        </div>
      </footer>
    </div>
  );
};
