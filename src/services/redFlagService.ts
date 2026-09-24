import { RedFlagAlert } from '../types';

export interface RedFlagRule {
  id: string;
  category: 'Cardiovascular' | 'Respiratory' | 'Neurological' | 'Circulatory' | 'Allergic / Anaphylaxis' | 'Acute Abdomen';
  name: string;
  keywords: string[];
  severity: 'HIGH' | 'CRITICAL' | 'MODERATE';
  symptomSummary: string;
}

export const CLINICAL_RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: 'RF-CHEST-PAIN',
    category: 'Cardiovascular',
    name: 'Acute Coronary Syndrome / High-Risk Chest Pain',
    keywords: [
      'chest pain', 'chest discomfort', 'left arm', 'radiating to arm', 'jaw pain', 'sweating', 'angina',
      'सीने में दर्द', 'छाती में दर्द', 'पसीना', 'baaye haath me dard', 'chhati me dard', 'crushing pain'
    ],
    severity: 'CRITICAL',
    symptomSummary: 'Potential acute coronary syndrome or unstable ischemic cardiac pattern identified.',
  },
  {
    id: 'RF-DYSPNEA',
    category: 'Respiratory',
    name: 'Severe Acute Dyspnea / Respiratory Distress',
    keywords: [
      'cannot breathe', 'severe shortness of breath', 'stridor', 'gasping', 'choking', 'cyanosis',
      'सांस लेने में तकलीफ', 'सांस फूलना', 'dum ghutna', 'unable to talk'
    ],
    severity: 'HIGH',
    symptomSummary: 'Acute severe respiratory compromise requiring immediate evaluation.',
  },
  {
    id: 'RF-STROKE-FAST',
    category: 'Neurological',
    name: 'Acute Neurological Deficit / Possible Stroke (FAST)',
    keywords: [
      'face drooping', 'arm weakness', 'speech difficulty', 'slurred speech', 'sudden weakness',
      'एक तरफ कमजोरी', 'बोलने में कठिनाई', 'ek taraf lakwa', 'loss of vision'
    ],
    severity: 'CRITICAL',
    symptomSummary: 'Focal neurological deficits or sudden motor/speech disturbance detected.',
  },
  {
    id: 'RF-HEMORRHAGE',
    category: 'Circulatory',
    name: 'Severe Acute Hemorrhage / Bleeding',
    keywords: [
      'vomiting blood', 'coughing blood', 'hematemesis', 'hemoptysis', 'severe bleeding',
      'खून की उल्टी', 'अत्यधिक रक्तस्राव', 'khansi me khoon', 'black tarry stool'
    ],
    severity: 'CRITICAL',
    symptomSummary: 'Active significant internal or airway hemorrhage warning signs detected.',
  },
  {
    id: 'RF-ANAPHYLAXIS',
    category: 'Allergic / Anaphylaxis',
    name: 'Anaphylaxis / Severe Systemic Allergic Reaction',
    keywords: [
      'throat swelling', 'tongue swelling', 'cannot swallow', 'severe allergic reaction',
      'gale me sujan', 'swollen lips', 'hives all over'
    ],
    severity: 'CRITICAL',
    symptomSummary: 'Airway compromise or rapid systemic hypersensitivity signs noted.',
  },
  {
    id: 'RF-ACUTE-ABDOMEN',
    category: 'Acute Abdomen',
    name: 'Acute Peritoneal Sign / Severe Abdominal Distress',
    keywords: [
      'rigid abdomen', 'unbearable stomach pain', 'severe tenderness', 'pet me asahay dard',
      'pet me bohot tez dard', 'guarding'
    ],
    severity: 'HIGH',
    symptomSummary: 'Severe acute surgical abdomen or peritoneal irritation signs.',
  },
];

export function evaluateRedFlags(
  text: string,
  patientId: string = 'PATIENT-INTAKE',
  patientName: string = 'Patient',
  token: string = 'T-001'
): RedFlagAlert[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const alerts: RedFlagAlert[] = [];

  for (const rule of CLINICAL_RED_FLAG_RULES) {
    const matched = rule.keywords.some(k => lower.includes(k.toLowerCase()));
    if (matched) {
      alerts.push({
        alertId: `RF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        patientId,
        intakeId: `INTAKE-${token}`,
        patientName,
        token,
        ruleTriggered: rule.name,
        severity: rule.severity,
        createdAt: new Date().toISOString(),
        status: 'UNREVIEWED',
        symptomSummary: rule.symptomSummary,
        actionRequired: rule.symptomSummary,
      });
    }
  }

  return alerts;
}
