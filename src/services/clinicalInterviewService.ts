import { ClinicalInterview, InterviewMessage, ClinicalReport, MedicalDocument, Patient, Language } from '../types';
import { IntentClassifier } from '../utils/intentClassifier';

export const NON_MEDICAL_REFUSAL_EN = "I am the digital clinical intake assistant. I can only assist with symptoms, medical history, medications, and details required for your doctor consultation.";
export const NON_MEDICAL_REFUSAL_HI = "मैं डिजिटल क्लिनिकल इंटेक सहायक हूँ। मैं केवल लक्षणों, स्वास्थ्य इतिहास, दवाओं और डॉक्टर परामर्श के लिए आवश्यक जानकारी में ही सहायता कर सकता हूँ।";

export function isNonMedicalQuestion(text: string): boolean {
  return !IntentClassifier.isMedical(text);
}

export async function startClinicalInterview(patient: Patient, mode: string = 'allopathy'): Promise<ClinicalInterview> {
  const res = await fetch('/api/interviews/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient, mode }),
  });

  if (!res.ok) {
    throw new Error('Failed to start clinical interview session');
  }

  const data = await res.json();
  return data.interview;
}

export async function sendInterviewMessage(
  interviewId: string,
  content: string,
  language: Language = 'en'
): Promise<{ interview: ClinicalInterview; reply: InterviewMessage; isNonMedical?: boolean }> {
  // Client-side quick filter using IntentClassifier
  const classified = IntentClassifier.classify(content);
  if (!classified.isMedical) {
    const isHinglish = /\b(mujhe|mera|meri|dard|bukhar|sirdard|pet|chhati|khansi|saans|goli|dawa|hai|hain|tha|thi|biryani|khaogi)\b/i.test(content);
    const casual = IntentClassifier.getConversationalResponse(content, classified, language, isHinglish);
    const reply: InterviewMessage = {
      id: `msg-${Date.now()}`,
      interviewId,
      sender: 'bot',
      message: casual.reply,
      timestamp: new Date().toISOString(),
      language,
      questionCategory: 'safety',
      quickOptions: casual.quickOptions,
    };

    return {
      interview: null as any,
      reply,
      isNonMedical: true,
    };
  }

  const res = await fetch(`/api/interviews/${interviewId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, language }),
  });

  if (!res.ok) {
    throw new Error('Failed to process message');
  }

  const data = await res.json();
  return {
    interview: data.interview,
    reply: data.reply,
    isNonMedical: data.isNonMedical || false,
  };
}

export async function uploadInterviewDocument(
  interviewId: string,
  doc: MedicalDocument
): Promise<{ interview: ClinicalInterview; document: MedicalDocument }> {
  const res = await fetch(`/api/interviews/${interviewId}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      docName: doc.name,
      docType: doc.type,
      document: doc,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to upload document');
  }

  const data = await res.json();
  return {
    interview: data.interview,
    document: data.document,
  };
}

export async function completeClinicalInterview(
  interviewId: string
): Promise<{ interview: ClinicalInterview; report: ClinicalReport; intake: any }> {
  const res = await fetch(`/api/interviews/${interviewId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error('Failed to generate clinical report');
  }

  const data = await res.json();
  return {
    interview: data.interview,
    report: data.report,
    intake: data.intake,
  };
}
