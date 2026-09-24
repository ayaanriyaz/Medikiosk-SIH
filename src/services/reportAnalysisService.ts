import { ClinicalReport, Medication, Allergy } from '../types';

export interface ReportValidationResult {
  isValid: boolean;
  warnings: string[];
  missingFields: string[];
}

export function validateClinicalReport(report: ClinicalReport): ReportValidationResult {
  const warnings: string[] = [];
  const missingFields: string[] = [];

  if (!report.chiefComplaint || report.chiefComplaint.trim().length === 0 || report.chiefComplaint === 'Not reported') {
    missingFields.push('Chief Complaint');
  }

  if (!report.hpiDetails?.onset || report.hpiDetails.onset === '—') {
    warnings.push('Onset duration not specified');
  }

  if (!report.drugHistory || report.drugHistory.length === 0) {
    warnings.push('No medications recorded (defaulting to None reported)');
  }

  if (!report.allergies || report.allergies.length === 0) {
    warnings.push('No allergy status recorded (defaulting to No known allergies)');
  }

  return {
    isValid: missingFields.length === 0,
    warnings,
    missingFields,
  };
}

export function updateReportField(
  report: ClinicalReport,
  updates: Partial<ClinicalReport>
): ClinicalReport {
  const updated = {
    ...report,
    ...updates,
  };

  // Re-sync quick summary if key sections changed
  if (updates.chiefComplaint || updates.drugHistory || updates.allergies || updates.hpiDetails) {
    const cc = updated.chiefComplaint;
    const onset = updated.hpiDetails?.onset || 'recently';
    const severity = updated.hpiDetails?.severity || 'moderate';

    const keyPoints: string[] = [];
    if (updated.redFlags && updated.redFlags.length > 0) {
      keyPoints.push(`🚨 RED FLAG: ${updated.redFlags.map(r => r.ruleTriggered).join(', ')}`);
    }
    keyPoints.push(`Primary complaint: ${cc} (${onset}, ${severity})`);
    if (updated.drugHistory && updated.drugHistory.length > 0 && !updated.drugHistory[0].name.toLowerCase().includes('none')) {
      keyPoints.push(`Active medications: ${updated.drugHistory.map(m => `${m.name} (${m.dosage})`).join(', ')}`);
    }
    if (updated.allergies && updated.allergies.length > 0 && !updated.allergies[0].substance.toLowerCase().includes('no')) {
      keyPoints.push(`⚠️ Allergies: ${updated.allergies.map(a => `${a.substance} (${a.reaction || 'Allergic reaction'})`).join(', ')}`);
    }

    updated.summary = {
      quickClinicalSummary: `Pre-consultation clinical intake summary. Patient presents with ${cc} (${onset}). Severity: ${severity}.`,
      keyPointsForDoctor: keyPoints,
    };
  }

  return updated;
}
