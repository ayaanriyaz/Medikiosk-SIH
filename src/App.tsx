import React, { useState } from 'react';
import { Workspace, Intake, Patient } from './types';
import { useLanguage } from './i18n/LanguageContext';
import { useAuth } from './auth/AuthContext';
import { Header } from './components/Header';
import { HomeLanding } from './components/HomeLanding';
import { PatientKiosk } from './components/PatientKiosk';
import { DoctorWorkspace } from './components/DoctorWorkspace';
import { HospitalOperations } from './components/HospitalOperations';
import { DoctorAuthPage } from './components/DoctorAuthPage';
import { HospitalAuthPage } from './components/HospitalAuthPage';
import { FhirModal } from './components/FhirModal';

// Rural Health Access Modules (SIH Problem Statement 26133)
import { LiveWaitingQueueView } from './components/LiveWaitingQueueView';
import { AshaModeView } from './components/AshaModeView';
import { ReferralManagementView } from './components/ReferralManagementView';
import { DiagnosticCoordinationView } from './components/DiagnosticCoordinationView';
import { MedicineStockView } from './components/MedicineStockView';
import { HighRiskFollowupView } from './components/HighRiskFollowupView';
import { DistrictHealthDashboard } from './components/DistrictHealthDashboard';
import { MultilingualHealthcareChatbot } from './components/MultilingualHealthcareChatbot';
import { AIChatbotWorkspace } from './components/AIChatbotWorkspace';
import { DoctorProgressReportModal } from './components/DoctorProgressReportModal';

export default function App() {
  const [workspace, setWorkspaceState] = useState<Workspace>('home');
  const [history, setHistory] = useState<Workspace[]>([]);
  const { language, setLanguage } = useLanguage();
  const { doctor, hospital } = useAuth();
  const [selectedPatientForDoctor, setSelectedPatientForDoctor] = useState<string | null>(null);
  const [activeFhirIntakeId, setActiveFhirIntakeId] = useState<string | null>(null);
  const [activeProgressReportPatientId, setActiveProgressReportPatientId] = useState<string | null>(null);

  const setWorkspace = (newWorkspace: Workspace) => {
    if (newWorkspace === 'demo') {
      newWorkspace = 'home';
    }
    if (newWorkspace !== workspace) {
      setHistory(prev => [...prev, workspace]);
      setWorkspaceState(newWorkspace);
    }
  };

  const handleGoBack = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setWorkspaceState(previous === 'demo' ? 'home' : previous);
    } else {
      setWorkspaceState('home');
    }
  };

  // When patient completes kiosk intake
  const handleIntakeCompleted = (intake: Intake) => {
    setSelectedPatientForDoctor(intake.id);
  };

  // Jump from Queue/Kiosk/Referrals to Doctor workspace
  const handleNavigateToDoctor = (patientOrIntakeId: string) => {
    setSelectedPatientForDoctor(patientOrIntakeId);
    if (doctor) {
      setWorkspace('doctor-dashboard');
    } else {
      setWorkspace('doctor');
    }
  };

  // When ASHA registers patient from frontline
  const handleStartAshaIntake = (patient: Partial<Patient>, mode: 'maternal' | 'ncd' | 'general') => {
    // Navigate directly to patient intake with pre-filled state
    setWorkspace('patient');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden select-none">
      {/* Universal Header */}
      <Header
        currentWorkspace={workspace}
        setWorkspace={setWorkspace}
        language={language}
        setLanguage={setLanguage}
        onBack={handleGoBack}
        canGoBack={history.length > 0 || workspace !== 'home'}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden relative">
        {workspace === 'home' && (
          <HomeLanding
            setWorkspace={setWorkspace}
            language={language}
            setLanguage={setLanguage}
            onQuickDemoStart={() => setWorkspace('patient')}
          />
        )}

        {(workspace === 'kiosk' || workspace === 'patient') && (
          <PatientKiosk
            language={language}
            setLanguage={setLanguage}
            onIntakeCompleted={handleIntakeCompleted}
            onNavigateToDoctor={handleNavigateToDoctor}
          />
        )}

        {/* Live Waiting Queue & Triage */}
        {workspace === 'live-queue' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <LiveWaitingQueueView onSelectPatient={handleNavigateToDoctor} />
          </div>
        )}

        {/* Frontline ASHA Health Worker Hub */}
        {workspace === 'asha-mode' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <AshaModeView
              onStartAshaIntake={handleStartAshaIntake}
              language={language}
            />
          </div>
        )}

        {/* Two-Way Referral Management & 108 Linkage */}
        {workspace === 'referrals' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <ReferralManagementView onSelectPatient={handleNavigateToDoctor} />
          </div>
        )}

        {/* Diagnostic Lab Coordination */}
        {workspace === 'diagnostics' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <DiagnosticCoordinationView />
          </div>
        )}

        {/* Essential Medicine Stock & Nearby Facility Routing */}
        {workspace === 'medicines' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <MedicineStockView />
          </div>
        )}

        {/* High-Risk Patient Follow-up (Maternal ANC & Child SAM/MAM) */}
        {workspace === 'high-risk-followup' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <HighRiskFollowupView onSelectPatient={handleNavigateToDoctor} />
          </div>
        )}

        {/* District & State Public Health Authority Dashboard */}
        {workspace === 'district-dashboard' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
            <DistrictHealthDashboard />
          </div>
        )}

        {/* Anna Multilingual AI Clinical Intake Assistant & Navigator */}
        {workspace === 'ai-chatbot' && (
          <AIChatbotWorkspace
            language={language}
            onNavigateToDoctor={handleNavigateToDoctor}
            onBack={handleGoBack}
          />
        )}

        {workspace === 'doctor-login' && (
          <DoctorAuthPage
            initialMode="login"
            onAuthSuccess={() => setWorkspace('doctor-dashboard')}
            onCancel={handleGoBack}
            onSwitchToRegister={() => setWorkspace('doctor-register')}
          />
        )}

        {workspace === 'doctor-register' && (
          <DoctorAuthPage
            initialMode="register"
            onAuthSuccess={() => setWorkspace('doctor-dashboard')}
            onCancel={handleGoBack}
            onSwitchToLogin={() => setWorkspace('doctor-login')}
          />
        )}

        {(workspace === 'doctor' || workspace === 'doctor-dashboard') && (
          <DoctorWorkspace
            language={language}
            onViewFhir={(id) => setActiveFhirIntakeId(id)}
            selectedPatientId={selectedPatientForDoctor}
            onBack={handleGoBack}
          />
        )}

        {workspace === 'hospital-login' && (
          <HospitalAuthPage
            initialMode="login"
            onAuthSuccess={() => setWorkspace('hospital-dashboard')}
            onCancel={handleGoBack}
            onSwitchToRegister={() => setWorkspace('hospital-register')}
          />
        )}

        {workspace === 'hospital-register' && (
          <HospitalAuthPage
            initialMode="register"
            onAuthSuccess={() => setWorkspace('hospital-dashboard')}
            onCancel={handleGoBack}
            onSwitchToLogin={() => setWorkspace('hospital-login')}
          />
        )}

        {(workspace === 'admin' || workspace === 'hospital-dashboard') && (
          <HospitalOperations
            language={language}
            onNavigateToPatient={handleNavigateToDoctor}
            onBack={handleGoBack}
          />
        )}
      </div>

      {/* FHIR R4 Modal Viewer */}
      {activeFhirIntakeId && (
        <FhirModal
          intakeId={activeFhirIntakeId}
          onClose={() => setActiveFhirIntakeId(null)}
        />
      )}

      {/* Doctor Longitudinal Progress Report Modal */}
      {activeProgressReportPatientId && (
        <DoctorProgressReportModal
          patientId={activeProgressReportPatientId}
          onClose={() => setActiveProgressReportPatientId(null)}
        />
      )}
    </div>
  );
}
