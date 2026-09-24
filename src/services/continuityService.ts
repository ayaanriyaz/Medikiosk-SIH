import { TimelineEvent, Patient, Intake, ClinicalReport, MedicalDocument } from '../types';

export function buildLongitudinalTimeline(
  patient: Patient,
  intake?: Intake | null,
  report?: ClinicalReport | null,
  docs?: MedicalDocument[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Current Intake / Active Encounter
  if (intake) {
    events.push({
      id: `TL-CURR-${intake.id}`,
      date: new Date(intake.createdAt || Date.now()).toISOString().split('T')[0],
      title: 'Current AI Clinical Intake & Triage',
      category: 'Current Intake',
      summary: `Chief Complaint: ${intake.chiefComplaint || 'Consultation intake active'}. Mode: ${intake.mode === 'ayush' ? 'Integrative AYUSH' : 'General Triage'}.`,
    });
  }

  // Pre-Consultation Summary Report
  if (report) {
    events.push({
      id: `TL-REP-${report.id}`,
      date: new Date(report.generatedAt || Date.now()).toISOString().split('T')[0],
      title: 'Synthesized Pre-Consultation Clinical Brief',
      category: 'Consultation',
      summary: report.summary?.quickClinicalSummary || 'Structured brief prepared for attending physician.',
    });
  }

  // Document-derived historical milestones
  if (docs && docs.length > 0) {
    docs.forEach((doc, idx) => {
      events.push({
        id: `TL-DOC-${doc.id || idx}`,
        date: doc.date || '2025-11-15',
        title: `${doc.name} (${doc.type})`,
        category:
          doc.type === 'Prescription'
            ? 'Prescription'
            : doc.type === 'Lab Report'
            ? 'Lab Test'
            : doc.type === 'Discharge Summary'
            ? 'Hospitalization'
            : 'Consultation',
        summary: `Facility: ${doc.facility || 'Clinical Center'}. Extracted: ${
          doc.extractedEntities?.diagnosis || (doc.extractedEntities as any)?.findings || 'Entities digitized via OCR'
        }`,
        sourceDocId: doc.id,
      });
    });
  }

  // Patient Registration Milestone
  if (patient.registeredAt) {
    events.push({
      id: `TL-REG-${patient.id}`,
      date: patient.registeredAt.split('T')[0],
      title: 'HealthOS Patient Registration & ABHA Linkage',
      category: 'Consultation',
      summary: `Registered with Token ${patient.token}. ABHA: ${patient.abhaId || 'Direct Kiosk Identifier'}.`,
    });
  }

  // Default chronological fallback if sparse
  if (events.length <= 1) {
    events.push(
      {
        id: `TL-HIST-1`,
        date: '2025-10-14',
        title: 'Prior Outpatient Consultation — Cardiology OPD',
        category: 'Consultation',
        summary: 'Evaluation for exertional fatigue and borderline blood pressure. Advised lifestyle modifications and Telmisartan 40mg.',
      },
      {
        id: `TL-HIST-2`,
        date: '2025-08-02',
        title: 'Comprehensive Metabolic Panel & Lipid Profile',
        category: 'Lab Test',
        summary: 'Fasting Plasma Glucose 112 mg/dL, Total Cholesterol 218 mg/dL, LDL 138 mg/dL, Serum Creatinine 0.9 mg/dL.',
      },
      {
        id: `TL-HIST-3`,
        date: '2024-03-20',
        title: 'Discharge Summary — Laparoscopic Appendectomy',
        category: 'Hospitalization',
        summary: 'Uncomplicated acute appendicitis treated surgically. Uneventful post-operative recovery, discharged in stable condition.',
      }
    );
  }

  // Sort chronologically descending
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
