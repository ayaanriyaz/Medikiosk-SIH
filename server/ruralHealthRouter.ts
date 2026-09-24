import { Router, Request, Response } from 'express';
import { getDatabase, saveDatabase, logAudit } from './db';
import {
  HealthcareFacility,
  LiveQueueItem,
  AppointmentRecord,
  ReferralRecord,
  DiagnosticTestItem,
  MedicineStockItem,
  HighRiskFollowup,
  DoctorProgressReportData,
} from '../src/types';

export const ruralHealthRouter = Router();

// 1. FACILITIES DIRECTORY
ruralHealthRouter.get('/facilities', (req: Request, res: Response) => {
  const db = getDatabase();
  const facilities = db.facilities || [];
  const { type, district } = req.query;

  let filtered = [...facilities];
  if (type) {
    filtered = filtered.filter(f => f.type === type);
  }
  if (district) {
    filtered = filtered.filter(f => f.district.toLowerCase() === (district as string).toLowerCase());
  }

  res.json({
    status: 'success',
    count: filtered.length,
    facilities: filtered,
  });
});

// 2. LIVE WAITING QUEUE
ruralHealthRouter.get('/queue', (req: Request, res: Response) => {
  const db = getDatabase();
  const queue = db.liveQueue || [];
  const { facilityId, category } = req.query;

  let list = [...queue];
  if (facilityId) {
    list = list.filter(q => q.facilityId === facilityId);
  }
  if (category) {
    list = list.filter(q => q.triageCategory === category);
  }

  const currentlyServing = list.find(q => q.status === 'SERVING') || null;
  const waitingList = list.filter(q => q.status === 'WAITING');
  const onHoldList = list.filter(q => q.status === 'HOLD');
  const completedList = list.filter(q => q.status === 'COMPLETED');

  res.json({
    status: 'success',
    totalActive: waitingList.length + (currentlyServing ? 1 : 0),
    currentlyServing,
    waitingList,
    onHoldList,
    completedList,
    rawQueue: list,
  });
});

// Queue Action (Call Next, In Consultation, Complete, Hold, Reprioritize)
ruralHealthRouter.post('/queue/action', (req: Request, res: Response) => {
  const { action, itemId, newCategory, doctorName } = req.body;
  const db = getDatabase();
  const queue = db.liveQueue || [];

  if (action === 'CALL_NEXT') {
    // Current serving moves to COMPLETED
    const currentServing = queue.find(q => q.status === 'SERVING');
    if (currentServing) {
      currentServing.status = 'COMPLETED';
    }

    // Sort waiting items by priority: CRITICAL first, then MEDIUM, then STABLE, then position
    const priorityWeight = { CRITICAL: 3, MEDIUM: 2, STABLE: 1 };
    const waiting = queue.filter(q => q.status === 'WAITING');
    waiting.sort((a, b) => {
      const pDiff = (priorityWeight[b.triageCategory] || 1) - (priorityWeight[a.triageCategory] || 1);
      if (pDiff !== 0) return pDiff;
      return a.position - b.position;
    });

    if (waiting.length > 0) {
      const nextItem = waiting[0];
      nextItem.status = 'SERVING';
      nextItem.calledAt = new Date().toISOString();
      if (doctorName) nextItem.assignedDoctorName = doctorName;
      nextItem.position = 0;
      nextItem.estimatedWaitMinutes = 0;

      // Recalculate positions & wait times for remainder
      const remaining = queue.filter(q => q.status === 'WAITING');
      remaining.forEach((item, idx) => {
        item.position = idx + 1;
        item.estimatedWaitMinutes = (idx + 1) * 10;
      });

      logAudit(doctorName || 'Doctor', 'DOCTOR', 'QUEUE_CALL_NEXT', nextItem.id, `Called token ${nextItem.token} (${nextItem.patientName})`);
      saveDatabase(db);
      return res.json({ status: 'success', message: `Token ${nextItem.token} is now serving`, currentlyServing: nextItem });
    } else {
      saveDatabase(db);
      return res.json({ status: 'success', message: 'No more waiting patients in queue', currentlyServing: null });
    }
  }

  if (action === 'SET_STATUS' && itemId) {
    const item = queue.find(q => q.id === itemId);
    if (!item) return res.status(404).json({ error: 'Queue item not found' });
    const { status } = req.body;
    item.status = status;
    saveDatabase(db);
    return res.json({ status: 'success', item });
  }

  if (action === 'REPRIORITIZE' && itemId && newCategory) {
    const item = queue.find(q => q.id === itemId);
    if (!item) return res.status(404).json({ error: 'Queue item not found' });
    item.triageCategory = newCategory;
    logAudit(doctorName || 'Doctor', 'DOCTOR', 'QUEUE_REPRIORITIZE', item.id, `Reprioritized token ${item.token} to ${newCategory}`);
    saveDatabase(db);
    return res.json({ status: 'success', message: `Reprioritized to ${newCategory}`, item });
  }

  return res.status(400).json({ error: 'Invalid queue action' });
});

// Join Queue (from kiosk, ASHA worker, or reception)
ruralHealthRouter.post('/queue/join', (req: Request, res: Response) => {
  const { patientId, patientName, patientAge, patientGender, patientPhone, triageCategory, urgency, chiefComplaint, vitals, facilityId, facilityName } = req.body;
  const db = getDatabase();
  const queue = db.liveQueue || [];

  const nextNum = queue.length + 41;
  const token = `A-0${nextNum}`;
  const newItem: LiveQueueItem = {
    id: `Q-${Date.now().toString().slice(-4)}`,
    token,
    patientId: patientId || `PAT-${Date.now().toString().slice(-4)}`,
    patientName: patientName || 'Walk-in Patient',
    patientAge: Number(patientAge) || 35,
    patientGender: patientGender || 'Other',
    patientPhone: patientPhone || '+91 98000 00000',
    triageCategory: triageCategory || 'STABLE',
    urgency: urgency || 'ROUTINE',
    status: 'WAITING',
    position: queue.filter(q => q.status === 'WAITING').length + 1,
    estimatedWaitMinutes: (queue.filter(q => q.status === 'WAITING').length + 1) * 10,
    joinedAt: new Date().toISOString(),
    chiefComplaint: chiefComplaint || 'General consultation',
    vitals: vitals || {},
    facilityId: facilityId || 'FAC-PHC-BHOR',
    facilityName: facilityName || 'Bhor Primary Health Centre (PHC)',
    assignedDoctorName: 'Dr. Ananya Deshmukh (Medical Officer)',
  };

  queue.push(newItem);
  db.liveQueue = queue;
  saveDatabase(db);

  logAudit(patientName, 'PATIENT', 'QUEUE_JOINED', newItem.id, `Patient registered into OPD queue with token ${token}`);

  res.status(201).json({
    status: 'success',
    token,
    queueItem: newItem,
  });
});

// 3. APPOINTMENTS & 1-HOUR NOTIFICATIONS
ruralHealthRouter.get('/appointments', (req: Request, res: Response) => {
  const db = getDatabase();
  const appointments = db.appointments || [];
  const { patientId, facilityId } = req.query;

  let list = [...appointments];
  if (patientId) {
    list = list.filter(a => a.patientId === patientId);
  }
  if (facilityId) {
    list = list.filter(a => a.facilityId === facilityId);
  }

  res.json({ status: 'success', count: list.length, appointments: list });
});

ruralHealthRouter.post('/appointments', (req: Request, res: Response) => {
  const db = getDatabase();
  const appointments = db.appointments || [];

  const newApt: AppointmentRecord = {
    id: `APT-MH-${Date.now().toString().slice(-4)}`,
    token: `A-0${appointments.length + 50}`,
    patientId: req.body.patientId || `PAT-${Date.now().toString().slice(-4)}`,
    patientName: req.body.patientName || 'Rural Patient',
    patientPhone: req.body.patientPhone || '+91 98000 00000',
    facilityId: req.body.facilityId || 'FAC-PHC-BHOR',
    facilityName: req.body.facilityName || 'Bhor Primary Health Centre (PHC)',
    department: req.body.department || 'General Medicine',
    doctorId: req.body.doctorId || 'DOC-102',
    doctorName: req.body.doctorName || 'Dr. Ananya Deshmukh',
    scheduledAt: req.body.scheduledAt || new Date(Date.now() + 60 * 60000).toISOString(),
    appointmentTime: req.body.appointmentTime || '11:00 AM',
    status: 'SCHEDULED',
    triageCategory: req.body.triageCategory || 'STABLE',
    isTeleconsult: !!req.body.isTeleconsult,
    oneHourReminderSent: false,
    notes: req.body.notes || '',
  };

  appointments.push(newApt);
  db.appointments = appointments;
  saveDatabase(db);

  res.status(201).json({ status: 'success', appointment: newApt });
});

ruralHealthRouter.post('/appointments/:id/trigger-1hr-reminder', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const appointments = db.appointments || [];
  const apt = appointments.find(a => a.id === id);

  if (!apt) return res.status(404).json({ error: 'Appointment not found' });

  apt.oneHourReminderSent = true;
  saveDatabase(db);

  const notificationPayload = {
    patientPhone: apt.patientPhone,
    patientName: apt.patientName,
    facilityName: apt.facilityName,
    appointmentTime: apt.appointmentTime,
    token: apt.token,
    messageEn: `MediKiosk Reminder: Dear ${apt.patientName}, your appointment at ${apt.facilityName} is in 1 hour (${apt.appointmentTime}). Token: ${apt.token}. Please arrange transit to reach on time.`,
    messageMr: `मेडीकियोस्क स्मरणपत्र: आदरणीय ${apt.patientName}, आपले ${apt.facilityName} येथे १ तासात भेटण्याचे ठरले आहे (${apt.appointmentTime}). टोकन: ${apt.token}. कृपया वेळेत पोहोचण्यासाठी तयारी ठेवा.`,
    sentVia: ['SMS', 'WhatsApp', 'In-App Alert'],
    timestamp: new Date().toISOString(),
  };

  logAudit('System', 'SYSTEM', 'ONE_HOUR_NOTIFICATION_DISPATCHED', apt.id, `Sent 1-hour appointment reminder to ${apt.patientPhone}`);

  res.json({
    status: 'success',
    notification: notificationPayload,
  });
});

// 4. REFERRALS MANAGEMENT & TRACKING
ruralHealthRouter.get('/referrals', (req: Request, res: Response) => {
  const db = getDatabase();
  const referrals = db.referrals || [];
  const { patientId, referringFacilityId, destinationFacilityId, status } = req.query;

  let list = [...referrals];
  if (patientId) {
    list = list.filter(r => r.patientId === patientId);
  }
  if (referringFacilityId) {
    list = list.filter(r => r.referringFacilityId === referringFacilityId);
  }
  if (destinationFacilityId) {
    list = list.filter(r => r.destinationFacilityId === destinationFacilityId);
  }
  if (status) {
    list = list.filter(r => r.status === status);
  }

  res.json({ status: 'success', count: list.length, referrals: list });
});

ruralHealthRouter.post('/referrals', (req: Request, res: Response) => {
  const db = getDatabase();
  const referrals = db.referrals || [];

  const newRef: ReferralRecord = {
    id: `REF-MH-${Date.now().toString().slice(-4)}`,
    patientId: req.body.patientId || `PAT-${Date.now().toString().slice(-4)}`,
    patientName: req.body.patientName,
    patientAge: Number(req.body.patientAge) || 30,
    patientGender: req.body.patientGender || 'Other',
    patientPhone: req.body.patientPhone || '+91 98000 00000',
    abhaId: req.body.abhaId,
    referringFacilityId: req.body.referringFacilityId || 'FAC-PHC-BHOR',
    referringFacilityName: req.body.referringFacilityName || 'Bhor Primary Health Centre (PHC)',
    referringDoctorName: req.body.referringDoctorName || 'Dr. Ananya Deshmukh (MO)',
    destinationFacilityId: req.body.destinationFacilityId || 'FAC-SGH-PUNE',
    destinationFacilityName: req.body.destinationFacilityName || 'Sassoon General Hospital & B.J. Medical College, Pune',
    destinationDepartment: req.body.destinationDepartment || 'Specialist OPD',
    specialty: req.body.specialty || 'General Surgery / Specialist Medicine',
    clinicalReason: req.body.clinicalReason || 'Requires higher level diagnostic workup and specialist review',
    priority: req.body.priority || 'PRIORITY',
    requiredDiagnostics: req.body.requiredDiagnostics || [],
    referralNotes: req.body.referralNotes || '',
    status: 'CREATED',
    createdAt: new Date().toISOString(),
  };

  referrals.unshift(newRef);
  db.referrals = referrals;
  saveDatabase(db);

  logAudit(newRef.referringDoctorName, 'DOCTOR', 'REFERRAL_CREATED', newRef.id, `Created referral for ${newRef.patientName} to ${newRef.destinationFacilityName}`);

  res.status(201).json({ status: 'success', referral: newRef });
});

ruralHealthRouter.patch('/referrals/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, outcomeSummary, counterReferralAdvice, doctorName } = req.body;
  const db = getDatabase();
  const referrals = db.referrals || [];
  const ref = referrals.find(r => r.id === id);

  if (!ref) return res.status(404).json({ error: 'Referral record not found' });

  ref.status = status;
  const now = new Date().toISOString();
  if (status === 'ACCEPTED') ref.acceptedAt = now;
  if (status === 'IN_TRANSIT') ref.transitStartedAt = now;
  if (status === 'ARRIVED') ref.arrivedAt = now;
  if (status === 'CONSULTATION_COMPLETED') {
    ref.completedAt = now;
    if (outcomeSummary) ref.outcomeSummary = outcomeSummary;
    if (counterReferralAdvice) ref.counterReferralAdvice = counterReferralAdvice;
  }

  logAudit(doctorName || 'Healthcare Provider', 'DOCTOR', 'REFERRAL_STATUS_UPDATED', ref.id, `Referral status updated to ${status}`);
  saveDatabase(db);

  res.json({ status: 'success', referral: ref });
});

// 5. DIAGNOSTIC COORDINATION
ruralHealthRouter.get('/diagnostics', (req: Request, res: Response) => {
  const db = getDatabase();
  const diagnostics = db.diagnostics || [];
  const { facilityId, category } = req.query;

  let list = [...diagnostics];
  if (facilityId) {
    list = list.filter(d => d.facilityId === facilityId);
  }
  if (category) {
    list = list.filter(d => d.category === category);
  }

  res.json({ status: 'success', count: list.length, diagnostics: list });
});

ruralHealthRouter.post('/diagnostics/book', (req: Request, res: Response) => {
  const { testId, patientName, patientPhone, preferredDate } = req.body;
  const db = getDatabase();
  const diagnostics = db.diagnostics || [];
  const test = diagnostics.find(d => d.id === testId);

  if (!test) return res.status(404).json({ error: 'Diagnostic test not found' });
  if (test.slotsAvailableToday <= 0) {
    return res.status(400).json({ error: 'No slots available today for this test' });
  }

  test.slotsAvailableToday -= 1;
  saveDatabase(db);

  const bookingConfirmation = {
    bookingId: `BKG-${Date.now().toString().slice(-4)}`,
    testName: test.testName,
    facilityName: test.facilityName,
    patientName,
    preferredDate: preferredDate || new Date().toISOString().split('T')[0],
    turnaroundHours: test.turnaroundHours,
    isFreeGovtSubsidized: test.isFreeGovtSubsidized,
    instructions: test.instructions,
    status: 'CONFIRMED',
  };

  res.json({ status: 'success', booking: bookingConfirmation });
});

// 6. MEDICINE STOCK VISIBILITY
ruralHealthRouter.get('/medicines', (req: Request, res: Response) => {
  const db = getDatabase();
  const medicines = db.medicines || [];
  const { facilityId, search, status } = req.query;

  let list = [...medicines];
  if (facilityId) {
    list = list.filter(m => m.facilityId === facilityId);
  }
  if (status) {
    list = list.filter(m => m.status === status);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(m => m.medicineName.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q));
  }

  res.json({ status: 'success', count: list.length, medicines: list });
});

// 7. HIGH-RISK FOLLOWUPS (Maternal, Child, NCD)
ruralHealthRouter.get('/high-risk-followups', (req: Request, res: Response) => {
  const db = getDatabase();
  const followups = db.highRiskFollowups || [];
  const { ashaId, category, status } = req.query;

  let list = [...followups];
  if (ashaId) {
    list = list.filter(f => f.assignedAshaId === ashaId);
  }
  if (category) {
    list = list.filter(f => f.category === category);
  }
  if (status) {
    list = list.filter(f => f.status === status);
  }

  res.json({ status: 'success', count: list.length, followups: list });
});

ruralHealthRouter.patch('/high-risk-followups/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes, lastVisitDate } = req.body;
  const db = getDatabase();
  const followups = db.highRiskFollowups || [];
  const f = followups.find(item => item.id === id);

  if (!f) return res.status(404).json({ error: 'Follow-up record not found' });

  if (status) f.status = status;
  if (notes) f.notes = notes;
  if (lastVisitDate) f.lastVisitDate = lastVisitDate;

  saveDatabase(db);
  res.json({ status: 'success', followup: f });
});

// 8. DOCTOR PROGRESS REPORTS (Longitudinal Trends)
ruralHealthRouter.get('/progress-report/:patientId', (req: Request, res: Response) => {
  const { patientId } = req.params;
  const db = getDatabase();
  const reports = db.progressReports || {};

  const report = reports[patientId];
  if (report) {
    return res.json({ status: 'success', progressReport: report });
  }

  // Generate dynamic fallback progress report if not pre-seeded
  const patient = (db.patients || []).find(p => p.id === patientId || p.token === patientId);
  const fallbackReport: DoctorProgressReportData = {
    patientId: patientId,
    patientName: patient?.name || 'Patient',
    age: patient?.age || 45,
    gender: patient?.gender || 'Other',
    chronicConditions: ['Hypertension Evaluation', 'General Medical Care'],
    vitalsTrend: [
      { date: '2 Months Ago', bpSystolic: 146, bpDiastolic: 92, weightKg: 70, pulse: 80 },
      { date: '1 Month Ago', bpSystolic: 140, bpDiastolic: 88, weightKg: 69.5, pulse: 76 },
      { date: 'Today', bpSystolic: 134, bpDiastolic: 84, weightKg: 69.0, pulse: 74 },
    ],
    medicationAdherencePercent: 90,
    diagnosticHistory: [
      { date: '1 Month Ago', testName: 'Hemoglobin', value: '12.8 g/dL', referenceRange: '12.0-15.5', status: 'NORMAL' },
      { date: 'Today', testName: 'Random Blood Glucose', value: '118 mg/dL', referenceRange: '< 140', status: 'NORMAL' },
    ],
    consultationMilestones: [
      { date: '1 Month Ago', facility: 'Bhor PHC', doctorName: 'Dr. Ananya Deshmukh', summary: 'Initiated routine health surveillance and dietary coaching.' },
      { date: 'Today', facility: 'Bhor PHC', doctorName: 'Dr. Ananya Deshmukh', summary: 'Stable parameters. Maintain current lifestyle measures.' },
    ],
    referralProgress: { hasReferral: false },
    clinicalEvolutionNotes: 'Patient demonstrates steady physiological control with adherence to primary healthcare guidance.',
  };

  res.json({ status: 'success', progressReport: fallbackReport });
});

// 9. OFFLINE QUEUE BATCH SYNC (For Sub-Centres & Low Connectivity)
ruralHealthRouter.post('/sync/batch', (req: Request, res: Response) => {
  const { items, ashaWorkerId, ashaWorkerName } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided for synchronization' });
  }

  const db = getDatabase();
  const queue = db.liveQueue || [];
  const followups = db.highRiskFollowups || [];

  let syncedCount = 0;

  for (const item of items) {
    if (item.entityType === 'TRIAGE' || item.entityType === 'PATIENT_REGISTRATION') {
      const p = item.payload;
      const newItem: LiveQueueItem = {
        id: `Q-SYNC-${Date.now().toString().slice(-4)}-${syncedCount}`,
        token: `A-0${queue.length + 42}`,
        patientId: p.patientId || `PAT-${Date.now().toString().slice(-4)}`,
        patientName: p.patientName || 'Rural Patient',
        patientAge: Number(p.age) || 35,
        patientGender: p.gender || 'Female',
        patientPhone: p.phone || '+91 98000 00000',
        triageCategory: p.triageCategory || 'STABLE',
        urgency: p.urgency || 'ROUTINE',
        status: 'WAITING',
        position: queue.filter(q => q.status === 'WAITING').length + 1,
        estimatedWaitMinutes: (queue.filter(q => q.status === 'WAITING').length + 1) * 10,
        joinedAt: item.timestamp || new Date().toISOString(),
        chiefComplaint: p.chiefComplaint || 'Assisted community registration',
        vitals: p.vitals || {},
        facilityId: p.facilityId || 'FAC-PHC-BHOR',
        facilityName: p.facilityName || 'Bhor Primary Health Centre (PHC)',
        assignedDoctorName: 'Dr. Ananya Deshmukh (Medical Officer)',
      };
      queue.push(newItem);
      syncedCount++;
    } else if (item.entityType === 'FOLLOWUP') {
      const p = item.payload;
      const target = followups.find(f => f.id === p.id);
      if (target) {
        if (p.status) target.status = p.status;
        if (p.notes) target.notes = p.notes;
        target.lastVisitDate = new Date().toISOString();
        syncedCount++;
      }
    }
  }

  db.liveQueue = queue;
  db.highRiskFollowups = followups;
  saveDatabase(db);

  logAudit(ashaWorkerName || 'ASHA Worker', 'PATIENT', 'OFFLINE_BATCH_SYNC', ashaWorkerId || 'ASHA-001', `Successfully synced ${syncedCount} offline records`);

  res.json({
    status: 'success',
    syncedCount,
    message: `Synchronized ${syncedCount} records from offline storage with the central public health database.`,
  });
});

// 10. MULTILINGUAL HEALTHCARE CHATBOT (Marathi, Hindi, English)
ruralHealthRouter.post('/chat', async (req: Request, res: Response) => {
  const { message, language, patientId } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const cleanLang = language === 'mr' ? 'mr' : language === 'hi' ? 'hi' : 'en';
  const cleanMsg = message.toLowerCase().trim();
  const db = getDatabase();

  // Knowledge base retrieval from live system data
  const facilities = db.facilities || [];
  const medicines = db.medicines || [];
  const queue = db.liveQueue || [];
  const referrals = db.referrals || [];

  let reply = '';

  // 1. Emergency / 108 queries
  if (cleanMsg.includes('108') || cleanMsg.includes('emergency') || cleanMsg.includes('ambulance') || cleanMsg.includes('तातडी') || cleanMsg.includes('रुग्णवाहिका') || cleanMsg.includes('आपातकाल')) {
    if (cleanLang === 'mr') {
      reply = '१०८ रुग्णवाहिका मदत: तातडीच्या वैद्यकीय मदतीसाठी १०८ क्रमांकावर मोफत संपर्क साधा. भोर प्राथमिक आरोग्य केंद्र व भोर ग्रामीण रुग्णालयात २४ तास आपत्कालीन कक्ष कार्यरत आहे. गंभीर रुग्णांसाठी त्वरित रुग्णवाहिका पाठवली जाईल.';
    } else if (cleanLang === 'hi') {
      reply = '१०८ एम्बुलेंस सहायता: किसी भी आपातकालीन स्थिति में तुरंत १०८ पर कॉल करें। भोर प्राथमिक स्वास्थ्य केंद्र एवं भोर ग्रामीण अस्पताल में २४ घंटे आपातकालीन सेवा उपलब्ध है।';
    } else {
      reply = 'Emergency 108 Ambulance: For acute emergencies, call 108 immediately (Toll-Free). 24x7 Emergency Trauma Care is available at Bhor Rural Hospital and PHC Bhor.';
    }
  }
  // 2. Queue & Token status
  else if (cleanMsg.includes('queue') || cleanMsg.includes('token') || cleanMsg.includes('wait') || cleanMsg.includes('रांग') || cleanMsg.includes('टोकन') || cleanMsg.includes('कतार') || cleanMsg.includes('नंबर')) {
    const serving = queue.find(q => q.status === 'SERVING');
    const waiting = queue.filter(q => q.status === 'WAITING').length;
    if (cleanLang === 'mr') {
      reply = `थेट प्रतीक्षा रांग माहिती: सध्या सुरू असलेले टोकन ${serving ? serving.token : 'A-041'} (${serving ? serving.patientName : 'चालू'}) आहे. प्रतीक्षा यादीत ${waiting} रुग्ण आहेत. अंदाजे प्रतीक्षा वेळ ${waiting * 8} ते ${waiting * 10} मिनिटे आहे.`;
    } else if (cleanLang === 'hi') {
      reply = `लाइव ओपीडी कतार: वर्तमान में टोकन ${serving ? serving.token : 'A-041'} का परामर्श चल रहा है। कतार में ${waiting} मरीज प्रतीक्षारत हैं। औसत प्रतीक्षा समय लगभग ${waiting * 10} मिनट है।`;
    } else {
      reply = `Live OPD Queue Status: Currently serving Token ${serving ? serving.token : 'A-041'} (${serving ? serving.patientName : 'Active'}). There are ${waiting} patients currently waiting ahead. Estimated consultation wait time is ~${waiting * 10} minutes.`;
    }
  }
  // 3. Medicine availability
  else if (cleanMsg.includes('medicine') || cleanMsg.includes('stock') || cleanMsg.includes('औषध') || cleanMsg.includes('गोळ्या') || cleanMsg.includes('दवा') || cleanMsg.includes('इंसुलिन') || cleanMsg.includes('insulin')) {
    const availableMeds = medicines.filter(m => m.status === 'AVAILABLE').map(m => m.medicineName).slice(0, 4).join(', ');
    if (cleanLang === 'mr') {
      reply = `औषध साठा माहिती: भोर प्राथमिक आरोग्य केंद्रात पॅरासिटामॉल, अमोक्सीसिलिन, मेटफॉर्मिन, आम्लोडिपाइन, ओआरएस आणि आयर्न-फॉलिक अ‍ॅसिड उपलब्ध आहेत. रेबीज लस व सर्पदंश प्रतिबंधक लस भोर ग्रामीण रुग्णालयाच्या कोल्ड चेन कक्षात उपलब्ध आहे.`;
    } else if (cleanLang === 'hi') {
      reply = `दवा उपलब्धता: भोर प्राथमिक स्वास्थ्य केंद्र में आवश्यक दवाएं (पैरासिटामोल, मेटफॉर्मिन, आम्लोडिपाइन, ओआरएस) उपलब्ध हैं। एंटी-रेबीज एवं एंटी-स्नेक वेनम भोर ग्रामीण अस्पताल में उपलब्ध हैं।`;
    } else {
      reply = `Medicine Stock Availability: Essential drugs like Paracetamol, Amoxicillin, Metformin, Amlodipine, and ORS are in stock at Bhor PHC. Anti-Rabies Vaccine and Anti-Snake Venom are available at Bhor Rural Hospital Cold Chain facility.`;
    }
  }
  // 4. Referral tracking
  else if (cleanMsg.includes('referral') || cleanMsg.includes('ससून') || cleanMsg.includes('sassoon') || cleanMsg.includes('संदर्भ') || cleanMsg.includes('ट्रॅक') || cleanMsg.includes('अस्पताल')) {
    const activeRef = referrals.find(r => r.status === 'IN_TRANSIT' || r.status === 'ACCEPTED');
    if (cleanLang === 'mr') {
      reply = `संदर्भ सेवा (Referrals): प्राथमिक आरोग्य केंद्रातून जिल्हा रुग्णालय औंध किंवा ससून रुग्णालय पुणे येथे संदर्भ केलेल्या रुग्णांचा संपूर्ण प्रवास डिजिटल पद्धतीने ट्रॅक केला जातो. रुग्ण पोहोचल्याची व उपचार पूर्ण झाल्याची नोंद मूळ केंद्राला त्वरित मिळते.`;
    } else if (cleanLang === 'hi') {
      reply = `रेफरल ट्रैकिंग: पीएचसी से जिला अस्पताल या ससून अस्पताल भेजे गए मरीजों का डिजिटल ट्रैकिंग उपलब्ध है ताकि कोई भी मरीज रास्ते में या फॉलो-अप में न छूटे।`;
    } else {
      reply = `Referral Tracking: The platform links Sub-Centres and PHCs to District Hospital Aundh and Sassoon General Hospital Pune. Counter-referral instructions are electronically sent back to local doctors.`;
    }
  }
  // 5. Maternal & Child health
  else if (cleanMsg.includes('गर्भवती') || cleanMsg.includes('anc') || cleanMsg.includes('pregnant') || cleanMsg.includes('लस') || cleanMsg.includes('माता') || cleanMsg.includes('बाळ') || cleanMsg.includes('child')) {
    if (cleanLang === 'mr') {
      reply = `माता व बाल आरोग्य: प्रधानमंत्री सुरक्षित मातृत्व अभियान व जननी शिशु सुरक्षा योजनेअंतर्गत मोफत तपासणी, पोषण आहार, आयर्न गोळ्या व संपूर्ण लसीकरण उपलब्ध आहे. आपल्या आशा ताई (वंदना ताई) आपल्या गावात नियमित भेट देतात.`;
    } else if (cleanLang === 'hi') {
      reply = `मातृ एवं शिशु स्वास्थ्य: गर्भवती महिलाओं के लिए नियमित एएनसी जांच, नि:शुल्क दवाएं एवं संस्थागत प्रसव सुविधाएं उपलब्ध हैं। आपकी आशा कार्यकर्ता नियमित गृह भेंट करती हैं।`;
    } else {
      reply = `Maternal & Child Healthcare: Complete ANC tracking, high-risk pregnancy monitoring, and childhood immunizations are fully tracked with your assigned ASHA worker and local Sub-Centre.`;
    }
  }
  // General guidance
  else {
    if (cleanLang === 'mr') {
      reply = 'नमस्कार! मी मेडीकियोस्क ग्रामीण आरोग्य सहाय्यक आहे. मी आपणास ओपीडी रांग, टोकन क्रमांक, डॉक्टर उपलब्धता, मोफत प्रयोगशाळा चाचण्या, औषध साठा आणि संदर्भ सेवा याबद्दल मदत करू शकतो. आपण काय जाणून घेऊ इच्छिता? (कृपया नोंद घ्या: हा केवळ माहिती सहाय्यक आहे, आपत्कालीन वैद्यकीय सल्ल्यासाठी थेट डॉक्टरांशी संपर्क साधा).';
    } else if (cleanLang === 'hi') {
      reply = 'नमस्ते! मैं मेडीकियोस्क ग्रामीण स्वास्थ्य सहायक हूँ। मैं आपको ओपीडी कतार, टोकन स्थिति, डॉक्टर उपलब्धता, दवा स्टॉक और रेफरल सेवा की जानकारी दे सकता हूँ। आप क्या जानना चाहते हैं? (सूचना: यह केवल सहायता टूल है, चिकित्सीय परामर्श के लिए डॉक्टर से संपर्क करें)।';
    } else {
      reply = 'Hello! I am the MediKiosk Rural Healthcare Assistant. I can help you check live OPD queue tokens, doctor schedules, diagnostic lab test availability, pharmacy medicine stocks, and referral status across public healthcare facilities. How can I assist you today? (Note: Informational support tool, please consult your doctor for clinical advice).';
    }
  }

  res.json({
    status: 'success',
    language: cleanLang,
    reply,
  });
});

// 11. DISTRICT & FACILITY HEALTH METRICS (For District Admin / MSIS Dashboard)
ruralHealthRouter.get('/district-metrics', (req: Request, res: Response) => {
  const db = getDatabase();
  const queue = db.liveQueue || [];
  const referrals = db.referrals || [];
  const medicines = db.medicines || [];
  const followups = db.highRiskFollowups || [];

  const totalPatientsToday = queue.length + 18;
  const criticalCount = queue.filter(q => q.triageCategory === 'CRITICAL').length;
  const mediumCount = queue.filter(q => q.triageCategory === 'MEDIUM').length;
  const stableCount = queue.filter(q => q.triageCategory === 'STABLE').length;

  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter(r => r.status === 'CONSULTATION_COMPLETED' || r.status === 'CLOSED').length;
  const inTransitReferrals = referrals.filter(r => r.status === 'IN_TRANSIT').length;
  const referralCompletionRate = totalReferrals > 0 ? Math.round((completedReferrals / totalReferrals) * 100) : 85;

  const lowStockMedicines = medicines.filter(m => m.status === 'LIMITED' || m.status === 'OUT_OF_STOCK');
  const overdueFollowups = followups.filter(f => f.status === 'OVERDUE' || f.status === 'ESCALATED');

  res.json({
    status: 'success',
    district: 'Pune District, Maharashtra',
    stateDepartment: 'Maharashtra State Innovation Society & Public Health Dept',
    metrics: {
      totalPatientsToday,
      triageBreakdown: {
        critical: criticalCount,
        medium: mediumCount,
        stable: stableCount,
      },
      averageWaitMinutes: 18,
      referralCompletionRate,
      activeReferralsCount: totalReferrals,
      inTransitReferralsCount: inTransitReferrals,
      lowStockMedicineAlerts: lowStockMedicines.length,
      overdueHighRiskFollowups: overdueFollowups.length,
      teleconsultationsCompletedToday: 14,
      facilitiesOnlineCount: 6,
      offlineSyncBatchesProcessed: 8,
    },
    lowStockMedicines,
    overdueFollowups,
  });
});
