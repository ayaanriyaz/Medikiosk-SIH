/**
 * IntentClassifier Utility
 * 
 * Deep Semantic Intent Classification & Conversation Engine for Anna:
 * 1. GREETING
 * 2. CASUAL_CONVERSATION
 * 3. MEDICAL_COMPLAINT
 * 4. SYMPTOM
 * 5. MEDICATION
 * 6. MEDICAL_REPORT
 * 7. DOCTOR
 * 8. HOSPITAL
 * 9. APPOINTMENT
 * 10. FOLLOW_UP
 * 11. CLINICAL_HISTORY
 * 12. EMERGENCY
 * 13. HEALTH_INFORMATION
 * 14. LANGUAGE_CHANGE
 * 15. HELP
 * 16. THANKS
 * 17. GOODBYE
 * 18. UNKNOWN
 *
 * Ensures:
 * - CONVERSATION FIRST. INTENT SECOND. MEDICAL INTERVIEW ONLY WHEN MEDICALLY RELEVANT.
 * - Negative statements ("I don't have fever", "bukhar nahi hai") are NOT false complaints.
 * - Family / third party mentions ("My mother has diabetes", "bhai ko bukhar hai") are NOT patient complaints.
 * - Normal casual phrases ("I like biryani", "went to a restaurant") are CASUAL chit-chat.
 */

export type UserIntentType =
  | 'GREETING'
  | 'CASUAL_CONVERSATION'
  | 'MEDICAL_COMPLAINT'
  | 'SYMPTOM'
  | 'MEDICATION'
  | 'MEDICAL_REPORT'
  | 'DOCTOR'
  | 'HOSPITAL'
  | 'APPOINTMENT'
  | 'FOLLOW_UP'
  | 'CLINICAL_HISTORY'
  | 'EMERGENCY'
  | 'HEALTH_INFORMATION'
  | 'LANGUAGE_CHANGE'
  | 'HELP'
  | 'THANKS'
  | 'GOODBYE'
  | 'UNKNOWN'
  // Legacy compatibility aliases
  | 'MEDICAL'
  | 'CASUAL'
  | 'GRATITUDE'
  | 'EDUCATION'
  | 'AMBIGUOUS';

export interface ClassifiedIntent {
  intent: UserIntentType;
  primaryIntent: UserIntentType;
  isMedical: boolean;
  isMedicalRelevant: boolean;
  confidence: number;
  subCategory?: string;
  extractedSymptom?: string;
  targetLanguage?: string;
  isNegativeStatement?: boolean;
  isFamilyHistory?: boolean;
  matchedPatterns: string[];
}

export interface IntentContext {
  currentSection?: string;
  hasComplaint?: boolean;
  activeInterview?: boolean;
  currentLanguage?: string;
}

// 1. Critical Red-Flag Emergency Indicators
const EMERGENCY_PATTERNS = [
  { pattern: /\b(chest\s*pain|angina|heart\s*attack|chhati\s*(?:me|t)\s*dard|seene\s*me\s*dard|छाती(त|मध्ये|\s*में)\s*(दुखणे|कळ|दर्द)|છાતીમાં\s*દુખાવો)\b/i, label: 'chest_pain' },
  { pattern: /\b(radiat(ing|es?)\s*to\s*(left\s*arm|jaw|back|shoulder)|left\s*arm\s*pain|haath\s*me\s*dard|डाव्या\s*हातात\s*कळ)\b/i, label: 'pain_radiation' },
  { pattern: /\b(severe\s*shortness\s*of\s*breath|cannot\s*breathe|saans\s*nahi\s*aa\s*rahi|suffocat(ing|ion)|श्वास\s*घेता\s*येत\s*नाही|दम\s*लागणे|দম\s*বন্ধ)\b/i, label: 'respiratory_distress' },
  { pattern: /\b(sudden\s*numbness|facial\s*droop|slurred\s*speech|stroke|paralysis|ek\s*taraf\s*kamzori|lakwa|पक्षाघात|लकवा)\b/i, label: 'stroke_symptoms' },
  { pattern: /\b(coughing\s*up\s*blood|vomiting\s*blood|khoon\s*ki\s*ulti|hematemesis|hemoptysis|रक्ताची\s*उलटी|थुंकीतून\s*रक्त)\b/i, label: 'hemorrhage' },
  { pattern: /\b(unconscious|fainted|loss\s*of\s*consciousness|behosh|chitt\s*ho\s*jana|बेहोश|भोवळ\s*येऊन\s*पडणे)\b/i, label: 'syncope' },
  { pattern: /\b(suicid(al|e)|kill\s*myself|end\s*my\s*life|marne\s*ka\s*mann|आत्महत्या)\b/i, label: 'crisis' },
];

// 2. Language Change Indicators
const LANGUAGE_CHANGE_PATTERNS: Array<{ regex: RegExp; lang: string; langName: string }> = [
  { regex: /\b(?:speak|talk|baat|bolo|bol|sang|switch|change|translate|convert)\b.*\b(?:marathi|marathit|मराठी)\b/i, lang: 'mr', langName: 'Marathi' },
  { regex: /\b(?:marathi\s*(?:madhe|t)\s*(?:bola|sang|bol)|मराठीत\s*बोला|मराठी\s*करा)\b/i, lang: 'mr', langName: 'Marathi' },
  { regex: /\b(?:speak|talk|baat|bolo|bol|switch|change)\b.*\b(?:hindi|hindustani|हिंदी|हिन्दी)\b/i, lang: 'hi', langName: 'Hindi' },
  { regex: /\b(?:hindi\s*mein\s*baat\s*karo|हिंदी\s*में\s*बोलो|हिंदी\s*करा)\b/i, lang: 'hi', langName: 'Hindi' },
  { regex: /\b(?:speak|talk|baat|bolo|bol|switch|change)\b.*\b(?:english|angrezi|इंग्रजी|अंग्रेजी)\b/i, lang: 'en', langName: 'English' },
  { regex: /\b(?:english\s*(?:mein|madhe)\s*(?:baat|bolo|speak)|talk\s*in\s*english|in\s*english)\b/i, lang: 'en', langName: 'English' },
  { regex: /\b(?:speak|talk|switch|change)\b.*\b(?:bengali|bangla|বাংলা)\b/i, lang: 'bn', langName: 'Bengali' },
  { regex: /\b(?:speak|talk|switch|change)\b.*\b(?:tamil|தமிழ்)\b/i, lang: 'ta', langName: 'Tamil' },
  { regex: /\b(?:speak|talk|switch|change)\b.*\b(?:telugu|తెలుగు)\b/i, lang: 'te', langName: 'Telugu' },
  { regex: /\b(?:speak|talk|switch|change)\b.*\b(?:gujarati|ગુજરાતી)\b/i, lang: 'gu', langName: 'Gujarati' },
  { regex: /\b(?:speak|talk|switch|change)\b.*\b(?:kannada|ಕನ್ನಡ)\b/i, lang: 'kn', langName: 'Kannada' },
  { regex: /\b(?:speak|talk|switch|change)\b.*\b(?:punjabi|ਪੰਜਾਬੀ)\b/i, lang: 'pa', langName: 'Punjabi' },
  { regex: /\b(?:speak|talk|switch|change)\b.*\b(?:urdu|اردو)\b/i, lang: 'ur', langName: 'Urdu' },
];

// 3. Negative Statements Indicators
const NEGATION_PREFIX_REGEX = /\b(no|not|don't|dont|do\s*not|never|neither|nahi|nahin|nahi\s*hai|nahi\s*tha|naahi|नाही|नाहीत|होते|नाहीं|न|bilkul\s*nahi)\b/i;

// 4. Third-party / Family History Indicators
const THIRD_PARTY_FAMILY_REGEX = /\b(mother|father|brother|sister|son|daughter|uncle|aunt|cousin|grandfather|grandmother|dadi|dada|nani|nana|mummy|papa|bhai|behen|dost|friend|neighbour|padosi|bhabhi|pati|patni|wife|husband|aai|vadil|bhau|bahin|आई|वडील|भाऊ|बहीण|दोस्त|माता|पिता|भाई|बहन)\b/i;

// 5. Medical Reports / Lab Document Processing Indicators
const MEDICAL_REPORT_REGEX = /\b(report|reports|blood\s*test|cbc|lft|kft|xray|x-ray|mri|ct\s*scan|ultrasound|ecg|sonography|prescription|parcha|discharge\s*summary|glucose\s*reading|sugar\s*level|bp\s*reading|test\s*result|document|upload|samjhao|explain\s*report)\b|(?:अहवाल|तपासणी\s*अहवाल|रक्त\s*तपासणी|एक्सरे|सोनोग्राफी|सिटिस्कॅन|प्रिस्क्रिप्शन|पर्चा|रिपोर्ट)/i;

// 6. Appointment / Doctor / Hospital Facility Indicators
const APPOINTMENT_REGEX = /\b(appointment|book\s*appointment|token|token\s*number|queue|wait\s*time|opd\s*timing|milna\s*hai|doctor\s*kab\s*baithenge|bhetaycha\s*ahe|doctor\s*available)\b|(?:अपॉइंटमेंट|टोकन|रांग|कतार|ओपीडी\s*वेळ|डॉक्टरांना\s*भेटायचे)/i;
const DOCTOR_FACILITY_REGEX = /\b(doctor|physician|cardiologist|pediatrician|gynecologist|surgeon|dr|vaidya|specialist|डॉक्टर|वैद्य|तज्ज्ञ)\b/i;
const HOSPITAL_FACILITY_REGEX = /\b(hospital|phc|chc|subcentre|dispensary|clinic|sassoon|bhor|bed\s*availability|ambulance|108|रुग्णालय|दवाखाना|प्राथमिक\s*आरोग्य\s*केंद्र|ससून|रुग्णवाहिका)/i;

// 7. Explicit Clinical Symptom Indicators
const SYMPTOM_PATTERNS: Array<{ regex: RegExp; symptom: string }> = [
  { regex: /(?:\b(chest\s*pain|chest\s*tightness|angina)\b|(?:छाती\s*में\s*दर्द|छातीत\s*दुखणे|छाती\s*भारी))/i, symptom: 'Chest Discomfort / Pain' },
  { regex: /(?:\b(stomach\s*pain|belly\s*ache|abdominal\s*pain|cramps|acidity|gas|constipation|loose\s*motion|diarrhea|dast)\b|(?:पेट\s*दर्द|पेट\s*खराब|दस्त|पोटात\s*दुखणे|कळ\s*लागणे))/i, symptom: 'Abdominal / Gastrointestinal Issue' },
  { regex: /(?:\b(fever|high\s*temp|pyrexia|chills|shivering|cold\s*and\s*fever|bukhar|tez\s*bukhar|taap|tap)\b|(?:बुखार|तेज\s*ताप|ठंड\s*लगना|थंडी\s*ताप|ज्वर|ताप))/i, symptom: 'Fever / High Temperature' },
  { regex: /(?:\b(headache|migraine|head\s*throbbing)\b|(?:सिरदर्द|सिर\s*में\s*दर्द|डोकेदुखी|माथा\s*व्यथा))/i, symptom: 'Headache / Migraine' },
  { regex: /(?:\b(cough|coughing|dry\s*cough|wet\s*cough|phlegm|sputum)\b|(?:खांसी|कफ|बलगम|खोकला|काशि))/i, symptom: 'Cough / Respiratory Symptom' },
  { regex: /(?:\b(shortness\s*of\s*breath|breathless|breathlessness|wheezing|asthma)\b|(?:सांस\s*फूलना|सांस\s*लेने\s*में\s*तकलीफ|दम\s*लागणे))/i, symptom: 'Breathlessness / Wheezing' },
  { regex: /(?:\b(vomit|vomiting|nausea|queasy)\b|(?:उल्टी|जी\s*मिचलाना|मळमळणे|मळमळ|വാந்தி))/i, symptom: 'Nausea / Vomiting' },
  { regex: /(?:\b(dizzy|dizziness|lightheaded|vertigo|faint)\b|(?:चक्कर|सिर\s*घूमना|भोवळ\s*येणे|भोवळ))/i, symptom: 'Dizziness / Vertigo' },
  { regex: /(?:\b(rash|itching|hives|allergy|skin\s*redness)\b|(?:खुजली|त्वचा\s*पर\s*दाने|खाज|एलर्जी|रॅश))/i, symptom: 'Skin Rash / Pruritus' },
  { regex: /(?:\b(back\s*pain|joint\s*pain|knee\s*pain|shoulder\s*pain|body\s*pain|body\s*ache|fatigue|weakness)\b|(?:कमर\s*दर्द|जोड़ों\s*में\s*दर्द|घुटनों\s*में\s*दर्द|बदन\s*दर्द|कमजोरी|पाठदुखी|सांधेदुखी|अंगदुखी))/i, symptom: 'Musculoskeletal Pain / Fatigue' },
  { regex: /(?:\b(pain|ache|hurt|dard|takleef|dukhne|bimar|ill|unwell|sick)\b|(?:दर्द|तकलीफ|दुखणे|बीमार|व्यथा|कळा))/i, symptom: 'Physical Pain / Discomfort' },
];

// 8. Casual Food & Dining Indicators
const CASUAL_FOOD_PATTERNS = [
  /\b(biryani|biriyani|khaogi|khaoge|khao|khana|chai|coffee|pizza|burger|pasta|roti|sabzi|lunch|dinner|breakfast|nashta|food|eat|eating|cook|cooking|recipe|delicious|bhookh|bhuk|restaurant)\b/i,
  /(?:बिरयानी|बिरयानी\s*खाओगी|खाना|चाय|कॉफी|रोटी|सब्जी|भूख|नाश्ता|जेवण|बिरयाणी|हॉटेल|রেস্তোরাঁ|பிரியாணி|బిర్యానీ)/i,
];

// 9. Casual Chit-Chat Topics
const CASUAL_TOPIC_PATTERNS: Array<{ regex: RegExp; subCategory: string }> = [
  { regex: /(?:\b(tell\s*me\s*a\s*joke|joke\s*sunao|chutkula|make\s*me\s*laugh|funny|story|kahani\s*sunao|shayari)\b|(?:चुटकुला|मजाक|कहानी\s*सुनाओ|हंसाओ|जोक|विनोद\s*सांगा))/i, subCategory: 'joke' },
  { regex: /(?:\b(weather|barish|mausam|temperature\s*outside|forecast|rain\s*today|garmi|sardi\s*mausam)\b|(?:मौसम|बारिश|तापमान|हवामान|বৃষ্টি|மழை))/i, subCategory: 'weather' },
  { regex: /(?:\b(cricket|match|ipl|football|fifa|score|winner|match\s*kaun\s*jeeta)\b|(?:क्रिकेट|मैच|फुटबॉल))/i, subCategory: 'sports' },
  { regex: /(?:\b(movie|cinema|actor|actress|film|song|gaana|sing|dance|bollywood|hollywood)\b|(?:फिल्म|गाना|सिनेमा|नाचो|गाओ|चित्रपट|गाणी))/i, subCategory: 'entertainment' },
  { regex: /(?:\b(politics|neta|election|vote|modi|bjp|congress|president|minister|government)\b|(?:राजनीति|चुनाव|नेता|सरकार|निवडणूक))/i, subCategory: 'politics' },
  { regex: /(?:\b(coding|python|javascript|react|code|program|debug|essay|homework|math)\b|(?:कोडिंग|प्रोग्रामिंग|होमवर्क))/i, subCategory: 'tech_homework' },
  { regex: /(?:\b(crypto|bitcoin|stock\s*market|share\s*bazaar|finance|shopping|buy\s*phone)\b|(?:शेयर\s*बाजार|शॉपिंग))/i, subCategory: 'finance_shopping' },
];

// 10. Greetings
const GREETING_PATTERNS = [
  /(?:^(hi|hello|hey|namaste|namaskar|pranam|khemcho|good\s*morning|good\s*afternoon|good\s*evening|shubh\s*prabhat|hola|bonjour|ciao|salam|sat\s*sri\s*akal)\b|^(?:नमस्ते|नमस्कार|शुभ\s*प्रभात|हेलो|हाय|सुप्रभात|प्रणाम|কেমন\s*আছেন|வணக்கம்|నమస్కారం|કેમ\s*છો))/i,
  /(?:\b(how\s*are\s*you|how\s*r\s*u|kaise\s*ho|kaisa\s*hai|kaisi\s*ho|kasa\s*ahes|kashi\s*ahes|kya\s*haal\s*hai|aap\s*kaise\s*hain|kese\s*ho)\b|(?:कैसा\s*है|कैसे\s*हो|कैसी\s*हो|आप\s*कैसे\s*हैं|कशी\s*आहेस|कसा\s*आहेस|कसे\s*आहात|केमन\s*आचेन|எப்படி\s*இருக்கிறீர்கள்|ఎలా\s*ఉన్నారు|તમે\s*કેમ\s*છો))/i,
  /(?:\b(who\s*are\s*you|what\s*is\s*your\s*name|aapka\s*naam|tumhara\s*naam|who\s*made\s*you|kisne\s*banaya|what\s*can\s*you\s*do|kya\s*kar\s*sakti\s*ho)\b|(?:आप\s*कौन\s*हैं|आपका\s*नाम|तुमचा\s*नाव|आप\s*क्या\s*कर\s*सकती\s*हो))/i,
];

// 11. Gratitude & Goodbye
const GRATITUDE_PATTERNS = [
  /(?:^(thank\s*you|thanks|thx|dhanyawad|shukriya|shukriyaa|dhanyavad)\b|^(?:धन्यवाद|शुक्रिया|आभार|थँक्यू|ধন্যবাদ|நன்றி|ధన్యవాదాలు|આભાર))/i,
];
const GOODBYE_PATTERNS = [
  /(?:^(bye|goodbye|alvida|tata|see\s*you|take\s*care)\b|^(?:अलविदा|बाय|टाटा|पुन्हा\s*भेटू))/i,
];

// 12. General Health Information
const HEALTH_INFO_PATTERNS = [
  /(?:\b(what\s*is|what\s*does|meaning\s*of|causes\s*of|normal\s*range|kya\s*hota\s*hai|kya\s*hai|ka\s*matlab)\b.*\b(diabetes|sugar|blood\s*pressure|bp|hypertension|cholesterol|asthma|thyroid|dengue|malaria|typhoid|covid|anemia|infection)\b|(?:क्या\s*होता\s*है|का\s*मतलब|कारण\s*क्या\s*है).*(?:डायबिटीज|शुगर|मधुमेह|ब्लड\s*प्रेशर|थायराइड|अस्थमा|दमा))/i,
];

// 13. Medication Patterns
const MEDICATION_PATTERNS = [
  /\b(taking|le\s*raha|khata\s*hoon|khati\s*hoon|prescribed|dose|mg|tablet|capsule|syrup|injection|insulin|metformin|amlodipine|telmisartan|paracetamol|crocin|aspirin|atorvastatin|pantoprazole|azithromycin|amoxicillin|cetirizine|omeprazole|dawa|dawai|goli|medicine|medicines|medication|side\s*effect|adverse\s*effect)\b/i,
  /(?:दवा|दवाई|गोली|इंसुलिन|टेबलेट|कैप्सूल|औषध|औषधे|दुष्परिणाम|ওষুধ)/i,
];

// 14. Help Patterns
const HELP_PATTERNS = [
  /(?:\b(help|madad|sahayata|guide\s*me|assist|madat|kya\s*kar\s*sakti\s*ho|how\s*can\s*you\s*help|madad\s*chahiye|kya\s*madad)\b|(?:मदत|मदद|सहायता|সাহায্য))/i,
];

// 15. Follow-up Patterns
const FOLLOWUP_PATTERNS = [
  /(?:\b(follow\s*up|follow-up|agla\s*checkup|dubara\s*kab|next\s*visit|recheck|punha\s*kadhi|checkup\s*kab|followup)\b|(?:फॉलो\s*अप|पुढील\s*तपासणी))/i,
];

export class IntentClassifier {
  /**
   * Main classification method
   */
  public static classify(text: string, context?: IntentContext): ClassifiedIntent {
    const raw = IntentClassifier._classifyInternal(text, context);
    return {
      ...raw,
      isMedicalRelevant: Boolean(raw.isMedical),
    };
  }

  private static _classifyInternal(text: string, context?: IntentContext): Omit<ClassifiedIntent, 'isMedicalRelevant'> {
    const clean = (text || '').trim();
    const lower = clean.toLowerCase();
    const matchedPatterns: string[] = [];

    if (!clean) {
      return {
        intent: 'UNKNOWN',
        primaryIntent: 'UNKNOWN',
        isMedical: false,
        confidence: 0,
        matchedPatterns: ['empty_string'],
      };
    }

    // Step 1: Emergency Check
    for (const rule of EMERGENCY_PATTERNS) {
      if (rule.pattern.test(clean)) {
        matchedPatterns.push(rule.label);
        return {
          intent: 'EMERGENCY',
          primaryIntent: 'EMERGENCY',
          isMedical: true,
          confidence: 0.99,
          subCategory: rule.label,
          extractedSymptom: 'Immediate Clinical Triage Required',
          matchedPatterns,
        };
      }
    }

    // Step 2: Language Change Request
    for (const item of LANGUAGE_CHANGE_PATTERNS) {
      if (item.regex.test(clean)) {
        matchedPatterns.push(`lang_switch_${item.lang}`);
        return {
          intent: 'LANGUAGE_CHANGE',
          primaryIntent: 'LANGUAGE_CHANGE',
          isMedical: false,
          confidence: 0.98,
          targetLanguage: item.lang,
          subCategory: item.langName,
          matchedPatterns,
        };
      }
    }

    // Step 3: Check for Negative Statements (e.g. "I don't have fever", "bukhar nahi hai")
    const isNegative = NEGATION_PREFIX_REGEX.test(lower) || /नाही|नाहीत|नहीं|नही/.test(clean);
    if (isNegative) {
      const hasSymptom = SYMPTOM_PATTERNS.some(s => s.regex.test(clean));
      if (hasSymptom) {
        matchedPatterns.push('negative_symptom_claim');
        return {
          intent: 'CASUAL_CONVERSATION',
          primaryIntent: 'CASUAL_CONVERSATION',
          isMedical: false, // Do NOT trigger active fever complaint
          isNegativeStatement: true,
          confidence: 0.95,
          subCategory: 'denied_symptom',
          matchedPatterns,
        };
      }
    }

    // Step 4: Check for Family / Third-Party Mentions (e.g. "My mother has diabetes", "bhai ko bukhar hai")
    if (THIRD_PARTY_FAMILY_REGEX.test(clean)) {
      const hasSymptom = SYMPTOM_PATTERNS.some(s => s.regex.test(clean)) || MEDICATION_PATTERNS.some(m => m.test(clean)) || /diabetes|sugar|bp|hypertension|मधुमेह/i.test(clean);
      if (hasSymptom) {
        matchedPatterns.push('family_medical_history');
        return {
          intent: 'CLINICAL_HISTORY',
          primaryIntent: 'CLINICAL_HISTORY',
          isMedical: false, // NOT patient's acute complaint
          isFamilyHistory: true,
          confidence: 0.94,
          subCategory: 'family_history',
          matchedPatterns,
        };
      }
    }

    // Step 5: Active Clinical Follow-up in an ongoing interview
    if (context?.hasComplaint && context.currentSection && context.currentSection !== 'chief_complaint') {
      const isDuration = /\b(\d+\s*(days?|din|hours?|ghante|weeks?|hafte|months?|mahine)|yesterday|kal\s*se|aaj\s*se|subah\s*se|since|sudden|gradual)\b/i.test(lower);
      const isSeverity = /\b(mild|moderate|severe|10|9|8|7|6|5|4|3|2|1|halka|zyada|bahut|tez|tolerable|unbearable)\b/i.test(lower);
      const isYesNo = /^(yes|no|haan|nahi|nahin|na|kuch\s*nahi|none|normal|bilkul\s*nahi|नाही|होय|हाँ|नहीं)$/i.test(lower);

      if (isDuration || isSeverity || isYesNo) {
        matchedPatterns.push('clinical_followup_answer');
        return {
          intent: 'FOLLOW_UP',
          primaryIntent: 'FOLLOW_UP',
          isMedical: true,
          confidence: 0.95,
          subCategory: 'interview_response',
          matchedPatterns,
        };
      }
    }

    // Step 6: Medical Report / Document Processing
    if (MEDICAL_REPORT_REGEX.test(clean)) {
      matchedPatterns.push('medical_report_query');
      return {
        intent: 'MEDICAL_REPORT',
        primaryIntent: 'MEDICAL_REPORT',
        isMedical: true,
        confidence: 0.95,
        subCategory: 'lab_document',
        matchedPatterns,
      };
    }

    // Step 7: Doctor / Hospital / Appointment
    if (APPOINTMENT_REGEX.test(clean)) {
      matchedPatterns.push('appointment_inquiry');
      return {
        intent: 'APPOINTMENT',
        primaryIntent: 'APPOINTMENT',
        isMedical: false,
        confidence: 0.92,
        subCategory: 'appointment',
        matchedPatterns,
      };
    }

    // Step 7b: Help & Followup Queries (Outside active clinical interview)
    for (const p of HELP_PATTERNS) {
      if (p.test(clean)) {
        matchedPatterns.push('help_inquiry');
        return {
          intent: 'HELP',
          primaryIntent: 'HELP',
          isMedical: false,
          confidence: 0.95,
          subCategory: 'help',
          matchedPatterns,
        };
      }
    }

    for (const p of FOLLOWUP_PATTERNS) {
      if (p.test(clean)) {
        matchedPatterns.push('followup_inquiry');
        return {
          intent: 'FOLLOW_UP',
          primaryIntent: 'FOLLOW_UP',
          isMedical: false,
          confidence: 0.95,
          subCategory: 'followup',
          matchedPatterns,
        };
      }
    }

    if (HOSPITAL_FACILITY_REGEX.test(clean) && !SYMPTOM_PATTERNS.some(s => s.regex.test(clean))) {
      matchedPatterns.push('hospital_inquiry');
      return {
        intent: 'HOSPITAL',
        primaryIntent: 'HOSPITAL',
        isMedical: false,
        confidence: 0.9,
        subCategory: 'facility',
        matchedPatterns,
      };
    }

    if (DOCTOR_FACILITY_REGEX.test(clean) && !SYMPTOM_PATTERNS.some(s => s.regex.test(clean))) {
      matchedPatterns.push('doctor_inquiry');
      return {
        intent: 'DOCTOR',
        primaryIntent: 'DOCTOR',
        isMedical: false,
        confidence: 0.9,
        subCategory: 'doctor',
        matchedPatterns,
      };
    }

    // Step 8: Health Education / General Inquiry (No personal symptoms)
    const isPersonalClaim = /\b(mujhe|mera|meri|i\s*have|i\s*am\s*having|suffering\s*from|diagnosed\s*with)\b/i.test(lower) ||
      /(?:मुझे|मेरा|मेरी|मला|আমি)/i.test(clean);

    for (const p of HEALTH_INFO_PATTERNS) {
      if (p.test(clean) && !isPersonalClaim) {
        matchedPatterns.push('health_information');
        return {
          intent: 'HEALTH_INFORMATION',
          primaryIntent: 'HEALTH_INFORMATION',
          isMedical: false,
          confidence: 0.9,
          subCategory: 'health_knowledge',
          matchedPatterns,
        };
      }
    }

    // Step 9: Casual Food & Dining (e.g. 'Biryani khaogi?', 'went to a restaurant')
    for (const p of CASUAL_FOOD_PATTERNS) {
      if (p.test(clean)) {
        const hasSymptom = SYMPTOM_PATTERNS.some(s => s.regex.test(clean));
        if (!hasSymptom) {
          matchedPatterns.push('casual_food');
          return {
            intent: 'CASUAL_CONVERSATION',
            primaryIntent: 'CASUAL_CONVERSATION',
            isMedical: false,
            confidence: 0.98,
            subCategory: 'food_dining',
            matchedPatterns,
          };
        }
      }
    }

    // Step 10: Greetings & Introductions ('How are you?', 'Namaste')
    for (const p of GREETING_PATTERNS) {
      if (p.test(clean)) {
        const hasSymptom = SYMPTOM_PATTERNS.some(s => s.regex.test(clean));
        if (!hasSymptom) {
          matchedPatterns.push('greeting_smalltalk');
          return {
            intent: 'GREETING',
            primaryIntent: 'GREETING',
            isMedical: false,
            confidence: 0.95,
            subCategory: 'greeting',
            matchedPatterns,
          };
        }
      }
    }

    // Step 11: Gratitude & Goodbye
    for (const p of GRATITUDE_PATTERNS) {
      if (p.test(clean)) {
        matchedPatterns.push('gratitude');
        return {
          intent: 'THANKS',
          primaryIntent: 'THANKS',
          isMedical: false,
          confidence: 0.95,
          subCategory: 'gratitude',
          matchedPatterns,
        };
      }
    }

    for (const p of GOODBYE_PATTERNS) {
      if (p.test(clean)) {
        matchedPatterns.push('goodbye');
        return {
          intent: 'GOODBYE',
          primaryIntent: 'GOODBYE',
          isMedical: false,
          confidence: 0.95,
          subCategory: 'goodbye',
          matchedPatterns,
        };
      }
    }

    // Step 12: Other Casual Chit-Chat (Jokes, weather, entertainment, sports)
    for (const item of CASUAL_TOPIC_PATTERNS) {
      if (item.regex.test(clean)) {
        matchedPatterns.push(`casual_${item.subCategory}`);
        return {
          intent: 'CASUAL_CONVERSATION',
          primaryIntent: 'CASUAL_CONVERSATION',
          isMedical: false,
          confidence: 0.92,
          subCategory: item.subCategory,
          matchedPatterns,
        };
      }
    }

    // Step 13: Medication Reporting (medications take priority over secondary symptoms like dizziness)
    for (const p of MEDICATION_PATTERNS) {
      if (p.test(clean)) {
        matchedPatterns.push('medication_reported');
        return {
          intent: 'MEDICATION',
          primaryIntent: 'MEDICATION',
          isMedical: true,
          confidence: 0.9,
          subCategory: 'medication_history',
          matchedPatterns,
        };
      }
    }

    // Step 14: Explicit Clinical Symptoms & Complaints
    for (const s of SYMPTOM_PATTERNS) {
      if (s.regex.test(clean)) {
        matchedPatterns.push('clinical_symptom');
        return {
          intent: 'MEDICAL_COMPLAINT',
          primaryIntent: 'MEDICAL_COMPLAINT',
          isMedical: true,
          confidence: 0.96,
          subCategory: 'symptom_report',
          extractedSymptom: s.symptom,
          matchedPatterns,
        };
      }
    }

    // Default: If no medical symptom detected and no complaint recorded yet, treat as CASUAL
    if (!context?.hasComplaint) {
      return {
        intent: 'CASUAL_CONVERSATION',
        primaryIntent: 'CASUAL_CONVERSATION',
        isMedical: false,
        confidence: 0.7,
        subCategory: 'general_statement',
        matchedPatterns: ['non_medical_default'],
      };
    }

    return {
      intent: 'UNKNOWN',
      primaryIntent: 'UNKNOWN',
      isMedical: false,
      confidence: 0.5,
      matchedPatterns: ['unmatched_tokens'],
    };
  }

  /**
   * Quick boolean check for whether input warrants clinical intake processing
   */
  public static isMedical(text: string, context?: IntentContext): boolean {
    const res = IntentClassifier.classify(text, context);
    return res.isMedical;
  }

  /**
   * Helper: Check if input is casual chatter
   */
  public static isCasual(text: string): boolean {
    const res = IntentClassifier.classify(text);
    return res.intent === 'CASUAL_CONVERSATION' || res.intent === 'GREETING' || res.intent === 'THANKS' || res.intent === 'GOODBYE';
  }

  /**
   * Generate an empathetic, context-aware conversational response for non-clinical chatter
   */
  public static getConversationalResponse(
    text: string,
    classified: ClassifiedIntent,
    lang: string = 'en',
    isHinglish?: boolean
  ): { reply: string; quickOptions: string[]; newLanguage?: string } {
    const lower = text.toLowerCase();

    // 1. Language Change Request
    if (classified.intent === 'LANGUAGE_CHANGE' && classified.targetLanguage) {
      const targetLang = classified.targetLanguage;
      if (targetLang === 'mr') {
        return {
          reply: 'नक्कीच! आता मी तुमच्याशी मराठीत बोलेन. आज तुम्हाला कोणत्या त्रासाबद्दल किंवा लक्षणांबद्दल सांगायचे आहे?',
          quickOptions: ['लक्षणे सांगायची आहेत', 'माझी औषधे नोंदवा', 'ओपीडी रांग तपासा'],
          newLanguage: 'mr',
        };
      }
      if (targetLang === 'hi') {
        return {
          reply: 'ज़रूर! अब मैं आपसे हिंदी में बात करूंगी। आज आप अपने डॉक्टर को किस स्वास्थ्य समस्या के बारे में बताना चाहते हैं?',
          quickOptions: ['लक्षण बताना चाहता हूँ', 'अपनी दवाइयाँ दर्ज करें', 'डॉक्टर से परामर्श'],
          newLanguage: 'hi',
        };
      }
      if (targetLang === 'en') {
        return {
          reply: 'Certainly! I will now speak with you in English. What main health concern or symptom would you like to discuss with your doctor today?',
          quickOptions: ['Describe a health symptom', 'Add my medications', 'Consult doctor'],
          newLanguage: 'en',
        };
      }
      return {
        reply: `Language updated to ${classified.subCategory || targetLang}. How can I assist you with your health today?`,
        quickOptions: ['Describe symptoms', 'Add medications', 'Consult doctor'],
        newLanguage: targetLang,
      };
    }

    // 2. Food / Dining / Biryani response
    if (classified.subCategory === 'food_dining' || lower.includes('biryani')) {
      if (lang === 'hi' || isHinglish) {
        return {
          reply: isHinglish
            ? '😄 Main khana nahi kha sakti, lekin biryani ka naam sunke achha laga! Waise agar aapko health se related koi baat karni hai, main yahin hoon.'
            : '😄 मैं भोजन नहीं कर सकती, लेकिन बिरयानी का नाम सुनकर अच्छा लगा! वैसे यदि आपको स्वास्थ्य से जुड़ी कोई बात करनी है या कोई लक्षण बताना है, तो मैं यहीं हूँ।',
          quickOptions: ['लक्षण बताना चाहता हूँ', 'अपनी दवाइयाँ दर्ज करें', 'डॉक्टर से परामर्श'],
        };
      }
      if (lang === 'mr') {
        return {
          reply: '😄 मी जेवण करू शकत नाही, पण बिरयानीचे नाव ऐकून छान वाटले! आरोग्याविषयी काही सांगायचे असेल किंवा लक्षणे सांगायची असतील तर मी इथेच आहे.',
          quickOptions: ['आरोग्य लक्षणे सांगायची आहेत', 'माझी औषधे नोंदवा', 'डॉक्टरांचा सल्ला'],
        };
      }
      return {
        reply: '😄 I can’t eat food, but biryani sounds delicious! Whenever you’d like to discuss your health or prepare for the doctor, I’m right here.',
        quickOptions: ['Describe a health symptom', 'Add my medications', 'Consult doctor'],
      };
    }

    // 3. Negative Statement (e.g. "I don't have fever", "bukhar nahi hai")
    if (classified.isNegativeStatement) {
      if (lang === 'hi' || isHinglish) {
        return {
          reply: isHinglish
            ? 'Achha, samajh gayi ki aapko yeh lakshan nahi hai. Kya aapko koi doosri takleef ya pareshani ho rahi hai?'
            : 'अच्छा, समझ गई कि आपको यह लक्षण नहीं है। क्या आपको कोई अन्य तकलीफ, दर्द या असुविधा महसूस हो रही है?',
          quickOptions: ['अन्य लक्षण बताएं', 'नियमित जांच', 'दवाइयों की समीक्षा'],
        };
      }
      if (lang === 'mr') {
        return {
          reply: 'समजले, आपल्याला हा त्रास नाहीये. आपल्याला इतर काही त्रास, दुखणे किंवा लक्षण जाणवत आहे का?',
          quickOptions: ['इतर लक्षणे सांगा', 'नियमित तपासणी', 'औषधे तपासा'],
        };
      }
      return {
        reply: 'Got it, noting that you do not have that symptom. Are there any other health concerns or symptoms bothering you?',
        quickOptions: ['Mention another symptom', 'Routine checkup', 'Review medications'],
      };
    }

    // 4. Family History (e.g. "My mother has diabetes", "bhai ko bukhar hai")
    if (classified.isFamilyHistory) {
      if (lang === 'hi' || isHinglish) {
        return {
          reply: isHinglish
            ? 'Samajh gayi, maine ise parivarik itihas ke taur par note kar liya hai. Aapko personally koi sharirik lakshan ya pareshani to nahi hai?'
            : 'समझ गई, मैंने इसे पारिवारिक स्वास्थ्य इतिहास के रूप में दर्ज कर लिया है। व्यक्तिगत रूप से आपकी अपनी सेहत कैसी है? क्या आपको कोई तकलीफ है?',
          quickOptions: ['मुझे भी कुछ लक्षण हैं', 'मेरी तबीयत बिल्कुल ठीक है', 'दवाइयों की समीक्षा'],
        };
      }
      if (lang === 'mr') {
        return {
          reply: 'समजले, मी ही नोंद कौटुंबिक आरोग्य इतिहास म्हणून ठेवली आहे. आपल्याला स्वतःला काही शारीरिक त्रास किंवा लक्षणे आहेत का?',
          quickOptions: ['मलाही काही लक्षणे आहेत', 'माझी तब्येत ठीक आहे', 'औषध तपासणी'],
        };
      }
      return {
        reply: 'Understood, I have noted this as family health background. How are you feeling personally? Do you have any symptoms of your own today?',
        quickOptions: ['I have some symptoms too', 'I feel fine myself', 'Review medications'],
      };
    }

    // 5. Greeting / "How are you?"
    if (classified.intent === 'GREETING') {
      if (lang === 'hi' || isHinglish) {
        return {
          reply: isHinglish
            ? 'Namaste! Main theek hoon, poochne ke liye shukriya. Aaj aap kaisa mehsoos kar rahe hain? Kya aapko koi health problem hai jisme main madad kar sakun?'
            : 'नमस्ते! मैं बिल्कुल ठीक हूँ, पूछने के लिए धन्यवाद। आज आप कैसा महसूस कर रहे हैं? क्या आपको कोई शारीरिक या स्वास्थ्य संबंधी समस्या है?',
          quickOptions: ['सीने में दर्द या भारीपन', 'तेज बुखार और ठंड', 'पेट में दर्द या अपच', 'नियमित स्वास्थ्य जांच'],
        };
      }
      if (lang === 'mr') {
        return {
          reply: 'नमस्कार! मी ठीक आहे, विचारल्याबद्दल धन्यवाद. आज आपली तब्येत कशी आहे? आरोग्याविषयी काही तक्रार असल्यास नक्की सांगा.',
          quickOptions: ['छातीत दुखणे', 'ताप आणि थंडी', 'पोटात दुखणे', 'नियमित तपासणी'],
        };
      }
      return {
        reply: 'Hello! I am doing well, thank you for asking. How are you feeling today? Please let me know if you are experiencing any symptoms or discomfort.',
        quickOptions: ['Chest Discomfort / Pain', 'High Fever & Chills', 'Stomach Pain / Acidity', 'Routine Health Check'],
      };
    }

    // 6. Medical Report Discussion
    if (classified.intent === 'MEDICAL_REPORT') {
      if (lang === 'hi' || isHinglish) {
        return {
          reply: isHinglish
            ? 'Ji bilkul, aap apna medical report ya prescription upload kar sakte hain. Main uske main findings doctor ke review ke liye summarize kar dungi.'
            : 'जी बिल्कुल, आप अपनी मेडिकल रिपोर्ट, ब्लड टेस्ट या डॉक्टर की पर्ची अपलोड कर सकते हैं। मैं उसके मुख्य बिंदुओं को डॉक्टर के लिए डिजिटाइज कर दूंगी।',
          quickOptions: ['रिपोर्ट अपलोड करें', 'लक्षण जोड़ें', 'डॉक्टर से परामर्श'],
        };
      }
      if (lang === 'mr') {
        return {
          reply: 'नक्कीच! तुम्ही तुमचा लॅब अहवाल किंवा औषध चिठ्ठी येथे अपलोड करू शकता. मी डॉक्टरांच्या तपासणीसाठी त्यातील मुख्य माहिती नोंदवून घेईन.',
          quickOptions: ['अहवाल अपलोड करा', 'लक्षणे सांगा', 'डॉक्टरांचा सल्ला'],
        };
      }
      return {
        reply: 'Certainly! You can upload your medical report, prescription, or lab findings. I will extract the key metrics for your doctor to review.',
        quickOptions: ['Upload Report / File', 'Describe Symptoms', 'Consult Doctor'],
      };
    }

    // 7. Appointment / Doctor Facility
    if (classified.intent === 'APPOINTMENT' || classified.intent === 'DOCTOR' || classified.intent === 'HOSPITAL') {
      if (lang === 'hi' || isHinglish) {
        return {
          reply: isHinglish
            ? 'OPD mein doctor consultation ke liye main aapki pre-consultation summary taiyar kar rahi hoon. Ek baar intake complete hone par aapka digital token generate ho jayega.'
            : 'ओपीडी में डॉक्टर से परामर्श के लिए मैं आपका पूर्व-परामर्श इतिहास तैयार कर रही हूँ। बातचीत पूरी होने पर आपको डिजिटल ओपीडी टोकन जारी कर दिया जाएगा।',
          quickOptions: ['लक्षण बताएं', 'ओपीडी कतार देखें', 'दवाइयाँ जोड़ें'],
        };
      }
      if (lang === 'mr') {
        return {
          reply: 'ओपीडी डॉक्टरांच्या सल्ल्यासाठी मी तुमचा पूर्व-तपासणी इतिहास तयार करत आहे. तपासणी पूर्ण झाल्यावर तुम्हाला थेट ओपीडी टोकन क्रमांक मिळेल.',
          quickOptions: ['लक्षणे सांगा', 'थेट रांग पहा', 'औषधे नोंदवा'],
        };
      }
      return {
        reply: 'I am helping prepare your clinical pre-consultation notes for the attending doctor. Once we complete your intake, your OPD queue token will be confirmed.',
        quickOptions: ['Describe symptoms', 'View Live Queue', 'Add medications'],
      };
    }

    // 8. Jokes
    if (classified.subCategory === 'joke') {
      if (lang === 'hi' || isHinglish) {
        return {
          reply: isHinglish
            ? '😄 Ek stethoscope doosre stethoscope se bola: "Aapki heartbeat bohot tez hai!" Chaliye, ab aap batayein—aaj aapki sehat kaisi hai? Kya koi sharirik pareshani hai?'
            : '😄 एक डॉक्टर ने मरीज से कहा: "आपकी सेहत अच्छी है, बस थोड़ा हंसते रहिए!" चलिए, अब बताइए—आज आपकी सेहत कैसी है? क्या कोई शारीरिक तकलीफ है?',
          quickOptions: ['लक्षण बताना चाहता हूँ', 'अपनी दवाइयाँ दर्ज करें', 'डॉक्टर से परामर्श'],
        };
      }
      if (lang === 'mr') {
        return {
          reply: '😄 डॉक्टर रुग्णाला म्हणाले: "औषध वेळेवर घ्या आणि आनंदी राहा!" चला, आता सांगा—आज तुमची तब्येत कशी आहे?',
          quickOptions: ['लक्षणे सांगा', 'औषधे नोंदवा', 'डॉक्टरांचा सल्ला'],
        };
      }
      return {
        reply: '😄 Why did the stethoscope go to school? To improve its listening skills! On a serious note, whenever you are ready, please tell me if you have any health symptoms or medical concerns.',
        quickOptions: ['Describe my symptoms', 'Add my medications', 'Consult doctor'],
      };
    }

    // 9. Gratitude / Goodbye
    if (classified.intent === 'THANKS' || classified.intent === 'GOODBYE') {
      if (lang === 'hi' || isHinglish) {
        return {
          reply: isHinglish
            ? 'Aapka swagat hai! Agar aur koi lakshan ya sawal ho to aap kabhi bhi bata sakte hain.'
            : 'आपका स्वागत है! यदि आपके पास कोई और लक्षण या स्वास्थ्य संबंधी जानकारी हो, तो आप बेझिझक बता सकते हैं।',
          quickOptions: ['डॉक्टर के लिए रिपोर्ट बनाएं', 'दवाइयों की समीक्षा', 'नया लक्षण जोड़ें'],
        };
      }
      if (lang === 'mr') {
        return {
          reply: 'आपले स्वागत आहे! इतर काही तक्रार किंवा लक्षण असल्यास आपण नक्की सांगू शकता.',
          quickOptions: ['क्लिनिकल अहवाल तयार करा', 'औषध तपासणी', 'नवीन लक्षण जोडा'],
        };
      }
      return {
        reply: 'You are very welcome! If you have any additional symptoms or health concerns to note, feel free to let me know.',
        quickOptions: ['Prepare report for doctor', 'Review medications', 'Add another symptom'],
      };
    }

    // 10. Health Education (non-personal inquiry)
    if (classified.intent === 'HEALTH_INFORMATION') {
      if (lang === 'hi' || isHinglish) {
        return {
          reply: isHinglish
            ? 'Yeh ek ahem health topic hai jisme shareer ki biological functioning par asar padta hai. Kya aapko ya aapke kisi parivarjan ko is se judi koi takleef mehsoos ho rahi hai?'
            : 'यह एक महत्वपूर्ण स्वास्थ्य विषय है। क्या आपको या आपके परिवार में किसी को इससे जुड़े कोई लक्षण या शारीरिक तकलीफ महसूस हो रही है?',
          quickOptions: ['हाँ, मुझे लक्षण हैं', 'परिवार में किसी को समस्या है', 'सिर्फ जानकारी के लिए पूछा'],
        };
      }
      if (lang === 'mr') {
        return {
          reply: 'हा एक महत्त्वाचा आरोग्य विषय आहे. आपल्याला किंवा आपल्या कुटुंबातील कोणाला यासंदर्भात काही त्रास जाणवत आहे का?',
          quickOptions: ['होय, मला लक्षणे आहेत', 'कौटुंबिक इतिहास आहे', 'फक्त माहितीसाठी विचारले'],
        };
      }
      return {
        reply: 'This is an important medical topic involving regular physiological regulation. Are you or a family member currently experiencing related symptoms?',
        quickOptions: ['Yes, I am experiencing symptoms', 'Family history', 'Just asking for information'],
      };
    }

    // Generic friendly non-medical fallback
    if (lang === 'hi' || isHinglish) {
      return {
        reply: isHinglish
          ? 'Main aapki health assistant Anna hoon. Main doctor se pehle aapki bimari, lakshan aur dawaiyon ki jankari record karne mein madad karti hoon. Aapko aaj kya takleef hai?'
          : 'मैं आपकी स्वास्थ्य सहायक अन्ना हूँ। मैं डॉक्टर से परामर्श से पहले आपके लक्षण, पिछली बीमारियां और दवाइयाँ एकत्र करने में मदद करती हूँ। आज आपको क्या स्वास्थ्य समस्या है?',
        quickOptions: ['लक्षण बताना चाहता हूँ', 'अपनी दवाइयाँ दर्ज करें', 'डॉक्टर से परामर्श'],
      };
    }

    if (lang === 'mr') {
      return {
        reply: 'मी तुमची एआय क्लिनिकल सहाय्यक अण्णा आहे. मी डॉक्टरांच्या तपासणीपूर्वी लक्षणे, मागील आजार आणि चालू औषधांची नोंद घेते. आज आपल्याला काय त्रास होत आहे?',
        quickOptions: ['लक्षणे सांगायची आहेत', 'चालू औषधे नोंदवा', 'डॉक्टरांचा सल्ला'],
      };
    }

    return {
      reply: 'I am Anna, your AI clinical intake assistant. I help collect your health history, current symptoms, and medications for your doctor. What health problem brings you in today?',
      quickOptions: ['Describe a health symptom', 'Add my medications', 'Consult doctor'],
    };
  }
}
