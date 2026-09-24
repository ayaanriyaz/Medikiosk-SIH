export type Language =
  | 'en'
  | 'hi'
  | 'mr'
  | 'bn'
  | 'gu'
  | 'pa'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'or'
  | 'as'
  | 'ur'
  | 'ne'
  | 'sa'
  | 'ar'
  | 'es'
  | 'fr'
  | 'de'
  | 'ru'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'tr'
  | 'id'
  | 'pt'
  | 'it'
  | 'vi'
  | 'th'
  | string;

export type IntakeStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'READY_FOR_REVIEW'
  | 'IN_REVIEW'
  | 'VERIFIED'
  | 'RED_FLAG'
  | 'COMPLETED';

export type ReportStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'AI_GENERATED'
  | 'AWAITING_DOCTOR_REVIEW'
  | 'REVIEWED'
  | 'EDITED_BY_DOCTOR'
  | 'FINALIZED';

export type SourceType =
  | 'patient_answer'
  | 'uploaded_document'
  | 'doctor_record'
  | 'AI_inference';

export type VerificationBadge =
  | 'Verified'
  | 'Needs Review'
  | 'Patient Reported'
  | 'Doctor Confirmed';

export type Workspace =
  | 'home'
  | 'kiosk'
  | 'patient'
  | 'asha'
  | 'asha-mode'
  | 'doctor'
  | 'doctor-login'
  | 'doctor-register'
  | 'doctor-dashboard'
  | 'admin'
  | 'facility'
  | 'facility-dashboard'
  | 'district'
  | 'district-dashboard'
  | 'hospital-login'
  | 'hospital-register'
  | 'hospital-dashboard'
  | 'referrals'
  | 'queue'
  | 'live-queue'
  | 'diagnostics'
  | 'medicines'
  | 'followups'
  | 'demo';

export interface Patient {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  abhaId?: string;
  aadhaarLast4?: string;
  registeredAt: string;
  isDemo?: boolean;
  bloodGroup?: string;
  city?: string;
  state?: string;
  symptoms?: string[];
  duration?: string;
  allergies?: string[];
  currentMedications?: string[];
  pastConditions?: string[];
  familyHistory?: string[];
  vitals?: {
    temperature_c?: number;
    heart_rate_bpm?: number;
    blood_pressure_mmhg?: string;
    spo2_percent?: number;
  };
  labReports?: Array<{
    test: string;
    date: string;
    summary: string;
  }>;
  notes?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedHospitalId?: string;
  assignedHospitalName?: string;
  department?: string;
  ayurvedaProfile?: any;
  status?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  source: string;
  verificationStatus?: VerificationBadge;
}

export interface Allergy {
  substance: string;
  reaction?: string;
  severity?: 'Mild' | 'Moderate' | 'Severe';
  type?: 'Drug' | 'Food' | 'Other';
  source: string;
  verificationStatus?: VerificationBadge;
}

export interface InterviewMessage {
  id: string;
  interviewId: string;
  sender: 'bot' | 'patient' | 'system';
  message: string;
  timestamp: string;
  language: Language;
  questionCategory?: string;
  quickOptions?: string[];
  allowsVoice?: boolean;
  allowsSkip?: boolean;
  isRedFlagAlert?: boolean;
  isClarification?: boolean;
  requiresDocumentUpload?: boolean;
  extractedDataPreview?: string;
}

export interface ClinicalInterview {
  id: string;
  patientId: string;
  intakeId?: string;
  language: Language;
  startedAt: string;
  completedAt?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'SUBMITTED';
  currentSection: 'chief_complaint' | 'hpi' | 'past_history' | 'medications_allergies' | 'family_lifestyle' | 'ayurveda' | 'review';
  chiefComplaint: string;
  hpi: {
    onset?: string;
    duration?: string;
    progression?: string;
    character?: string;
    location?: string;
    radiation?: string;
    severity?: number | string;
    aggravatingFactors?: string;
    relievingFactors?: string;
    associatedSymptoms?: string[];
  };
  reviewOfSystems: Record<string, string>;
  pastHistory: string[];
  surgicalHistory: Array<{ surgery: string; year?: string; reason?: string }>;
  hospitalizationHistory: Array<{ reason: string; year?: string; hospital?: string }>;
  drugHistory: Medication[];
  allergies: Allergy[];
  familyHistory: Array<{ relationship: string; condition: string }>;
  personalHistory: {
    diet?: string;
    sleep?: string;
    physicalActivity?: string;
    tobacco?: string;
    alcohol?: string;
    occupation?: string;
    exposure?: string;
  };
  femaleHealthHistory?: {
    menstrualHistory?: string;
    pregnancyStatus?: string;
    gynecologicalConcerns?: string;
  };
  ayurvedaHistory?: AyushData;
  redFlags: RedFlagAlert[];
  documents: MedicalDocument[];
  completionScore: number;
  messages: InterviewMessage[];
  contradictionClarifications?: Array<{
    question: string;
    initialAnswer: string;
    newAnswer: string;
    resolvedTo: string;
  }>;
}

export interface ClinicalReport {
  id: string;
  patientId: string;
  interviewId: string;
  intakeId: string;
  patientName: string;
  age: number;
  gender: string;
  abhaId?: string;
  token: string;
  generatedAt: string;
  status: ReportStatus;
  demographics?: {
    name: string;
    age: number;
    gender: string;
    token: string;
    abhaAddress?: string;
    phone?: string;
  };
  summary: {
    quickClinicalSummary: string;
    keyPointsForDoctor: string[];
  };
  chiefComplaint: string;
  historyOfPresentIllness: string;
  hpiDetails?: {
    onset?: string;
    duration?: string;
    progression?: string;
    severity?: string;
    character?: string;
    location?: string;
    radiation?: string;
    aggravating?: string;
    relieving?: string;
    associatedSymptoms?: string;
  };
  reviewOfSystems: Record<string, string>;
  pastMedicalHistory: string[];
  pastSurgicalHistory: string[];
  hospitalizationHistory: string[];
  drugHistory: Medication[];
  allergies: Allergy[];
  familyHistory: Array<{ relationship: string; condition: string }>;
  personalHistory: {
    diet?: string;
    sleep?: string;
    physicalActivity?: string;
    tobacco?: string;
    alcohol?: string;
    occupation?: string;
    exposure?: string;
  };
  femaleHealthHistory?: {
    menstrualHistory?: string;
    pregnancyStatus?: string;
    gynecologicalConcerns?: string;
  };
  ayurvedaAssessment?: AyushData;
  documents: MedicalDocument[];
  redFlags: RedFlagAlert[];
  triagePriority: 'HIGH' | 'NORMAL' | 'LOW';
  priorityScore?: ClinicalPriorityScore;
  drugSafetyAlerts?: DrugInteractionAlert[];
  reviewedBy?: string;
  reviewedAt?: string;
  doctorNotes?: string;
  disclaimer?: string;
  sharedWith?: Array<{
    doctorId: string;
    doctorName: string;
    hospitalName?: string;
    sharedAt: string;
    status: 'SENT' | 'DELIVERED' | 'VIEWED' | 'REVIEWED';
  }>;
}

export interface AyushData {
  prakriti?: string; // Vata, Pitta, Kapha, Vata-Pitta, etc.
  vikriti?: string; // Current imbalance
  agni?: string; // Vishama, Tikshna, Manda, Sama
  koshtha?: string; // Krura, Mridu, Madhyama
  aharaShakti?: string; // Abhyavaharana & Jaranashakti (Pravara, Madhyama, Avara)
  vyayamaShakti?: string; // Pravara, Madhyama, Avara
  sara?: string; // Dhatu excellence
  samhanana?: string; // Body compactness
  pramana?: string; // Anthropometric measurement
  satmya?: string; // Homologation
  sattva?: string; // Mental strength (Pravara, Madhyama, Avara)
  vaya?: string; // Age stage (Balya, Madhyama, Vardhakya)
  nidana?: string; // Causative factors
  samprapti?: string; // Pathogenesis summary
}

export interface MedicalDocument {
  id: string;
  name: string;
  type:
    | 'Prescription'
    | 'Blood Test'
    | 'Lab Report'
    | 'X-Ray Report'
    | 'Scan/Imaging Report'
    | 'Discharge Summary'
    | 'Doctor Note'
    | 'Other Medical Document';
  date: string;
  facility?: string;
  doctor?: string;
  fileSize?: string;
  extractedEntities: {
    patientName?: string;
    diagnosis?: string;
    medications?: Array<{ name: string; dosage: string; frequency?: string; duration?: string; route?: string }>;
    labTests?: Array<{ testName: string; value: string; unit: string; referenceRange: string; abnormal?: boolean }>;
    procedures?: string[];
    allergies?: string[];
    notes?: string;
    confidence?: string;
  };
  patientCorrections?: {
    notes?: string;
    confirmed: boolean;
  };
  verified: boolean;
  fileUrl?: string;
  isDemoSample?: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  category: 'Consultation' | 'Prescription' | 'Lab Test' | 'Hospitalization' | 'Current Intake';
  summary: string;
  sourceDocId?: string;
}

export interface RedFlagAlert {
  alertId: string;
  patientId: string;
  intakeId: string;
  patientName: string;
  token: string;
  ruleTriggered: string;
  severity: 'HIGH' | 'CRITICAL' | 'MODERATE';
  createdAt: string;
  status: 'UNREVIEWED' | 'ACKNOWLEDGED' | 'RESOLVED';
  symptomSummary: string;
  actionRequired?: string;
}

export interface AISummary {
  version: number;
  text: string;
  sections: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    pastMedicalHistory: string;
    pastSurgicalHistory: string;
    currentMedications: string[];
    drugAllergies: string[];
    familyHistory: string;
    personalHistory: string;
    reviewOfSystems: string;
    previousInvestigations: string;
    ayushParameters?: string;
    redFlags: string[];
    importantNotes: string;
  };
  sources: Array<{ statement: string; source: string }>;
  isDraft: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  doctorNotes?: string;
}

export interface Intake {
  id: string;
  patientId: string;
  sessionId: string;
  token: string;
  patientName: string;
  age: number;
  gender: string;
  language: Language;
  department: string;
  mode: 'general' | 'ayush';
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  pastSurgicalHistory: string;
  medications: Medication[];
  allergies: Allergy[];
  familyHistory: string;
  personalHistory: string;
  reviewOfSystems: Record<string, string>;
  ayushData: AyushData;
  documents: MedicalDocument[];
  timeline: TimelineEvent[];
  redFlags: RedFlagAlert[];
  vitals?: { bp?: string; spo2?: number; pulse?: number; temp?: number; };
  priorityScore?: ClinicalPriorityScore;
  aiSummary: AISummary;
  consent: {
    given: boolean;
    timestamp: string;
    version: string;
    language: string;
  };
  rawAnswers: Array<{ question: string; answer: string; timestamp: string }>;
  status: IntakeStatus;
  interviewId?: string;
  clinicalReportId?: string;
  reportStatus?: ReportStatus;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: 'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN' | 'SYSTEM';
  action: string;
  recordId: string;
  details: string;
}

export interface KioskStatus {
  id: string;
  name: string;
  location: string;
  status: 'ONLINE' | 'IN_USE' | 'MAINTENANCE';
  activePatientToken?: string;
  lastHeartbeat: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Doctor' | 'Nurse' | 'Kiosk Attendant' | 'Hospital Admin';
  department: string;
  status: 'Available' | 'In Consultation' | 'Off Duty';
}

export interface AdminOverview {
  patientsToday: number;
  activeIntakes: number;
  readyForReview: number;
  priorityAlerts: number;
  completed: number;
  avgCompletionTimeMinutes: number;
  documentsProcessed: number;
  doctorVerificationRate: number;
}

export type HospitalConnectionStatus = 'NOT_CONNECTED' | 'PENDING_APPROVAL' | 'CONNECTED' | 'REJECTED';

export interface DoctorUser {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  registrationNumber: string;
  council?: string;
  specialization: string;
  subSpecialization?: string;
  qualification: string;
  experienceYears?: number;
  department?: string;
  languages?: string[];
  avatarUrl?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  hospitalId?: string;
  hospitalName?: string;
  hospitalDepartment?: string;
  city?: string;
  state?: string;
  consultationType?: string[];
  bio?: string;
  hospitalConnectionStatus: HospitalConnectionStatus;
  statusReason?: string;
  token?: string;
  createdAt: string;
}

export interface DoctorRegistrationPayload {
  fullName: string;
  email: string;
  mobile: string;
  registrationNumber: string;
  council?: string;
  specialization: string;
  subSpecialization?: string;
  qualification: string;
  experienceYears?: number;
  department?: string;
  languages?: string[];
  avatarUrl?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  hospitalId?: string;
  hospitalName?: string;
  city?: string;
  state?: string;
  consultationType?: string[];
  bio?: string;
  password: string;
}

export interface HospitalUser {
  id: string;
  hospitalName: string;
  hospitalType: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
  contactNumber: string;
  adminName: string;
  verificationStatus: 'VERIFIED' | 'PENDING_VERIFICATION' | 'REJECTED';
  departments?: string[];
  totalBeds?: number;
  availableBeds?: number;
  icuBeds?: number;
  opdCapacity?: number;
  connectedDoctorsCount?: number;
  logoUrl?: string;
  description?: string;
  token?: string;
  createdAt: string;
}

export interface HospitalRegistrationPayload {
  hospitalName: string;
  hospitalType: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
  contactNumber: string;
  adminName: string;
  departments?: string[];
  totalBeds?: number;
  password: string;
}

export interface ReportShare {
  id: string;
  reportId: string;
  intakeId?: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientToken: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  hospitalId?: string;
  hospitalName?: string;
  sharedAt: string;
  status: 'SENT' | 'DELIVERED' | 'VIEWED' | 'REVIEWED';
  deliveredAt?: string;
  viewedAt?: string;
  reviewedAt?: string;
  doctorNotes?: string;
  patientNotes?: string;
  reportSummary?: {
    chiefComplaint: string;
    quickClinicalSummary: string;
    triagePriority: 'HIGH' | 'NORMAL' | 'LOW';
  };
}

export interface HospitalConnectionRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  doctorMobile: string;
  doctorRegNumber: string;
  doctorSpecialization: string;
  doctorQualification: string;
  doctorExperienceYears?: number;
  hospitalId: string;
  hospitalName: string;
  department: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt?: string;
  decidedAt?: string;
  rejectionReason?: string;
}

export interface ProcedureRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientToken: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  procedureName: string;
  date: string;
  time?: string;
  status: 'Planned' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface NotificationRecord {
  id: string;
  recipientRole: 'DOCTOR' | 'HOSPITAL' | 'PATIENT';
  recipientId: string;
  title: string;
  message: string;
  type: 'REPORT_RECEIVED' | 'REPORT_VIEWED' | 'REPORT_REVIEWED' | 'CONNECTION_REQUEST' | 'CONNECTION_APPROVED' | 'CONNECTION_REJECTED' | 'TRIAGE_ALERT';
  relatedId?: string;
  createdAt: string;
  read: boolean;
}

export interface ClinicalPriorityFactor {
  code: string;
  factor: string;
  points: number;
  explanation: string;
}

export interface ClinicalPriorityScore {
  score: number; // 0 - 100
  category: 'Routine' | 'Priority' | 'Urgent';
  factors: ClinicalPriorityFactor[];
  calculatedAt: string;
  override?: {
    originalCategory: 'Routine' | 'Priority' | 'Urgent';
    newCategory: 'Routine' | 'Priority' | 'Urgent';
    doctorNotes: string;
    doctorId: string;
    doctorName: string;
    timestamp: string;
  };
}

export interface DrugInteractionAlert {
  id: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  drug1: string;
  drug2?: string;
  mechanism: string;
  clinicalEffect: string;
  management: string;
  disclaimer: string;
}

export interface PostMedicationFeedback {
  id: string;
  patientId: string;
  patientName: string;
  prescriptionId?: string;
  submittedAt: string;
  medicationAdherence: 'ALL_TAKEN' | 'MISSED_SOME' | 'STOPPED_DUE_TO_SIDE_EFFECT';
  symptomStatus: 'IMPROVED' | 'UNCHANGED' | 'WORSENED';
  sideEffects: string[];
  severityRating: number; // 1 to 5
  comments: string;
  reviewedByDoctor?: boolean;
  reviewedDoctorNotes?: string;
}

export interface AmbulanceDispatchRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  pickupAddress: string;
  emergencyType: string;
  triagePriority: 'URGENT' | 'CRITICAL';
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED';
  vehicleNumber: string;
  ambulanceType: string;
  driverName: string;
  paramedicContact: string;
  etaMinutes: number;
  dispatchedAt: string;
  notes?: string;
}

export interface CallSession {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  callType: 'VIDEO' | 'AUDIO';
  status: 'CONNECTING' | 'CONNECTED' | 'ENDED';
  startedAt: string;
  durationSeconds: number;
  notes?: string;
  reportId?: string;
}

export interface AshaWorkerProfile {
  id: string;
  name: string;
  workerCode: string;
  subCenter: string;
  phcCenter: string;
  village: string;
  activePatientsCached: number;
  lastSyncedAt: string;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  type: 'SUB_CENTRE' | 'PHC' | 'RURAL_HOSPITAL' | 'SUB_DISTRICT_HOSPITAL' | 'DISTRICT_HOSPITAL' | 'SPECIALIST_CENTER';
  district: string;
  taluka: string;
  village?: string;
  contactNumber: string;
  address: string;
  totalBeds: number;
  availableBeds: number;
  doctorCount: number;
  hasTeleconsultation: boolean;
  hasEmergency108: boolean;
  operatingHours: string;
  parentFacilityId?: string;
  coordinates?: { lat: number; lng: number };
}

export interface LiveQueueItem {
  id: string;
  token: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  triageCategory: 'CRITICAL' | 'MEDIUM' | 'STABLE';
  urgency: 'ROUTINE' | 'PRIORITY' | 'URGENT' | 'EMERGENCY';
  status: 'WAITING' | 'SERVING' | 'HOLD' | 'COMPLETED';
  position: number;
  estimatedWaitMinutes: number;
  joinedAt: string;
  calledAt?: string;
  chiefComplaint: string;
  vitals?: { bp?: string; spo2?: number; pulse?: number; temp?: number };
  facilityId: string;
  facilityName: string;
  assignedDoctorName: string;
}

export interface AppointmentRecord {
  id: string;
  token: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  facilityId: string;
  facilityName: string;
  department: string;
  doctorId: string;
  doctorName: string;
  scheduledAt: string;
  appointmentTime: string;
  status: 'SCHEDULED' | 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  triageCategory: 'CRITICAL' | 'MEDIUM' | 'STABLE';
  isTeleconsult: boolean;
  oneHourReminderSent: boolean;
  notes?: string;
}

export interface ReferralRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  abhaId?: string;
  referringFacilityId: string;
  referringFacilityName: string;
  referringDoctorName: string;
  destinationFacilityId: string;
  destinationFacilityName: string;
  destinationDepartment: string;
  specialty: string;
  clinicalReason: string;
  priority: 'CRITICAL' | 'URGENT' | 'PRIORITY' | 'ROUTINE';
  requiredDiagnostics: string[];
  referralNotes: string;
  status:
    | 'CREATED'
    | 'ACCEPTED'
    | 'SCHEDULED'
    | 'IN_TRANSIT'
    | 'ARRIVED'
    | 'CONSULTATION_COMPLETED'
    | 'RETURNED'
    | 'FOLLOWUP_PENDING'
    | 'CLOSED';
  createdAt: string;
  acceptedAt?: string;
  transitStartedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  outcomeSummary?: string;
  counterReferralAdvice?: string;
}

export interface DiagnosticTestItem {
  id: string;
  facilityId: string;
  facilityName: string;
  testCode: string;
  testName: string;
  category: 'BLOOD' | 'IMAGING' | 'BIOCHEMISTRY' | 'MICROBIOLOGY' | 'PATHOLOGY';
  available: boolean;
  turnaroundHours: number;
  slotsAvailableToday: number;
  isFreeGovtSubsidized: boolean;
  instructions: string;
}

export interface MedicineStockItem {
  id: string;
  facilityId: string;
  facilityName: string;
  medicineName: string;
  genericName: string;
  dosageForm: 'TABLET' | 'SYRUP' | 'INJECTION' | 'DROPS' | 'OINTMENT' | 'POWDER' | 'SACHET';
  strength: string;
  quantityAvailable: number;
  status: 'AVAILABLE' | 'LIMITED' | 'OUT_OF_STOCK' | 'RESTOCK_PENDING';
  lastUpdated: string;
  alternativeFacility?: {
    facilityName: string;
    distanceKm: number;
    phone: string;
  };
}

export interface HighRiskFollowup {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  age: number;
  village: string;
  category: 'MATERNAL' | 'CHILD' | 'CHRONIC_NCD' | 'POST_REFERRAL' | 'EMERGENCY_DISCHARGE';
  subCategory: string; // e.g. 'ANC 3rd Trimester (High BP)', 'Child Immunization Pentavalent', 'Type-2 Diabetes Uncontrolled'
  assignedAshaId: string;
  assignedAshaName: string;
  dueDate: string;
  lastVisitDate?: string;
  status: 'DUE' | 'OVERDUE' | 'COMPLETED' | 'ESCALATED';
  riskFactors: string[];
  nextAction: string;
  notes?: string;
}

export interface DoctorProgressReportData {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  chronicConditions: string[];
  vitalsTrend: Array<{
    date: string;
    bpSystolic: number;
    bpDiastolic: number;
    fastingSugar?: number;
    weightKg: number;
    pulse: number;
  }>;
  medicationAdherencePercent: number;
  diagnosticHistory: Array<{
    date: string;
    testName: string;
    value: string;
    referenceRange: string;
    status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  }>;
  consultationMilestones: Array<{
    date: string;
    facility: string;
    doctorName: string;
    summary: string;
  }>;
  referralProgress: {
    hasReferral: boolean;
    referralId?: string;
    destination?: string;
    status?: string;
    summary?: string;
  };
  clinicalEvolutionNotes: string;
}

export interface SyncQueueItem {
  id: string;
  entityType: 'PATIENT_REGISTRATION' | 'TRIAGE' | 'APPOINTMENT' | 'REFERRAL' | 'FOLLOWUP';
  payload: any;
  timestamp: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  retryCount: number;
}


