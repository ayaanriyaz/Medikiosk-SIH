export interface RedFlagRule {
  id: string;
  category: string;
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
    keywords: ['chest pain', 'chest discomfort', 'left arm', 'radiating', 'jaw pain', 'sweating', 'angina', 'सीने में दर्द', 'छाती में दर्द', 'पसीना'],
    severity: 'CRITICAL',
    symptomSummary: 'Potential acute coronary syndrome or unstable angina pattern identified requiring immediate clinical triage.',
  },
  {
    id: 'RF-DYSPNEA',
    category: 'Respiratory',
    name: 'Severe Breathing Difficulty / Acute Dyspnea',
    keywords: ['cannot breathe', 'severe shortness of breath', 'stridor', 'gasping', 'choking', 'cyanosis', 'सांस लेने में तकलीफ', 'सांस फूलना'],
    severity: 'HIGH',
    symptomSummary: 'Acute severe respiratory distress requiring urgent oxygenation assessment.',
  },
  {
    id: 'RF-STROKE-FAST',
    category: 'Neurological',
    name: 'Acute Neurological Deficit / Possible Stroke',
    keywords: ['face drooping', 'arm weakness', 'speech difficulty', 'slurred speech', 'sudden weakness', 'एक तरफ कमजोरी', 'बोलने में कठिनाई'],
    severity: 'CRITICAL',
    symptomSummary: 'FAST stroke warning signs detected; urgent neurological evaluation required.',
  },
  {
    id: 'RF-HEMORRHAGE',
    category: 'Circulatory',
    name: 'Severe Acute Bleeding / Hemorrhage',
    keywords: ['vomiting blood', 'coughing blood', 'hematemesis', 'hemoptysis', 'severe bleeding', 'खून की उल्टी', 'अत्यधिक रक्तस्राव'],
    severity: 'CRITICAL',
    symptomSummary: 'Active upper GI or airway hemorrhage symptoms detected.',
  },
  {
    id: 'RF-ALTERED-MENTATION',
    category: 'Neurological',
    name: 'Altered Mental Status / Syncope',
    keywords: ['fainted', 'loss of consciousness', 'blackout', 'unresponsive', 'acute confusion', 'बेहोश', 'चक्कर खाकर गिरना'],
    severity: 'HIGH',
    symptomSummary: 'Transient loss of consciousness or altered sensorium noted.',
  },
];

export function checkRedFlags(text: string): { triggered: boolean; alerts: Array<{ ruleId: string; name: string; severity: 'HIGH' | 'CRITICAL' | 'MODERATE'; symptomSummary: string }> } {
  if (!text) return { triggered: false, alerts: [] };
  const lower = text.toLowerCase();
  const matched: Array<{ ruleId: string; name: string; severity: 'HIGH' | 'CRITICAL' | 'MODERATE'; symptomSummary: string }> = [];

  for (const rule of CLINICAL_RED_FLAG_RULES) {
    const hits = rule.keywords.some(k => lower.includes(k.toLowerCase()));
    if (hits) {
      matched.push({
        ruleId: rule.id,
        name: rule.name,
        severity: rule.severity,
        symptomSummary: rule.symptomSummary,
      });
    }
  }

  return {
    triggered: matched.length > 0,
    alerts: matched,
  };
}
