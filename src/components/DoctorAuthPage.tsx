import React, { useState, useRef } from 'react';
import {
  Stethoscope,
  Lock,
  Mail,
  User,
  Phone,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FileBadge2,
  Building2,
  Calendar,
  Camera,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { BackButton } from './BackButton';

interface DoctorAuthPageProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
  onAuthSuccess?: () => void;
  onNavigateHome?: () => void;
  onCancel?: () => void;
  onSwitchToRegister?: () => void;
  onSwitchToLogin?: () => void;
}

export const DoctorAuthPage: React.FC<DoctorAuthPageProps> = ({
  initialMode = 'login',
  onSuccess,
  onAuthSuccess,
  onNavigateHome,
  onCancel,
  onSwitchToRegister,
  onSwitchToLogin,
}) => {
  const { doctor, loginDoctor, registerDoctor, logoutDoctor, isDoctorLoading, doctorError } = useAuth();
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state - Personal Information
  const [regFullName, setRegFullName] = useState('');
  const [regAvatarUrl, setRegAvatarUrl] = useState('');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regDob, setRegDob] = useState('1988-05-15');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Professional Information
  const [regNumber, setRegNumber] = useState('');
  const [regCouncil, setRegCouncil] = useState('National Medical Commission');
  const [regQualification, setRegQualification] = useState('MBBS, MD');
  const [regSubSpecialization, setRegSubSpecialization] = useState('');
  const [regSpecialization, setRegSpecialization] = useState('General Medicine');
  const [regExperience, setRegExperience] = useState('8');
  const [regBio, setRegBio] = useState('');
  const [regLanguages, setRegLanguages] = useState<string[]>(['English', 'Hindi']);

  // Practice Information
  const [regDepartment, setRegDepartment] = useState('Outpatient Department (OPD)');
  const [regConsultationTypes, setRegConsultationTypes] = useState<string[]>(['OPD', 'Teleconsultation']);
  const [regOpdTimings, setRegOpdTimings] = useState('Mon - Sat: 09:00 AM - 02:00 PM');
  const [regEmergencyAvailable, setRegEmergencyAvailable] = useState('No');

  // Hospital Information
  const [regHospitalMode, setRegHospitalMode] = useState<'SELECT' | 'CUSTOM'>('SELECT');
  const [regHospitalId, setRegHospitalId] = useState('HOSP-202');
  const [regHospitalName, setRegHospitalName] = useState('MediCare Hospital');
  const [regHospitalCity, setRegHospitalCity] = useState('Kanpur');
  const [regHospitalState, setRegHospitalState] = useState('Uttar Pradesh');
  const [regHospitalDepartment, setRegHospitalDepartment] = useState('Department of Internal Medicine');
  const [regHospitalRole, setRegHospitalRole] = useState('Attending Consultant Physician');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (onSwitchToRegister) onSwitchToRegister();
  };

  const switchToLogin = () => {
    setMode('login');
    setLocalError(null);
    if (onSwitchToLogin) onSwitchToLogin();
  };

  // Demo accounts helper (Requirement 19)
  const handleFillDemoDoctor = (docType: 1 | 2 | 3) => {
    setMode('login');
    setLocalError(null);
    if (docType === 1) {
      setLoginIdentifier('dr.ananya@medikiosk.demo');
      setLoginPassword('Doctor@123');
    } else if (docType === 2) {
      setLoginIdentifier('dr.rahul@medikiosk.demo');
      setLoginPassword('Doctor@123');
    } else {
      setLoginIdentifier('dr.meera@medikiosk.demo');
      setLoginPassword('Doctor@123');
    }
  };

  // Photo upload handler (Requirement 5)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setLocalError('Photo file size must be less than 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setRegAvatarUrl(reader.result);
          setLocalError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setRegAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLocalError(t.doctorFillAllFields || 'Please enter your login identifier and password.');
      return;
    }

    const res = await loginDoctor(loginIdentifier.trim(), loginPassword);
    if (res.success) {
      handleAuthSuccess();
    } else {
      setLocalError(res.error || t.doctorAuthError || 'Invalid credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (
      !regFullName.trim() ||
      !regEmail.trim() ||
      !regMobile.trim() ||
      !regNumber.trim() ||
      !regPassword.trim()
    ) {
      setLocalError(t.doctorFillAllFields || 'Please fill in all mandatory fields (Name, Email, Mobile, Reg No, Password).');
      return;
    }

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setLocalError(t.doctorInvalidEmail || 'Please enter a valid email address.');
      return;
    }

    if (regPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setLocalError(t.doctorPasswordMismatch || 'Passwords do not match.');
      return;
    }

    const res = await registerDoctor({
      fullName: regFullName.trim(),
      email: regEmail.trim(),
      mobile: regMobile.trim(),
      registrationNumber: regNumber.trim(),
      council: regCouncil.trim(),
      specialization: regSpecialization.trim(),
      subSpecialization: regSubSpecialization.trim() || undefined,
      qualification: regQualification.trim(),
      experienceYears: Number(regExperience) || 3,
      department: regDepartment.trim(),
      languages: regLanguages,
      avatarUrl: regAvatarUrl || undefined,
      gender: regGender,
      dob: regDob,
      hospitalId: regHospitalMode === 'SELECT' ? regHospitalId : undefined,
      hospitalName: regHospitalName.trim(),
      city: regHospitalCity.trim(),
      state: regHospitalState.trim(),
      consultationType: regConsultationTypes,
      bio: regBio.trim() || `${regQualification} in ${regSpecialization} with ${regExperience} years of experience.`,
      password: regPassword,
    });

    if (res.success) {
      handleAuthSuccess();
    } else {
      setLocalError(res.error || 'Registration failed. Please try again.');
    }
  };

  // If already authenticated
  if (doctor) {
    return (
      <div className="w-full flex-1 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50">
        <div className="w-full max-w-lg bg-white border border-teal-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="relative inline-block mx-auto">
            {doctor.avatarUrl ? (
              <img
                src={doctor.avatarUrl}
                alt={doctor.fullName}
                className="w-20 h-20 rounded-full object-cover border-4 border-teal-100 shadow-md mx-auto"
              />
            ) : (
              <div className="w-20 h-20 bg-teal-100 text-teal-800 rounded-full mx-auto flex items-center justify-center shadow-md">
                <Stethoscope className="w-10 h-10" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t.loggedInDoctorBadge || 'Authenticated Doctor'}
            </span>
            <h2 className="text-2xl font-black text-slate-800 mt-3">{doctor.fullName}</h2>
            <p className="text-sm font-semibold text-teal-700 mt-1">
              {doctor.qualification} • {doctor.specialization}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {doctor.hospitalName || 'Outpatient Consultation'}
            </p>
            <p className="text-xs font-mono text-teal-800 bg-teal-50 px-3 py-1 rounded-md inline-block mt-3 border border-teal-200">
              Reg. No: {doctor.registrationNumber}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={handleAuthSuccess}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{t.doctorDashboardNav || 'Open Doctor Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={logoutDoctor}
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

          {/* 3 Working Demo Doctor Accounts Pills (Requirement 19) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline mr-1">
              Demo:
            </span>
            <button
              type="button"
              onClick={() => handleFillDemoDoctor(1)}
              title="Dr. Ananya Sharma - General Medicine"
              className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[11px] font-bold transition-all cursor-pointer shrink-0 active:scale-95"
            >
              🩺 Dr. Ananya (Medicine)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemoDoctor(2)}
              title="Dr. Rahul Verma - Cardiology"
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold transition-all cursor-pointer shrink-0 active:scale-95"
            >
              ❤️ Dr. Rahul (Cardio)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemoDoctor(3)}
              title="Dr. Meera Kapoor - Ayurveda"
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold transition-all cursor-pointer shrink-0 active:scale-95"
            >
              🌿 Dr. Meera (Ayush)
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
          <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 px-6 py-6 sm:py-7 text-white text-center relative shrink-0">
            <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-2.5 shadow-sm">
              <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {t.doctorPortalHeading || 'Doctor Clinical Portal'}
            </h1>
            <p className="text-xs text-teal-100 max-w-md mx-auto mt-1 leading-relaxed">
              {t.doctorPortalSubheading ||
                'Access verified patient histories, AI symptom analysis, and pre-consultation clinical reports.'}
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
                {t.doctorLoginTab || 'Doctor Sign In'}
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
                {t.doctorRegisterTab || 'Register Doctor'}
              </button>
            </div>
          </div>

          {/* Form Area - Naturally fits in login mode, smoothly scrollable in register mode */}
          <div
            className={
              mode === 'login'
                ? 'p-6 md:p-8'
                : 'flex-1 min-h-0 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth overscroll-contain'
            }
          >
            {(localError || doctorError) && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{localError || doctorError}</span>
              </div>
            )}

            {/* ===================== MODE: LOGIN ===================== */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.doctorIdentifierLabel || 'Email or Mobile Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={e => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. dr.ananya@medikiosk.demo or +91 98765 11111"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-slate-50/60"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {t.doctorPasswordLabel || 'Password'}
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
                      placeholder="Enter password (e.g. Doctor@123)"
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
                    disabled={isDoctorLoading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isDoctorLoading ? (
                      <span>{t.doctorSigningIn || 'Signing in...'}</span>
                    ) : (
                      <>
                        <span>{t.doctorSignInBtn || 'Sign In to Doctor Portal'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Hint Card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                    <span>Demo Doctor Accounts (Password: Doctor@123):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-[11px]">
                    <span className="font-mono bg-white p-1 rounded border border-slate-200 text-teal-900">
                      dr.ananya@medikiosk.demo
                    </span>
                    <span className="font-mono bg-white p-1 rounded border border-slate-200 text-teal-900">
                      dr.rahul@medikiosk.demo
                    </span>
                    <span className="font-mono bg-white p-1 rounded border border-slate-200 text-teal-900">
                      dr.meera@medikiosk.demo
                    </span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={switchToRegister}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                  >
                    New practitioner? Complete Doctor Registration Form →
                  </button>
                </div>
              </form>
            ) : (
              /* ===================== MODE: REGISTER ===================== */
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                {/* SECTION 1: PERSONAL INFORMATION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <User className="w-4 h-4 text-teal-700" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      1. Personal Information
                    </h3>
                  </div>

                  {/* Profile Photo Upload (Requirement 5) */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-teal-50/50 rounded-2xl border border-teal-100">
                    <div className="relative group shrink-0">
                      {regAvatarUrl ? (
                        <img
                          src={regAvatarUrl}
                          alt="Doctor Preview"
                          className="w-20 h-20 rounded-full object-cover border-3 border-teal-600 shadow-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-teal-100 text-teal-700 flex flex-col items-center justify-center border-2 border-dashed border-teal-300">
                          <Camera className="w-6 h-6 mb-1 opacity-70" />
                          <span className="text-[9px] font-bold">Photo</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <p className="text-xs font-bold text-slate-800">Profile Photo</p>
                      <p className="text-[11px] text-slate-500">
                        Upload doctor profile photo (JPG, PNG). Will appear on reports & dashboard.
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="doctor-photo-input"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{regAvatarUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                        </button>
                        {regAvatarUrl && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name (with title) *
                    </label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Kumar Sharma"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      required
                    />
                  </div>

                  {/* Gender & DOB */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Gender
                      </label>
                      <select
                        value={regGender}
                        onChange={e => setRegGender(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={regDob}
                        onChange={e => setRegDob(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Mobile & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        value={regMobile}
                        onChange={e => setRegMobile(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="doctor@hospital.in"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Create Password *
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confirm Password *
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: PROFESSIONAL INFORMATION */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Award className="w-4 h-4 text-teal-700" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      2. Professional Information
                    </h3>
                  </div>

                  {/* Reg Number & Medical Council */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Medical Registration No. *
                      </label>
                      <input
                        type="text"
                        value={regNumber}
                        onChange={e => setRegNumber(e.target.value)}
                        placeholder="e.g. UPMC/2020/78901 or NMC/8912"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        State / National Council
                      </label>
                      <input
                        type="text"
                        value={regCouncil}
                        onChange={e => setRegCouncil(e.target.value)}
                        placeholder="e.g. Uttar Pradesh Medical Council"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Qualification & Degree */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Primary Qualification *
                      </label>
                      <input
                        type="text"
                        value={regQualification}
                        onChange={e => setRegQualification(e.target.value)}
                        placeholder="e.g. MBBS, MD or BAMS, MD (Ayurveda)"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Sub-Specialization / Fellowship
                      </label>
                      <input
                        type="text"
                        value={regSubSpecialization}
                        onChange={e => setRegSubSpecialization(e.target.value)}
                        placeholder="e.g. Interventional Cardiology / Panchakarma"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Specialization & Experience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Specialization Category *
                      </label>
                      <select
                        value={regSpecialization}
                        onChange={e => setRegSpecialization(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      >
                        <option value="General Medicine">General Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Ayurveda">Ayurveda / Kayachikitsa</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Pulmonology">Pulmonology</option>
                        <option value="Gastroenterology">Gastroenterology</option>
                        <option value="General Surgery">General Surgery</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={regExperience}
                        onChange={e => setRegExperience(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Languages Spoken */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Consultation Languages
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['English', 'Hindi', 'Sanskrit', 'Bengali', 'Marathi', 'Tamil', 'Telugu'].map(lang => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            setRegLanguages(prev =>
                              prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
                            );
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            regLanguages.includes(lang)
                              ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Professional Bio */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Professional Bio / Clinical Focus
                    </label>
                    <textarea
                      rows={2}
                      value={regBio}
                      onChange={e => setRegBio(e.target.value)}
                      placeholder="Brief clinical background, special patient care interests, academic appointments..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* SECTION 3: PRACTICE INFORMATION */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <FileBadge2 className="w-4 h-4 text-teal-700" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      3. Practice Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Practice Department
                      </label>
                      <input
                        type="text"
                        value={regDepartment}
                        onChange={e => setRegDepartment(e.target.value)}
                        placeholder="e.g. General OPD or CCU"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        OPD Timings / Availability
                      </label>
                      <input
                        type="text"
                        value={regOpdTimings}
                        onChange={e => setRegOpdTimings(e.target.value)}
                        placeholder="e.g. Mon-Sat 09:00 AM - 02:00 PM"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Consultation Types
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['OPD', 'Teleconsultation', 'Emergency', 'IPD'].map(ct => (
                          <button
                            key={ct}
                            type="button"
                            onClick={() => {
                              setRegConsultationTypes(prev =>
                                prev.includes(ct) ? prev.filter(c => c !== ct) : [...prev, ct]
                              );
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              regConsultationTypes.includes(ct)
                                ? 'bg-teal-700 text-white border-teal-700'
                                : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            {ct}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Emergency Availability
                      </label>
                      <select
                        value={regEmergencyAvailable}
                        onChange={e => setRegEmergencyAvailable(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      >
                        <option value="No">No - Scheduled OPD Only</option>
                        <option value="Yes">Yes - On-Call Emergency</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: HOSPITAL AFFILIATION */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Building2 className="w-4 h-4 text-teal-700" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      4. Hospital Affiliation Information
                    </h3>
                  </div>

                  {/* Hospital Connection Workflow Notice (Requirement 4) */}
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Hospital Connection Workflow:</p>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        When you select a hospital, an official affiliation request will be generated with status{' '}
                        <strong className="text-amber-950 font-bold">Pending Approval</strong>. The hospital
                        administrator will review and approve your credentials.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Select Hospital or Enter Details
                      </label>
                      <select
                        value={regHospitalMode === 'SELECT' ? regHospitalId : 'CUSTOM'}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'CUSTOM') {
                            setRegHospitalMode('CUSTOM');
                            setRegHospitalId('');
                            setRegHospitalName('');
                          } else {
                            setRegHospitalMode('SELECT');
                            setRegHospitalId(val);
                            if (val === 'HOSP-202') {
                              setRegHospitalName('MediCare Hospital');
                              setRegHospitalCity('Kanpur');
                              setRegHospitalState('Uttar Pradesh');
                              setRegHospitalDepartment('Department of Internal Medicine');
                            } else if (val === 'HOSP-203') {
                              setRegHospitalName('City Heart Hospital');
                              setRegHospitalCity('Lucknow');
                              setRegHospitalState('Uttar Pradesh');
                              setRegHospitalDepartment('Cardiology & CCU');
                            } else if (val === 'HOSP-204') {
                              setRegHospitalName('Ayush Wellness Hospital');
                              setRegHospitalCity('Kanpur');
                              setRegHospitalState('Uttar Pradesh');
                              setRegHospitalDepartment('Kayachikitsa & Panchakarma Unit');
                            } else if (val === 'HOSP-201') {
                              setRegHospitalName('All India Institute of Ayurveda & Hospital');
                              setRegHospitalCity('New Delhi');
                              setRegHospitalState('Delhi');
                              setRegHospitalDepartment('Department of Kayachikitsa');
                            }
                          }
                        }}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                      >
                        <option value="HOSP-202">MediCare Hospital (Kanpur)</option>
                        <option value="HOSP-203">City Heart Hospital (Lucknow)</option>
                        <option value="HOSP-204">Ayush Wellness Hospital (Kanpur)</option>
                        <option value="HOSP-201">All India Institute of Ayurveda (New Delhi)</option>
                        <option value="CUSTOM">+ Enter Different Hospital Name</option>
                      </select>
                    </div>

                    {regHospitalMode === 'CUSTOM' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Hospital Name *
                          </label>
                          <input
                            type="text"
                            value={regHospitalName}
                            onChange={e => setRegHospitalName(e.target.value)}
                            placeholder="e.g. Apex Multi-speciality Hospital"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            City
                          </label>
                          <input
                            type="text"
                            value={regHospitalCity}
                            onChange={e => setRegHospitalCity(e.target.value)}
                            placeholder="City"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            State
                          </label>
                          <input
                            type="text"
                            value={regHospitalState}
                            onChange={e => setRegHospitalState(e.target.value)}
                            placeholder="State"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Hospital Department
                        </label>
                        <input
                          type="text"
                          value={regHospitalDepartment}
                          onChange={e => setRegHospitalDepartment(e.target.value)}
                          placeholder="e.g. Department of Medicine"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Doctor's Role / Designation
                        </label>
                        <input
                          type="text"
                          value={regHospitalRole}
                          onChange={e => setRegHospitalRole(e.target.value)}
                          placeholder="e.g. Attending Consultant / HOD"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON - Always visible and reachable at the bottom of the form */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={isDoctorLoading}
                    className="w-full py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isDoctorLoading ? (
                      <span>Submitting Registration...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Register Doctor & Open Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2.5">
                    ABDM & Medical Council Compliant Practitioner Onboarding
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
