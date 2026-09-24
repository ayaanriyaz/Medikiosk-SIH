import { ClinicalPriorityScore, ClinicalPriorityFactor, ClinicalReport, Intake } from '../types';

export function calculateRiskStratificationScore(
  data: Partial<ClinicalReport | Intake> & {
    symptoms?: string;
    vitals?: { bp?: string; spo2?: number; pulse?: number; temp?: number };
    age?: number;
    redFlagCount?: number;
    medCount?: number;
  }
): ClinicalPriorityScore {
  const factors: ClinicalPriorityFactor[] = [];
  let score = 10; // Baseline routine intake score

  const chiefComplaint = (data.chiefComplaint || data.symptoms || '').toLowerCase();
  const hpi = (data.historyOfPresentIllness || '').toLowerCase();
  const redFlags = data.redFlags || [];
  const age = data.age || 35;
  const pmh = Array.isArray(data.pastMedicalHistory)
    ? data.pastMedicalHistory.join(' ').toLowerCase()
    : String(data.pastMedicalHistory || '').toLowerCase();

  // Factor A: Red Flags & Acute Cardiovascular/Respiratory Indicators
  const isCardioOrResp =
    chiefComplaint.includes('chest') ||
    chiefComplaint.includes('heart') ||
    chiefComplaint.includes('breath') ||
    chiefComplaint.includes('dyspnea') ||
    chiefComplaint.includes('छाती') ||
    chiefComplaint.includes('सांस') ||
    hpi.includes('radiating') ||
    hpi.includes('crushing') ||
    hpi.includes('sweating') ||
    hpi.includes('diaphoresis');

  if (redFlags.length > 0 || isCardioOrResp) {
    const points = redFlags.some(r => r.severity === 'CRITICAL') ? 45 : 35;
    score += points;
    factors.push({
      code: 'ACUTE_RED_FLAG',
      factor: 'Acute Cardiovascular / Respiratory Red Flag Presentation',
      points,
      explanation:
        redFlags.length > 0
          ? `Identified ${redFlags.length} active triage alerts (${redFlags.map(r => r.ruleTriggered).slice(0, 2).join(', ')}).`
          : 'Patient complaints include symptoms suggestive of acute cardiopulmonary or vascular distress.',
    });
  }

  // Factor B: Severity / Distress Indicators
  const isSeverePain =
    chiefComplaint.includes('severe') ||
    chiefComplaint.includes('unbearable') ||
    chiefComplaint.includes('गंभीर') ||
    hpi.includes('severe') ||
    hpi.includes('scale 8') ||
    hpi.includes('scale 9') ||
    hpi.includes('scale 10') ||
    hpi.includes('worst pain');

  if (isSeverePain) {
    score += 20;
    factors.push({
      code: 'HIGH_INTENSITY_PAIN',
      factor: 'Severe Reported Symptom Intensity (VAS 8-10/10)',
      points: 20,
      explanation: 'Patient reported high-grade distress or incapacitating pain onset.',
    });
  } else if (chiefComplaint.includes('moderate') || hpi.includes('moderate')) {
    score += 10;
    factors.push({
      code: 'MODERATE_INTENSITY',
      factor: 'Moderate Distress Rating',
      points: 10,
      explanation: 'Symptom intensity is moderately elevated and interferes with daily function.',
    });
  }

  // Factor C: Comorbidity & Systemic Risk
  const hasMajorComorbidities =
    pmh.includes('hypertension') ||
    pmh.includes('diabetes') ||
    pmh.includes('cad') ||
    pmh.includes('infarction') ||
    pmh.includes('stroke') ||
    pmh.includes('ckd') ||
    pmh.includes('asthma') ||
    pmh.includes('उच्च रक्तचाप') ||
    pmh.includes('मधुमेह');

  if (hasMajorComorbidities) {
    score += 15;
    factors.push({
      code: 'COMORBID_BURDEN',
      factor: 'Known Chronic Systemic Comorbidities',
      points: 15,
      explanation: 'History of chronic vascular, metabolic, or pulmonary disease.',
    });
  }

  // Factor D: Vulnerable Demographic Factor
  if (age >= 65) {
    score += 10;
    factors.push({
      code: 'GERIATRIC_RISK',
      factor: 'Geriatric Vulnerability Factor (Age ≥ 65)',
      points: 10,
      explanation: `Patient age is ${age} years, placing them in an elevated vulnerability cohort.`,
    });
  } else if (age <= 5) {
    score += 12;
    factors.push({
      code: 'PEDIATRIC_RISK',
      factor: 'Pediatric Early Warning Factor (Age ≤ 5)',
      points: 12,
      explanation: `Young child patient (${age} yrs) requiring accelerated pediatric evaluation.`,
    });
  }

  // Factor E: Polypharmacy / Drug Safety
  const meds = (data as any).drugHistory || (data as any).medications || [];
  if (meds.length >= 4) {
    score += 10;
    factors.push({
      code: 'POLYPHARMACY',
      factor: 'Polypharmacy Surveillance (≥4 Concurrent Medications)',
      points: 10,
      explanation: `${meds.length} active pharmaceutical formulations recorded.`,
    });
  }

  // Factor F: Abnormal Investigational Record / Document
  const docs = data.documents || [];
  const abnormalDocs = docs.filter(
    d =>
      (d.extractedEntities as any)?.findings?.toLowerCase().includes('abnormal') ||
      d.extractedEntities?.diagnosis?.toLowerCase().includes('infarction') ||
      d.extractedEntities?.diagnosis?.toLowerCase().includes('uncontrolled')
  );
  if (abnormalDocs.length > 0) {
    score += 15;
    factors.push({
      code: 'ABNORMAL_DOCS',
      factor: 'Prior Document Demonstrates Pathological Findings',
      points: 15,
      explanation: `Uploaded medical record (${abnormalDocs[0].name}) indicates clinical deviation.`,
    });
  }

  // Factor G: Vital signs if present
  if (data.vitals) {
    const { bp, spo2, pulse } = data.vitals;
    if (spo2 && spo2 < 93) {
      score += 25;
      factors.push({
        code: 'HYPOXEMIA',
        factor: 'Peripheral Oxygen Desaturation (SpO2 < 93%)',
        points: 25,
        explanation: `SpO2 recorded at ${spo2}%, requiring immediate airway/oxygen triage.`,
      });
    }
    if (bp) {
      const [sys] = bp.split('/').map(Number);
      if (sys && (sys >= 165 || sys <= 85)) {
        score += 20;
        factors.push({
          code: 'HEMODYNAMIC_ALERT',
          factor: 'Hemodynamic Blood Pressure Alert',
          points: 20,
          explanation: `Systolic blood pressure measured at ${sys} mmHg.`,
        });
      }
    }
  }

  // Cap score at 100
  const finalScore = Math.min(Math.max(score, 12), 100);

  // Categorize
  let category: 'Routine' | 'Priority' | 'Urgent' = 'Routine';
  if (finalScore >= 70) {
    category = 'Urgent';
  } else if (finalScore >= 40) {
    category = 'Priority';
  } else {
    category = 'Routine';
  }

  return {
    score: finalScore,
    category,
    factors,
    calculatedAt: new Date().toISOString(),
  };
}
