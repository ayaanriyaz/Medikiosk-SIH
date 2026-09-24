import fs from 'fs';
import path from 'path';
import {
  Patient,
  Intake,
  RedFlagAlert,
  AuditLog,
  KioskStatus,
  StaffMember,
  ClinicalInterview,
  ClinicalReport,
  DoctorUser,
  HospitalUser,
  HospitalConnectionRequest,
  ReportShare,
  ProcedureRecord,
  NotificationRecord,
  AmbulanceDispatchRecord,
  PostMedicationFeedback,
  HealthcareFacility,
  LiveQueueItem,
  AppointmentRecord,
  ReferralRecord,
  DiagnosticTestItem,
  MedicineStockItem,
  HighRiskFollowup,
  DoctorProgressReportData,
} from '../src/types';
import { buildRelationalMockDataset } from './mockPatientsData';
import {
  DEMO_FACILITIES,
  DEMO_LIVE_QUEUE,
  DEMO_APPOINTMENTS,
  DEMO_REFERRALS,
  DEMO_DIAGNOSTICS,
  DEMO_MEDICINES,
  DEMO_HIGH_RISK_FOLLOWUPS,
  DEMO_PROGRESS_REPORTS,
} from './ruralHealthData';

export interface DatabaseSchema {
  patients: Patient[];
  intakes: Intake[];
  interviews: ClinicalInterview[];
  clinicalReports: ClinicalReport[];
  redFlagAlerts: RedFlagAlert[];
  auditLogs: AuditLog[];
  kiosks: KioskStatus[];
  staff: StaffMember[];
  doctors: (DoctorUser & { passwordHash: string })[];
  hospitals: (HospitalUser & { passwordHash: string })[];
  hospitalConnectionRequests: HospitalConnectionRequest[];
  reportShares: ReportShare[];
  procedures: ProcedureRecord[];
  notifications: NotificationRecord[];
  ambulanceDispatches?: AmbulanceDispatchRecord[];
  postMedicationFeedbacks?: PostMedicationFeedback[];
  facilities?: HealthcareFacility[];
  liveQueue?: LiveQueueItem[];
  appointments?: AppointmentRecord[];
  referrals?: ReferralRecord[];
  diagnostics?: DiagnosticTestItem[];
  medicines?: MedicineStockItem[];
  highRiskFollowups?: HighRiskFollowup[];
  progressReports?: Record<string, DoctorProgressReportData>;
  systemMetrics: {
    lastReset: string;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'medikiosk_db.json');

// In-memory cache synced with disk
let dbCache: DatabaseSchema | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialDemoData(): DatabaseSchema {
  const now = new Date().toISOString();

  const patients: Patient[] = [
    {
      id: 'DEMO-001',
      token: 'TK-101',
      name: 'Rahul Kumar',
      age: 38,
      gender: 'Male',
      phone: '+91 98765 43210',
      abhaId: 'rahul.kumar@abdm',
      aadhaarLast4: '4821',
      registeredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      isDemo: true,
    },
    {
      id: 'DEMO-002',
      token: 'TK-102',
      name: 'Aisha Khan',
      age: 29,
      gender: 'Female',
      phone: '+91 98111 22334',
      abhaId: 'aisha.khan@abdm',
      aadhaarLast4: '8832',
      registeredAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      isDemo: true,
    },
    {
      id: 'DEMO-003',
      token: 'TK-103',
      name: 'Ravi Singh',
      age: 54,
      gender: 'Male',
      phone: '+91 97222 33445',
      abhaId: 'ravi.singh@abdm',
      aadhaarLast4: '1094',
      registeredAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      isDemo: true,
    },
    {
      id: 'DEMO-004',
      token: 'TK-104',
      name: 'Meena Verma',
      age: 42,
      gender: 'Female',
      phone: '+91 96333 44556',
      abhaId: 'meena.verma@abdm',
      aadhaarLast4: '6745',
      registeredAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      isDemo: true,
    },
  ];

  const intakes: Intake[] = [
    {
      id: 'INT-101',
      patientId: 'DEMO-001',
      sessionId: 'SES-901',
      token: 'TK-101',
      patientName: 'Rahul Kumar',
      age: 38,
      gender: 'Male',
      language: 'hi',
      department: 'Cardiology / Emergency Triage',
      mode: 'general',
      chiefComplaint: 'Chest discomfort radiating to left shoulder with sweating for 2 hours',
      historyOfPresentIllness: 'Patient reported retrosternal tightness starting while climbing stairs 2 hours ago. Associated with diaphoresis and mild nausea. Denies prior cardiac diagnosis.',
      pastMedicalHistory: 'Mild hypertension (2 years on Telmisartan 40mg), Dyslipidemia',
      pastSurgicalHistory: 'Appendectomy (2018)',
      medications: [
        { name: 'Telmisartan', dosage: '40 mg', frequency: 'OD', source: 'Patient verbal intake' },
        { name: 'Rosuvastatin', dosage: '10 mg', frequency: 'HS', source: 'Uploaded prescription' },
      ],
      allergies: [
        { substance: 'Penicillin', reaction: 'Skin rash / hives', severity: 'Moderate', source: 'Patient verbal intake' },
      ],
      familyHistory: 'Father had myocardial infarction at age 52.',
      personalHistory: 'Non-smoker, occasional alcohol, moderate physical activity.',
      reviewOfSystems: {
        Cardiovascular: 'Chest heaviness, mild palpitations',
        Respiratory: 'Mild breathlessness on exertion',
        Gastrointestinal: 'No epigastric burning',
      },
      ayushData: {},
      documents: [
        {
          id: 'DOC-001',
          name: 'Previous_Cardio_Prescription_2025.pdf',
          type: 'Prescription',
          date: '2025-11-14',
          facility: 'AIIMS New Delhi',
          doctor: 'Dr. V. Sharma (Cardiology)',
          extractedEntities: {
            diagnosis: 'Essential Hypertension, Stage 1',
            medications: [
              { name: 'Telmisartan', dosage: '40 mg', frequency: 'OD' },
              { name: 'Rosuvastatin', dosage: '10 mg', frequency: 'HS' },
            ],
            notes: 'Advised lifestyle modification, low sodium diet.',
          },
          patientCorrections: { notes: 'Verified correct', confirmed: true },
          verified: true,
          isDemoSample: true,
        },
      ],
      timeline: [
        {
          id: 'TL-01',
          date: '2025-11-14',
          title: 'Cardiology OPD Visit',
          category: 'Consultation',
          summary: 'Diagnosed with Essential Hypertension; prescribed Telmisartan 40mg.',
          sourceDocId: 'DOC-001',
        },
        {
          id: 'TL-02',
          date: new Date().toISOString().split('T')[0],
          title: 'MediKiosk Emergency Intake',
          category: 'Current Intake',
          summary: 'Acute chest discomfort reported; flagged for rapid clinical assessment.',
        },
      ],
      redFlags: [
        {
          alertId: 'ALT-101',
          patientId: 'DEMO-001',
          intakeId: 'INT-101',
          patientName: 'Rahul Kumar',
          token: 'TK-101',
          ruleTriggered: 'Acute Coronary Syndrome / High-Risk Chest Pain',
          severity: 'CRITICAL',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          status: 'UNREVIEWED',
          symptomSummary: 'Acute chest heaviness with left shoulder radiation and sweating.',
        },
      ],
      aiSummary: {
        version: 1,
        text: '38-year-old male with known HTN presenting with acute retrosternal chest discomfort radiating to left shoulder for 2 hours with diaphoresis. Prior history of hypertension on Telmisartan. Family history significant for premature CAD. Immediate ECG and troponin evaluation indicated.',
        sections: {
          chiefComplaint: 'Chest discomfort radiating to left shoulder (2 hours)',
          historyOfPresentIllness: 'Sudden retrosternal tightness with mild dyspnea and sweating. Started during mild exertion.',
          pastMedicalHistory: 'Essential Hypertension (2 years), Dyslipidemia',
          pastSurgicalHistory: 'Appendectomy (2018)',
          currentMedications: ['Telmisartan 40mg OD', 'Rosuvastatin 10mg HS'],
          drugAllergies: ['Penicillin (Urticaria)'],
          familyHistory: 'Paternal history of early myocardial infarction (age 52)',
          personalHistory: 'Sedentary desk worker, non-smoker',
          reviewOfSystems: 'Positive for exertional chest tightness; negative for syncope or hematemesis.',
          previousInvestigations: 'Lipid profile (Nov 2025): Total Cholesterol 210 mg/dL, LDL 132 mg/dL.',
          redFlags: ['CRITICAL: Acute retrosternal pain with radiation and diaphoresis'],
          importantNotes: 'Potential ACS symptom pattern requiring high-priority triage.',
        },
        sources: [
          { statement: 'Chief Complaint: Chest discomfort radiating to left shoulder', source: 'Patient voice response (Hindi)' },
          { statement: 'Medication: Telmisartan 40mg OD', source: 'Uploaded prescription DOC-001' },
          { statement: 'Allergy: Penicillin', source: 'Patient verbal intake' },
        ],
        isDraft: true,
      },
      consent: {
        given: true,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        version: 'v2.1-AYUSH',
        language: 'hi',
      },
      rawAnswers: [
        { question: 'आज आप अस्पताल किस समस्या के लिए आए हैं?', answer: 'सीने में भारीपन और दर्द है जो उल्टे कंधे में जा रहा है।', timestamp: now },
        { question: 'यह समस्या कब से है?', answer: 'लगभग 2 घंटे पहले शुरू हुआ जब सीढ़ियां चढ़ा था।', timestamp: now },
      ],
      status: 'RED_FLAG',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'INT-102',
      patientId: 'DEMO-002',
      sessionId: 'SES-902',
      token: 'TK-102',
      patientName: 'Aisha Khan',
      age: 29,
      gender: 'Female',
      language: 'en',
      department: 'Neurology / General Medicine',
      mode: 'general',
      chiefComplaint: 'Throbbing hemicranial headache with photophobia for 3 days',
      historyOfPresentIllness: 'Unilateral right-sided throbbing headache with nausea and light sensitivity. Worsened by screen usage.',
      pastMedicalHistory: 'Recurrent episodic migraines since 2021',
      pastSurgicalHistory: 'None',
      medications: [
        { name: 'Naproxen', dosage: '500 mg', frequency: 'PRN', source: 'Patient response' },
      ],
      allergies: [
        { substance: 'Sulfa drugs', reaction: 'Facial swelling', severity: 'Moderate', source: 'Patient response' },
      ],
      familyHistory: 'Mother has migraine history.',
      personalHistory: 'Software engineer, high caffeine intake, irregular sleep.',
      reviewOfSystems: {
        Neurological: 'Hemicranial headache, photophobia, phonophobia',
        Ophthalmology: 'No visual aura',
      },
      ayushData: {},
      documents: [],
      timeline: [
        {
          id: 'TL-10',
          date: new Date().toISOString().split('T')[0],
          title: 'OPD Intake Completed',
          category: 'Current Intake',
          summary: 'Migraine presentation with photophobia documented for review.',
        },
      ],
      redFlags: [],
      aiSummary: {
        version: 1,
        text: '29-year-old female presenting with 3-day history of right-sided pulsatile headache accompanied by photophobia and nausea, consistent with migraine without aura exacerbation.',
        sections: {
          chiefComplaint: 'Right-sided pulsatile headache (3 days)',
          historyOfPresentIllness: 'Throbbing character, exacerbated by bright light and noise. Relief with dark room rest.',
          pastMedicalHistory: 'Episodic migraine without aura',
          pastSurgicalHistory: 'None',
          currentMedications: ['Naproxen 500mg PRN'],
          drugAllergies: ['Sulfa drugs (Angioedema)'],
          familyHistory: 'Maternal history of migraines',
          personalHistory: 'Sleep deprivation, screen exposure',
          reviewOfSystems: 'Normal cranial nerves; no focal motor weakness or fever.',
          previousInvestigations: 'Non-contrast brain MRI (2023): Unremarkable.',
          redFlags: [],
          importantNotes: 'Review prophylactic migraine regimen.',
        },
        sources: [
          { statement: 'Chief Complaint: Right pulsatile headache', source: 'Patient touch/text intake' },
        ],
        isDraft: true,
      },
      consent: {
        given: true,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        version: 'v2.1-AYUSH',
        language: 'en',
      },
      rawAnswers: [],
      status: 'READY_FOR_REVIEW',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: now,
    },
    {
      id: 'INT-104',
      patientId: 'DEMO-004',
      sessionId: 'SES-904',
      token: 'TK-104',
      patientName: 'Meena Verma',
      age: 42,
      gender: 'Female',
      language: 'hi',
      department: 'Kayachikitsa (Ayurveda Internal Medicine)',
      mode: 'ayush',
      chiefComplaint: 'Chronic indigestion (Agnimandya), abdominal heaviness and sluggish bowel',
      historyOfPresentIllness: 'Feeling of post-prandial fullness, sour eructations, heaviness in epigastrium after meals for 3 months.',
      pastMedicalHistory: 'Hypothyroidism (Eltroxin 50mcg)',
      pastSurgicalHistory: 'None',
      medications: [
        { name: 'Thyroxine', dosage: '50 mcg', frequency: 'Empty stomach OD', source: 'Patient response' },
      ],
      allergies: [],
      familyHistory: 'No specific metabolic history.',
      personalHistory: 'Vegetarian, irregular meal timing (Vishamashana), sedentary routine.',
      reviewOfSystems: {
        Gastrointestinal: 'Bloating, irregular evacuation (Krura koshtha)',
      },
      ayushData: {
        prakriti: 'Kapha-Vata',
        vikriti: 'Vata-Pitta Dushti',
        agni: 'Manda Agni (Sluggish Digestive Fire)',
        koshtha: 'Krura Koshtha (Hard/Constipated)',
        aharaShakti: 'Avara (Reduced)',
        vyayamaShakti: 'Madhyama (Moderate)',
        sara: 'Meda-Mamsa Sara',
        samhanana: 'Madhyama',
        pramana: 'Madhyama',
        satmya: 'Katu-Tikta Satmya',
        sattva: 'Madhyama',
        vaya: 'Madhyama Vaya (42 Yrs)',
        nidana: 'Vishamashana (irregular meals), Divasvapna (daytime sleeping)',
        samprapti: 'Agnimandya leading to Ama accumulation in Amashaya and Annavaha Srotas',
      },
      documents: [],
      timeline: [
        {
          id: 'TL-20',
          date: new Date().toISOString().split('T')[0],
          title: 'AIIA Kayachikitsa Intake',
          category: 'Current Intake',
          summary: 'Dashavidha Pariksha conducted at MediKiosk; Manda Agni recorded.',
        },
      ],
      redFlags: [],
      aiSummary: {
        version: 1,
        text: '42-year-old female presenting for Ayurvedic consultation with chronic Agnimandya, Adhmana (bloating), and Vibandha. Dashavidha Pariksha indicates Kapha-Vata Prakriti with Manda Agni and Krura Koshtha.',
        sections: {
          chiefComplaint: 'Agnimandya, Adhmana and Vibandha for 3 months',
          historyOfPresentIllness: 'Post-meal heaviness, irregular appetite, incomplete bowel evacuation.',
          pastMedicalHistory: 'Hypothyroidism on Thyroxine 50mcg',
          pastSurgicalHistory: 'None',
          currentMedications: ['Thyroxine 50 mcg OD'],
          drugAllergies: ['None reported'],
          familyHistory: 'Non-contributory',
          personalHistory: 'Irregular eating intervals, lack of daily physical exercise.',
          reviewOfSystems: 'Digestive impairment with Ama symptoms.',
          previousInvestigations: 'TSH (Jan 2026): 3.2 mIU/L (Euthyroid on medication).',
          ayushParameters: 'Prakriti: Kapha-Vata | Agni: Manda | Koshtha: Krura | Ahara Shakti: Avara | Nidana: Vishamashana.',
          redFlags: [],
          importantNotes: 'Candidate for Deepana-Pachana therapy followed by Mridu Anulomana.',
        },
        sources: [
          { statement: 'Ayush Dashavidha Pariksha', source: 'Kiosk Guided Ayush Pariksha Flow' },
        ],
        isDraft: true,
      },
      consent: {
        given: true,
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        version: 'v2.1-AYUSH',
        language: 'hi',
      },
      rawAnswers: [],
      status: 'READY_FOR_REVIEW',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      updatedAt: now,
    },
  ];

  const redFlagAlerts: RedFlagAlert[] = [
    {
      alertId: 'ALT-101',
      patientId: 'DEMO-001',
      intakeId: 'INT-101',
      patientName: 'Rahul Kumar',
      token: 'TK-101',
      ruleTriggered: 'Acute Coronary Syndrome / High-Risk Chest Pain',
      severity: 'CRITICAL',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      status: 'UNREVIEWED',
      symptomSummary: 'Acute chest heaviness with left shoulder radiation and sweating.',
    },
  ];

  const kiosks: KioskStatus[] = [
    { id: 'KIOSK-01', name: 'Kiosk 01 — Main OPD Entrance', location: 'Ground Floor Atrium', status: 'ONLINE', activePatientToken: 'TK-105', lastHeartbeat: now },
    { id: 'KIOSK-02', name: 'Kiosk 02 — Emergency Reception', location: 'Emergency Block 1A', status: 'ONLINE', activePatientToken: 'TK-101', lastHeartbeat: now },
    { id: 'KIOSK-03', name: 'Kiosk 03 — AYUSH Center', location: 'Block B - AIIA Wing', status: 'ONLINE', activePatientToken: 'TK-104', lastHeartbeat: now },
    { id: 'KIOSK-04', name: 'Kiosk 04 — Pediatric & Geriatric Wing', location: '1st Floor OPD', status: 'MAINTENANCE', lastHeartbeat: new Date(Date.now() - 7200000).toISOString() },
  ];

  const staff: StaffMember[] = [
    { id: 'STF-01', name: 'Dr. Vivek Sharma, MD', role: 'Doctor', department: 'Cardiology / Medicine', status: 'Available' },
    { id: 'STF-02', name: 'Dr. Ananya Mukherjee, BAMS, MD(Ayu)', role: 'Doctor', department: 'Kayachikitsa (AIIA)', status: 'In Consultation' },
    { id: 'STF-03', name: 'Sister Priya Nair, RN', role: 'Nurse', department: 'Triage & Kiosk Assistance', status: 'Available' },
    { id: 'STF-04', name: 'Rajesh Mehra', role: 'Kiosk Attendant', department: 'Helpdesk & Patient Navigation', status: 'Available' },
  ];

  const auditLogs: AuditLog[] = [
    { id: 'AUD-01', timestamp: new Date(Date.now() - 7200000).toISOString(), user: 'Kiosk 01 (Patient)', role: 'PATIENT', action: 'PATIENT_IDENTIFIED', recordId: 'DEMO-002', details: 'Aisha Khan verified via ABHA ID.' },
    { id: 'AUD-02', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'Kiosk 02 (Patient)', role: 'PATIENT', action: 'INTAKE_SUBMITTED', recordId: 'INT-101', details: 'Rahul Kumar submitted clinical intake.' },
    { id: 'AUD-03', timestamp: new Date(Date.now() - 3590000).toISOString(), user: 'System Clinical Engine', role: 'SYSTEM', action: 'RED_FLAG_TRIGGERED', recordId: 'ALT-101', details: 'CRITICAL alert: Acute Coronary Syndrome rule triggered.' },
  ];

  const doctors = getDemoDoctors();
  const hospitals = getDemoHospitals();
  const hospitalConnectionRequests = getDemoConnectionRequests();
  const reportShares = getDemoReportShares();
  const procedures = getDemoProcedures();
  const notifications: NotificationRecord[] = [
    {
      id: 'NOTIF-01',
      recipientRole: 'DOCTOR',
      recipientId: 'DOC-102',
      title: 'New Clinical Report Received',
      message: 'Patient Rahul Kumar (Token TK-101) shared a pre-consultation report with you.',
      type: 'REPORT_RECEIVED',
      relatedId: 'REP-DEMO-01',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: 'NOTIF-02',
      recipientRole: 'HOSPITAL',
      recipientId: 'HOSP-202',
      title: 'Pending Doctor Affiliation Request',
      message: 'Dr. Sunita Rao (Dermatology) submitted a request to connect with MediCare Hospital.',
      type: 'CONNECTION_REQUEST',
      relatedId: 'REQ-01',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      read: false,
    },
  ];

  return {
    patients,
    intakes,
    interviews: [],
    clinicalReports: [],
    redFlagAlerts,
    auditLogs,
    kiosks,
    staff,
    doctors,
    hospitals,
    hospitalConnectionRequests,
    reportShares,
    procedures,
    notifications,
    systemMetrics: {
      lastReset: now,
    },
  };
}

export function getDemoDoctors(): (DoctorUser & { passwordHash: string })[] {
  return [
    {
      id: 'DOC-102',
      fullName: 'Dr. Ananya Sharma',
      email: 'dr.ananya@medikiosk.demo',
      mobile: '+91 98765 11111',
      registrationNumber: 'UPMC/2019/54321',
      council: 'Uttar Pradesh Medical Council',
      specialization: 'General Medicine',
      subSpecialization: 'Internal Medicine & Adult Care',
      qualification: 'MBBS, MD (General Medicine)',
      experienceYears: 8,
      department: 'General Medicine & OPD',
      languages: ['English', 'Hindi'],
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
      gender: 'Female',
      dob: '1988-04-12',
      hospitalId: 'HOSP-202',
      hospitalName: 'ABC Multispeciality Hospital',
      hospitalDepartment: 'Department of Internal Medicine',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      consultationType: ['OPD', 'Teleconsultation'],
      bio: 'Consultant Physician specializing in adult chronic disease management, metabolic syndrome, and preventative clinical care.',
      hospitalConnectionStatus: 'CONNECTED',
      passwordHash: 'Doctor@123',
      createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    },
    {
      id: 'DOC-103',
      fullName: 'Dr. Rahul Verma',
      email: 'dr.rahul@medikiosk.demo',
      mobile: '+91 98765 22222',
      registrationNumber: 'UPMC/2015/88921',
      council: 'Medical Council of India / UPMC',
      specialization: 'Cardiology',
      subSpecialization: 'Interventional Cardiology & Coronary Care',
      qualification: 'MBBS, MD, DM (Cardiology)',
      experienceYears: 12,
      department: 'Cardiology & CCU',
      languages: ['English', 'Hindi'],
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
      gender: 'Male',
      dob: '1982-08-19',
      hospitalId: 'HOSP-203',
      hospitalName: 'City Heart Hospital',
      hospitalDepartment: 'Cardiology & Catheterization Lab',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      consultationType: ['OPD', 'Emergency', 'IPD'],
      bio: 'Senior Interventional Cardiologist with extensive clinical expertise in acute coronary syndromes and preventive cardiology.',
      hospitalConnectionStatus: 'CONNECTED',
      passwordHash: 'Doctor@123',
      createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    },
    {
      id: 'DOC-104',
      fullName: 'Dr. Meera Kapoor',
      email: 'dr.meera@medikiosk.demo',
      mobile: '+91 98765 33333',
      registrationNumber: 'NCISM/AYU/2020/1904',
      council: 'National Commission for Indian System of Medicine',
      specialization: 'Ayurveda',
      subSpecialization: 'Kayachikitsa & Panchakarma',
      qualification: 'BAMS, MD (Ayurveda - Kayachikitsa)',
      experienceYears: 6,
      department: 'Ayurvedic Medicine & Integrative Care',
      languages: ['English', 'Hindi', 'Sanskrit'],
      avatarUrl: 'https://images.unsplash.com/photo-1594824813682-192e2124505f?auto=format&fit=crop&w=300&q=80',
      gender: 'Female',
      dob: '1992-11-05',
      hospitalId: 'HOSP-204',
      hospitalName: 'Ayush Wellness Hospital',
      hospitalDepartment: 'Kayachikitsa & Panchakarma Unit',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      consultationType: ['OPD', 'Ayurvedic Consultation'],
      bio: 'Holistic Ayurvedic practitioner integrating classical Dashavidha Pariksha and personalized lifestyle interventions.',
      hospitalConnectionStatus: 'CONNECTED',
      passwordHash: 'Doctor@123',
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
    {
      id: 'DOC-101',
      fullName: 'Dr. Rajesh Sharma',
      email: 'dr.sharma@aiia.gov.in',
      mobile: '9876543210',
      registrationNumber: 'NMC/2018/84729',
      council: 'National Medical Commission',
      specialization: 'Kayachikitsa & General Medicine',
      subSpecialization: 'Integrative Medicine',
      qualification: 'MD (Ayurveda), MBBS',
      experienceYears: 14,
      department: 'Department of Kayachikitsa',
      languages: ['English', 'Hindi'],
      avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
      gender: 'Male',
      hospitalId: 'HOSP-201',
      hospitalName: 'All India Institute of Ayurveda & Hospital',
      city: 'New Delhi',
      state: 'Delhi',
      consultationType: ['OPD', 'IPD'],
      bio: 'Head of Outpatient Consultation with double qualification in modern medicine and traditional Ayurveda protocols.',
      hospitalConnectionStatus: 'CONNECTED',
      passwordHash: 'Doctor@123',
      createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    },
  ];
}

export function getDemoHospitals(): (HospitalUser & { passwordHash: string })[] {
  return [
    {
      id: 'HOSP-202',
      hospitalName: 'MediCare Hospital',
      hospitalType: 'Multispecialty Hospital & Trauma Center',
      licenseNumber: 'UP-HOSP-KAN-2019-4401',
      address: 'Civil Lines, Mall Road',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      pincode: '208001',
      email: 'admin@medicare.demo',
      contactNumber: '+91 512 230 4500',
      adminName: 'Dr. S. K. Gupta',
      verificationStatus: 'VERIFIED',
      departments: ['General Medicine', 'Cardiology', 'Pediatrics', 'Emergency & Trauma', 'Orthopedics', 'Pathology'],
      totalBeds: 250,
      availableBeds: 48,
      icuBeds: 32,
      opdCapacity: 600,
      connectedDoctorsCount: 18,
      logoUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=300&q=80',
      description: 'Premier multispecialty hospital providing 24x7 emergency, critical care, and outpatient medical services in Kanpur.',
      passwordHash: 'Hospital@12345',
      createdAt: new Date(Date.now() - 86400000 * 300).toISOString(),
    },
    {
      id: 'HOSP-203',
      hospitalName: 'City Heart Hospital',
      hospitalType: 'Super-Specialty Cardiac Care Institute',
      licenseNumber: 'UP-HOSP-LKO-2016-8820',
      address: 'Gomti Nagar, Vibhuti Khand',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226010',
      email: 'admin@cityheart.demo',
      contactNumber: '+91 522 400 7800',
      adminName: 'Dr. Rameshwar Pandey',
      verificationStatus: 'VERIFIED',
      departments: ['Cardiology', 'Cardiothoracic Surgery', 'Cardiac Intensive Care (CCU)', 'Emergency Triage', 'Cardiac Rehab'],
      totalBeds: 180,
      availableBeds: 35,
      icuBeds: 40,
      opdCapacity: 450,
      connectedDoctorsCount: 14,
      logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=300&q=80',
      description: 'Dedicated tertiary cardiac institute renowned for round-the-clock cath labs, angioplasty, and bypass surgery.',
      passwordHash: 'Hospital@12345',
      createdAt: new Date(Date.now() - 86400000 * 360).toISOString(),
    },
    {
      id: 'HOSP-204',
      hospitalName: 'Ayush Wellness Hospital',
      hospitalType: 'Ayurvedic & Integrative Healthcare Center',
      licenseNumber: 'UP-AYUSH-KAN-2021-1205',
      address: 'Swaroop Nagar, GT Road',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      pincode: '208002',
      email: 'admin@ayushwellness.demo',
      contactNumber: '+91 512 255 3300',
      adminName: 'Vaidya Harishankar Mishra',
      verificationStatus: 'VERIFIED',
      departments: ['Kayachikitsa', 'Panchakarma Unit', 'Shalya Tantra', 'Ahara-Vihara (Dietetics)', 'Yoga & Naturopathy'],
      totalBeds: 120,
      availableBeds: 28,
      icuBeds: 10,
      opdCapacity: 300,
      connectedDoctorsCount: 9,
      logoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300&q=80',
      description: 'Center of excellence for classical Ayurvedic medicine, chronic disease reversal, and authentic Panchakarma therapies.',
      passwordHash: 'Hospital@12345',
      createdAt: new Date(Date.now() - 86400000 * 200).toISOString(),
    },
    {
      id: 'HOSP-201',
      hospitalName: 'All India Institute of Ayurveda & Hospital',
      hospitalType: 'Government Autonomous Institute / NABH Accredited',
      licenseNumber: 'DL-HOSP-2021-0941',
      address: 'Gautampuri, Sarita Vihar, Mathura Road',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110076',
      email: 'admin@aiia.gov.in',
      contactNumber: '+91 11 2695 0401',
      adminName: 'Dr. Manoj Nesari',
      verificationStatus: 'VERIFIED',
      departments: ['Kayachikitsa', 'Panchakarma', 'Shalakya Tantra', 'Prasuti & Stri Roga', 'Kaumarbhritya', 'Emergency OPD'],
      totalBeds: 350,
      availableBeds: 65,
      icuBeds: 45,
      opdCapacity: 900,
      connectedDoctorsCount: 42,
      logoUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=300&q=80',
      description: 'Apex institute of Ayurveda under the Ministry of Ayush, Government of India, delivering tertiary level integrative care.',
      passwordHash: 'Hospital@123',
      createdAt: new Date(Date.now() - 86400000 * 500).toISOString(),
    },
  ];
}

export function getDemoConnectionRequests(): HospitalConnectionRequest[] {
  return [
    {
      id: 'REQ-01',
      doctorId: 'DOC-105',
      doctorName: 'Dr. Sunita Rao',
      doctorEmail: 'dr.sunita@example.com',
      doctorMobile: '+91 98123 45678',
      doctorRegNumber: 'UPMC/2021/33912',
      doctorSpecialization: 'Dermatology & Cosmetology',
      doctorQualification: 'MBBS, MD (Dermatology)',
      doctorExperienceYears: 5,
      hospitalId: 'HOSP-202',
      hospitalName: 'MediCare Hospital',
      department: 'Department of Dermatology',
      requestedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      status: 'PENDING',
    },
  ];
}

export function getDemoReportShares(): ReportShare[] {
  return [
    {
      id: 'SHARE-101',
      reportId: 'REP-DEMO-01',
      intakeId: 'INT-101',
      patientId: 'DEMO-001',
      patientName: 'Rahul Kumar',
      patientAge: 38,
      patientGender: 'Male',
      patientToken: 'TK-101',
      patientPhone: '+91 98765 43210',
      doctorId: 'DOC-102',
      doctorName: 'Dr. Ananya Verma',
      doctorSpecialization: 'General Medicine',
      hospitalId: 'HOSP-202',
      hospitalName: 'MediCare Hospital',
      sharedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'DELIVERED',
      deliveredAt: new Date(Date.now() - 3600000 * 2 + 1000).toISOString(),
      reportSummary: {
        chiefComplaint: 'Chest discomfort radiating to left shoulder with sweating for 2 hours',
        quickClinicalSummary: 'Pre-consultation digital clinical intake. Retrosternal tightness radiating to left arm. Priority HIGH.',
        triagePriority: 'HIGH',
      },
    },
  ];
}

export function getDemoProcedures(): ProcedureRecord[] {
  return [
    {
      id: 'PROC-01',
      patientId: 'DEMO-001',
      patientName: 'Rahul Kumar',
      patientToken: 'TK-101',
      doctorId: 'DOC-103',
      doctorName: 'Dr. Arjun Mehta',
      hospitalId: 'HOSP-202',
      hospitalName: 'MediCare Hospital',
      department: 'Cardiology',
      procedureName: '12-Lead Diagnostic ECG & Echocardiogram',
      date: new Date().toISOString().split('T')[0],
      time: '14:30',
      status: 'Scheduled',
      notes: 'Priority evaluation for retrosternal chest pain with diaphoresis.',
    },
    {
      id: 'PROC-02',
      patientId: 'DEMO-003',
      patientName: 'Ravi Singh',
      patientToken: 'TK-103',
      doctorId: 'DOC-102',
      doctorName: 'Dr. Ananya Verma',
      hospitalId: 'HOSP-202',
      hospitalName: 'MediCare Hospital',
      department: 'Internal Medicine',
      procedureName: 'Fasting Blood Glucose & HbA1c Lab Panel',
      date: new Date().toISOString().split('T')[0],
      time: '11:00',
      status: 'In Progress',
      notes: 'Routine quarterly diabetes and metabolic panel assessment.',
    },
    {
      id: 'PROC-03',
      patientId: 'DEMO-004',
      patientName: 'Meena Verma',
      patientToken: 'TK-104',
      doctorId: 'DOC-104',
      doctorName: 'Dr. Kavya Sharma',
      hospitalId: 'HOSP-204',
      hospitalName: 'Ayush Wellness Hospital',
      department: 'Panchakarma',
      procedureName: 'Abhyanga & Swedana Classical Session',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      time: '10:00',
      status: 'Completed',
      notes: 'Completed session 1 of 7 for chronic lumbar stiffness.',
    },
  ];
}

export function mergeMockDataset(db: DatabaseSchema): DatabaseSchema {
  const { patients, intakes, clinicalReports, reportShares, redFlagAlerts } = buildRelationalMockDataset();

  db.patients = db.patients || [];
  for (const p of patients) {
    const existingIdx = db.patients.findIndex(item => item.id === p.id);
    if (existingIdx >= 0) {
      db.patients[existingIdx] = { ...p, ...db.patients[existingIdx], ...p };
    } else {
      db.patients.push(p);
    }
  }

  db.intakes = db.intakes || [];
  for (const i of intakes) {
    const existingIdx = db.intakes.findIndex(item => item.id === i.id || item.patientId === i.patientId);
    if (existingIdx >= 0) {
      db.intakes[existingIdx] = { ...i, ...db.intakes[existingIdx], ...i };
    } else {
      db.intakes.push(i);
    }
  }

  db.clinicalReports = db.clinicalReports || [];
  for (const r of clinicalReports) {
    const existingIdx = db.clinicalReports.findIndex(item => item.id === r.id || item.patientId === r.patientId);
    if (existingIdx >= 0) {
      db.clinicalReports[existingIdx] = { ...r, ...db.clinicalReports[existingIdx], ...r };
    } else {
      db.clinicalReports.push(r);
    }
  }

  db.reportShares = db.reportShares || [];
  for (const s of reportShares) {
    const existingIdx = db.reportShares.findIndex(item => item.id === s.id || (item.patientId === s.patientId && item.doctorId === s.doctorId));
    if (existingIdx >= 0) {
      db.reportShares[existingIdx] = { ...s, ...db.reportShares[existingIdx], ...s };
    } else {
      db.reportShares.push(s);
    }
  }

  db.redFlagAlerts = db.redFlagAlerts || [];
  for (const a of redFlagAlerts) {
    const existingIdx = db.redFlagAlerts.findIndex(item => item.alertId === a.alertId || item.patientId === a.patientId);
    if (existingIdx < 0) {
      db.redFlagAlerts.push(a);
    }
  }

  return db;
}

export function getDatabase(): DatabaseSchema {
  if (dbCache) {
    dbCache.interviews = dbCache.interviews || [];
    dbCache.clinicalReports = dbCache.clinicalReports || [];
    dbCache.doctors = dbCache.doctors && dbCache.doctors.length > 0 ? dbCache.doctors : getDemoDoctors();
    dbCache.hospitals = dbCache.hospitals && dbCache.hospitals.length > 0 ? dbCache.hospitals : getDemoHospitals();
    dbCache.hospitalConnectionRequests = dbCache.hospitalConnectionRequests || getDemoConnectionRequests();
    dbCache.reportShares = dbCache.reportShares || getDemoReportShares();
    dbCache.procedures = dbCache.procedures || getDemoProcedures();
    dbCache.notifications = dbCache.notifications || [];
    dbCache.ambulanceDispatches = dbCache.ambulanceDispatches || [];
    dbCache.postMedicationFeedbacks = dbCache.postMedicationFeedbacks || [];
    dbCache.facilities = dbCache.facilities && dbCache.facilities.length > 0 ? dbCache.facilities : DEMO_FACILITIES;
    dbCache.liveQueue = dbCache.liveQueue && dbCache.liveQueue.length > 0 ? dbCache.liveQueue : DEMO_LIVE_QUEUE;
    dbCache.appointments = dbCache.appointments && dbCache.appointments.length > 0 ? dbCache.appointments : DEMO_APPOINTMENTS;
    dbCache.referrals = dbCache.referrals && dbCache.referrals.length > 0 ? dbCache.referrals : DEMO_REFERRALS;
    dbCache.diagnostics = dbCache.diagnostics && dbCache.diagnostics.length > 0 ? dbCache.diagnostics : DEMO_DIAGNOSTICS;
    dbCache.medicines = dbCache.medicines && dbCache.medicines.length > 0 ? dbCache.medicines : DEMO_MEDICINES;
    dbCache.highRiskFollowups = dbCache.highRiskFollowups && dbCache.highRiskFollowups.length > 0 ? dbCache.highRiskFollowups : DEMO_HIGH_RISK_FOLLOWUPS;
    dbCache.progressReports = dbCache.progressReports || DEMO_PROGRESS_REPORTS;
    mergeMockDataset(dbCache);
    return dbCache;
  }

  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
      if (dbCache && Array.isArray(dbCache.patients) && Array.isArray(dbCache.intakes)) {
        dbCache.interviews = dbCache.interviews || [];
        dbCache.clinicalReports = dbCache.clinicalReports || [];
        const demoDocs = getDemoDoctors();
        dbCache.doctors = dbCache.doctors || [];
        for (const dDoc of demoDocs) {
          const idx = dbCache.doctors.findIndex(d => d.id === dDoc.id || d.email.toLowerCase() === dDoc.email.toLowerCase());
          if (idx >= 0) {
            dbCache.doctors[idx] = { ...dDoc, ...dbCache.doctors[idx], fullName: dDoc.fullName, specialization: dDoc.specialization, email: dDoc.email };
          } else {
            dbCache.doctors.push(dDoc);
          }
        }
        dbCache.hospitals = dbCache.hospitals && dbCache.hospitals.length > 0 ? dbCache.hospitals : getDemoHospitals();
        dbCache.hospitalConnectionRequests = dbCache.hospitalConnectionRequests || getDemoConnectionRequests();
        dbCache.reportShares = dbCache.reportShares || getDemoReportShares();
        dbCache.procedures = dbCache.procedures || getDemoProcedures();
        dbCache.notifications = dbCache.notifications || [];
        dbCache.ambulanceDispatches = dbCache.ambulanceDispatches || [];
        dbCache.postMedicationFeedbacks = dbCache.postMedicationFeedbacks || [];
        dbCache.facilities = dbCache.facilities && dbCache.facilities.length > 0 ? dbCache.facilities : DEMO_FACILITIES;
        dbCache.liveQueue = dbCache.liveQueue && dbCache.liveQueue.length > 0 ? dbCache.liveQueue : DEMO_LIVE_QUEUE;
        dbCache.appointments = dbCache.appointments && dbCache.appointments.length > 0 ? dbCache.appointments : DEMO_APPOINTMENTS;
        dbCache.referrals = dbCache.referrals && dbCache.referrals.length > 0 ? dbCache.referrals : DEMO_REFERRALS;
        dbCache.diagnostics = dbCache.diagnostics && dbCache.diagnostics.length > 0 ? dbCache.diagnostics : DEMO_DIAGNOSTICS;
        dbCache.medicines = dbCache.medicines && dbCache.medicines.length > 0 ? dbCache.medicines : DEMO_MEDICINES;
        dbCache.highRiskFollowups = dbCache.highRiskFollowups && dbCache.highRiskFollowups.length > 0 ? dbCache.highRiskFollowups : DEMO_HIGH_RISK_FOLLOWUPS;
        dbCache.progressReports = dbCache.progressReports || DEMO_PROGRESS_REPORTS;
        mergeMockDataset(dbCache);
        saveDatabase(dbCache);
        return dbCache;
      }
    } catch (e) {
      console.error('Failed to read db file, initializing with fresh demo data:', e);
    }
  }

  dbCache = getInitialDemoData();
  mergeMockDataset(dbCache);
  saveDatabase(dbCache);
  return dbCache;
}

export function saveDatabase(data?: DatabaseSchema): void {
  ensureDataDir();
  const dbToSave = data || dbCache || getInitialDemoData();
  dbCache = dbToSave;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbToSave, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write database to disk:', e);
  }
}

export function logAudit(user: string, role: 'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN' | 'SYSTEM', action: string, recordId: string, details: string) {
  const db = getDatabase();
  const newLog: AuditLog = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    user,
    role,
    action,
    recordId,
    details,
  };
  db.auditLogs.unshift(newLog);
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
  saveDatabase();
}
