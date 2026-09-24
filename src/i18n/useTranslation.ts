import { useLanguage } from './LanguageContext';
import { SupportedLanguage } from './languages';
import { TranslationStrings } from './translations';
import { Language } from '../types';

export interface UseTranslationReturn {
  t: TranslationStrings & ((key: string, fallback?: string, params?: Record<string, string | number>) => string);
  language: Language;
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  changeLanguage: (lang: Language) => void;
  i18n: {
    language: Language;
    changeLanguage: (lang: Language) => void;
    availableLanguages: SupportedLanguage[];
  };
  isHindi: boolean;
  isMarathi: boolean;
  isEnglish: boolean;
  isRTL: boolean;
  config: SupportedLanguage;
  availableLanguages: SupportedLanguage[];
  localize: (text: string) => string;
  localizeStatus: (status: string) => string;
}

/**
 * useTranslation hook for complete multi-language reactive UI switching
 * Supports key-based lookup t('key'), fallback t('key', 'Default'), and direct access t.key
 */
export function useTranslation(): UseTranslationReturn {
  const context = useLanguage();

  const enhancedT = ((key: string, fallback?: string, params?: Record<string, string | number>): string => {
    let result = context.t(key, fallback);
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(paramVal));
        result = result.replace(new RegExp(`{\\s*${paramKey}\\s*}`, 'g'), String(paramVal));
      });
    }
    return result;
  }) as TranslationStrings & ((key: string, fallback?: string, params?: Record<string, string | number>) => string);

  // Copy property getters from context.t onto enhancedT
  Object.assign(enhancedT, context.t);

  return {
    t: enhancedT,
    language: context.language,
    currentLanguage: context.language,
    setLanguage: context.setLanguage,
    changeLanguage: context.setLanguage,
    i18n: {
      language: context.language,
      changeLanguage: context.setLanguage,
      availableLanguages: context.availableLanguages,
    },
    isHindi: context.isHindi,
    isMarathi: context.isMarathi,
    isEnglish: context.isEnglish,
    isRTL: context.isRTL,
    config: context.config,
    availableLanguages: context.availableLanguages,
    localize: context.localize,
    localizeStatus: context.localizeStatus,
  };
}

export default useTranslation;
