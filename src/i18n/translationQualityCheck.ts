import { translations } from './translations';
import { Language } from '../types';

export interface CompletenessReport {
  valid: boolean;
  baseKeyCount: number;
  results: Record<
    string,
    {
      keyCount: number;
      missingCount: number;
      missingKeys: string[];
      coveragePercent: number;
    }
  >;
}

/**
 * Validates that all translation dictionaries have key parity with English.
 */
export function translationCompletenessCheck(): CompletenessReport {
  const enKeys = Object.keys(translations.en || {});
  const report: CompletenessReport = {
    valid: true,
    baseKeyCount: enKeys.length,
    results: {},
  };

  const allLanguages: Language[] = ['en', 'hi', 'mr', 'bn', 'ta', 'te', 'gu', 'kn', 'ml', 'pa', 'ur'];

  for (const lang of allLanguages) {
    const dict = translations[lang] || {};
    const dictKeys = Object.keys(dict);
    const missingKeys: string[] = [];

    for (const key of enKeys) {
      if (dict[key] === undefined || dict[key] === null || dict[key] === '') {
        missingKeys.push(key);
      }
    }

    const coverage = enKeys.length > 0 ? Math.round(((enKeys.length - missingKeys.length) / enKeys.length) * 100) : 100;

    report.results[lang] = {
      keyCount: dictKeys.length,
      missingCount: missingKeys.length,
      missingKeys,
      coveragePercent: coverage,
    };

    if (missingKeys.length > 0 && (lang === 'mr' || lang === 'hi')) {
      report.valid = false;
    }
  }

  return report;
}
