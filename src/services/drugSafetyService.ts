import { DrugInteractionAlert, Medication } from '../types';

interface InteractionRule {
  drugA: string[];
  drugB: string[];
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  mechanism: string;
  clinicalEffect: string;
  management: string;
}

const KNOWN_INTERACTION_RULES: InteractionRule[] = [
  {
    drugA: ['sildenafil', 'tadalafil', 'vardenafil'],
    drugB: ['nitroglycerin', 'isosorbide', 'sorbitrate', 'mononitrate', 'nitrate'],
    severity: 'HIGH',
    mechanism: 'Synergistic cGMP pathway potentiation leading to massive systemic vasodilation',
    clinicalEffect: 'Severe potentially fatal precipitous drop in systemic blood pressure and coronary perfusion',
    management: 'Absolute contraindication. Never administer nitrates within 24-48 hours of PDE5 inhibitors.',
  },
  {
    drugA: ['telmisartan', 'losartan', 'valsartan', 'olmesartan'],
    drugB: ['ramipril', 'enalapril', 'lisinopril', 'perindopril'],
    severity: 'HIGH',
    mechanism: 'Dual Renin-Angiotensin-Aldosterone System (RAAS) blockade',
    clinicalEffect: 'Increased risk of acute kidney injury (AKI), hyperkalemia, and profound hypotension without added benefit',
    management: 'Avoid combining ARBs and ACE inhibitors. Recommend monotherapy with single agent.',
  },
  {
    drugA: ['aspirin', 'ecospirin', 'clopidogrel', 'prasugrel', 'ticagrelor', 'warfarin', 'dabigatran', 'apixaban'],
    drugB: ['ibuprofen', 'diclofenac', 'naproxen', 'aceclofenac', 'combiflam'],
    severity: 'MODERATE',
    mechanism: 'Concurrent antiplatelet/anticoagulant activity combined with NSAID-induced gastric mucosal inhibition',
    clinicalEffect: 'Elevated risk of gastrointestinal ulceration, upper GI hemorrhage, and blunted antiplatelet cardioprotection',
    management: 'Use paracetamol for analgesia where appropriate. If NSAID required, co-prescribe PPI gastroprotection and monitor closely.',
  },
  {
    drugA: ['metformin', 'glycomet'],
    drugB: ['radiological iodinated contrast', 'contrast agent'],
    severity: 'MODERATE',
    mechanism: 'Contrast-induced nephropathy impairing renal clearance of metformin',
    clinicalEffect: 'Elevated risk of potentially life-threatening lactic acidosis in renal impairment',
    management: 'Withhold metformin prior to or at time of iodinated contrast study; resume after 48h if eGFR stable.',
  },
  {
    drugA: ['spironolactone', 'eplerenone'],
    drugB: ['telmisartan', 'ramipril', 'losartan', 'potassium supplement'],
    severity: 'MODERATE',
    mechanism: 'Additive aldosterone inhibition and reduced renal potassium excretion',
    clinicalEffect: 'Symptomatic hyperkalemia causing cardiac conduction delays or arrhythmias',
    management: 'Check serum potassium and creatinine within 1-2 weeks of initiation.',
  },
  {
    drugA: ['ashwagandha', 'withania somnifera'],
    drugB: ['sedative', 'alprazolam', 'clonazepam', 'zolpidem'],
    severity: 'LOW',
    mechanism: 'Additive GABA-mimetic and central nervous system depressant synergy',
    clinicalEffect: 'Potentiated drowsiness, excessive sedation, and daytime motor psychomotor impairment',
    management: 'Counsel patient on alertness; separate administration and adjust sedative dosing if warranted.',
  },
  {
    drugA: ['guggulu', 'commiphora mukul'],
    drugB: ['atorvastatin', 'rosuvastatin', 'simvastatin'],
    severity: 'LOW',
    mechanism: 'CYP3A4 modulation and overlapping hepatic bile acid receptor competition',
    clinicalEffect: 'Potential alteration in statin bioavailability; rarely mild transaminitis',
    management: 'Monitor baseline liver function tests; ensure integrative medicine physician supervision.',
  },
];

export function checkMedicationSafety(
  medications: (Medication | string)[],
  allergies?: string[]
): DrugInteractionAlert[] {
  const alerts: DrugInteractionAlert[] = [];

  const medNames = medications.map(m => {
    if (typeof m === 'string') return m.toLowerCase();
    return (m.name || '').toLowerCase();
  });

  // Check pairwise interactions
  for (const rule of KNOWN_INTERACTION_RULES) {
    const matchA = medNames.find(m => rule.drugA.some(a => m.includes(a)));
    const matchB = medNames.find(m => rule.drugB.some(b => m.includes(b)));

    if (matchA && matchB && matchA !== matchB) {
      alerts.push({
        id: `INT-${Date.now().toString().slice(-4)}-${alerts.length + 1}`,
        severity: rule.severity,
        drug1: matchA.charAt(0).toUpperCase() + matchA.slice(1),
        drug2: matchB.charAt(0).toUpperCase() + matchB.slice(1),
        mechanism: rule.mechanism,
        clinicalEffect: rule.clinicalEffect,
        management: rule.management,
        disclaimer:
          'CLINICAL SAFETY ALERT: Identified via MediKiosk pharmacology safety engine. This flag is provided for licensed physician verification and does NOT constitute medical instructions to modify or discontinue any medication without consulting your doctor.',
      });
    }
  }

  // Duplicate therapy check
  const antihypertensives = ['telmisartan', 'losartan', 'amlodipine', 'ramipril', 'atenolol', 'metoprolol'];
  const matchingAntihypertensives = medNames.filter(m => antihypertensives.some(ah => m.includes(ah)));
  if (matchingAntihypertensives.length >= 3) {
    alerts.push({
      id: `INT-DUP-${Date.now().toString().slice(-4)}`,
      severity: 'LOW',
      drug1: matchingAntihypertensives.join(', '),
      mechanism: 'Multiple concurrent antihypertensive drug classes',
      clinicalEffect: 'High cumulative hypotensive effect; potential risk of orthostatic dizziness or falls in elderly',
      management: 'Verify adherence, ambulatory blood pressure monitoring, and standing BP.',
      disclaimer: 'PHYSICIAN REVIEW: Review cumulative polypharmacy load.',
    });
  }

  return alerts;
}
