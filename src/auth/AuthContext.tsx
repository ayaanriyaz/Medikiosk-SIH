import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DoctorUser,
  HospitalUser,
  DoctorRegistrationPayload,
  HospitalRegistrationPayload,
} from '../types';

interface AuthContextType {
  // Doctor Auth State
  doctor: DoctorUser | null;
  isDoctorLoading: boolean;
  doctorError: string | null;
  loginDoctor: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerDoctor: (data: DoctorRegistrationPayload) => Promise<{ success: boolean; error?: string }>;
  logoutDoctor: () => void;

  // Hospital Auth State
  hospital: HospitalUser | null;
  isHospitalLoading: boolean;
  hospitalError: string | null;
  hospitalNotice: string | null;
  loginHospital: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerHospital: (data: HospitalRegistrationPayload) => Promise<{ success: boolean; notice?: string; error?: string }>;
  logoutHospital: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DOCTOR_STORAGE_KEY = 'medikiosk_doctor_auth_v1';
const HOSPITAL_STORAGE_KEY = 'medikiosk_hospital_auth_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Doctor state
  const [doctor, setDoctor] = useState<DoctorUser | null>(() => {
    try {
      const stored = localStorage.getItem(DOCTOR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isDoctorLoading, setIsDoctorLoading] = useState(false);
  const [doctorError, setDoctorError] = useState<string | null>(null);

  // Hospital state
  const [hospital, setHospital] = useState<HospitalUser | null>(() => {
    try {
      const stored = localStorage.getItem(HOSPITAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isHospitalLoading, setIsHospitalLoading] = useState(false);
  const [hospitalError, setHospitalError] = useState<string | null>(null);
  const [hospitalNotice, setHospitalNotice] = useState<string | null>(null);

  // Sync doctor session with backend if present
  useEffect(() => {
    if (doctor?.token) {
      fetch('/api/auth/doctor/me', {
        headers: { Authorization: `Bearer ${doctor.token}` },
      })
        .then(res => {
          if (!res.ok) {
            // Expired or invalid
            setDoctor(null);
            localStorage.removeItem(DOCTOR_STORAGE_KEY);
          }
        })
        .catch(() => {
          // Network issue, keep local state
        });
    }
  }, []);

  // Sync hospital session with backend if present
  useEffect(() => {
    if (hospital?.token) {
      fetch('/api/auth/hospital/me', {
        headers: { Authorization: `Bearer ${hospital.token}` },
      })
        .then(res => {
          if (!res.ok) {
            setHospital(null);
            localStorage.removeItem(HOSPITAL_STORAGE_KEY);
          }
        })
        .catch(() => {
          // Network issue, keep local state
        });
    }
  }, []);

  const loginDoctor = async (identifier: string, password: string) => {
    setIsDoctorLoading(true);
    setDoctorError(null);
    try {
      const res = await fetch('/api/auth/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg = data.error || 'Doctor authentication failed.';
        setDoctorError(msg);
        return { success: false, error: msg };
      }
      setDoctor(data.doctor);
      localStorage.setItem(DOCTOR_STORAGE_KEY, JSON.stringify(data.doctor));
      return { success: true };
    } catch (e: any) {
      const msg = e.message || 'Unable to contact doctor authentication service.';
      setDoctorError(msg);
      return { success: false, error: msg };
    } finally {
      setIsDoctorLoading(false);
    }
  };

  const registerDoctor = async (payload: DoctorRegistrationPayload) => {
    setIsDoctorLoading(true);
    setDoctorError(null);
    try {
      const res = await fetch('/api/auth/doctor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg = data.error || 'Doctor registration failed.';
        setDoctorError(msg);
        return { success: false, error: msg };
      }
      setDoctor(data.doctor);
      localStorage.setItem(DOCTOR_STORAGE_KEY, JSON.stringify(data.doctor));
      return { success: true };
    } catch (e: any) {
      const msg = e.message || 'Network error during doctor registration.';
      setDoctorError(msg);
      return { success: false, error: msg };
    } finally {
      setIsDoctorLoading(false);
    }
  };

  const logoutDoctor = () => {
    if (doctor?.token) {
      fetch('/api/auth/doctor/logout', { method: 'POST' }).catch(() => {});
    }
    setDoctor(null);
    setDoctorError(null);
    localStorage.removeItem(DOCTOR_STORAGE_KEY);
  };

  const loginHospital = async (email: string, password: string) => {
    setIsHospitalLoading(true);
    setHospitalError(null);
    setHospitalNotice(null);
    try {
      const res = await fetch('/api/auth/hospital/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg = data.error || 'Hospital authentication failed.';
        setHospitalError(msg);
        return { success: false, error: msg };
      }
      setHospital(data.hospital);
      localStorage.setItem(HOSPITAL_STORAGE_KEY, JSON.stringify(data.hospital));
      return { success: true };
    } catch (e: any) {
      const msg = e.message || 'Unable to contact hospital authentication service.';
      setHospitalError(msg);
      return { success: false, error: msg };
    } finally {
      setIsHospitalLoading(false);
    }
  };

  const registerHospital = async (payload: HospitalRegistrationPayload) => {
    setIsHospitalLoading(true);
    setHospitalError(null);
    setHospitalNotice(null);
    try {
      const res = await fetch('/api/auth/hospital/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg = data.error || 'Hospital registration failed.';
        setHospitalError(msg);
        return { success: false, error: msg };
      }
      setHospital(data.hospital);
      if (data.verificationNotice) {
        setHospitalNotice(data.verificationNotice);
      }
      localStorage.setItem(HOSPITAL_STORAGE_KEY, JSON.stringify(data.hospital));
      return { success: true, notice: data.verificationNotice };
    } catch (e: any) {
      const msg = e.message || 'Network error during hospital registration.';
      setHospitalError(msg);
      return { success: false, error: msg };
    } finally {
      setIsHospitalLoading(false);
    }
  };

  const logoutHospital = () => {
    if (hospital?.token) {
      fetch('/api/auth/hospital/logout', { method: 'POST' }).catch(() => {});
    }
    setHospital(null);
    setHospitalError(null);
    setHospitalNotice(null);
    localStorage.removeItem(HOSPITAL_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        doctor,
        isDoctorLoading,
        doctorError,
        loginDoctor,
        registerDoctor,
        logoutDoctor,
        hospital,
        isHospitalLoading,
        hospitalError,
        hospitalNotice,
        loginHospital,
        registerHospital,
        logoutHospital,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
