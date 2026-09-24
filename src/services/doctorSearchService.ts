import { DoctorUser } from '../types';

export interface DoctorSearchQuery {
  doctorName?: string;
  hospitalName?: string;
  specialization?: string;
}

export interface DoctorSearchResult extends DoctorUser {
  isVerified: boolean;
  matchScore: number;
}

export async function fetchDoctorsDirectory(): Promise<DoctorUser[]> {
  try {
    const res = await fetch('/api/doctors');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      if (data.doctors && Array.isArray(data.doctors)) {
        return data.doctors;
      }
    }
  } catch (err) {
    console.warn('Network call to /api/doctors failed, using internal fallback directory', err);
  }

  // Fallback doctors list with verified status and hospitals
  return [
    {
      id: 'DOC-102',
      fullName: 'Dr. Ananya Sharma',
      email: 'dr.ananya@medikiosk.demo',
      mobile: '+91 98765 11111',
      registrationNumber: 'UPMC/2019/54321',
      council: 'Uttar Pradesh Medical Council',
      specialization: 'General Physician / Internal Medicine',
      qualification: 'MBBS, MD (General Medicine)',
      experienceYears: 8,
      department: 'General Medicine & OPD',
      languages: ['English', 'Hindi'],
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
      gender: 'Female',
      hospitalId: 'HOSP-202',
      hospitalName: 'ABC Multispeciality Hospital',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      consultationType: ['OPD', 'Teleconsultation'],
      hospitalConnectionStatus: 'CONNECTED',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'DOC-103',
      fullName: 'Dr. Rahul Verma',
      email: 'dr.rahul@medikiosk.demo',
      mobile: '+91 98765 22222',
      registrationNumber: 'UPMC/2015/88921',
      council: 'Medical Council of India',
      specialization: 'Cardiology & Critical Care',
      qualification: 'MBBS, MD, DM (Cardiology)',
      experienceYears: 12,
      department: 'Cardiology & CCU',
      languages: ['English', 'Hindi'],
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      gender: 'Male',
      hospitalId: 'HOSP-203',
      hospitalName: 'City Heart Hospital & Research Institute',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      consultationType: ['OPD', 'Emergency'],
      hospitalConnectionStatus: 'CONNECTED',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'DOC-104',
      fullName: 'Dr. Meera Kapoor',
      email: 'dr.meera@medikiosk.demo',
      mobile: '+91 98765 33333',
      registrationNumber: 'NCISM/AYU/2020/1904',
      council: 'National Commission for Indian System of Medicine',
      specialization: 'Ayurveda & Kayachikitsa',
      qualification: 'BAMS, MD (Ayurveda)',
      experienceYears: 6,
      department: 'Ayurvedic OPD & Panchakarma',
      languages: ['English', 'Hindi', 'Sanskrit'],
      avatarUrl: 'https://images.unsplash.com/photo-1594824813682-192e2124505f?auto=format&fit=crop&w=300&q=80',
      gender: 'Female',
      hospitalId: 'HOSP-204',
      hospitalName: 'Ayush Wellness Hospital & Research Center',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      consultationType: ['OPD'],
      hospitalConnectionStatus: 'CONNECTED',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'DOC-101',
      fullName: 'Dr. Rajesh Sharma',
      email: 'dr.sharma@aiia.gov.in',
      mobile: '+91 98765 43210',
      registrationNumber: 'NMC/2018/84729',
      council: 'National Medical Commission',
      specialization: 'Kayachikitsa & Integrative Medicine',
      qualification: 'MD (Ayurveda), MBBS',
      experienceYears: 14,
      department: 'Department of Outpatient Consultations',
      languages: ['English', 'Hindi'],
      avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
      gender: 'Male',
      hospitalId: 'HOSP-201',
      hospitalName: 'All India Institute of Ayurveda (AIIA) & Hospital',
      city: 'New Delhi',
      state: 'Delhi',
      consultationType: ['OPD', 'IPD'],
      hospitalConnectionStatus: 'CONNECTED',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'DOC-105',
      fullName: 'Dr. Ananya Sen',
      email: 'dr.asen@medikiosk.demo',
      mobile: '+91 98765 55555',
      registrationNumber: 'WBMC/2017/10294',
      council: 'West Bengal Medical Council',
      specialization: 'General Physician & Diabetology',
      qualification: 'MBBS, DNB (Family Medicine)',
      experienceYears: 7,
      department: 'Outpatient Care',
      languages: ['English', 'Hindi', 'Bengali'],
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
      gender: 'Female',
      hospitalId: 'HOSP-205',
      hospitalName: 'Apollo Multispeciality Hospital',
      city: 'Kolkata',
      state: 'West Bengal',
      consultationType: ['OPD'],
      hospitalConnectionStatus: 'CONNECTED',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function searchDoctors(
  doctors: DoctorUser[],
  query: DoctorSearchQuery
): DoctorSearchResult[] {
  const docNameQ = (query.doctorName || '').toLowerCase().trim();
  const hospNameQ = (query.hospitalName || '').toLowerCase().trim();
  const specQ = (query.specialization || '').toLowerCase().trim();

  return doctors
    .map(doc => {
      let matchScore = 0;
      const fullName = (doc.fullName || '').toLowerCase();
      const hospitalName = (doc.hospitalName || '').toLowerCase();
      const specialization = (doc.specialization || '').toLowerCase();

      // Check Doctor Name match
      if (docNameQ) {
        if (fullName.includes(docNameQ)) {
          matchScore += 10;
        } else {
          // Check parts
          const parts = docNameQ.split(' ').filter(p => p.length > 2 && p !== 'dr' && p !== 'dr.');
          for (const p of parts) {
            if (fullName.includes(p)) matchScore += 5;
          }
        }
      }

      // Check Hospital / Clinic Name match
      if (hospNameQ) {
        if (hospitalName.includes(hospNameQ)) {
          matchScore += 10;
        } else {
          const parts = hospNameQ.split(' ').filter(p => p.length > 2 && p !== 'hospital' && p !== 'clinic');
          for (const p of parts) {
            if (hospitalName.includes(p)) matchScore += 4;
          }
        }
      }

      // Check Specialization match if specified
      if (specQ && specialization.includes(specQ)) {
        matchScore += 5;
      }

      // If no queries provided, show all with default score
      if (!docNameQ && !hospNameQ && !specQ) {
        matchScore = 1;
      }

      return {
        ...doc,
        isVerified: true,
        matchScore,
      };
    })
    .filter(doc => doc.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}
