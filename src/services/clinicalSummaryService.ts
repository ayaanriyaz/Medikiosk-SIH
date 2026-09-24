import { ClinicalInterview, Medication, Allergy, RedFlagAlert } from '../types';

export interface LiveSummaryState {
  chiefComplaint: string;
  hpi: {
    onset: string;
    duration: string;
    severity: string;
    character: string;
    radiation: string;
    aggravating: string;
    relieving: string;
    associated: string;
  };
  medications: Medication[];
  allergies: Allergy[];
  pastHistory: string[];
  redFlags: RedFlagAlert[];
  completionPercentage: number;
  isReadyForReport: boolean;
}

export function buildLiveSummary(interview: ClinicalInterview): LiveSummaryState {
  const cc = String(interview.chiefComplaint || '');
  const onset = String(interview.hpi?.onset || '');
  const severity = String(interview.hpi?.severity || '');
  const character = String(interview.hpi?.character || '');
  const radiation = String(interview.hpi?.radiation || '');
  const meds = interview.drugHistory || [];
  const allergies = interview.allergies || [];
  const past = interview.pastHistory || [];
  const redFlags = interview.redFlags || [];

  // Calculate completion percentage
  let score = 10; // baseline started
  if (cc.trim().length > 0) score += 25;
  if (onset.trim().length > 0) score += 15;
  if (severity.trim().length > 0) score += 15;
  if (character.trim().length > 0 || radiation.trim().length > 0) score += 10;
  if (meds.length > 0) score += 15;
  if (allergies.length > 0) score += 10;

  const completionPercentage = Math.min(100, score);
  const isReadyForReport = Boolean(cc.trim().length > 0 && (onset.trim().length > 0 || severity.trim().length > 0));

  return {
    chiefComplaint: cc,
    hpi: {
      onset: onset || '—',
      duration: interview.hpi?.duration || '—',
      severity: severity || '—',
      character: character || '',
      radiation: radiation || '',
      aggravating: Array.isArray(interview.hpi?.aggravatingFactors)
        ? interview.hpi.aggravatingFactors.join(', ')
        : (interview.hpi?.aggravatingFactors || ''),
      relieving: Array.isArray(interview.hpi?.relievingFactors)
        ? interview.hpi.relievingFactors.join(', ')
        : (interview.hpi?.relievingFactors || ''),
      associated: interview.hpi?.associatedSymptoms ? interview.hpi.associatedSymptoms.join(', ') : '',
    },
    medications: meds,
    allergies,
    pastHistory: past,
    redFlags,
    completionPercentage,
    isReadyForReport,
  };
}
