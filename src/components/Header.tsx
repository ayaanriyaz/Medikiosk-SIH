import React, { useState } from 'react';
import { Workspace, Language } from '../types';
import { useTranslation } from '../i18n';
import { useAuth } from '../auth/AuthContext';
import { BackButton } from './BackButton';
import {
  Stethoscope,
  Building2,
  Home,
  LogOut,
  Users,
  GitFork,
  Pill,
  FlaskConical,
  HeartPulse,
  LayoutGrid,
  Bot,
  Activity,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { LanguageSelectorModal } from './LanguageSelectorModal';

interface HeaderProps {
  currentWorkspace: Workspace;
  setWorkspace: (ws: Workspace) => void;
  language?: Language;
  setLanguage?: (lang: Language) => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentWorkspace,
  setWorkspace,
  onBack,
}) => {
  const { language, setLanguage, t, config } = useTranslation();
  const { doctor, logoutDoctor } = useAuth();
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 shrink-0 shadow-xs sticky top-0 z-40">
      {/* Brand & Back Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {currentWorkspace !== 'home' && (
          <BackButton
            onClick={onBack ? onBack : () => setWorkspace('home')}
            variant={currentWorkspace === 'home' ? 'home' : 'dashboard'}
            label={`← ${t.navHome || t.homeNav || 'Home'}`}
            language={language}
          />
        )}

        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => setWorkspace('home')}
        >
          <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-teal-100 select-none transition-transform hover:scale-105 shrink-0">
            M
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg leading-none tracking-tight text-slate-900">
                {t.appTitle || 'MEDIKIOSK'}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                {t.ruralTag || 'RURAL'}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-tight text-teal-800 font-bold mt-0.5">
              {t.ministryHeader || 'Govt of Maharashtra • MSIS (SIH 26133)'}
            </span>
          </div>
        </div>
      </div>

      {/* Center Navigation Bar */}
      <nav className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button
          onClick={() => setWorkspace('home')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            currentWorkspace === 'home'
              ? 'bg-white text-teal-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Home className="w-3.5 h-3.5 text-teal-600" />
          <span>{t.homeNav || 'Home'}</span>
        </button>

        {/* Live Queue */}
        <button
          onClick={() => setWorkspace('live-queue')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            currentWorkspace === 'live-queue'
              ? 'bg-white text-teal-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.liveQueueNav || 'Live Queue'}</span>
        </button>

        {/* ASHA Health Worker */}
        <button
          onClick={() => setWorkspace('asha-mode')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            currentWorkspace === 'asha-mode'
              ? 'bg-white text-teal-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.ashaWorkerNav || 'ASHA Worker'}</span>
        </button>

        {/* Doctor Portal */}
        <button
          onClick={() => {
            if (doctor) {
              setWorkspace('doctor-dashboard');
            } else {
              setWorkspace('doctor-login');
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            currentWorkspace === 'doctor' ||
            currentWorkspace === 'doctor-login' ||
            currentWorkspace === 'doctor-register' ||
            currentWorkspace === 'doctor-dashboard'
              ? 'bg-white text-teal-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
          <span>
            {doctor
              ? `${doctor.fullName.split(' ')[0] || 'Dr.'}`
              : t.doctorPortalNav || 'Doctor Portal'}
          </span>
        </button>

        {/* Public Health Care Services Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsServicesMenuOpen(!isServicesMenuOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              currentWorkspace === 'referrals' ||
              currentWorkspace === 'diagnostics' ||
              currentWorkspace === 'medicines' ||
              currentWorkspace === 'high-risk-followup' ||
              currentWorkspace === 'district-dashboard'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.ruralCareServices || 'Rural Care Services'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isServicesMenuOpen && (
            <div
              className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1 z-50 text-xs animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setIsServicesMenuOpen(false)}
            >
              <button
                onClick={() => {
                  setWorkspace('referrals');
                  setIsServicesMenuOpen(false);
                }}
                className="w-full text-left p-2 hover:bg-slate-50 rounded-xl font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <GitFork className="w-4 h-4 text-indigo-600" />
                <div>
                  <div>{t.referralNav || 'Referral Network'}</div>
                  <div className="text-[10px] font-normal text-slate-500">{t.referralSub || 'PHC ↔ Sassoon Tertiary Link'}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setWorkspace('medicines');
                  setIsServicesMenuOpen(false);
                }}
                className="w-full text-left p-2 hover:bg-slate-50 rounded-xl font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Pill className="w-4 h-4 text-emerald-600" />
                <div>
                  <div>{t.medicineStockNav || 'Medicine Stock'}</div>
                  <div className="text-[10px] font-normal text-slate-500">{t.medicineStockSub || 'Essential drugs & nearby alternatives'}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setWorkspace('diagnostics');
                  setIsServicesMenuOpen(false);
                }}
                className="w-full text-left p-2 hover:bg-slate-50 rounded-xl font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <FlaskConical className="w-4 h-4 text-cyan-600" />
                <div>
                  <div>{t.diagnosticsNav || 'Diagnostic Labs'}</div>
                  <div className="text-[10px] font-normal text-slate-500">{t.diagnosticsSub || 'Free subsidized tests & slots'}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setWorkspace('high-risk-followup');
                  setIsServicesMenuOpen(false);
                }}
                className="w-full text-left p-2 hover:bg-slate-50 rounded-xl font-bold text-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <div>
                  <div>{t.highRiskNav || 'High-Risk Followup'}</div>
                  <div className="text-[10px] font-normal text-slate-500">{t.highRiskSub || 'Maternal ANC & Child SAM/MAM'}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setWorkspace('district-dashboard');
                  setIsServicesMenuOpen(false);
                }}
                className="w-full text-left p-2 hover:bg-slate-50 rounded-xl font-bold text-slate-800 flex items-center gap-2 border-t border-slate-100 mt-1 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-slate-900" />
                <div>
                  <div>{t.districtNav || 'District Dashboard'}</div>
                  <div className="text-[10px] font-normal text-slate-500">{t.districtSub || 'Pune District Public Health (MSIS)'}</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Multilingual AI Chatbot Button */}
        <button
          onClick={() => setWorkspace('ai-chatbot')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            currentWorkspace === 'ai-chatbot'
              ? 'bg-white text-teal-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-teal-600" />
          <span>{t.aiAssistantNav || 'AI Assistant'}</span>
        </button>
      </nav>

      {/* Right Controls: Trilingual Selector (EN, HI, MR) + Global Modal */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              language === 'en'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              language === 'hi'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => setLanguage('mr')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              language === 'mr'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            मराठी
          </button>

          {/* More Global Languages Picker Button */}
          <button
            onClick={() => setIsLangModalOpen(true)}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              language !== 'en' && language !== 'hi' && language !== 'mr'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-teal-800 hover:bg-slate-200'
            }`}
            title={t.browseAllLanguages || 'Browse all Indian & Global Languages'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {language !== 'en' && language !== 'hi' && language !== 'mr'
                ? config.nativeName
                : t.moreLanguages || 'More'}
            </span>
          </button>
        </div>

        {/* Global Language Selector Modal */}
        <LanguageSelectorModal
          isOpen={isLangModalOpen}
          onClose={() => setIsLangModalOpen(false)}
        />

        {/* Active Auth Logout */}
        {doctor && (
          <button
            onClick={() => {
              logoutDoctor();
              setWorkspace('home');
            }}
            title={t.logoutDoctor || 'Logout Doctor'}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-red-700 text-xs rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px] font-semibold">{t.logoutBtn || 'Logout'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
