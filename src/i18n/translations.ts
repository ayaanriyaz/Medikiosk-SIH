import { Language } from '../types';
import enJson from './locales/en.json';
import hiJson from './locales/hi.json';
import mrJson from './locales/mr.json';
import bnJson from './locales/bn.json';
import taJson from './locales/ta.json';
import teJson from './locales/te.json';
import guJson from './locales/gu.json';
import knJson from './locales/kn.json';
import mlJson from './locales/ml.json';
import paJson from './locales/pa.json';
import urJson from './locales/ur.json';

export interface TranslationStrings {
  appTitle: string;
  subTitle: string;
  stepOf?: (step: number, total: number) => string;
  welcome: string;
  continue: string;
  back: string;
  next: string;
  skip: string;
  repeat: string;
  speak: string;
  listening: string;
  processing: string;
  iHeard: string;
  accept: string;
  correct: string;
  consent: string;
  consentTitle: string;
  consentText1: string;
  consentText2: string;
  consentText3: string;
  listenConsent: string;
  agree: string;
  disagree: string;
  yes: string;
  no: string;
  submit: string;
  review: string;
  complete: string;
  upload: string;
  scan: string;
  done: string;
  currentProblem: string;
  medicalHistory: string;
  medicines: string;
  allergies: string;
  previousReports: string;
  ayushInfo: string;
  tapToSpeak: string;
  typeAnswerHere: string;
  orChooseOption: string;
  redFlagWarning: string;
  readyForConsultation: string;
  tokenNumber: string;
  pleaseWaitMessage: string;
  assistedByAi: string;
  searchPatient: string;
  enterAbha: string;
  enterAadhaar: string;
  registerNew: string;
  noRecordFound: string;
  demoModeNotice: string;
  homeNav: string;
  patientModeNav: string;
  doctorWorkspaceNav: string;
  hospitalOpsNav: string;
  demoCenterNav: string;
  resetBtn: string;
  dashboard: string;
  howAreYouFeeling: string;
  startMedicalInterview: string;
  uploadReports: string;
  scanMedicine: string;
  abdmSync: string;
  preConsultationSummary: string;
  emergencyAlert: string;
  verifiedByDoctor: string;
  [key: string]: any;
}

const buildTranslationStrings = (json: Record<string, any>, langCode: string): TranslationStrings => {
  return {
    ...json,
    stepOf: (step: number, total: number) => {
      if (langCode === 'hi') return `चरण ${step} / ${total}`;
      if (langCode === 'mr') return `टप्पा ${step} / ${total}`;
      return `Step ${step} of ${total}`;
    },
  } as TranslationStrings;
};

export const en = buildTranslationStrings(enJson, 'en');
export const hi = buildTranslationStrings(hiJson, 'hi');
export const mr = buildTranslationStrings(mrJson, 'mr');
export const bn = buildTranslationStrings(bnJson, 'bn');
export const ta = buildTranslationStrings(taJson, 'ta');
export const te = buildTranslationStrings(teJson, 'te');
export const gu = buildTranslationStrings(guJson, 'gu');
export const kn = buildTranslationStrings(knJson, 'kn');
export const ml = buildTranslationStrings(mlJson, 'ml');
export const pa = buildTranslationStrings(paJson, 'pa');
export const ur = buildTranslationStrings(urJson, 'ur');

export const translations: Record<Language, TranslationStrings> = {
  en,
  hi,
  mr,
  bn,
  ta,
  te,
  gu,
  kn,
  ml,
  pa,
  ur,
};
