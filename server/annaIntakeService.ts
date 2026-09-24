import { GoogleGenAI } from '@google/genai';
import {
  Patient,
  ClinicalInterview,
  InterviewMessage,
  ClinicalReport,
  RedFlagAlert,
  Medication,
  Allergy,
  MedicalDocument,
  AyushData,
} from '../src/types';
import { checkRedFlags } from './clinicalRules';
import { getDatabase, saveDatabase, logAudit } from './db';
import { IntentClassifier, type ClassifiedIntent, type UserIntentType } from './intentClassifier';

export { IntentClassifier };
export type { ClassifiedIntent, UserIntentType };

// Lazy initialized Gemini client following @google/genai guidelines
let aiClient: GoogleGenAI | null = null;
function getGenAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('[AnnaIntake] Gemini client initialization warning:', e);
    }
  }
  return aiClient;
}

// Anna User Intent Categories
export type AnnaUserIntent =
  | 'CLINICAL'             // Active medical symptoms, pain, discomfort, illness
  | 'MEDICATION'           // Patient reporting or asking about medicines, dosages, allergies
  | 'REPORT_DOCUMENT'      // Discussing lab tests, blood sugar, BP readings, scan reports
  | 'APPOINTMENT_HOSPITAL' // Asking about doctors, hospital queue, tokens, OPD timings
  | 'EMERGENCY'            // Life-threatening red-flags (chest pain radiating, severe dyspnea, stroke)
  | 'FOLLOW_UP'            // Answering previous clinical question in active intake (onset, severity, etc.)
  | 'GENERAL_CONVERSATION' // Friendly chit-chat, food, weather, jokes, movies, personal remarks
  | 'GREETING'             // Hi, hello, namaste, good morning, how are you, kaise ho
  | 'MEDICAL_EDUCATION'    // General medical/health knowledge questions without reporting personal symptoms
  | 'GRATITUDE_CLOSING'    // Thank you, bye, okay, theek hai
  | 'UNCLEAR_AMBIGUOUS';   // Single punctuation, gibberish, vague noise

// Explicit Clinical Symptom Indicators (Latin with \b + Unicode non-Latin scripts)
const EXPLICIT_SYMPTOM_REGEX = /(?:\b(pain|ache|fever|cough|cold|vomit|vomiting|nausea|diarrhea|dast|loose\s*motion|bleeding|blood|chest\s*pain|angina|stomach\s*pain|abdominal\s*pain|belly\s*ache|headache|migraine|dizzy|dizziness|lightheaded|vertigo|rash|itching|swelling|edema|breathless|shortness\s*of\s*breath|wheezing|asthma|throat|chills|shivering|weakness|fatigue|seizure|convulsion|paralysis|numbness|palpitations|high\s*bp|hypertension|high\s*sugar|diabetes|fracture|burn|injury|wound|ulcer|infection|jaundice|dard|bukhar|tap|sirdard|sir\s*dard|sar\s*dard|chhati|seene|pet\s*dard|pet\s*kharab|khansi|jukham|sardi|gale|saans|ulti|jee\s*machlana|chakkar|kamzori|sujan|khujli|jalan|khoon|kamar\s*dard|peeth\s*dard|ghutne|sandhe)\b|(?:सांस|दर्द|बुखार|सिरदर्द|उल्टी|चक्कर|खांसी|कफ|पेट\s*दर्द|छाती|कमजोरी|सूजन|खुजली|जलन|खून|दस्त|दुखणे|कळ|खोकला|श्वास|ताप|मळमळ|व्यथा|ব্যথা|জ্বর|কাশি|வலி|காய்ச்சல்|నొప్పి|జ్వరం|દુખાવો|તાવ|પીડા))/i;

// Food / Casual Chit-Chat Indicators
const CASUAL_FOOD_REGEX = /(?:\b(biryani|khaogi|khao|khana|chai|chai\s*piogi|coffee|pizza|burger|pasta|roti|sabzi|lunch|dinner|breakfast|nashta|food|eat|eating|cook|cooking|recipe|delicious|bhookh|bhuk)\b|(?:बिरयानी|बिरयानी\s*खाओगी|खाना|चाय|कॉफी|रोटी|सब्जी|भूख|नाश्ता|जेवण|बिरयाणी|খাবার|পোলাও|பிரியாணி|బిర్యానీ))/i;
const CASUAL_GREETING_REGEX = /(?:^(hi|hello|hey|namaste|namaskar|pranam|khemcho|good\s*morning|good\s*afternoon|good\s*evening|shubh\s*prabhat|hola|bonjour|ciao|salam|sat\s*sri\s*akal)\b|^(?:नमस्ते|नमस्कार|शुभ\s*प्रभात|हेलो|हाय|सुप्रभात|प्रणाम|কেমন\s*আছেন|வணக்கம்|నమస్కారం|કેમ\s*છો))/i;
const CASUAL_HOW_ARE_YOU_REGEX = /(?:\b(how\s*are\s*you|how\s*r\s*u|kaise\s*ho|kaisa\s*hai|kaisi\s*ho|kasa\s*ahes|kashi\s*ahes|kya\s*haal\s*hai|aap\s*kaise\s*hain|kese\s*ho)\b|(?:कैसा\s*है|कैसे\s*हो|कैसी\s*हो|आप\s*कैसे\s*हैं|कशी\s*आहेस|कसा\s*आहेस|कसे\s*आहात|केमन\s*आचेन|எப்படி\s*இருக்கிறீர்கள்|ఎలా\s*ఉన్నారు|તમે\s*કેમ\s*છો))/i;
const CASUAL_NAME_WHO_REGEX = /(?:\b(who\s*are\s*you|what\s*is\s*your\s*name|aapka\s*naam|tumhara\s*naam|who\s*made\s*you|kisne\s*banaya|what\s*can\s*you\s*do|kya\s*kar\s*sakti\s*ho)\b|(?:आप\s*कौन\s*हैं|आपका\s*नाम|तुमचा\s*नाव|आप\s*क्या\s*कर\s*सकती\s*हो))/i;
const CASUAL_JOKE_REGEX = /(?:\b(tell\s*me\s*a\s*joke|joke\s*sunao|chutkula|make\s*me\s*laugh|funny|story|kahani\s*sunao|shayari)\b|(?:चुटकुला|मजाक|कहानी\s*सुनाओ|हंसाओ|जोक|विनोद\s*सांगा))/i;
const CASUAL_WEATHER_REGEX = /(?:\b(weather|barish|mausam|temperature\s*outside|forecast|rain\s*today|garmi|sardi\s*mausam)\b|(?:मौसम|बारिश|तापमान|हवामान|বৃষ্টি|மழை))/i;
const GRATITUDE_CLOSING_REGEX = /(?:^(thank\s*you|thanks|thx|dhanyawad|shukriya|shukriyaa|bye|goodbye|alvida|tata|see\s*you|okay|ok|theek\s*hai|achha\s*theek\s*hai|all\s*right)\b|^(?:धन्यवाद|शुक्रिया|अलविदा|ठीक\s*है|आभार|बाय|टाटा|নমস্কার|ধন্যবাদ|நன்றி|ధన్యవాదాలు|આભાર))/i;
const MEDICAL_EDUCATION_REGEX = /(?:\b(what\s*is|what\s*does|meaning\s*of|causes\s*of|normal\s*range|kya\s*hota\s*hai|kya\s*hai|ka\s*matlab)\b.*\b(diabetes|sugar|blood\s*pressure|bp|hypertension|cholesterol|asthma|thyroid|dengue|malaria|typhoid|covid|anemia|infection)\b|(?:क्या\s*होता\s*है|का\s*मतलब|कारण\s*क्या\s*है).*(?:डायबिटीज|शुगर|मधुमेह|ब्लड\s*प्रेशर|थायराइड|अस्थमा|दमा))/i;

/**
 * Robust Deterministic Intent Classifier using IntentClassifier utility
 */
export function classifyMessageIntent(
  text: string,
  currentSection: string = 'chief_complaint',
  hasComplaint: boolean = false
): { intent: AnnaUserIntent; isMedical: boolean; extractedSymptom?: string; targetLanguage?: string; rawIntent: ClassifiedIntent } {
  const result = IntentClassifier.classify(text, { currentSection, hasComplaint });

  let annaIntent: AnnaUserIntent = 'UNCLEAR_AMBIGUOUS';
  switch (result.intent) {
    case 'MEDICAL_COMPLAINT':
    case 'SYMPTOM':
    case 'MEDICAL':
      annaIntent = 'CLINICAL';
      break;
    case 'FOLLOW_UP':
      annaIntent = 'FOLLOW_UP';
      break;
    case 'CASUAL_CONVERSATION':
    case 'CASUAL':
      annaIntent = 'GENERAL_CONVERSATION';
      break;
    case 'GREETING':
      annaIntent = 'GREETING';
      break;
    case 'THANKS':
    case 'GOODBYE':
    case 'GRATITUDE':
      annaIntent = 'GRATITUDE_CLOSING';
      break;
    case 'MEDICATION':
      annaIntent = 'MEDICATION';
      break;
    case 'EMERGENCY':
      annaIntent = 'EMERGENCY';
      break;
    case 'HEALTH_INFORMATION':
    case 'EDUCATION':
      annaIntent = 'MEDICAL_EDUCATION';
      break;
    case 'MEDICAL_REPORT':
      annaIntent = 'REPORT_DOCUMENT';
      break;
    case 'APPOINTMENT':
    case 'DOCTOR':
    case 'HOSPITAL':
      annaIntent = 'APPOINTMENT_HOSPITAL';
      break;
    default:
      annaIntent = result.isMedical ? 'CLINICAL' : 'GENERAL_CONVERSATION';
  }

  return {
    intent: annaIntent,
    isMedical: result.isMedical,
    extractedSymptom: result.extractedSymptom,
    targetLanguage: result.targetLanguage,
    rawIntent: result,
  };
}

/**
 * Generate friendly, non-medical conversational response
 */
export function getCasualConversationalReply(
  text: string,
  intent: AnnaUserIntent,
  lang: string,
  isHinglish?: boolean
): { reply: string; quickOptions: string[]; newLanguage?: string } {
  const classified = IntentClassifier.classify(text);
  return IntentClassifier.getConversationalResponse(text, classified, lang, isHinglish);
}

export function isNonMedicalQuery(text: string): boolean {
  return !IntentClassifier.isMedical(text);
}

export function getNonMedicalRefusal(lang: string, isHinglish?: boolean): string {
  if (isHinglish) {
    return 'Main sirf aapki health aur medical information mein help kar sakti hoon. Aap apni health problem ya lakshan batayein.';
  }
  switch (lang) {
    case 'hi':
      return 'मैं आपकी एआई क्लिनिकल इंटेक सहायक अन्ना हूँ। मैं केवल आपके स्वास्थ्य, लक्षणों, दवाओं और डॉक्टर परामर्श से संबंधित जानकारी में ही मदद कर सकती हूँ। कृपया मुझे अपनी स्वास्थ्य समस्या के बारे में बताएं।';
    case 'mr':
      return 'मी तुमची एआय क्लिनिकल सहाय्यक अण्णा आहे. मी फक्त तुमच्या आरोग्याच्या तक्रारी, लक्षणे, औषधे आणि डॉक्टर तपासणीसाठी मदत करू शकते. कृपया तुमच्या आरोग्याच्या समस्येबद्दल सांगा.';
    case 'bn':
      return 'আমি আপনার এআই ক্লিনিকাল সহকারী আন্না। আমি শুধুমাত্র আপনার স্বাস্থ্য, লক্ষণ, ওষুধ এবং ডাক্তারের পরামর্শ সম্পর্কিত তথ্যে সাহায্য করতে পারি। অনুগ্রহ করে আপনার স্বাস্থ্য সমস্যা বলুন।';
    case 'ta':
      return 'நான் உங்கள் மருத்துவ உதவியாளர் அன்னா. உங்கள் உடல்நலம், அறிகுறிகள், மருந்துகள் மற்றும் மருத்துவ ஆலோசனை விவரங்களுக்கு மட்டுமே என்னால் உதவ முடியும். தயவுசெய்து உங்கள் உடல்நலப் பிரச்சனையை தெரிவிக்கவும்.';
    case 'te':
      return 'నేను మీ ఏఐ క్లినికల్ అసిస్టెంట్ అన్నాను. నేను మీ ఆరోగ్యం, లక్షణాలు, మందులు మరియు వైద్యుల సంప్రదింపులకు సంబంధించిన సమాచారంలో మాత్రమే సహాయపడగలను. దయచేసి మీ ఆరోగ్య సమస్యను చెప్పండి.';
    case 'gu':
      return 'હું તમારી એઆઈ ક્લિનિકલ સહાયક અન્ના છું. હું ફક્ત તમારા સ્વાસ્થ્ય, લક્ષણો, દવાઓ અને ડૉક્ટર પરામર્શ સંબંધિત માહિતીમાં મદદ કરી શકું છું. કૃપા કરીને તમારી સ્વાસ્થ્ય સમસ્યા જણાવો.';
    case 'es':
      return 'Soy Anna, su asistente clínica de IA. Solo puedo ayudarle con información sobre su salud, síntomas, medicamentos y consulta médica. Por favor, cuénteme sobre su problema de salud.';
    case 'fr':
      return 'Je suis Anna, votre assistante clinique IA. Je peux uniquement vous aider pour vos problèmes de santé, symptômes, médicaments et consultation médicale. Veuillez me parler de votre problème de santé.';
    case 'de':
      return 'Ich bin Anna, Ihre klinische KI-Assistentin. Ich kann nur bei Gesundheitsfragen, Symptomen, Medikamenten und der Vorbereitung auf Ihren Arztbesuch helfen. Bitte beschreiben Sie Ihre Beschwerden.';
    case 'ar':
      return 'أنا آنا، مساعدتكم الطبية للرعاية الصحية. يمكنني فقط مساعدتكم في الأعراض والتاريخ الصحي والأدوية ومعلومات استشارة الطبيب. يرجى إخباري بمشكلتكم الصحية.';
    default:
      return 'I am Anna, your AI clinical intake assistant. I can only assist with your health concerns, symptoms, medications, and details for your doctor consultation. Please tell me about your health problem.';
  }
}

/**
 * Speech Audio Generation via Gemini TTS (gemini-3.8-flash-lite-tts)
 * Includes circuit-breaker with graceful fallback to browser speech synthesis
 * to respect free-tier daily rate limits (10 requests/day).
 */
let ttsQuotaCooldownUntil = 0;

export function isTtsQuotaCooldown(): boolean {
  return Date.now() < ttsQuotaCooldownUntil;
}

export async function generateAnnaSpeech(text: string, voiceName: string = 'Kore'): Promise<{ audioBase64?: string; sampleRate: number; mimeType: string } | null> {
  // If recent calls hit quota or rate limit, fail fast to avoid latency and quota hammer
  if (Date.now() < ttsQuotaCooldownUntil) {
    return null;
  }

  const ai = getGenAiClient();
  if (!ai) return null;

  try {
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .slice(0, 600)
      .trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Clear, empathetic clinical assistant',
              },
            },
          ],
        },
      ] as any,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioBase64) {
      return {
        audioBase64,
        sampleRate: 24000,
        mimeType: 'audio/pcm;rate=24000',
      };
    }
  } catch (err: any) {
    const errMessage = String(err?.message || err || '');
    const isRateOrQuota =
      err?.status === 429 ||
      err?.code === 429 ||
      errMessage.includes('429') ||
      errMessage.includes('RESOURCE_EXHAUSTED') ||
      errMessage.includes('quota') ||
      errMessage.includes('Quota exceeded');

    if (isRateOrQuota) {
      // Cooldown for 5 minutes so subsequent utterances immediately and smoothly use native browser synthesis
      ttsQuotaCooldownUntil = Date.now() + 5 * 60 * 1000;
      console.info('[AnnaTTS] Gemini TTS free-tier daily quota reached; seamlessly routed to browser speech synthesis fallback.');
    } else {
      console.info('[AnnaTTS] Gemini TTS generation unavailable, using browser speech synthesis fallback:', err?.message || 'Offline/Unavailable');
    }
  }
  return null;
}

/**
 * Initialize Anna session for a patient with returning memory & past medication context
 */
export function initializeAnnaSession(patient: Patient, language: string = 'hi', mode: 'general' | 'ayush' = 'general'): ClinicalInterview {
  const db = getDatabase();
  const interviewId = `ANNA-${Date.now().toString().slice(-6)}`;

  // Find previous verified intakes or medical records for returning patient memory
  const previousIntake = (db.intakes || []).find(i => i.patientId === patient.id && (i.status === 'VERIFIED' || i.status === 'READY_FOR_REVIEW'));
  const hasPreviousHistory = !!previousIntake || ((patient as any).previousVisits && (patient as any).previousVisits.length > 0);

  let initialGreeting = '';
  let quickOptions: string[] = [];

  if (hasPreviousHistory) {
    const prevChief = previousIntake?.chiefComplaint || (patient as any).previousVisits?.[0]?.diagnosis || 'your previous health consultation';
    const prevMeds = previousIntake?.medications?.map(m => m.name).join(', ') || '';

    if (language === 'hi') {
      initialGreeting = `नमस्ते ${patient.name}! मैं अन्ना हूँ, आपकी एआई क्लिनिकल इंटेक सहायक। आपके पिछले रिकॉर्ड के अनुसार, आप '${prevChief}' के लिए परामर्श ले रहे थे${prevMeds ? ` और आपको ${prevMeds} दी गई थी` : ''}। दवा के बाद अब आप कैसा महसूस कर रहे हैं, और आज डॉक्टर से किस समस्या पर बात करना चाहते हैं?`;
      quickOptions = [
        'दवा से आराम है, नई समस्या है',
        'पिछली समस्या अभी भी जारी है',
        'दवा के बाद नया लक्षण महसूस हो रहा है',
        'नियमित स्वास्थ्य जांच / परामर्श',
      ];
    } else if (language === 'mr') {
      initialGreeting = `नमस्कार ${patient.name}! मी अण्णा आहे, तुमची एआई क्लिनिकल सहाय्यक. तुमच्या मागील नोंदीनुसार, तुम्ही '${prevChief}' साठी आला होता${prevMeds ? ` आणि आपल्याला ${prevMeds} दिली होती` : ''}। आता आपली तब्येत कशी आहे, आणि आज कोणत्या त्रासाबद्दल डॉक्टरांशी बोलायचे आहे?`;
      quickOptions = [
        'औषधाने आराम आहे, नवीन त्रास आहे',
        'मागील त्रास अजूनही सुरू आहे',
        'औषधानंतर काही नवीन त्रास होतोय',
        'नियमित तपासणी',
      ];
    } else if (language === 'es') {
      initialGreeting = `¡Hola ${patient.name}! Soy Anna, su asistente clínica de IA. Según sus registros anteriores, consultó por '${prevChief}'${prevMeds ? ` y se le recetó ${prevMeds}` : ''}. ¿Cómo se ha sentido desde entonces y qué síntoma desea tratar con el médico hoy?`;
      quickOptions = [
        'Ha mejorado, tengo un problema nuevo',
        'El problema anterior continúa',
        'Siento síntomas después del medicamento',
        'Revisión o control de rutina',
      ];
    } else {
      initialGreeting = `Hello ${patient.name}! I am Anna, your AI clinical intake assistant. According to your verified records, you previously consulted for '${prevChief}'${prevMeds ? ` and were prescribed ${prevMeds}` : ''}. How have you been feeling since then, and what health concern brings you to the doctor today?`;
      quickOptions = [
        'Condition improved, have a new concern',
        'Previous condition still persists',
        'Experiencing new symptoms after medication',
        'Routine follow-up / checkup',
      ];
    }
  } else {
    // New patient greeting
    if (language === 'hi') {
      initialGreeting = `नमस्ते ${patient.name}! मैं अन्ना हूँ, आपकी एआई क्लिनिकल इंटेक सहायक। आज आप अपने डॉक्टर को किस मुख्य स्वास्थ्य समस्या या लक्षण के बारे में बताना चाहते हैं?`;
      quickOptions = ['सीने में दर्द या भारीपन', 'तेज बुखार और ठंड', 'सांस लेने में तकलीफ', 'पेट में दर्द या अपच', 'जोड़ों या बदन में दर्द', 'दवाइयों की समीक्षा'];
    } else if (language === 'mr') {
      initialGreeting = `नमस्कार ${patient.name}! मी अण्णा आहे, तुमची एआई क्लिनिकल सहाय्यक. आज तुम्ही डॉक्टरांना कोणत्या मुख्य त्रासाबद्दल किंवा लक्षणांबद्दल सांगू इच्छिता?`;
      quickOptions = ['छातीत दुखणे किंवा जडपणा', 'तीव्र ताप आणि थंडी', 'श्वास घेण्यास त्रास', 'पोटात दुखणे किंवा ॲसिडिटी', 'सांधेदुखी किंवा अंगदुखी'];
    } else if (language === 'es') {
      initialGreeting = `¡Hola ${patient.name}! Soy Anna, su asistente clínica de IA. ¿Cuál es el síntoma o motivo principal de su consulta con el médico hoy?`;
      quickOptions = ['Dolor en el pecho o malestar', 'Fiebre alta y escalofríos', 'Dificultad para respirar', 'Dolor de estómago o acidez', 'Dolor articular o muscular'];
    } else {
      initialGreeting = `Hello ${patient.name}! I am Anna, your AI clinical intake assistant. What main symptom or health concern would you like to discuss with the doctor today?`;
      quickOptions = ['Chest Discomfort / Pain', 'High Fever & Chills', 'Shortness of Breath', 'Stomach Pain / Acidity', 'Joint / Musculoskeletal Pain', 'Routine Health Check'];
    }
  }

  const initialMsg: InterviewMessage = {
    id: `MSG-01`,
    interviewId,
    sender: 'bot',
    message: initialGreeting,
    timestamp: new Date().toISOString(),
    language,
    questionCategory: 'chief_complaint',
    quickOptions,
    allowsVoice: true,
    allowsSkip: false,
  };

  const newInterview: ClinicalInterview = {
    id: interviewId,
    patientId: patient.id,
    language,
    startedAt: new Date().toISOString(),
    status: 'IN_PROGRESS',
    currentSection: 'chief_complaint',
    chiefComplaint: '',
    hpi: {},
    reviewOfSystems: {},
    pastHistory: [],
    surgicalHistory: [],
    hospitalizationHistory: [],
    drugHistory: [],
    allergies: [],
    familyHistory: [],
    personalHistory: { diet: 'Regular / Home-cooked meals', sleep: '7-8 hours average' },
    ayurvedaHistory: mode === 'ayush' ? { prakriti: 'Pitta-Vata', agni: 'Samagni' } : undefined,
    redFlags: [],
    documents: [],
    completionScore: 15,
    messages: [initialMsg],
  };

  db.interviews = db.interviews || [];
  db.interviews.unshift(newInterview);
  saveDatabase();

  logAudit('Anna AI Clinical Assistant', 'PATIENT', 'ANNA_INTAKE_STARTED', interviewId, `Anna clinical intake started for ${patient.name} (${language})`);
  return newInterview;
}

/**
 * Process a conversational intake turn with Anna (Gemini-powered with robust multilingual clinical fallback)
 */
export async function processAnnaTurn(params: {
  interviewId: string;
  message: string;
  inputType: 'voice' | 'text';
  requestedLanguage?: string;
}): Promise<{
  interview: ClinicalInterview;
  nextMessage: InterviewMessage;
  detectedLanguage: string;
  redFlagsTriggered: RedFlagAlert[];
  priority: 'ROUTINE' | 'PRIORITY' | 'URGENT';
}> {
  const db = getDatabase();
  const interview = (db.interviews || []).find(i => i.id === params.interviewId);
  if (!interview) {
    throw new Error('Clinical interview session not found');
  }

  const patient = db.patients.find(p => p.id === interview.patientId);
  const text = (params.message || '').trim();
  const currentLang = params.requestedLanguage && params.requestedLanguage !== 'auto'
    ? params.requestedLanguage
    : interview.language || 'en';

  // Check if text is Hinglish
  const isHinglish = /\b(mujhe|mera|meri|dard|bukhar|sirdard|pet|chhati|khansi|saans|goli|dawa|hai|hain|tha|thi|din\s*se|ho\s*raha|kya|kyun|kaise|khaogi|khao|khana|theek|achha|biryani)\b/i.test(text);

  // 1. Append patient's message to interview log
  const userMsg: InterviewMessage = {
    id: `MSG-${Date.now()}-u`,
    interviewId: interview.id,
    sender: 'patient',
    message: text,
    timestamp: new Date().toISOString(),
    language: currentLang,
  };
  interview.messages.push(userMsg);

  // 2. Strict Deterministic Intent Classification Gate
  const intentCheck = classifyMessageIntent(text, interview.currentSection, !!interview.chiefComplaint);

  // If casual chit-chat, greeting, small talk, language change, or medical education inquiry without personal complaint:
  if (!intentCheck.isMedical) {
    const casualRes = getCasualConversationalReply(text, intentCheck.intent, currentLang, isHinglish);
    let effectiveLang = currentLang;

    // Handle language switch
    if (casualRes.newLanguage) {
      effectiveLang = casualRes.newLanguage;
      interview.language = casualRes.newLanguage;
    }

    // If family history mentioned, safely note it without registering as patient's complaint
    if (intentCheck.rawIntent?.isFamilyHistory) {
      interview.familyHistory = interview.familyHistory || [];
      interview.familyHistory.push({
        condition: text,
        relationship: 'Family member',
      });
    }

    const botCasualMsg: InterviewMessage = {
      id: `MSG-${Date.now()}-b`,
      interviewId: interview.id,
      sender: 'bot',
      message: casualRes.reply,
      timestamp: new Date().toISOString(),
      language: effectiveLang,
      questionCategory: interview.currentSection,
      quickOptions: casualRes.quickOptions,
      allowsVoice: true,
      allowsSkip: true,
    };

    interview.messages.push(botCasualMsg);
    saveDatabase();

    return {
      interview,
      nextMessage: botCasualMsg,
      detectedLanguage: effectiveLang,
      redFlagsTriggered: interview.redFlags,
      priority: interview.redFlags.some(r => r.severity === 'CRITICAL') ? 'URGENT' : 'ROUTINE',
    };
  }

  // 3. Red-Flag & Safety Detection on cumulative text
  const safetyCheck = checkRedFlags(`${interview.chiefComplaint || ''} ${text}`);
  const newRedFlags: RedFlagAlert[] = [];

  if (safetyCheck.triggered) {
    for (const item of safetyCheck.alerts) {
      if (!interview.redFlags.some(r => r.ruleTriggered === item.name)) {
        const alert: RedFlagAlert = {
          alertId: `ALT-${Date.now().toString().slice(-6)}`,
          patientId: interview.patientId,
          intakeId: interview.intakeId || `INT-${interview.patientId}`,
          patientName: patient ? patient.name : 'Patient',
          token: patient ? patient.token : 'TK-100',
          ruleTriggered: item.name,
          severity: item.severity,
          createdAt: new Date().toISOString(),
          status: 'UNREVIEWED',
          symptomSummary: item.symptomSummary,
        };
        interview.redFlags.push(alert);
        db.redFlagAlerts = db.redFlagAlerts || [];
        db.redFlagAlerts.unshift(alert);
        newRedFlags.push(alert);
        logAudit('Anna Safety Guard', 'SYSTEM', 'RED_FLAG_TRIGGERED', alert.alertId, `Critical symptom flagged: ${item.name}`);
      }
    }
  }

  // 4. Try Gemini-powered clinical intake response
  let botReply = '';
  let quickOptions: string[] = [];
  let nextCategory = interview.currentSection;
  let detectedLang = currentLang;

  const ai = getGenAiClient();
  let aiSuccess = false;

  if (ai) {
    try {
      const prompt = `You are Anna, an AI Clinical Intake Assistant for MediKiosk (Maharashtra Public Health).
Role: Conduct a conversational, empathetic medical history intake for a doctor consultation.
Patient Info: Name: ${patient?.name || 'Patient'}, Age: ${patient?.age || 'Adult'}, Gender: ${patient?.gender || 'Unknown'}.
Current Section: ${interview.currentSection}
Chief Complaint so far: "${interview.chiefComplaint || 'None reported yet'}"
HPI details so far: ${JSON.stringify(interview.hpi)}
Past History so far: ${interview.pastHistory.join(', ') || 'None'}
Medications so far: ${interview.drugHistory.map(m => m.name).join(', ') || 'None'}
Allergies: ${interview.allergies.map(a => a.substance).join(', ') || 'None'}
Uploaded Documents: ${interview.documents.map(d => d.name).join(', ') || 'None'}
Patient just said: "${text}"

MANDATORY INTENT & CLINICAL SAFETY RULES:
1. Intent Classification:
   - "CASUAL_CHITCHAT": Small talk, food (e.g. biryani, chai, khana), jokes, weather, general comments.
   - "GREETING": Hello, hi, how are you, namaste.
   - "GRATITUDE_CLOSING": Thank you, bye, okay.
   - "MEDICAL_EDUCATION": General medical explanation without personal symptoms (e.g. "What does diabetes mean?").
   - "CLINICAL_COMPLAINT": Patient explicitly reports their own symptom, discomfort, or illness.
   - "MEDICATION": Reporting current medicines or dosage.
   - "REPORT_DOCUMENT": Lab or diagnostic readings.
   - "INTERVIEW_ANSWER": Patient answering previous clinical intake question.
   - "EMERGENCY": Critical red-flag emergency symptoms.

2. NEVER convert casual words (like "biryani", "food", "cricket", "weather") into a disease or symptom!
   - BAD: "Aapne biryani ki samasya batayi hai. Ye bimari aapko kab se hai?" -> STRICTLY PROHIBITED!
   - GOOD: "😄 Main khana nahi kha sakti, lekin biryani ka naam sunke bhookh zaroor yaad aa gayi! Waise agar aapko koi health-related problem hai to bata sakte hain."
3. If intent is non-medical (CASUAL_CHITCHAT, GREETING, GRATITUDE_CLOSING, MEDICAL_EDUCATION):
   - Set "isMedical": false
   - Set "extractedChiefComplaint": null
   - Set "nextSection": remain at currentSection ("${interview.currentSection}")
   - Do NOT ask clinical HPI questions (e.g. when did it start, how severe).
4. If intent is CLINICAL_COMPLAINT:
   - Set "isMedical": true
   - Set "extractedChiefComplaint": clean medical term (e.g. "Stomach pain / Abdominal discomfort", "Fever", "Severe headache").
   - Ask 1-2 focused questions about onset, duration, or severity.
5. NEVER diagnose illnesses independently.
6. NEVER prescribe medicines or recommend stopping/changing medication.
7. LANGUAGE CONSISTENCY: Reply in the EXACT SAME LANGUAGE and script the patient typed or spoke (Hindi Devanagari -> Hindi; Hinglish -> natural Hinglish; Marathi -> Marathi; Bengali -> Bengali; Spanish -> Spanish; English -> English).
8. Tone: Empathetic, respectful, professional, simple (no difficult medical jargon).

Output MUST be valid JSON with this exact schema:
{
  "intent": "CASUAL_CHITCHAT" | "GREETING" | "GRATITUDE_CLOSING" | "MEDICAL_EDUCATION" | "CLINICAL_COMPLAINT" | "MEDICATION" | "REPORT_DOCUMENT" | "INTERVIEW_ANSWER" | "EMERGENCY",
  "isMedical": boolean,
  "reply": "Your conversational response",
  "detectedLanguage": "code like 'en', 'hi', 'mr', 'es', 'bn'",
  "quickOptions": ["Option 1", "Option 2", "Option 3"],
  "nextSection": "chief_complaint" | "hpi" | "past_history" | "medications_allergies" | "family_lifestyle" | "review",
  "extractedChiefComplaint": "string or null",
  "hpiOnset": "string or null",
  "hpiSeverity": "string or null",
  "medicationMentioned": "string or null",
  "allergyMentioned": "string or null"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text?.trim() || '';
      if (responseText) {
        const parsed = JSON.parse(responseText);
        botReply = parsed.reply || '';
        quickOptions = Array.isArray(parsed.quickOptions) ? parsed.quickOptions : [];
        if (parsed.nextSection) nextCategory = parsed.nextSection;
        if (parsed.detectedLanguage) detectedLang = parsed.detectedLanguage;

        // Post-AI Safety Guard: Only record clinical complaint if intent is truly medical
        if (parsed.isMedical && (parsed.intent === 'CLINICAL_COMPLAINT' || parsed.intent === 'EMERGENCY')) {
          if (parsed.extractedChiefComplaint && !interview.chiefComplaint) {
            interview.chiefComplaint = parsed.extractedChiefComplaint;
          }
        } else if (!parsed.isMedical || ['CASUAL_CHITCHAT', 'GREETING', 'GRATITUDE_CLOSING', 'MEDICAL_EDUCATION'].includes(parsed.intent)) {
          // Strictly prevent setting chief complaint or advancing section on casual remarks
          parsed.extractedChiefComplaint = null;
          nextCategory = interview.currentSection;
        }

        if (parsed.isMedical) {
          if (parsed.hpiOnset) interview.hpi.onset = parsed.hpiOnset;
          if (parsed.hpiSeverity) interview.hpi.severity = parsed.hpiSeverity;
          if (parsed.medicationMentioned && !interview.drugHistory.some(d => d.name.toLowerCase() === parsed.medicationMentioned.toLowerCase())) {
            interview.drugHistory.push({
              name: parsed.medicationMentioned,
              dosage: 'Regular',
              frequency: 'Daily',
              source: 'Patient verbal intake',
              verificationStatus: 'Patient Reported',
            });
          }
          if (parsed.allergyMentioned && !interview.allergies.some(a => a.substance.toLowerCase() === parsed.allergyMentioned.toLowerCase())) {
            interview.allergies.push({
              substance: parsed.allergyMentioned,
              reaction: 'Patient reported adverse sensitivity',
              source: 'Patient verbal intake',
              verificationStatus: 'Patient Reported',
            });
          }
        }

        aiSuccess = true;
      }
    } catch (err: any) {
      const errMessage = String(err?.message || err || '');
      const isQuota =
        err?.status === 429 ||
        err?.code === 429 ||
        errMessage.includes('429') ||
        errMessage.includes('RESOURCE_EXHAUSTED') ||
        errMessage.includes('quota');
      if (isQuota) {
        console.info('[AnnaIntake] Conversational model quota limit active, smoothly using rule-based clinical engine.');
      } else {
        console.info('[AnnaIntake] Conversational turn handled by clinical rules engine:', err?.message || 'Fallback');
      }
    }
  }

  // 5. Fallback Clinical Rules Engine if Gemini is offline or failed
  if (!aiSuccess || !botReply) {
    const fallbackIntent = classifyMessageIntent(text, interview.currentSection, !!interview.chiefComplaint);

    if (!fallbackIntent.isMedical) {
      const casual = getCasualConversationalReply(text, fallbackIntent.intent, currentLang, isHinglish);
      botReply = casual.reply;
      quickOptions = casual.quickOptions;
    } else if (interview.currentSection === 'chief_complaint') {
      const symptomName = fallbackIntent.extractedSymptom || (EXPLICIT_SYMPTOM_REGEX.test(text) ? text : 'General Outpatient Health Consultation');
      interview.chiefComplaint = symptomName;
      interview.currentSection = 'hpi';
      interview.completionScore = 35;

      if (currentLang === 'hi' || isHinglish) {
        botReply = isHinglish
          ? `Dhanyawad. Aapne '${symptomName}' bataya hai. Ye problem kab se shuru hui, aur kya ye lagatar ho rahi hai ya ruk-ruk kar?`
          : `धन्यवाद। आपने '${symptomName}' बताया है। यह समस्या कब से शुरू हुई, और क्या यह लगातार हो रही है या समय-समय पर?`;
        quickOptions = ['आज ही शुरू हुई (कुछ घंटे पहले)', '1 से 2 दिन पहले', 'लगभग 1 हफ्ते से', '1 महीने से अधिक समय से'];
      } else if (currentLang === 'mr') {
        botReply = `धन्यवाद। आपण सांगितल्याप्रमाणे '${symptomName}'. हा त्रास नेमका कधीपासून सुरू झाला, आणि त्रास अचानक सुरू झाला की हळूहळू?`;
        quickOptions = ['आजच काही तासांपूर्वी', '१ ते २ दिवसांपूर्वी', 'सुमारे आठवडाभरापासून', '१ महिन्यापेक्षा जास्त'];
      } else if (currentLang === 'es') {
        botReply = `Gracias. Ha indicado '${symptomName}'. ¿Cuándo comenzó este malestar y se presenta de forma continua o intermitente?`;
        quickOptions = ['Comenzó hoy', 'Hace 1 o 2 días', 'Hace una semana', 'Más de un mes'];
      } else {
        botReply = `Thank you. You noted '${symptomName}'. When did this problem begin, and did it start suddenly or gradually?`;
        quickOptions = ['Started today (a few hours ago)', '1 to 2 days ago', 'About a week ago', 'Over a month ago'];
      }
    } else if (interview.currentSection === 'hpi') {
      if (!interview.hpi.onset) {
        interview.hpi.onset = text;
        interview.completionScore = 50;

        if (currentLang === 'hi' || isHinglish) {
          botReply = isHinglish
            ? 'Takleef ki severity 0 se 10 scale par kitni hai? Aur kya iske saath sweating, ulti, ya chakkar jaise lakshan bhi hain?'
            : 'तकलीफ की तीव्रता 0 से 10 के पैमाने पर कितनी है? (0 = बिल्कुल दर्द नहीं, 10 = असहनीय दर्द)। क्या इसके साथ कोई अन्य लक्षण (जैसे पसीना, उल्टी, या चक्कर) भी है?';
          quickOptions = ['हल्का (1 - 3)', 'मध्यम (4 - 6)', 'तीव्र (7 - 9)', 'अत्यधिक तीव्र (10/10)'];
        } else if (currentLang === 'mr') {
          botReply = 'त्रासाची तीव्रता ० ते १० च्या प्रमाणात किती आहे? (० = अजिबात नाही, १० = असह्य त्रास). सोबत घाम येणे, मळमळ किंवा चक्कर येणे असे काही होते का?';
          quickOptions = ['कमी (१ - ३)', 'मध्यम (४ - ६)', 'जास्त (७ - ९)', 'फार तीव्र (१०/१०)'];
        } else {
          botReply = 'On a scale from 0 to 10, how severe is this discomfort? Are there any associated symptoms such as sweating, nausea, breathlessness, or dizziness?';
          quickOptions = ['Mild (1 - 3)', 'Moderate (4 - 6)', 'Severe (7 - 9)', 'Very Severe (10/10)'];
        }
      } else {
        interview.hpi.severity = text;
        interview.currentSection = 'past_history';
        interview.completionScore = 65;

        // Check if chest pain radiation
        const isChest = (interview.chiefComplaint || '').toLowerCase().includes('chest') || (interview.chiefComplaint || '').toLowerCase().includes('chhati');
        if (isChest) {
          botReply = currentLang === 'hi' || isHinglish
            ? (isHinglish ? 'Kya ye dard left arm, shoulder ya jaw ki taraf failta hai? Aur kya chalne-firne se badhta hai?' : 'क्या यह दर्द बाएं कंधे, हाथ, गर्दन या जबड़े की तरफ फैलता है? और क्या चलने-फिरने से दर्द बढ़ता है?')
            : 'Does the discomfort spread to your left arm, shoulder, neck, or jaw? Does it worsen with exertion or walking?';
          quickOptions = ['Yes, radiates to left arm/shoulder', 'Yes, worsens with walking', 'No, localized in chest only', 'Relieved by resting'];
        } else {
          botReply = currentLang === 'hi' || isHinglish
            ? (isHinglish ? 'Kya aapko pehle se koi bimari (BP, diabetes, thyroid, asthma) hai ya koi surgery hui hai?' : 'क्या आपको पहले से कोई बीमारी (जैसे हाई बीपी, शुगर/मधुमेह, थायराइड, दमा) है या कोई पूर्व सर्जरी हुई है?')
            : 'Do you have any diagnosed medical conditions (such as high blood pressure, diabetes, thyroid, asthma) or prior surgeries?';
          quickOptions = ['High Blood Pressure (BP)', 'Diabetes (Sugar)', 'Heart Disease / Stent', 'Asthma / Respiratory', 'No diagnosed conditions'];
        }
      }
    } else if (interview.currentSection === 'past_history') {
      interview.pastHistory.push(text);
      interview.currentSection = 'medications_allergies';
      interview.completionScore = 80;

      botReply = currentLang === 'hi' || isHinglish
        ? (isHinglish ? 'Aap rozana kaun si medicine lete hain? Aur kya kisi dawa ya khane se koi allergy hai? (Aap prescription ka photo bhi upload kar sakte hain)' : 'क्या आप रोजाना कोई दवाई लेते हैं? और क्या आपको किसी दवा (जैसे पेनिसिलिन) या खाने से कोई एलर्जी है? (यदि पर्ची है, तो आप कैमरा/अपलोड बटन से स्कैन कर सकते हैं)')
        : 'What daily medicines do you take, and do you have any drug or food allergies? (Tip: You can also tap the camera/upload icon to scan your prescription!)';
      quickOptions = ['Blood Pressure medicine daily', 'Diabetes medication daily', 'Penicillin allergy', 'No daily meds or allergies'];
    } else if (interview.currentSection === 'medications_allergies') {
      const lower = text.toLowerCase();
      if (lower.includes('allerg') || lower.includes('एलर्जी') || lower.includes('penicillin')) {
        interview.allergies.push({ substance: text, reaction: 'Reported adverse reaction', source: 'Patient verbal intake', verificationStatus: 'Patient Reported' });
      } else if (!lower.includes('no') && !lower.includes('none') && !lower.includes('nahi') && !lower.includes('नाही')) {
        interview.drugHistory.push({ name: text, dosage: 'Regular', frequency: 'Daily', source: 'Patient verbal intake', verificationStatus: 'Patient Reported' });
      }

      interview.currentSection = 'family_lifestyle';
      interview.completionScore = 90;

      botReply = currentLang === 'hi' || isHinglish
        ? (isHinglish ? 'Family mein kisi ko heart disease ya sugar hai? Aapka diet (veg/non-veg), sleep aur smoking/tobacco habit kaisi hai?' : 'क्या परिवार में किसी को दिल की बीमारी या शुगर का इतिहास है? आपका खान-पान, नींद और तंबाकू/धूम्रपान की आदत कैसी है?')
        : 'Is there a family history of early heart disease or diabetes? How are your diet, sleep, and physical habits?';
      quickOptions = ['Family history of Heart Disease', 'Family history of Diabetes', 'Vegetarian diet, normal sleep', 'Non-smoker, no tobacco'];
    } else {
      interview.personalHistory.diet = text;
      interview.currentSection = 'review';
      interview.completionScore = 100;

      botReply = currentLang === 'hi' || isHinglish
        ? (isHinglish ? 'Bohat dhanyawad! Aapki complete clinical history record kar li gayi hai. Kripya right side mein summary check karein aur doctor ke liye "Generate Clinical Report" par tap karein.' : 'बहुत धन्यवाद! आपका संपूर्ण क्लिनिकल विवरण एकत्र कर लिया गया है। कृपया सारांश की जांच करें और अपने डॉक्टर के लिए रिपोर्ट तैयार करने हेतु "रिपोर्ट बनाएं" पर टैप करें।')
        : 'Thank you! Your comprehensive clinical history has been captured. Please review your intake summary and tap "Generate Clinical Report" when you are ready.';
      quickOptions = ['Confirm & Generate Clinical Report', 'I want to add another detail'];
    }
  }

  // If critical red flag was newly detected, add emergency notice banner prefix
  if (newRedFlags.length > 0) {
    const warningPrefix = currentLang === 'hi' || isHinglish
      ? '⚠️ महत्वपूर्ण सूचना: आपके द्वारा बताए गए लक्षण तत्काल चिकित्सकीय समीक्षा की मांग कर सकते हैं। डॉक्टर व क्लिनिकल टीम को सूचित किया जा रहा है।\n\n'
      : currentLang === 'mr'
      ? '⚠️ तातडीची सूचना: आपण नमूद केलेले लक्षण तात्काळ डॉक्टरी तपासणीची आवश्यकता दर्शवितात. आरोग्य कर्मचाऱ्यांना सावध केले आहे.\n\n'
      : '⚠️ CLINICAL PRIORITY ALERT: Some of the symptoms you described require urgent medical evaluation. The healthcare team is being alerted.\n\n';

    botReply = warningPrefix + botReply;
  }

  // Section score progression
  const sectionScores: Record<string, number> = {
    chief_complaint: 25,
    hpi: 50,
    past_history: 70,
    medications_allergies: 85,
    family_lifestyle: 95,
    review: 100,
  };
  interview.completionScore = Math.max(interview.completionScore, sectionScores[interview.currentSection] || 60);

  const nextMsg: InterviewMessage = {
    id: `MSG-${Date.now()}-b`,
    interviewId: interview.id,
    sender: 'bot',
    message: botReply,
    timestamp: new Date().toISOString(),
    language: detectedLang,
    questionCategory: interview.currentSection,
    quickOptions,
    allowsVoice: true,
    allowsSkip: true,
    isRedFlagAlert: newRedFlags.length > 0,
  };

  interview.messages.push(nextMsg);
  saveDatabase();

  const isUrgent = interview.redFlags.some(r => r.severity === 'CRITICAL');
  const isPriority = interview.redFlags.length > 0 || String(interview.hpi?.severity || '').includes('Severe') || String(interview.hpi?.severity || '').includes('तीव्र');

  return {
    interview,
    nextMessage: nextMsg,
    detectedLanguage: detectedLang,
    redFlagsTriggered: interview.redFlags,
    priority: isUrgent ? 'URGENT' : isPriority ? 'PRIORITY' : 'ROUTINE',
  };
}

/**
 * Generate Structured Clinical Intake Summary & Report for Doctor
 */
export function generateAnnaClinicalReport(interviewId: string): ClinicalReport {
  const db = getDatabase();
  const interview = (db.interviews || []).find(i => i.id === interviewId);
  if (!interview) {
    throw new Error('Interview not found');
  }

  const patient = db.patients.find(p => p.id === interview.patientId);
  if (!patient) {
    throw new Error('Patient not found');
  }

  interview.status = 'COMPLETED';
  interview.completedAt = new Date().toISOString();
  interview.completionScore = 100;

  const chief = interview.chiefComplaint || 'General Outpatient Health Consultation';
  const isCritical = interview.redFlags.some(r => r.severity === 'CRITICAL');

  const medsList = interview.drugHistory.map(m => `${m.name} (${m.dosage || 'Regular'})`);
  const allergyList = interview.allergies.map(a => `${a.substance} (${a.reaction || 'Reaction'})`);

  const reportId = `REP-${Date.now().toString().slice(-6)}`;
  const report: ClinicalReport = {
    id: reportId,
    interviewId: interview.id,
    intakeId: interview.intakeId || `INT-${interview.id}`,
    patientId: patient.id,
    patientName: patient.name,
    age: patient.age,
    gender: patient.gender,
    token: patient.token,
    abhaId: patient.abhaId,
    chiefComplaint: chief,
    historyOfPresentIllness: `Onset: ${interview.hpi.onset || 'Reported at intake'}. Severity: ${interview.hpi.severity || 'Moderate'}. Description: ${interview.chiefComplaint}.`,
    pastMedicalHistory: interview.pastHistory,
    pastSurgicalHistory: (interview.surgicalHistory || []).map((s: any) => typeof s === 'string' ? s : s.surgery || 'Prior procedure'),
    hospitalizationHistory: (interview.hospitalizationHistory || []).map((h: any) => typeof h === 'string' ? h : h.reason || 'Hospital admission'),
    drugHistory: interview.drugHistory,
    allergies: interview.allergies,
    familyHistory: interview.familyHistory,
    personalHistory: interview.personalHistory,
    reviewOfSystems: interview.reviewOfSystems,
    ayurvedaAssessment: interview.ayurvedaHistory,
    documents: interview.documents,
    redFlags: interview.redFlags,
    generatedAt: new Date().toISOString(),
    status: 'AI_GENERATED',
    triagePriority: isCritical ? 'HIGH' : interview.redFlags.length > 0 ? 'NORMAL' : 'LOW',
    priorityScore: {
      score: isCritical ? 92 : interview.redFlags.length > 0 ? 68 : 34,
      category: isCritical ? 'Urgent' : interview.redFlags.length > 0 ? 'Priority' : 'Routine',
      factors: interview.redFlags.map(r => ({
        code: r.alertId || 'RF-01',
        factor: r.ruleTriggered,
        points: r.severity === 'CRITICAL' ? 40 : 20,
        explanation: r.symptomSummary || 'Clinical safety alert',
      })),
      calculatedAt: new Date().toISOString(),
    },
    summary: {
      quickClinicalSummary: `AI-Assisted Clinical Intake Summary: ${patient.name}, ${patient.age}y ${patient.gender}. Chief Complaint: ${chief}. Past History: ${interview.pastHistory.join(', ') || 'None reported'}. Current Medications: ${medsList.join(', ') || 'None'}. Allergies: ${allergyList.join(', ') || 'None reported'}.`,
      keyPointsForDoctor: [
        'AI-Assisted Pre-Consultation Summary — Attending doctor clinical verification required.',
        `Chief Complaint: ${chief}`,
        `Medications reported: ${medsList.join(', ') || 'None reported'}`,
        `Allergies: ${allergyList.join(', ') || 'No known drug allergies reported'}`,
        ...(interview.redFlags.map(r => `⚠️ Red Flag Triggered: ${r.ruleTriggered} (${r.severity})`)),
      ],
    },
  };

  db.clinicalReports = db.clinicalReports || [];
  db.clinicalReports.unshift(report);

  // Link to active Intake in database
  let intake = db.intakes.find(i => i.patientId === patient.id && i.status !== 'VERIFIED');
  if (intake) {
    intake.chiefComplaint = chief;
    intake.clinicalReportId = report.id;
    intake.status = isCritical ? 'RED_FLAG' : 'READY_FOR_REVIEW';
    intake.reportStatus = 'AWAITING_DOCTOR_REVIEW';
    intake.updatedAt = new Date().toISOString();
  }

  saveDatabase();
  logAudit('Anna AI Clinical Assistant', 'PATIENT', 'CLINICAL_REPORT_GENERATED', report.id, `Clinical intake report ${report.id} generated for ${patient.name}`);
  return report;
}
