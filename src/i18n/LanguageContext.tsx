import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Language } from '../types';
import { translations, TranslationStrings } from './translations';
import { MULTILINGUAL_GLOSSARY, getLocalizedPhrase } from './multilingualGlossary';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  getLanguageConfig,
  isRtlLanguage,
} from './languages';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationStrings & ((key: string, fallback?: string) => string);
  localize: (text: string) => string;
  localizeStatus: (status: string) => string;
  isHindi: boolean;
  isMarathi: boolean;
  isEnglish: boolean;
  isRTL: boolean;
  config: SupportedLanguage;
  availableLanguages: SupportedLanguage[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEYS = ['preferredLanguage', 'annaLanguage', 'medikiosk_language', 'language'];

function getInitialLanguage(): Language {
  try {
    for (const key of STORAGE_KEYS) {
      const saved = localStorage.getItem(key);
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    }
  } catch (e) {
    console.warn('Unable to access localStorage for language:', e);
  }
  // Default to Hindi per clinical workflow requirement
  return 'hi';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (newLang: Language) => {
    const config = getLanguageConfig(newLang);
    setLanguageState(config.code);
    try {
      localStorage.setItem('preferredLanguage', config.code);
      localStorage.setItem('annaLanguage', config.code);
      localStorage.setItem('medikiosk_language', config.code);
      localStorage.setItem('language', config.code);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = config.bcp47;
        document.documentElement.dir = config.dir;
      }
    } catch (e) {
      console.warn('Unable to persist language:', e);
    }
  };

  useEffect(() => {
    try {
      const config = getLanguageConfig(language);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = config.bcp47;
        document.documentElement.dir = config.dir;
      }
    } catch {
      // safe ignore in non-browser env
    }
  }, [language]);

  const value = useMemo<LanguageContextType>(() => {
    const config = getLanguageConfig(language);
    const baseDict = translations.en;
    const directLangDict = (translations as any)[config.code] || {};
    const glossaryDict = MULTILINGUAL_GLOSSARY[config.code] || {};

    // Combine base English, specialized glossary, and direct translation dictionary
    const dict = { ...baseDict, ...glossaryDict, ...directLangDict };

    const tFn = (key: string, fallback?: string): string => {
      // 1. Direct key match
      if (key in dict && typeof dict[key] === 'string') {
        return dict[key];
      }
      if (key in dict && typeof dict[key] === 'function') {
        return dict[key];
      }

      // 2. Glossary lookup by English phrase
      const localizedGlossaryPhrase = getLocalizedPhrase(key, config.code);
      if (localizedGlossaryPhrase !== key) {
        return localizedGlossaryPhrase;
      }

      // 3. Fallback or base dictionary
      if (fallback !== undefined) {
        return fallback;
      }
      if (key in baseDict) {
        return (baseDict as any)[key];
      }
      return key;
    };

    const combinedT = Object.assign(tFn, dict) as any;

    const localize = (text: string): string => {
      if (!text) return text;
      if (config.code === 'en') return text;
      // Try t first
      const val = tFn(text, '');
      if (val && val !== text) return val;
      return getLocalizedPhrase(text, config.code);
    };

    const statusMap: Record<string, Record<string, string>> = {
      hi: {
        'Available': 'उपलब्ध',
        'Waiting': 'प्रतीक्षारत',
        'In Consultation': 'परामर्श जारी',
        'Completed': 'पूर्ण',
        'Confirmed': 'पुष्ट',
        'Processing': 'प्रक्रिया जारी',
        'Verified': 'सत्यापित',
        'Red Flag': 'रेड फ्लैग',
        'Routine': 'सामान्य',
        'Priority': 'प्राथमिकता',
        'Urgent': 'अति आवश्यक',
        'Pending': 'लंबित',
      },
      mr: {
        'Available': 'उपलब्ध',
        'Waiting': 'प्रतिक्षेत',
        'In Consultation': 'सल्लामसलत सुरू',
        'Completed': 'पूर्ण',
        'Confirmed': 'निश्चित',
        'Processing': 'प्रक्रिया सुरू',
        'Verified': 'सत्यापित',
        'Red Flag': 'धोक्याचा इशारा',
        'Routine': 'नियमित',
        'Priority': 'प्राधान्य',
        'Urgent': 'तातडीचे',
        'Pending': 'प्रलंबित',
      },
      bn: {
        'Available': 'উপলব্ধ',
        'Waiting': 'অপেক্ষমান',
        'In Consultation': 'পরামর্শ চলছে',
        'Completed': 'সম্পূর্ণ',
        'Confirmed': 'নিশ্চিত',
        'Processing': 'প্রক্রিয়াধীন',
        'Verified': 'যাচাইকৃত',
        'Red Flag': 'জরুরি সতর্কতা',
        'Routine': 'স্বাভাবিক',
        'Priority': 'অগ্রাধিকার',
        'Urgent': 'জরুরি',
        'Pending': 'অমীমাংসিত',
      },
      ta: {
        'Available': 'கிடைக்கிறது',
        'Waiting': 'காத்திருக்கிறது',
        'In Consultation': 'ஆலோசனை நடக்கிறது',
        'Completed': 'முடிந்தது',
        'Confirmed': 'உறுதி செய்யப்பட்டது',
        'Processing': 'செயல்பாட்டில் உள்ளது',
        'Verified': 'சரிபார்க்கப்பட்டது',
        'Red Flag': 'அபாய எச்சரிக்கை',
        'Routine': 'வழக்கமான',
        'Priority': 'முன்னுரிமை',
        'Urgent': 'அவசர',
        'Pending': 'நிலுவையில் உள்ளது',
      },
      te: {
        'Available': 'అందుబాటులో ఉంది',
        'Waiting': 'వేచి ఉంది',
        'In Consultation': 'సంప్రదింపు జరుగుతోంది',
        'Completed': 'పూర్తయింది',
        'Confirmed': 'ధృవీకరించబడింది',
        'Processing': 'ప్రక్రియలో ఉంది',
        'Verified': 'ధృవీకరించబడింది',
        'Red Flag': 'అత్యవసర హెచ్చరిక',
        'Routine': 'సాధారణ',
        'Priority': 'ప్రాధాన్యత',
        'Urgent': 'అత్యవసరం',
        'Pending': 'పెండింగ్‌లో ఉంది',
      },
    };

    const localizeStatus = (status: string): string => {
      if (!status) return status;
      const langStatus = statusMap[config.code];
      if (langStatus && langStatus[status]) {
        return langStatus[status];
      }
      return localize(status);
    };

    return {
      language: config.code,
      setLanguage,
      t: combinedT,
      localize,
      localizeStatus,
      isHindi: config.code === 'hi',
      isMarathi: config.code === 'mr',
      isEnglish: config.code === 'en',
      isRTL: config.dir === 'rtl',
      config,
      availableLanguages: SUPPORTED_LANGUAGES,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
