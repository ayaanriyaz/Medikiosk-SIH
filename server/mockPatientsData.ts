import {
  Patient,
  Intake,
  ClinicalReport,
  ReportShare,
  MedicalDocument,
  TimelineEvent,
  RedFlagAlert,
  AyushData,
  Medication,
  Allergy,
} from '../src/types';

// Raw mock patient dataset as provided by the user
export interface RawMockPatient {
  patient_id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  blood_group: string;
  phone: string;
  city: string;
  symptoms: string[];
  duration: string;
  allergies: string[];
  current_medications: string[];
  past_conditions: string[];
  family_history: string[];
  vitals: {
    temperature_c: number;
    heart_rate_bpm: number;
    blood_pressure_mmhg: string;
    spo2_percent: number;
  };
  lab_reports: Array<{
    test: string;
    date: string;
    summary: string;
  }>;
  notes: string;
}

export const RAW_MOCK_PATIENTS: RawMockPatient[] = [
  {
    patient_id: 'PAT001',
    name: 'Aarav Mehta',
    age: 28,
    gender: 'Male',
    blood_group: 'O+',
    phone: '9000000001',
    city: 'Kanpur',
    symptoms: ['fever', 'headache', 'body ache'],
    duration: '3 days',
    allergies: [],
    current_medications: [],
    past_conditions: [],
    family_history: ['mother with seasonal allergies'],
    vitals: {
      temperature_c: 38.4,
      heart_rate_bpm: 94,
      blood_pressure_mmhg: '118/76',
      spo2_percent: 98,
    },
    lab_reports: [
      { test: 'Complete blood count', date: '2026-08-30', summary: 'Synthetic demo report; mild leukocyte elevation noted' },
    ],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT002',
    name: 'Diya Nair',
    age: 34,
    gender: 'Female',
    blood_group: 'A+',
    phone: '9000000002',
    city: 'Kochi',
    symptoms: ['dry cough', 'throat irritation', 'nasal congestion'],
    duration: '6 days',
    allergies: ['dust'],
    current_medications: ['saline nasal spray as needed'],
    past_conditions: ['allergic rhinitis during winter'],
    family_history: [],
    vitals: {
      temperature_c: 37.1,
      heart_rate_bpm: 82,
      blood_pressure_mmhg: '114/72',
      spo2_percent: 97,
    },
    lab_reports: [],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT003',
    name: 'Ishaan Kulkarni',
    age: 22,
    gender: 'Male',
    blood_group: 'B+',
    phone: '9000000003',
    city: 'Pune',
    symptoms: ['throbbing headache', 'light sensitivity', 'nausea'],
    duration: '8 months, episodes twice monthly',
    allergies: [],
    current_medications: ['occasional over-the-counter pain reliever'],
    past_conditions: [],
    family_history: ['father with recurrent headaches'],
    vitals: {
      temperature_c: 36.7,
      heart_rate_bpm: 76,
      blood_pressure_mmhg: '116/74',
      spo2_percent: 99,
    },
    lab_reports: [],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT004',
    name: 'Kavya Reddy',
    age: 47,
    gender: 'Female',
    blood_group: 'AB+',
    phone: '9000000004',
    city: 'Hyderabad',
    symptoms: ['increased thirst', 'frequent urination', 'fatigue'],
    duration: '2 months',
    allergies: ['penicillin'],
    current_medications: ['metformin 500 mg once daily'],
    past_conditions: ['elevated blood sugar noted previously'],
    family_history: ['mother with type 2 diabetes', 'brother with high blood pressure'],
    vitals: {
      temperature_c: 36.8,
      heart_rate_bpm: 88,
      blood_pressure_mmhg: '132/84',
      spo2_percent: 98,
    },
    lab_reports: [
      { test: 'Fasting blood glucose', date: '2026-08-25', summary: 'Synthetic demo report; above reference range (148 mg/dL)' },
      { test: 'HbA1c', date: '2026-08-25', summary: 'Synthetic demo report; moderately elevated value (7.8%)' },
    ],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT005',
    name: 'Rohan Bhatia',
    age: 56,
    gender: 'Male',
    blood_group: 'O-',
    phone: '9000000005',
    city: 'Jaipur',
    symptoms: ['occasional dizziness', 'morning headache', 'tiredness'],
    duration: '3 weeks',
    allergies: [],
    current_medications: ['amlodipine 5 mg once daily'],
    past_conditions: ['high blood pressure for 4 years'],
    family_history: ['father with high blood pressure and stroke history'],
    vitals: {
      temperature_c: 36.6,
      heart_rate_bpm: 86,
      blood_pressure_mmhg: '148/92',
      spo2_percent: 97,
    },
    lab_reports: [],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT006',
    name: 'Mira Joshi',
    age: 31,
    gender: 'Female',
    blood_group: 'A-',
    phone: '9000000006',
    city: 'Ahmedabad',
    symptoms: ['upper abdominal discomfort', 'bloating', 'sour taste'],
    duration: '10 days',
    allergies: [],
    current_medications: [],
    past_conditions: ['intermittent acidity'],
    family_history: [],
    vitals: {
      temperature_c: 36.9,
      heart_rate_bpm: 78,
      blood_pressure_mmhg: '110/70',
      spo2_percent: 99,
    },
    lab_reports: [],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT007',
    name: 'Arjun Iyer',
    age: 39,
    gender: 'Male',
    blood_group: 'B-',
    phone: '9000000007',
    city: 'Chennai',
    symptoms: ['sneezing', 'itchy eyes', 'runny nose'],
    duration: '2 weeks',
    allergies: ['pollen', 'cat dander'],
    current_medications: ['cetirizine 10 mg as needed'],
    past_conditions: ['seasonal allergic rhinitis'],
    family_history: ['sister with eczema'],
    vitals: {
      temperature_c: 36.5,
      heart_rate_bpm: 80,
      blood_pressure_mmhg: '122/78',
      spo2_percent: 98,
    },
    lab_reports: [],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT008',
    name: 'Sana Khan',
    age: 63,
    gender: 'Female',
    blood_group: 'O+',
    phone: '9000000008',
    city: 'Lucknow',
    symptoms: ['knee pain', 'stiffness after sitting', 'difficulty climbing stairs'],
    duration: '9 months',
    allergies: [],
    current_medications: ['calcium supplement'],
    past_conditions: ['mild knee osteoarthritis noted on an earlier synthetic scan'],
    family_history: ['mother had chronic knee pain'],
    vitals: {
      temperature_c: 36.6,
      heart_rate_bpm: 74,
      blood_pressure_mmhg: '136/82',
      spo2_percent: 98,
    },
    lab_reports: [],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT009',
    name: 'Vivek Deshmukh',
    age: 29,
    gender: 'Male',
    blood_group: 'A+',
    phone: '9000000009',
    city: 'Nagpur',
    symptoms: ['fatigue', 'shortness of breath on exertion', 'pale appearance'],
    duration: '6 weeks',
    allergies: [],
    current_medications: [],
    past_conditions: ['low iron level reported once'],
    family_history: [],
    vitals: {
      temperature_c: 36.8,
      heart_rate_bpm: 92,
      blood_pressure_mmhg: '108/68',
      spo2_percent: 98,
    },
    lab_reports: [
      { test: 'Hemoglobin', date: '2026-08-28', summary: 'Synthetic demo report; below reference range (9.8 g/dL)' },
    ],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT010',
    name: 'Nandini Rao',
    age: 42,
    gender: 'Female',
    blood_group: 'B+',
    phone: '9000000010',
    city: 'Bengaluru',
    symptoms: ['feeling cold', 'constipation', 'dry skin', 'low energy'],
    duration: '4 months',
    allergies: [],
    current_medications: ['levothyroxine 50 mcg once daily'],
    past_conditions: ['thyroid function variation'],
    family_history: ['mother with thyroid condition'],
    vitals: {
      temperature_c: 36.3,
      heart_rate_bpm: 68,
      blood_pressure_mmhg: '124/80',
      spo2_percent: 99,
    },
    lab_reports: [
      { test: 'Thyroid stimulating hormone', date: '2026-08-20', summary: 'Synthetic demo report; monitoring value included (5.8 mIU/L)' },
    ],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT011',
    name: 'Aditya Menon',
    age: 18,
    gender: 'Male',
    blood_group: 'AB+',
    phone: '9000000011',
    city: 'Thiruvananthapuram',
    symptoms: ['wheezing', 'chest tightness', 'cough after running'],
    duration: '2 years, worse for 5 days',
    allergies: ['house dust'],
    current_medications: ['salbutamol inhaler as needed'],
    past_conditions: ['episodic asthma symptoms since childhood'],
    family_history: ['father with asthma'],
    vitals: {
      temperature_c: 36.7,
      heart_rate_bpm: 90,
      blood_pressure_mmhg: '112/70',
      spo2_percent: 96,
    },
    lab_reports: [],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT012',
    name: 'Pooja Chatterjee',
    age: 26,
    gender: 'Female',
    blood_group: 'O+',
    phone: '9000000012',
    city: 'Kolkata',
    symptoms: ['itchy skin patches', 'redness', 'dryness'],
    duration: '3 weeks',
    allergies: ['fragranced soaps'],
    current_medications: ['unscented moisturizer'],
    past_conditions: ['eczema during childhood'],
    family_history: [],
    vitals: {
      temperature_c: 36.6,
      heart_rate_bpm: 79,
      blood_pressure_mmhg: '118/74',
      spo2_percent: 99,
    },
    lab_reports: [],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT013',
    name: 'Manav Sethi',
    age: 51,
    gender: 'Male',
    blood_group: 'A+',
    phone: '9000000013',
    city: 'New Delhi',
    symptoms: ['burning urination', 'increased urinary frequency', 'lower abdominal discomfort'],
    duration: '2 days',
    allergies: [],
    current_medications: [],
    past_conditions: [],
    family_history: ['mother with recurrent urinary infections'],
    vitals: {
      temperature_c: 37.5,
      heart_rate_bpm: 84,
      blood_pressure_mmhg: '128/80',
      spo2_percent: 98,
    },
    lab_reports: [
      { test: 'Urinalysis', date: '2026-09-02', summary: 'Synthetic demo report; urinary symptoms recorded for evaluation (Leukocyte esterase positive, WBC 15-20/HPF)' },
    ],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT014',
    name: 'Ananya Pillai',
    age: 37,
    gender: 'Female',
    blood_group: 'B+',
    phone: '9000000014',
    city: 'Mysuru',
    symptoms: ['neck stiffness', 'shoulder pain', 'pain after prolonged computer use'],
    duration: '3 weeks',
    allergies: [],
    current_medications: [],
    past_conditions: [],
    family_history: [],
    vitals: {
      temperature_c: 36.7,
      heart_rate_bpm: 77,
      blood_pressure_mmhg: '116/76',
      spo2_percent: 99,
    },
    lab_reports: [],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT015',
    name: 'Kabir Malhotra',
    age: 7,
    gender: 'Male',
    blood_group: 'O+',
    phone: '9000000015',
    city: 'Chandigarh',
    symptoms: ['runny nose', 'mild fever', 'reduced appetite'],
    duration: '2 days',
    allergies: [],
    current_medications: [],
    past_conditions: [],
    family_history: ['mother with seasonal allergies'],
    vitals: {
      temperature_c: 37.9,
      heart_rate_bpm: 102,
      blood_pressure_mmhg: '104/66',
      spo2_percent: 98,
    },
    lab_reports: [],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT016',
    name: 'Shruti Verma',
    age: 45,
    gender: 'Female',
    blood_group: 'AB-',
    phone: '9000000016',
    city: 'Bhopal',
    symptoms: ['palpitations', 'restlessness', 'unintentional weight change'],
    duration: '5 weeks',
    allergies: ['ibuprofen'],
    current_medications: [],
    past_conditions: [],
    family_history: ['aunt with thyroid disorder'],
    vitals: {
      temperature_c: 37.0,
      heart_rate_bpm: 104,
      blood_pressure_mmhg: '126/78',
      spo2_percent: 98,
    },
    lab_reports: [
      { test: 'Thyroid profile', date: '2026-08-31', summary: 'Synthetic demo report; values provided for outpatient review (Free T4 elevated 2.4 ng/dL, TSH <0.05 mIU/L)' },
    ],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT017',
    name: 'Yash Thakur',
    age: 33,
    gender: 'Male',
    blood_group: 'A-',
    phone: '9000000017',
    city: 'Shimla',
    symptoms: ['low back pain', 'pain after lifting', 'muscle tightness'],
    duration: '5 days',
    allergies: [],
    current_medications: ['topical pain relief gel'],
    past_conditions: [],
    family_history: [],
    vitals: {
      temperature_c: 36.5,
      heart_rate_bpm: 81,
      blood_pressure_mmhg: '120/78',
      spo2_percent: 99,
    },
    lab_reports: [],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT018',
    name: 'Rituparna Das',
    age: 68,
    gender: 'Female',
    blood_group: 'B+',
    phone: '9000000018',
    city: 'Bhubaneswar',
    symptoms: ['mild ankle swelling', 'tiredness', 'occasional breathlessness'],
    duration: '1 month',
    allergies: [],
    current_medications: ['losartan 50 mg once daily', 'atorvastatin 10 mg at night'],
    past_conditions: ['high blood pressure', 'high cholesterol'],
    family_history: ['father with heart disease'],
    vitals: {
      temperature_c: 36.6,
      heart_rate_bpm: 78,
      blood_pressure_mmhg: '142/86',
      spo2_percent: 96,
    },
    lab_reports: [
      { test: 'Lipid profile', date: '2026-08-18', summary: 'Synthetic demo report; follow-up monitoring values (Total Chol 218 mg/dL, Triglycerides 185 mg/dL, LDL 138 mg/dL)' },
    ],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT019',
    name: 'Neelam Kaur',
    age: 30,
    gender: 'Female',
    blood_group: 'O-',
    phone: '9000000019',
    city: 'Amritsar',
    symptoms: ['sore throat', 'mild cough', 'tiredness'],
    duration: '4 days',
    allergies: [],
    current_medications: [],
    past_conditions: [],
    family_history: [],
    vitals: {
      temperature_c: 37.6,
      heart_rate_bpm: 87,
      blood_pressure_mmhg: '118/76',
      spo2_percent: 98,
    },
    lab_reports: [],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
  {
    patient_id: 'PAT020',
    name: 'Samar Roy',
    age: 74,
    gender: 'Male',
    blood_group: 'A+',
    phone: '9000000020',
    city: 'Patna',
    symptoms: ['difficulty sleeping', 'occasional heartburn', 'otherwise well'],
    duration: '3 weeks',
    allergies: ['sulfa medicines'],
    current_medications: [],
    past_conditions: [],
    family_history: ['son with asthma'],
    vitals: {
      temperature_c: 36.4,
      heart_rate_bpm: 72,
      blood_pressure_mmhg: '126/78',
      spo2_percent: 98,
    },
    lab_reports: [],
    notes: 'Fictional demo patient. Not for clinical use.',
  },
];

// Doctor mappings to maintain exact relational hierarchy:
// Patient -> Doctor -> Hospital
interface DoctorAssignment {
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  mode: 'general' | 'ayush';
  ayushPrakriti?: string;
  ayushAgni?: string;
  ayushVikriti?: string;
  ayushSamprapti?: string;
}

const DOCTOR_MAP: Record<string, DoctorAssignment> = {
  // Dr. Ananya Sharma -> MediCare Hospital (Kanpur)
  PAT001: {
    doctorId: 'DOC-102',
    doctorName: 'Dr. Ananya Sharma',
    doctorSpecialization: 'General Medicine',
    hospitalId: 'HOSP-202',
    hospitalName: 'MediCare Hospital',
    department: 'General Medicine & OPD',
    mode: 'general',
  },
  PAT004: {
    doctorId: 'DOC-102',
    doctorName: 'Dr. Ananya Sharma',
    doctorSpecialization: 'General Medicine',
    hospitalId: 'HOSP-202',
    hospitalName: 'MediCare Hospital',
    department: 'General Medicine & OPD',
    mode: 'general',
  },
  PAT007: {
    doctorId: 'DOC-102',
    doctorName: 'Dr. Ananya Sharma',
    doctorSpecialization: 'General Medicine',
    hospitalId: 'HOSP-202',
    hospitalName: 'MediCare Hospital',
    department: 'General Medicine & OPD',
    mode: 'general',
  },
  PAT013: {
    doctorId: 'DOC-102',
    doctorName: 'Dr. Ananya Sharma',
    doctorSpecialization: 'General Medicine',
    hospitalId: 'HOSP-202',
    hospitalName: 'MediCare Hospital',
    department: 'General Medicine & OPD',
    mode: 'general',
  },
  PAT019: {
    doctorId: 'DOC-102',
    doctorName: 'Dr. Ananya Sharma',
    doctorSpecialization: 'General Medicine',
    hospitalId: 'HOSP-202',
    hospitalName: 'MediCare Hospital',
    department: 'General Medicine & OPD',
    mode: 'general',
  },

  // Dr. Rahul Verma -> City Heart Hospital (Lucknow)
  PAT003: {
    doctorId: 'DOC-103',
    doctorName: 'Dr. Rahul Verma',
    doctorSpecialization: 'Cardiology',
    hospitalId: 'HOSP-203',
    hospitalName: 'City Heart Hospital',
    department: 'Neurology & Internal Medicine',
    mode: 'general',
  },
  PAT005: {
    doctorId: 'DOC-103',
    doctorName: 'Dr. Rahul Verma',
    doctorSpecialization: 'Cardiology',
    hospitalId: 'HOSP-203',
    hospitalName: 'City Heart Hospital',
    department: 'Cardiology & CCU',
    mode: 'general',
  },
  PAT008: {
    doctorId: 'DOC-103',
    doctorName: 'Dr. Rahul Verma',
    doctorSpecialization: 'Cardiology',
    hospitalId: 'HOSP-203',
    hospitalName: 'City Heart Hospital',
    department: 'Orthopedic & Rheumatology OPD',
    mode: 'general',
  },
  PAT016: {
    doctorId: 'DOC-103',
    doctorName: 'Dr. Rahul Verma',
    doctorSpecialization: 'Cardiology',
    hospitalId: 'HOSP-203',
    hospitalName: 'City Heart Hospital',
    department: 'Cardiology & Endocrine Care',
    mode: 'general',
  },
  PAT018: {
    doctorId: 'DOC-103',
    doctorName: 'Dr. Rahul Verma',
    doctorSpecialization: 'Cardiology',
    hospitalId: 'HOSP-203',
    hospitalName: 'City Heart Hospital',
    department: 'Cardiology & Heart Failure Clinic',
    mode: 'general',
  },

  // Dr. Meera Kapoor -> Ayush Wellness Hospital (Kanpur)
  PAT006: {
    doctorId: 'DOC-104',
    doctorName: 'Dr. Meera Kapoor',
    doctorSpecialization: 'Ayurveda',
    hospitalId: 'HOSP-204',
    hospitalName: 'Ayush Wellness Hospital',
    department: 'Kayachikitsa & Panchakarma Unit',
    mode: 'ayush',
    ayushPrakriti: 'Pitta-Kapha',
    ayushAgni: 'Tikshnagni (Sharp/Hyperactive)',
    ayushVikriti: 'Pitta Dushti (Amlapitta)',
    ayushSamprapti: 'Vidagdha Ajirna leading to upward sour eructations and epigastric burning.',
  },
  PAT010: {
    doctorId: 'DOC-104',
    doctorName: 'Dr. Meera Kapoor',
    doctorSpecialization: 'Ayurveda',
    hospitalId: 'HOSP-204',
    hospitalName: 'Ayush Wellness Hospital',
    department: 'Kayachikitsa & Panchakarma Unit',
    mode: 'ayush',
    ayushPrakriti: 'Kapha-Vata',
    ayushAgni: 'Manda Agni (Sluggish Digestive Fire)',
    ayushVikriti: 'Kapha Dushti & Medo-Dhatu Sluggishness',
    ayushSamprapti: 'Dhatvagnimandya leading to metabolic lethargy and cold intolerance.',
  },
  PAT014: {
    doctorId: 'DOC-104',
    doctorName: 'Dr. Meera Kapoor',
    doctorSpecialization: 'Ayurveda',
    hospitalId: 'HOSP-204',
    hospitalName: 'Ayush Wellness Hospital',
    department: 'Panchakarma & Spine Care',
    mode: 'ayush',
    ayushPrakriti: 'Vata-Pitta',
    ayushAgni: 'Vishamagni',
    ayushVikriti: 'Vata Dushti in Greeva (Manyastambha)',
    ayushSamprapti: 'Prolonged sitting posture causing Srotorodha in Greeva and Amsa Sandhi.',
  },
  PAT017: {
    doctorId: 'DOC-104',
    doctorName: 'Dr. Meera Kapoor',
    doctorSpecialization: 'Ayurveda',
    hospitalId: 'HOSP-204',
    hospitalName: 'Ayush Wellness Hospital',
    department: 'Shalya Tantra & Panchakarma',
    mode: 'ayush',
    ayushPrakriti: 'Vata-Kapha',
    ayushAgni: 'Vishamagni',
    ayushVikriti: 'Katigraha (Vata Vyadhi)',
    ayushSamprapti: 'Abhighataja Vata Prakopa in Kati Pradesh following physical weight lifting.',
  },
  PAT020: {
    doctorId: 'DOC-104',
    doctorName: 'Dr. Meera Kapoor',
    doctorSpecialization: 'Ayurveda',
    hospitalId: 'HOSP-204',
    hospitalName: 'Ayush Wellness Hospital',
    department: 'Rasayana & Geriatric Care',
    mode: 'ayush',
    ayushPrakriti: 'Vata-Pitta',
    ayushAgni: 'Manda-Vishamagni',
    ayushVikriti: 'Anidra & Pittaja Amlapitta in Vardhakya',
    ayushSamprapti: 'Vata increase in geriatric age impairing Manovaha Srotas, causing fragmented sleep.',
  },

  // Dr. Rajesh Sharma -> All India Institute of Ayurveda & Hospital (New Delhi)
  PAT002: {
    doctorId: 'DOC-101',
    doctorName: 'Dr. Rajesh Sharma',
    doctorSpecialization: 'Kayachikitsa & General Medicine',
    hospitalId: 'HOSP-201',
    hospitalName: 'All India Institute of Ayurveda & Hospital',
    department: 'Department of Kayachikitsa',
    mode: 'ayush',
    ayushPrakriti: 'Kapha-Vata',
    ayushAgni: 'Sama Agni',
    ayushVikriti: 'Pratishyaya (Kaphaja)',
    ayushSamprapti: 'Dust exposure causing aggravation of Prana Vata and Kapha in Nasal passages.',
  },
  PAT009: {
    doctorId: 'DOC-101',
    doctorName: 'Dr. Rajesh Sharma',
    doctorSpecialization: 'Kayachikitsa & General Medicine',
    hospitalId: 'HOSP-201',
    hospitalName: 'All India Institute of Ayurveda & Hospital',
    department: 'Department of Kayachikitsa',
    mode: 'ayush',
    ayushPrakriti: 'Pitta-Vata',
    ayushAgni: 'Manda Agni',
    ayushVikriti: 'Pandu Roga (Alparakta)',
    ayushSamprapti: 'Pitta Pradhana Tridosha vitiation affecting Rasa-Rakta Dhatu and Ojas.',
  },
  PAT011: {
    doctorId: 'DOC-101',
    doctorName: 'Dr. Rajesh Sharma',
    doctorSpecialization: 'Kayachikitsa & General Medicine',
    hospitalId: 'HOSP-201',
    hospitalName: 'All India Institute of Ayurveda & Hospital',
    department: 'Pranavaha Srotas Clinical Unit',
    mode: 'ayush',
    ayushPrakriti: 'Vata-Kapha',
    ayushAgni: 'Vishamagni',
    ayushVikriti: 'Tamaka Shvasa (Bronchial Asthma)',
    ayushSamprapti: 'Pratiloma Vata moving upward in Pranavaha Srotas, aggravated by physical exertion and cold air.',
  },
  PAT012: {
    doctorId: 'DOC-101',
    doctorName: 'Dr. Rajesh Sharma',
    doctorSpecialization: 'Kayachikitsa & General Medicine',
    hospitalId: 'HOSP-201',
    hospitalName: 'All India Institute of Ayurveda & Hospital',
    department: 'Twak Roga (Dermatology Unit)',
    mode: 'ayush',
    ayushPrakriti: 'Pitta-Kapha',
    ayushAgni: 'Tikshnagni',
    ayushVikriti: 'Vicharchika (Eczematous Dermatitis)',
    ayushSamprapti: 'Rakta-Twak Dushti leading to Kandu (itching), Shyava (dark patches), and Srava.',
  },
  PAT015: {
    doctorId: 'DOC-101',
    doctorName: 'Dr. Rajesh Sharma',
    doctorSpecialization: 'Kayachikitsa & General Medicine',
    hospitalId: 'HOSP-201',
    hospitalName: 'All India Institute of Ayurveda & Hospital',
    department: 'Kaumarbhritya (Pediatrics)',
    mode: 'general',
  },
};

/**
 * Transforms raw mock patient data into relational entities:
 * Patients, Intakes, Clinical Reports, Documents, ReportShares, Timeline
 */
export function buildRelationalMockDataset() {
  const patients: Patient[] = [];
  const intakes: Intake[] = [];
  const clinicalReports: ClinicalReport[] = [];
  const reportShares: ReportShare[] = [];
  const redFlagAlerts: RedFlagAlert[] = [];

  const now = new Date();

  RAW_MOCK_PATIENTS.forEach((raw, idx) => {
    const regTimestamp = new Date(now.getTime() - (idx + 1) * 3600000 * 4).toISOString();
    const token = `TK-${raw.patient_id}`;
    const abhaId = `${raw.name.toLowerCase().replace(/\s+/g, '.')}.${raw.patient_id.toLowerCase()}@abdm`;
    const aadhaarLast4 = `${4000 + idx + 1}`;

    const assignment = DOCTOR_MAP[raw.patient_id] || {
      doctorId: 'DOC-102',
      doctorName: 'Dr. Ananya Sharma',
      doctorSpecialization: 'General Medicine',
      hospitalId: 'HOSP-202',
      hospitalName: 'MediCare Hospital',
      department: 'General Medicine',
      mode: 'general',
    };

    // Determine Triage Priority & Red Flag
    const isHighTemp = raw.vitals.temperature_c >= 38.0;
    const isHighBP = parseInt(raw.vitals.blood_pressure_mmhg.split('/')[0] || '120') >= 145;
    const isLowSpO2 = raw.vitals.spo2_percent <= 96;
    const isHighHR = raw.vitals.heart_rate_bpm >= 100;

    let priority: 'HIGH' | 'NORMAL' | 'LOW' = 'NORMAL';
    let redFlagAlert: RedFlagAlert | null = null;

    if (isHighTemp || isHighBP || isLowSpO2 || isHighHR) {
      priority = 'HIGH';
      const rule = isHighBP
        ? 'Stage 2 Hypertension with symptoms'
        : isLowSpO2
        ? 'Hypoxemia / Respiratory Distress Risk'
        : isHighHR
        ? 'Marked Tachycardia / Arrhythmia Risk'
        : 'High Pyrexia / Systemic Infection Risk';

      redFlagAlert = {
        alertId: `ALT-${raw.patient_id}`,
        patientId: raw.patient_id,
        intakeId: `INT-${raw.patient_id}`,
        patientName: raw.name,
        token,
        ruleTriggered: rule,
        severity: 'HIGH',
        createdAt: regTimestamp,
        status: 'UNREVIEWED',
        symptomSummary: `${raw.symptoms.join(', ')} (${raw.duration}) with Vitals: Temp ${raw.vitals.temperature_c}°C, BP ${raw.vitals.blood_pressure_mmhg}, HR ${raw.vitals.heart_rate_bpm} bpm.`,
      };
      redFlagAlerts.push(redFlagAlert);
    }

    // Convert raw medications to Medication objects
    const medications: Medication[] = raw.current_medications.map(m => ({
      name: m.split(' ')[0] || m,
      dosage: m.includes('mg') ? m.replace(/^.*?(\d+\s*mg).*$/, '$1') : 'As directed',
      frequency: m.toLowerCase().includes('daily') ? 'OD' : m.toLowerCase().includes('needed') ? 'PRN' : 'OD',
      source: 'Patient Verbal / Prescription',
      verificationStatus: 'Patient Reported',
    }));

    // Convert raw allergies to Allergy objects
    const allergies: Allergy[] = raw.allergies.map(a => ({
      substance: a,
      reaction: 'Hypersensitivity / Rash',
      severity: a.toLowerCase().includes('penicillin') || a.toLowerCase().includes('sulfa') ? 'Moderate' : 'Mild',
      type: a.toLowerCase().includes('penicillin') || a.toLowerCase().includes('sulfa') || a.toLowerCase().includes('ibuprofen') ? 'Drug' : 'Other',
      source: 'Patient Reported',
      verificationStatus: 'Patient Reported',
    }));

    // Convert raw lab reports to MedicalDocument objects
    const documents: MedicalDocument[] = raw.lab_reports.map((lr, dIdx) => ({
      id: `DOC-${raw.patient_id}-${dIdx + 1}`,
      name: `${lr.test.replace(/\s+/g, '_')}_${lr.date}.pdf`,
      type: 'Lab Report',
      date: lr.date,
      facility: assignment.hospitalName,
      doctor: assignment.doctorName,
      extractedEntities: {
        patientName: raw.name,
        diagnosis: lr.test,
        labTests: [
          {
            testName: lr.test,
            value: lr.summary,
            unit: '',
            referenceRange: 'Standard Diagnostic Reference',
            abnormal: lr.summary.toLowerCase().includes('elevation') || lr.summary.toLowerCase().includes('above') || lr.summary.toLowerCase().includes('below'),
          },
        ],
        notes: lr.summary,
        confidence: '98%',
      },
      verified: true,
      isDemoSample: true,
    }));

    // Build timeline events
    const timeline: TimelineEvent[] = [
      {
        id: `TL-${raw.patient_id}-01`,
        date: raw.lab_reports[0]?.date || new Date(now.getTime() - 86400000 * 10).toISOString().split('T')[0],
        title: raw.lab_reports[0] ? `Diagnostic Test: ${raw.lab_reports[0].test}` : 'Outpatient Registration',
        category: raw.lab_reports[0] ? 'Lab Test' : 'Consultation',
        summary: raw.lab_reports[0] ? raw.lab_reports[0].summary : `Initial visit recorded at ${assignment.hospitalName}.`,
      },
      {
        id: `TL-${raw.patient_id}-02`,
        date: new Date().toISOString().split('T')[0],
        title: 'MediKiosk Clinical Intake Completed',
        category: 'Current Intake',
        summary: `Self-reported symptoms (${raw.symptoms.join(', ')}) logged with Vitals verified. Assigned to ${assignment.doctorName}.`,
      },
    ];

    // Build AyushData if applicable
    const ayushData: AyushData = assignment.mode === 'ayush' ? {
      prakriti: assignment.ayushPrakriti || 'Kapha-Pitta',
      agni: assignment.ayushAgni || 'Sama Agni',
      vikriti: assignment.ayushVikriti || 'Dosha imbalance reported',
      koshtha: 'Madhyama Koshtha',
      aharaShakti: 'Madhyama',
      vyayamaShakti: 'Madhyama',
      satmya: 'Sarvarasa Satmya',
      sattva: 'Madhyama Sattva',
      vaya: raw.age < 16 ? 'Balya' : raw.age < 60 ? 'Madhyama Vaya' : 'Vardhakya',
      nidana: `Ahara-Vihara related causative factors noted in clinical history: ${raw.symptoms.join(', ')}`,
      samprapti: assignment.ayushSamprapti || 'Srotorodha and Dosha Prakopa in corresponding organ channels.',
    } : {};

    // Patient record
    const patientRecord: Patient = {
      id: raw.patient_id,
      token,
      name: raw.name,
      age: raw.age,
      gender: raw.gender,
      bloodGroup: raw.blood_group,
      phone: raw.phone,
      city: raw.city,
      state: raw.city === 'Kanpur' || raw.city === 'Lucknow' ? 'Uttar Pradesh'
        : raw.city === 'Kochi' || raw.city === 'Thiruvananthapuram' ? 'Kerala'
        : raw.city === 'Pune' || raw.city === 'Nagpur' ? 'Maharashtra'
        : raw.city === 'Hyderabad' ? 'Telangana'
        : raw.city === 'Jaipur' ? 'Rajasthan'
        : raw.city === 'Ahmedabad' ? 'Gujarat'
        : raw.city === 'Chennai' ? 'Tamil Nadu'
        : raw.city === 'Bengaluru' || raw.city === 'Mysuru' ? 'Karnataka'
        : raw.city === 'Kolkata' ? 'West Bengal'
        : raw.city === 'New Delhi' ? 'Delhi'
        : raw.city === 'Chandigarh' || raw.city === 'Amritsar' ? 'Punjab'
        : raw.city === 'Bhopal' ? 'Madhya Pradesh'
        : raw.city === 'Shimla' ? 'Himachal Pradesh'
        : raw.city === 'Bhubaneswar' ? 'Odisha'
        : raw.city === 'Patna' ? 'Bihar' : 'India',
      abhaId,
      aadhaarLast4,
      registeredAt: regTimestamp,
      isDemo: true,
      symptoms: raw.symptoms,
      duration: raw.duration,
      allergies: raw.allergies,
      currentMedications: raw.current_medications,
      pastConditions: raw.past_conditions,
      familyHistory: raw.family_history,
      vitals: raw.vitals,
      labReports: raw.lab_reports,
      notes: raw.notes,
      assignedDoctorId: assignment.doctorId,
      assignedDoctorName: assignment.doctorName,
      assignedHospitalId: assignment.hospitalId,
      assignedHospitalName: assignment.hospitalName,
      status: priority === 'HIGH' ? 'RED_FLAG' : 'READY_FOR_REVIEW',
    };
    patients.push(patientRecord);

    // Intake record
    const chiefComplaintStr = `${raw.symptoms.join(', ')} for ${raw.duration}`;
    const hpiStr = `Patient presents with ${raw.symptoms.join(', ')} of ${raw.duration} duration. Vitals: BP ${raw.vitals.blood_pressure_mmhg}, HR ${raw.vitals.heart_rate_bpm} bpm, Temp ${raw.vitals.temperature_c}°C, SpO2 ${raw.vitals.spo2_percent}%. Past history: ${raw.past_conditions.length > 0 ? raw.past_conditions.join(', ') : 'None significant'}.`;

    const intakeRecord: Intake = {
      id: `INT-${raw.patient_id}`,
      patientId: raw.patient_id,
      sessionId: `SES-${raw.patient_id}`,
      token,
      patientName: raw.name,
      age: raw.age,
      gender: raw.gender,
      language: 'en',
      department: assignment.department,
      mode: assignment.mode,
      chiefComplaint: chiefComplaintStr,
      historyOfPresentIllness: hpiStr,
      pastMedicalHistory: raw.past_conditions.join(', ') || 'No prior chronic condition reported',
      pastSurgicalHistory: 'None reported',
      medications,
      allergies,
      familyHistory: raw.family_history.join(', ') || 'Non-contributory',
      personalHistory: `Resident of ${raw.city}. Blood group: ${raw.blood_group}. Standard outpatient lifestyle.`,
      reviewOfSystems: {
        General: `Fatigue/Vitals: ${raw.vitals.temperature_c}°C, ${raw.vitals.blood_pressure_mmhg}`,
        Symptoms: raw.symptoms.join(', '),
      },
      ayushData,
      documents,
      timeline,
      redFlags: redFlagAlert ? [redFlagAlert] : [],
      aiSummary: {
        version: 1,
        text: `${raw.age}-year-old ${raw.gender.toLowerCase()} presenting with ${raw.symptoms.join(', ')} persisting for ${raw.duration}. Vital signs: Temp ${raw.vitals.temperature_c}°C, BP ${raw.vitals.blood_pressure_mmhg}, HR ${raw.vitals.heart_rate_bpm} bpm, SpO2 ${raw.vitals.spo2_percent}%. ${raw.past_conditions.length ? 'Past conditions: ' + raw.past_conditions.join(', ') + '.' : ''} Assigned to ${assignment.doctorName} at ${assignment.hospitalName}.`,
        sections: {
          chiefComplaint: chiefComplaintStr,
          historyOfPresentIllness: hpiStr,
          pastMedicalHistory: raw.past_conditions.join(', ') || 'Nil',
          pastSurgicalHistory: 'None',
          currentMedications: raw.current_medications.length > 0 ? raw.current_medications : ['None reported'],
          drugAllergies: raw.allergies.length > 0 ? raw.allergies : ['None reported'],
          familyHistory: raw.family_history.join(', ') || 'Non-contributory',
          personalHistory: `City: ${raw.city} | Blood Group: ${raw.blood_group}`,
          reviewOfSystems: `Recorded symptoms: ${raw.symptoms.join(', ')}`,
          previousInvestigations: raw.lab_reports.map(lr => `${lr.test} (${lr.date}): ${lr.summary}`).join(' | ') || 'None recorded',
          ayushParameters: assignment.mode === 'ayush' ? `Prakriti: ${ayushData.prakriti} | Agni: ${ayushData.agni} | Vikriti: ${ayushData.vikriti}` : undefined,
          redFlags: redFlagAlert ? [redFlagAlert.ruleTriggered] : [],
          importantNotes: `Assigned Physician: ${assignment.doctorName} (${assignment.hospitalName}). Pre-consultation intake ready for clinical validation.`,
        },
        sources: [
          { statement: 'Chief complaints and duration', source: 'MediKiosk Patient Questionnaire' },
          { statement: 'Vitals assessment', source: 'Kiosk Automated Diagnostic Sensors' },
        ],
        isDraft: true,
      },
      consent: {
        given: true,
        timestamp: regTimestamp,
        version: 'v2.2-ABDM',
        language: 'en',
      },
      rawAnswers: raw.symptoms.map(s => ({
        question: 'Reported Symptom',
        answer: s,
        timestamp: regTimestamp,
      })),
      status: priority === 'HIGH' ? 'RED_FLAG' : 'READY_FOR_REVIEW',
      clinicalReportId: `REP-${raw.patient_id}`,
      reportStatus: 'AWAITING_DOCTOR_REVIEW',
      createdAt: regTimestamp,
      updatedAt: regTimestamp,
    };
    intakes.push(intakeRecord);

    // Clinical Report Record
    const clinicalReportRecord: ClinicalReport = {
      id: `REP-${raw.patient_id}`,
      patientId: raw.patient_id,
      interviewId: `INTV-${raw.patient_id}`,
      intakeId: `INT-${raw.patient_id}`,
      patientName: raw.name,
      age: raw.age,
      gender: raw.gender,
      abhaId,
      token,
      generatedAt: regTimestamp,
      status: 'AWAITING_DOCTOR_REVIEW',
      demographics: {
        name: raw.name,
        age: raw.age,
        gender: raw.gender,
        token,
        abhaAddress: abhaId,
        phone: raw.phone,
      },
      summary: {
        quickClinicalSummary: `${raw.age}Y ${raw.gender} presenting with ${raw.symptoms.join(', ')} for ${raw.duration}. Vitals: ${raw.vitals.blood_pressure_mmhg}, HR ${raw.vitals.heart_rate_bpm}, Temp ${raw.vitals.temperature_c}°C, SpO2 ${raw.vitals.spo2_percent}%.`,
        keyPointsForDoctor: [
          `Symptoms: ${raw.symptoms.join(', ')} (${raw.duration})`,
          `Vitals: BP ${raw.vitals.blood_pressure_mmhg}, HR ${raw.vitals.heart_rate_bpm} bpm, Temp ${raw.vitals.temperature_c}°C, SpO2 ${raw.vitals.spo2_percent}%`,
          ...(raw.current_medications.length ? [`Medications: ${raw.current_medications.join(', ')}`] : []),
          ...(raw.allergies.length ? [`Allergies: ${raw.allergies.join(', ')}`] : []),
          ...(raw.lab_reports.length ? [`Labs: ${raw.lab_reports.map(l => `${l.test} - ${l.summary}`).join('; ')}`] : []),
        ],
      },
      chiefComplaint: chiefComplaintStr,
      historyOfPresentIllness: hpiStr,
      hpiDetails: {
        onset: raw.duration,
        duration: raw.duration,
        character: raw.symptoms.join(', '),
        severity: priority === 'HIGH' ? 'Severe / Monitored' : 'Moderate',
      },
      reviewOfSystems: {
        General: `Reported symptoms: ${raw.symptoms.join(', ')}`,
      },
      pastMedicalHistory: raw.past_conditions,
      pastSurgicalHistory: [],
      hospitalizationHistory: [],
      drugHistory: medications,
      allergies,
      familyHistory: raw.family_history.map(fh => ({ relationship: 'Family', condition: fh })),
      personalHistory: {
        diet: 'Balanced',
        occupation: `Resident of ${raw.city}`,
      },
      ayurvedaAssessment: assignment.mode === 'ayush' ? ayushData : undefined,
      documents,
      redFlags: redFlagAlert ? [redFlagAlert] : [],
      triagePriority: priority,
      disclaimer: 'AI-generated clinical intake summary. Not a diagnosis. Must be reviewed and verified by a qualified healthcare professional.',
      sharedWith: [
        {
          doctorId: assignment.doctorId,
          doctorName: assignment.doctorName,
          hospitalName: assignment.hospitalName,
          sharedAt: regTimestamp,
          status: 'DELIVERED',
        },
      ],
    };
    clinicalReports.push(clinicalReportRecord);

    // ReportShare record connecting Patient -> Doctor -> Hospital
    const reportShareRecord: ReportShare = {
      id: `SHARE-${raw.patient_id}`,
      reportId: `REP-${raw.patient_id}`,
      intakeId: `INT-${raw.patient_id}`,
      patientId: raw.patient_id,
      patientName: raw.name,
      patientAge: raw.age,
      patientGender: raw.gender,
      patientToken: token,
      patientPhone: raw.phone,
      doctorId: assignment.doctorId,
      doctorName: assignment.doctorName,
      doctorSpecialization: assignment.doctorSpecialization,
      hospitalId: assignment.hospitalId,
      hospitalName: assignment.hospitalName,
      sharedAt: regTimestamp,
      status: 'DELIVERED',
      deliveredAt: regTimestamp,
      reportSummary: {
        chiefComplaint: chiefComplaintStr,
        quickClinicalSummary: `${raw.age}Y ${raw.gender} with ${raw.symptoms.join(', ')} (${raw.duration}). Vitals: BP ${raw.vitals.blood_pressure_mmhg}, Temp ${raw.vitals.temperature_c}°C, SpO2 ${raw.vitals.spo2_percent}%.`,
        triagePriority: priority,
      },
    };
    reportShares.push(reportShareRecord);
  });

  return {
    patients,
    intakes,
    clinicalReports,
    reportShares,
    redFlagAlerts,
  };
}
