import React, { useState, useRef } from 'react';
import {
  Building2,
  Lock,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  KeyRound,
  Clock,
  Info,
  Camera,
  Trash2,
  Upload,
  Globe,
  Layers,
  BedDouble,
  Activity,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { BackButton } from './BackButton';

interface HospitalAuthPageProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
  onAuthSuccess?: () => void;
  onNavigateHome?: () => void;
  onCancel?: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToLogin?: () => void;
}

export const HospitalAuthPage: React.FC<HospitalAuthPageProps> = ({
  initialMode = 'login',
  onSuccess,
  onAuthSuccess,
  onNavigateHome,
  onCancel,
  onSwitchToRegister,
  onSwitchToLogin,
}) => {
  const {
    hospital,
    loginHospital,
    registerHospital,
    logoutHospital,
    isHospitalLoading,
    hospitalError,
    hospitalNotice,
  } = useAuth();
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localNotice, setLocalNotice] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state - Basic Details
  const [hospName, setHospName] = useState('');
  const [hospType, setHospType] = useState('Government Hospital');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Facilities & Capacity
  const [facilities, setFacilities] = useState<string[]>([
    'Emergency',
    'ICU',
    'OPD',
    'IPD',
    'Pharmacy',
    'Laboratory',
  ]);
  const [departments, setDepartments] = useState<string[]>([
    'General Medicine',
    'Cardiology',
    'Ayurveda / Kayachikitsa',
    'Pediatrics',
    'General Surgery',
  ]);
  const [totalBeds, setTotalBeds] = useState('250');
  const [icuBeds, setIcuBeds] = useState('30');
  const [opdCapacity, setOpdCapacity] = useState('500');

  // Administrator Details
  const [adminName, setAdminName] = useState('');
  const [adminContact, setAdminContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    if (onCancel) onCancel();
    else if (onNavigateHome) onNavigateHome();
  };

  const handleAuthSuccess = () => {
    if (onAuthSuccess) onAuthSuccess();
    else if (onSuccess) onSuccess();
  };

  const switchToRegister = () => {
    setMode('register');
    setLocalError(null);
    setLocalNotice(null);
    if (onSwitchToRegister) onSwitchToRegister();
  };

  const switchToLogin = () => {
    setMode('login');
    setLocalError(null);
    setLocalNotice(null);
    if (onSwitchToLogin) onSwitchToLogin();
  };

  const handleFillDemoHospital = (type: 'AIIA' | 'MEDICARE') => {
    setMode('login');
    setLocalError(null);
    setLocalNotice(null);
    if (type === 'AIIA') {
      setLoginEmail('admin@aiia.gov.in');
      setLoginPassword('Hospital@123');
    } else {
      setLoginEmail('admin@medicare.demo');
      setLoginPassword('Hospital@123');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setLocalError('Hospital logo must be less than 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
          setLocalError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalNotice(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLocalError(t.hospitalFillAllFields || 'Please enter hospital email and password.');
      return;
    }

    const res = await loginHospital(loginEmail.trim(), loginPassword);
    if (res.success) {
      handleAuthSuccess();
    } else {
      setLocalError(res.error || t.hospitalAuthError || 'Invalid credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalNotice(null);

    if (
      !hospName.trim() ||
      !licenseNumber.trim() ||
      !officialEmail.trim() ||
      !adminName.trim() ||
      !password.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      setLocalError(t.hospitalFillAllFields || 'Please fill in all mandatory institutional fields.');
      return;
    }

    if (!officialEmail.includes('@') || !officialEmail.includes('.')) {
      setLocalError(t.hospitalInvalidEmail || 'Please provide a valid official hospital email address.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(t.hospitalPasswordMismatch || 'Passwords do not match.');
      return;
    }

    const res = await registerHospital({
      hospitalName: hospName.trim(),
      hospitalType: hospType.trim(),
      licenseNumber: licenseNumber.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      email: officialEmail.trim(),
      contactNumber: contactNumber.trim() || adminContact.trim() || '9876543210',
      adminName: adminName.trim(),
      departments,
      totalBeds: Number(totalBeds) || 100,
      password,
    });

    if (res.success) {
      handleAuthSuccess();
    } else {
      setLocalError(res.error || 'Hospital registration submission failed.');
    }
  };

  // If already authenticated
  if (hospital) {
    return (
      <div className="w-full flex-1 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50">
        <div className="w-full max-w-lg bg-white border border-teal-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-teal-100 text-teal-800 rounded-2xl mx-auto flex items-center justify-center shadow-md">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {hospital.verificationStatus === 'VERIFIED'
                ? t.verifiedHospitalBadge || 'Verified Healthcare Institution'
                : 'Registration Under Review'}
            </span>
            <h2 className="text-2xl font-black text-slate-800 mt-3">{hospital.hospitalName}</h2>
            <p className="text-sm font-semibold text-teal-700 mt-1">
              {hospital.city}, {hospital.state} • {hospital.hospitalType}
            </p>
            <p className="text-xs font-mono text-teal-800 bg-teal-50 px-3 py-1 rounded-md inline-block mt-2 border border-teal-200">
              License: {hospital.licenseNumber}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={handleAuthSuccess}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{t.hospitalDashboardNav || 'Open Hospital Operations'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={logoutHospital}
              className="w-full py-3 px-6 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-all cursor-pointer"
            >
              {t.logoutBtn || 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 bg-slate-50 selection:bg-teal-100 overflow-y-auto">
      <div className="w-full max-w-xl md:max-w-2xl mx-auto my-auto flex flex-col items-center">
        {/* Top bar with back button and quick demo buttons */}
        <div className="w-full mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
          <BackButton
            onClick={handleBack}
            variant="home"
            language={language}
            label={language === 'hi' ? '← मुख्य पृष्ठ' : '← Home'}
          />

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline mr-1">
              Demo Hospital:
            </span>
            <button
              type="button"
              onClick={() => handleFillDemoHospital('AIIA')}
              className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[11px] font-bold transition-all cursor-pointer active:scale-95"
            >
              🏛️ AIIA Delhi
            </button>
            <button
              type="button"
              onClick={() => handleFillDemoHospital('MEDICARE')}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold transition-all cursor-pointer active:scale-95"
            >
              🏥 MediCare Kanpur
            </button>
          </div>
        </div>

        {/* Centered Authentication Card */}
        <div
          className={`w-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col transition-all mx-auto ${
            mode === 'register' ? 'max-h-[calc(100vh-7.5rem)] sm:max-h-[calc(100vh-9rem)]' : ''
          }`}
        >
          {/* Header Banner - Fixed at the top of the card */}
          <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 px-6 py-6 sm:py-7 text-white text-center relative shrink-0">
            <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-2.5 shadow-sm">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {t.hospitalPortalHeading || 'Hospital Administration Portal'}
            </h1>
            <p className="text-xs text-teal-100 max-w-md mx-auto mt-1 leading-relaxed">
              {t.hospitalPortalSubheading ||
                'Manage OPD queues, doctor affiliations, diagnostic departments, and hospital operations.'}
            </p>

            {/* Mode Toggle Tabs */}
            <div className="flex bg-teal-950/40 p-1 rounded-2xl max-w-xs mx-auto mt-4 border border-white/10">
              <button
                type="button"
                onClick={switchToLogin}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                {t.hospitalLoginTab || 'Hospital Sign In'}
              </button>
              <button
                type="button"
                onClick={switchToRegister}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                {t.hospitalRegisterTab || 'Register Hospital'}
              </button>
            </div>
          </div>

          {/* Form Area */}
          <div
            className={
              mode === 'login'
                ? 'p-6 md:p-8'
                : 'flex-1 min-h-0 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth overscroll-contain'
            }
          >
            {(localError || hospitalError) && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{localError || hospitalError}</span>
              </div>
            )}

            {(localNotice || hospitalNotice) && (
              <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{localNotice || hospitalNotice}</span>
              </div>
            )}

            {/* ===================== MODE: LOGIN ===================== */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.hospitalEmailLabel || 'Official Hospital Email'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="admin@aiia.gov.in"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-slate-50/60"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {t.hospitalPasswordLabel || 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="text-xs text-teal-700 hover:text-teal-800 font-semibold cursor-pointer"
                    >
                      {showLoginPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="Hospital@123"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-slate-50/60"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isHospitalLoading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isHospitalLoading ? (
                      <span>{t.hospitalSigningIn || 'Authenticating...'}</span>
                    ) : (
                      <>
                        <span>{t.hospitalSignInBtn || 'Sign In to Hospital Operations'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>Demo: <strong className="font-mono text-teal-900">admin@aiia.gov.in</strong> / <strong className="font-mono text-teal-900">Hospital@123</strong></span>
                  <button
                    type="button"
                    onClick={() => handleFillDemoHospital('AIIA')}
                    className="text-teal-700 font-bold hover:underline cursor-pointer"
                  >
                    Auto Fill
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={switchToRegister}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                  >
                    Register new healthcare institution / hospital →
                  </button>
                </div>
              </form>
            ) : (
              /* ===================== MODE: REGISTER ===================== */
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                {/* SECTION 1: BASIC HOSPITAL DETAILS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Building2 className="w-4 h-4 text-teal-700" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      1. Basic Hospital Details
                    </h3>
                  </div>

                  {/* Logo Upload */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
                    <div className="relative group shrink-0">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Hospital Logo"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-600 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex flex-col items-center justify-center border-2 border-dashed border-teal-300">
                          <Building2 className="w-6 h-6 mb-1 opacity-70" />
                          <span className="text-[9px] font-bold">Logo</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <p className="text-xs font-bold text-slate-800">Hospital Logo</p>
                      <p className="text-[11px] text-slate-500">Upload institution logo or clinical emblem.</p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                        <input
                          type="file"
                          ref={logoInputRef}
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="hospital-logo-input"
                        />
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                        </button>
                        {logoUrl && (
                          <button
                            type="button"
                            onClick={() => setLogoUrl('')}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hospital Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Hospital / Institution Name *
                    </label>
                    <input
                      type="text"
                      value={hospName}
                      onChange={e => setHospName(e.target.value)}
                      placeholder="e.g. Apex Multi-speciality Hospital & Research Centre"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      required
                    />
                  </div>

                  {/* Hospital Type & License */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Hospital Category *
                      </label>
                      <select
                        value={hospType}
                        onChange={e => setHospType(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      >
                        <option value="Government Hospital">Government Hospital</option>
                        <option value="Private Multi-specialty">Private Multi-specialty</option>
                        <option value="Charitable / Trust Hospital">Charitable / Trust Hospital</option>
                        <option value="AYUSH Speciality Hospital">AYUSH Speciality Hospital</option>
                        <option value="Medical College & Research Hospital">Medical College & Research</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Registration / NABH License No. *
                      </label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={e => setLicenseNumber(e.target.value)}
                        placeholder="NABH/2023/10892"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50 font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Number, Email, Website */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Official Phone *
                      </label>
                      <input
                        type="tel"
                        value={contactNumber}
                        onChange={e => setContactNumber(e.target.value)}
                        placeholder="+91 512 2540000"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Official Email *
                      </label>
                      <input
                        type="email"
                        value={officialEmail}
                        onChange={e => setOfficialEmail(e.target.value)}
                        placeholder="admin@hospital.org"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Website (optional)
                      </label>
                      <input
                        type="text"
                        value={website}
                        onChange={e => setWebsite(e.target.value)}
                        placeholder="https://hospital.org"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: LOCATION */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <MapPin className="w-4 h-4 text-teal-700" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      2. Geographic Location
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Address / Landmark *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Plot No. 45, Institutional Area, Ring Road"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="Kanpur"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        District
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        placeholder="Kanpur Nagar"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        State *
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={e => setState(e.target.value)}
                        placeholder="Uttar Pradesh"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={e => setPincode(e.target.value)}
                        placeholder="208001"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50 font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: FACILITIES & CAPACITY */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Activity className="w-4 h-4 text-teal-700" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      3. Facilities, Departments & Bed Capacity
                    </h3>
                  </div>

                  {/* Facilities Checkboxes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Available Facilities
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        'Emergency',
                        'ICU',
                        'OPD',
                        'IPD',
                        'Pharmacy',
                        'Laboratory',
                        'Imaging/Diagnostics',
                        'Ambulance',
                      ].map(fac => (
                        <button
                          key={fac}
                          type="button"
                          onClick={() => {
                            setFacilities(prev =>
                              prev.includes(fac) ? prev.filter(f => f !== fac) : [...prev, fac]
                            );
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all cursor-pointer ${
                            facilities.includes(fac)
                              ? 'bg-teal-50 text-teal-900 border-teal-400'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          <span>{fac}</span>
                          {facilities.includes(fac) && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bed Capacity Counters */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Total Beds
                      </label>
                      <input
                        type="number"
                        value={totalBeds}
                        onChange={e => setTotalBeds(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        ICU Beds
                      </label>
                      <input
                        type="number"
                        value={icuBeds}
                        onChange={e => setIcuBeds(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Daily OPD Cap.
                      </label>
                      <input
                        type="number"
                        value={opdCapacity}
                        onChange={e => setOpdCapacity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: ADMINISTRATOR DETAILS */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      4. Hospital Administrator & Credentials
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Administrator / Medical Supt. Name *
                      </label>
                      <input
                        type="text"
                        value={adminName}
                        onChange={e => setAdminName(e.target.value)}
                        placeholder="Dr. S. K. Verma"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Admin Direct Contact
                      </label>
                      <input
                        type="tel"
                        value={adminContact}
                        onChange={e => setAdminContact(e.target.value)}
                        placeholder="+91 98765 00000"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Create Admin Password *
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confirm Admin Password *
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON - Always visible and reachable */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={isHospitalLoading}
                    className="w-full py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isHospitalLoading ? (
                      <span>Registering Hospital...</span>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span>Submit Hospital Registration & Open Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2.5">
                    ABDM Facility Registry Compliant Institution Onboarding
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
