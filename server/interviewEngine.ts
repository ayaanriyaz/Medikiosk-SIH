import { ClinicalInterview, InterviewMessage, ClinicalReport, RedFlagAlert, Medication, Allergy, AyushData, Patient } from '../src/types';
import { checkRedFlags } from './clinicalRules';
import { calculateRiskStratificationScore } from '../src/services/riskStratificationService';
import { checkMedicationSafety } from '../src/services/drugSafetyService';

// Strict Non-medical triggers list
const NON_MEDICAL_TRIGGERS = [
  'weather', 'joke', 'president', 'prime minister', 'cricket', 'football',
  'movie', 'song', 'sing', 'dance', 'recipe', 'cook', 'cooking', 'politics',
  'capital of', 'who are you', 'how are you', 'tell me a story', 'game', 'gaming',
  'bitcoin', 'crypto', 'stock market', 'finance', 'coding', 'program',
  'javascript', 'python', 'write code', 'debug code', 'essay', 'poem',
  'who is the best', 'make me laugh', 'translate this sentence', 'shopping',
  'buy phone', 'flight ticket', 'hotel booking', 'actor', 'actress', 'cinema',
  'film', 'election', 'homework', 'entertainment', 'tell me a joke', 'sports',
  'play music', 'video game', 'pubg', 'ipl',
  'मौसम', 'गाना', 'क्रिकेट', 'चुटकुला', 'कहानी सुनाओ', 'शेयर बाजार', 'राजनीति',
  'फिल्म', 'गाना सुनाओ', 'पॉलिटिक्स', 'एक्टर', 'सिनेमा', 'शॉपिंग', 'होमवर्क'
];

import { classifyMessageIntent } from './annaIntakeService';

export const NON_MEDICAL_REFUSAL_EN = "I am the digital clinical intake assistant. I can only assist with symptoms, medical history, medications, and details required for your doctor consultation.";
export const NON_MEDICAL_REFUSAL_HI = "मैं डिजिटल क्लिनिकल इंटेक सहायक हूँ। मैं केवल लक्षणों, स्वास्थ्य इतिहास, दवाओं और डॉक्टर परामर्श के लिए आवश्यक जानकारी में ही सहायता कर सकता हूँ।";

export function isNonMedicalQuery(text: string): boolean {
  const clean = text.toLowerCase().trim();
  const classified = classifyMessageIntent(clean, 'chief_complaint', false);
  return !classified.isMedical;
}

// Extract clinical entities from natural language (English, Hindi, Hinglish)
export interface ExtractedEntities {
  chiefComplaint?: string;
  onset?: string;
  duration?: string;
  severity?: string;
  radiation?: string;
  character?: string;
  aggravatingFactors?: string;
  relievingFactors?: string;
  associatedSymptoms?: string[];
  medications?: Array<{ name: string; dosage?: string; frequency?: string }>;
  allergies?: Array<{ substance: string; reaction?: string }>;
  pastHistory?: string[];
  surgeries?: string[];
  diet?: string;
  prakriti?: string;
  agni?: string;
}

export function extractClinicalEntitiesFromText(text: string): ExtractedEntities {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const entities: ExtractedEntities = {};

  // 1. Chief Complaint extraction
  if (/chest\s*pain|chest\s*discomfort|angina|seene\s*me\s*dard|chhati\s*me\s*dard|सीने\s*में\s*दर्द/i.test(lower)) {
    entities.chiefComplaint = 'Chest Pain / Discomfort';
  } else if (/fever|temperature|chills|bukhar|thand\s*lagna|बुखार/i.test(lower)) {
    entities.chiefComplaint = 'Fever with chills';
  } else if (/headache|migraine|sir\s*dard|sar\s*dard|सिरदर्द/i.test(lower)) {
    entities.chiefComplaint = 'Headache';
  } else if (/stomach\s*pain|abdominal\s*pain|cramp|pet\s*dard|pet\s*me\s*dard|पेट\s*दर्द/i.test(lower)) {
    entities.chiefComplaint = 'Abdominal / Stomach Pain';
  } else if (/cough|phlegm|khansi|balgam|खांसी/i.test(lower)) {
    entities.chiefComplaint = 'Cough / Respiratory symptoms';
  } else if (/breathless|shortness of breath|saans\s*phoolna|सांस\s*फूलना/i.test(lower)) {
    entities.chiefComplaint = 'Shortness of breath (Dyspnea)';
  } else if (/vomit|nausea|ulti|mitli|जी\s*मिचलाना|उल्टी/i.test(lower)) {
    entities.chiefComplaint = 'Nausea and Vomiting';
  } else if (/rash|itching|skin|chakatte|khujli|चकत्ते|खुजली/i.test(lower)) {
    entities.chiefComplaint = 'Skin Rash / Itching';
  } else if (/joint\s*pain|knee\s*pain|back\s*pain|ghutne\s*me\s*dard|kamar\s*dard|कमर\s*दर्द/i.test(lower)) {
    entities.chiefComplaint = 'Joint / Musculoskeletal Pain';
  }

  // 2. Onset & Duration extraction (e.g., "teen din se", "3 days", "2 ghante", "kal se")
  const durationMatch = clean.match(/(\d+|teen|do|ek|char|paanch|chhah|do-teen|two|three|four|five)\s*(days?|din|hours?|ghante?|weeks?|hafte?|months?|mahine?)/i);
  if (durationMatch) {
    entities.duration = durationMatch[0];
    entities.onset = `Started ${durationMatch[0]} ago`;
  } else if (/kal\s*se|since\s*yesterday/i.test(lower)) {
    entities.duration = '1 day';
    entities.onset = 'Since yesterday';
  } else if (/aaj\s*subah|since\s*morning|today\s*morning/i.test(lower)) {
    entities.duration = 'A few hours';
    entities.onset = 'Since morning today';
  } else if (/teen\s*din|3\s*din|3\s*days/i.test(lower)) {
    entities.duration = '3 days';
    entities.onset = '3 days ago';
  }

  // 3. Severity extraction
  if (/severe|unbearable|bahut\s*zyada|bohot\s*tez|asahay|असहनीय|बहुत\s*तेज|10\/10|9\/10|8\/10/i.test(lower)) {
    entities.severity = 'Severe (8-10/10)';
  } else if (/moderate|theek\s*thaak|madhyam|5\/10|6\/10|7\/10/i.test(lower)) {
    entities.severity = 'Moderate (4-7/10)';
  } else if (/mild|halka|thoda|halki|1\/10|2\/10|3\/10/i.test(lower)) {
    entities.severity = 'Mild (1-3/10)';
  }

  // 4. Radiation
  if (/left\s*arm|baaye\s*haath|left\s*shoulder|jaw|jabde|back|peeth/i.test(lower)) {
    if (/left\s*arm|baaye\s*haath/i.test(lower)) entities.radiation = 'Radiating to left arm';
    if (/jaw|jabde/i.test(lower)) entities.radiation = (entities.radiation ? entities.radiation + ' and ' : '') + 'Radiating to jaw';
    if (/shoulder/i.test(lower)) entities.radiation = (entities.radiation ? entities.radiation + ' and ' : '') + 'Radiating to shoulder';
    if (/back|peeth/i.test(lower)) entities.radiation = (entities.radiation ? entities.radiation + ' and ' : '') + 'Radiating to back';
  }

  // 5. Associated symptoms
  const assoc: string[] = [];
  if (/sweat|paseena|पसीना/i.test(lower)) assoc.push('Unusual sweating / Diaphoresis');
  if (/dizz|chakkar|चक्कर/i.test(lower)) assoc.push('Dizziness / Lightheadedness');
  if (/breathless|saans\s*phool|सांस/i.test(lower)) assoc.push('Shortness of breath');
  if (/nausea|mitli|ulti|vomit/i.test(lower)) assoc.push('Nausea / Vomiting');
  if (/shiver|chills|thand\s*lag/i.test(lower)) assoc.push('Chills / Shivering');
  if (/body\s*pain|badan\s*dard|sar\s*dard/i.test(lower)) assoc.push('Body aches');
  if (assoc.length > 0) entities.associatedSymptoms = assoc;

  // 6. Aggravating & Relieving
  if (/raat\s*ko\s*zyada|worse\s*at\s*night/i.test(lower)) {
    entities.aggravatingFactors = 'Worse at night';
  }
  if (/chalne\s*par|exertion|stair|stairs|chadhne/i.test(lower)) {
    entities.aggravatingFactors = 'Worse with physical exertion / walking';
  }
  if (/khana\s*khane\s*ke\s*baad|after\s*eating|post-meal/i.test(lower)) {
    entities.aggravatingFactors = 'Aggravated after food intake';
  }
  if (/paracetamol.*relief|aaram\s*milta|relief\s*milta|better\s*with\s*rest|aaram\s*se\s*thik/i.test(lower)) {
    entities.relievingFactors = 'Reported temporary relief with rest / medication';
  }

  // 7. Medications
  const medMatches: Array<{ name: string; dosage?: string; frequency?: string }> = [];
  const knownMeds = [
    { regex: /paracetamol|dolo|crocin|calpol/i, name: 'Paracetamol', dosage: '650 mg', freq: 'SOS as needed' },
    { regex: /metformin|glycomet/i, name: 'Metformin', dosage: '500 mg', freq: 'Twice daily after meals' },
    { regex: /telmisartan|telma/i, name: 'Telmisartan', dosage: '40 mg', freq: 'Once daily morning' },
    { regex: /amlodipine|amlong/i, name: 'Amlodipine', dosage: '5 mg', freq: 'Once daily' },
    { regex: /atorvastatin|atorva/i, name: 'Atorvastatin', dosage: '20 mg', freq: 'Once daily bedtime' },
    { regex: /pantoprazole|pan-?d|pantocid/i, name: 'Pantoprazole', dosage: '40 mg', freq: 'Once daily empty stomach' },
    { regex: /azithromycin|azee/i, name: 'Azithromycin', dosage: '500 mg', freq: 'Once daily' },
    { regex: /cetirizine|cetzine/i, name: 'Cetirizine', dosage: '10 mg', freq: 'At bedtime' },
    { regex: /insulin/i, name: 'Insulin', dosage: 'As prescribed', freq: 'Subcutaneous daily' },
  ];

  for (const m of knownMeds) {
    if (m.regex.test(lower)) {
      medMatches.push({ name: m.name, dosage: m.dosage, frequency: m.freq });
    }
  }
  if (medMatches.length > 0) entities.medications = medMatches;

  // 8. Allergies
  if (/penicillin.*allerg|allerg.*penicillin|penicillin\s*se\s*allergy/i.test(lower)) {
    entities.allergies = [{ substance: 'Penicillin', reaction: 'Skin rash / allergic reaction' }];
  } else if (/sulfa.*allerg|allerg.*sulfa/i.test(lower)) {
    entities.allergies = [{ substance: 'Sulfa drugs', reaction: 'Hypersensitivity' }];
  } else if (/aspirin.*allerg/i.test(lower)) {
    entities.allergies = [{ substance: 'Aspirin / NSAIDs', reaction: 'Bronchospasm / rash' }];
  }

  // 9. Past Medical Conditions
  const pastList: string[] = [];
  if (/high\s*bp|hypertension|blood\s*pressure|बीपी/i.test(lower)) pastList.push('Hypertension (High Blood Pressure)');
  if (/sugar|diabetes|madhumeh|मधुमेह/i.test(lower)) pastList.push('Type 2 Diabetes Mellitus');
  if (/asthma|dama|दमा/i.test(lower)) pastList.push('Bronchial Asthma');
  if (/heart\s*attack|stent|bypass|angioplasty|दिल\s*का\s*दौरा/i.test(lower)) pastList.push('Coronary Artery Disease (CAD)');
  if (/thyroid|hypothyroid/i.test(lower)) pastList.push('Hypothyroidism');
  if (pastList.length > 0) entities.pastHistory = pastList;

  // 10. Ayurveda Dashavidha Pariksha indicators
  if (/bhukh\s*kam|appetite\s*poor|mandagni|bloat|gas|apach/i.test(lower)) {
    entities.agni = 'Manda (Sluggish / Reduced digestive fire)';
  } else if (/bhukh\s*zyada|high\s*appetite|acidity|teekha/i.test(lower)) {
    entities.agni = 'Tikshna (Intense / Acidic)';
  }
  if (/shakahari|veg|vegetarian/i.test(lower)) entities.diet = 'Vegetarian';
  if (/non-?veg|mansahari/i.test(lower)) entities.diet = 'Non-Vegetarian';

  return entities;
}

// Symptom classification for adaptive branching
export function categorizeSymptom(text: string): 'cardiac' | 'respiratory' | 'fever' | 'gastro' | 'neuro' | 'skin' | 'ortho' | 'general' {
  const lower = (text || '').toLowerCase();
  if (lower.includes('chest') || lower.includes('heart') || lower.includes('palpitation') || lower.includes('angina') || lower.includes('सीने') || lower.includes('दिल')) {
    return 'cardiac';
  }
  if (lower.includes('breath') || lower.includes('cough') || lower.includes('wheez') || lower.includes('asthma') || lower.includes('phlegm') || lower.includes('सांस') || lower.includes('खांसी')) {
    return 'respiratory';
  }
  if (lower.includes('fever') || lower.includes('chills') || lower.includes('temperature') || lower.includes('shivering') || lower.includes('बुखार') || lower.includes('ठंड')) {
    return 'fever';
  }
  if (lower.includes('stomach') || lower.includes('abdomen') || lower.includes('vomit') || lower.includes('diarrhea') || lower.includes('acidity') || lower.includes('loose') || lower.includes('पेट') || lower.includes('उल्टी')) {
    return 'gastro';
  }
  if (lower.includes('headache') || lower.includes('dizz') || lower.includes('seizure') || lower.includes('numb') || lower.includes('weakness') || lower.includes('सिरदर्द') || lower.includes('चक्कर')) {
    return 'neuro';
  }
  if (lower.includes('rash') || lower.includes('itch') || lower.includes('skin') || lower.includes('blister') || lower.includes('allergy') || lower.includes('चकत्ते') || lower.includes('खुजली')) {
    return 'skin';
  }
  if (lower.includes('joint') || lower.includes('knee') || lower.includes('back') || lower.includes('swelling') || lower.includes('spine') || lower.includes('जोड़ों') || lower.includes('कमर')) {
    return 'ortho';
  }
  return 'general';
}

export interface AdaptiveQuestion {
  id: string;
  category: string;
  textEn: string;
  textHi: string;
  hintEn: string;
  hintHi: string;
  optionsEn: string[];
  optionsHi: string[];
  allowsVoice: boolean;
  allowsSkip: boolean;
}

export function getAdaptiveHPIQuestions(category: string): AdaptiveQuestion[] {
  switch (category) {
    case 'cardiac':
      return [
        {
          id: 'cardiac_character',
          category: 'hpi',
          textEn: 'How would you describe the sensation in your chest?',
          textHi: 'आप अपने सीने की तकलीफ या दर्द को किस प्रकार का महसूस करते हैं?',
          hintEn: 'E.g. heaviness, tight pressure, squeezing, or sharp stabbing.',
          hintHi: 'जैसे भारीपन, दबाव, जकड़न, तेज चुभन या जलन।',
          optionsEn: ['Heavy pressure / Squeezing tight', 'Sharp stabbing pain', 'Burning / Acid sensation', 'Dull continuous ache', 'Fluttering / Rapid heartbeat'],
          optionsHi: ['भारी दबाव / जकड़न', 'तेज चुभने वाला दर्द', 'जलन / खट्टा अहसास', 'धीमा लगातार दर्द', 'धड़कन तेज होना'],
          allowsVoice: true,
          allowsSkip: true,
        },
        {
          id: 'cardiac_radiation',
          category: 'hpi',
          textEn: 'Does this chest discomfort spread or move to your left arm, shoulder, jaw, or back?',
          textHi: 'क्या यह सीने का दर्द आपके बाएं हाथ, कंधे, जबड़े या पीठ की तरफ फैलता है?',
          hintEn: 'Radiating pain is an important cardiac diagnostic sign.',
          hintHi: 'दर्द का अन्य अंगों में फैलना एक महत्वपूर्ण चिकित्सीय संकेत है।',
          optionsEn: ['Radiating to left arm / shoulder', 'Spreading to jaw & neck', 'Spreading to back between shoulder blades', 'Stays centered in chest only', 'Not sure'],
          optionsHi: ['बाएं हाथ / कंधे में फैलता है', 'गर्दन और जबड़े की ओर', 'पीठ में फैलता है', 'केवल सीने में ही रहता है', 'पक्का नहीं पता'],
          allowsVoice: true,
          allowsSkip: true,
        },
        {
          id: 'cardiac_associated',
          category: 'hpi',
          textEn: 'Are you experiencing any shortness of breath, unusual sweating, or dizziness?',
          textHi: 'क्या आपको सांस फूलना, असामान्य पसीना आना या चक्कर महसूस हो रहे हैं?',
          hintEn: 'Cold sweats, breathlessness while walking or resting.',
          hintHi: 'ठंडा पसीना, चलने या लेटने पर सांस फूलना, या चक्कर आना।',
          optionsEn: ['Shortness of breath & Cold sweating', 'Shortness of breath only', 'Dizziness / Lightheadedness', 'Nausea / Feeling sick', 'None of these'],
          optionsHi: ['सांस फूलना और ठंडा पसीना', 'केवल सांस फूलना', 'चक्कर आना', 'उल्टी या मितली जैसा लगना', 'इनमें से कोई नहीं'],
          allowsVoice: true,
          allowsSkip: true,
        },
        {
          id: 'cardiac_triggers',
          category: 'hpi',
          textEn: 'Does walking or climbing stairs make the chest discomfort worse, and does resting relieve it?',
          textHi: 'क्या पैदल चलने या सीढ़ियां चढ़ने पर यह तकलीफ बढ़ती है, और आराम करने से घटती है?',
          hintEn: 'Exertional angina vs constant discomfort.',
          hintHi: 'परिश्रम से दर्द का संबंध।',
          optionsEn: ['Worse with exertion / Relieved by rest', 'Constant, no change with rest', 'Worse with deep breath or coughing', 'Worse after meals / lying flat', 'Unpredictable'],
          optionsHi: ['चलने पर बढ़ता है / आराम से राहत', 'लगातार बना रहता है', 'लंबी सांस लेने पर बढ़ता है', 'खाने के बाद या लेटने पर बढ़ता है', 'अनिश्चित'],
          allowsVoice: true,
          allowsSkip: true,
        },
      ];

    case 'fever':
      return [
        {
          id: 'fever_pattern',
          category: 'hpi',
          textEn: 'How high is your fever, and does it come with chills or shivering?',
          textHi: 'बुखार कितना तेज है, और क्या ठंड या कंपकंपी छूटती है?',
          hintEn: 'Continuous high fever, or coming at specific times like evening.',
          hintHi: 'लगातार तेज बुखार, या शाम/सुबह किसी खास समय आना।',
          optionsEn: ['High fever with severe chills / shivering', 'Mild low-grade fever continuously', 'Comes and goes in spikes', 'Worse in the evening / night', 'Not measured with thermometer'],
          optionsHi: ['तेज बुखार के साथ तेज ठंड/कंपकंपी', 'हल्का बुखार लगातार', 'चढ़ता-उतरता रहता है', 'रात/शाम को ज्यादा बढ़ता है', 'थर्मामीटर से नहीं नापा'],
          allowsVoice: true,
          allowsSkip: true,
        },
        {
          id: 'fever_associated',
          category: 'hpi',
          textEn: 'Do you also have cough, sore throat, severe body ache, or burning urination?',
          textHi: 'क्या आपको खांसी, गले में खराश, तेज बदन दर्द या पेशाब में जलन भी है?',
          hintEn: 'Helps identify potential respiratory, urinary, or viral causes.',
          hintHi: 'संक्रमण के स्रोत की पहचान में सहायक।',
          optionsEn: ['Severe body pain & headache', 'Cough with phlegm & sore throat', 'Vomiting or loose motions', 'Burning during urination', 'Rash on body'],
          optionsHi: ['शरीर और सिर में बहुत दर्द', 'खांसी, बलगम और गले में खराश', 'उल्टी या दस्त', 'पेशाब में जलन', 'शरीर पर लाल चकत्ते'],
          allowsVoice: true,
          allowsSkip: true,
        },
      ];

    case 'respiratory':
      return [
        {
          id: 'resp_cough_type',
          category: 'hpi',
          textEn: 'Is your cough dry, or are you bringing up phlegm/mucus?',
          textHi: 'आपकी खांसी सूखी है, या बलगम (कफ) निकल रहा है?',
          hintEn: 'Color of phlegm: clear, yellow, greenish, or blood-tinged.',
          hintHi: 'बलगम का रंग (सफेद, पीला, हरा, या खून के धब्बे)।',
          optionsEn: ['Dry hacking cough', 'Cough with clear / white phlegm', 'Cough with yellow / green phlegm', 'Traces of blood in cough (Hemoptysis)', 'Mostly coughing at night'],
          optionsHi: ['सूखी खांसी', 'सफेद/साफ बलगम वाली खांसी', 'पीला/हरा बलगम', 'खांसी में खून का अंश', 'रात में ज्यादा खांसी'],
          allowsVoice: true,
          allowsSkip: true,
        },
        {
          id: 'resp_breathlessness',
          category: 'hpi',
          textEn: 'How easily do you feel short of breath or hear wheezing?',
          textHi: 'सांस कितनी जल्दी फूलती है या क्या सीने से सीटी जैसी आवाज आती है?',
          hintEn: 'Shortness of breath walking flat ground vs sitting still.',
          hintHi: 'समतल चलने पर, सीढ़ियां चढ़ने पर, या बैठे-बैठे भी सांस फूलना।',
          optionsEn: ['Breathless even while resting / talking', 'Short of breath only while climbing stairs', 'Wheezing / whistling sound from chest', 'Need extra pillows to sleep flat', 'No breathing difficulty'],
          optionsHi: ['बैठे या बात करते समय भी सांस फूलती है', 'सीढ़ियां चढ़ने पर ही सांस फूलती है', 'सीने से सीटी जैसी आवाज', 'सोने के लिए 2-3 तकिए लगाने पड़ते हैं', 'सांस में कोई तकलीफ नहीं'],
          allowsVoice: true,
          allowsSkip: true,
        },
      ];

    case 'gastro':
      return [
        {
          id: 'gastro_location',
          category: 'hpi',
          textEn: 'Where in your abdomen do you feel the pain, and is it related to food?',
          textHi: 'पेट में दर्द किस जगह है, और क्या इसका खाने से कोई संबंध है?',
          hintEn: 'Upper stomach / heartburn, lower right side, or whole abdomen.',
          hintHi: 'ऊपरी पेट/खट्टी डकार, निचले दाएं हिस्से में, या पूरे पेट में।',
          optionsEn: ['Upper abdomen / Acid heartburn', 'Lower right abdomen (sharp pain)', 'Around navel / Crampy', 'Lower pelvis / Cramping', 'Whole stomach bloated & aching'],
          optionsHi: ['ऊपरी पेट / खट्टी जलन', 'निचले दाएं हिस्से में तेज दर्द', 'नाभि के चारों ओर मरोड़', 'निचले पेट में दर्द', 'पूरे पेट में अफारा और दर्द'],
          allowsVoice: true,
          allowsSkip: true,
        },
        {
          id: 'gastro_bowel',
          category: 'hpi',
          textEn: 'Have you experienced vomiting, diarrhea (loose motions), or difficulty passing stools?',
          textHi: 'क्या आपको उल्टी, दस्त, या शौच में रुकावट (कब्ज) की परेशानी हुई है?',
          hintEn: 'Frequency of loose stools or any dark / bloody stool.',
          hintHi: 'दस्त की संख्या या मल में कालापन या खून।',
          optionsEn: ['Frequent watery loose motions', 'Vomiting food or fluids', 'Severe constipation for 2+ days', 'Black / dark tarry stools', 'Normal bowel movements'],
          optionsHi: ['बार-बार पानी जैसे दस्त', 'उल्टी होना', 'गंभीर कब्ज (2+ दिनों से)', 'काला मल आना', 'शौच सामान्य है'],
          allowsVoice: true,
          allowsSkip: true,
        },
      ];

    case 'neuro':
      return [
        {
          id: 'neuro_character',
          category: 'hpi',
          textEn: 'Did this headache begin suddenly (like a thunderclap) or build up gradually?',
          textHi: 'क्या सिरदर्द अचानक बिजली की तरह शुरू हुआ या धीरे-धीरे बढ़ा?',
          hintEn: 'Sudden worst headache of life vs gradual migraine or tension ache.',
          hintHi: 'अचानक तेज सिरदर्द या तनाव/माइग्रेन जैसा।',
          optionsEn: ['Sudden explosive "worst headache of life"', 'Gradual throbbing on one side', 'Dull pressure around entire forehead', 'Comes with nausea & light sensitivity', 'Comes with dizziness / balance loss'],
          optionsHi: ['अचानक भयानक तेज दर्द', 'एक तरफा धड़कता हुआ दर्द', 'माथे पर चारों तरफ दबाव', 'उल्टी व रोशनी से परेशानी के साथ', 'चक्कर व संतुलन बिगड़ने के साथ'],
          allowsVoice: true,
          allowsSkip: true,
        },
        {
          id: 'neuro_focal',
          category: 'hpi',
          textEn: 'Have you noticed any facial weakness, arm numbness, slurred speech, or vision blur?',
          textHi: 'क्या चेहरे में कमजोरी, हाथ में सुन्नपन, बोलने में लड़खड़ाहट या नजर धुंधली हुई है?',
          hintEn: 'Immediate stroke screening signs.',
          hintHi: 'लकवा/स्ट्रोक के महत्वपूर्ण चेतावनी संकेत।',
          optionsEn: ['Weakness or numbness in arm / leg', 'Difficulty speaking clearly', 'Blurry or double vision', 'None of these neurological symptoms'],
          optionsHi: ['हाथ या पैर में कमजोरी / सुन्नपन', 'बोलने में लड़खड़ाहट', 'धुंधला या दोहरा दिखाई देना', 'इनमें से कोई लक्षण नहीं'],
          allowsVoice: true,
          allowsSkip: true,
        },
      ];

    case 'skin':
      return [
        {
          id: 'skin_character',
          category: 'hpi',
          textEn: 'Where is the rash located, and does it itch, burn, or blister?',
          textHi: 'चकत्ते शरीर पर कहाँ हैं, और क्या इनमें तेज खुजली, जलन या छाले हैं?',
          hintEn: 'New soap, medicine, insect bite, or food allergy history.',
          hintHi: 'कोई नई दवा, साबुन, कीड़े का काटना या खानपान से एलर्जी।',
          optionsEn: ['Intense itching with red raised bumps (hives)', 'Dry peeling patches', 'Blisters / fluid-filled bumps', 'Burning sensation with redness', 'Spreading rapidly over body'],
          optionsHi: ['तेज खुजली और लाल उभरे चकत्ते (पित्ती)', 'सूखे पपड़ीदार चकत्ते', 'पानी वाले छाले', 'लाल चकत्तों के साथ जलन', 'शरीर पर तेजी से फैल रहे हैं'],
          allowsVoice: true,
          allowsSkip: true,
        },
      ];

    default:
      return [
        {
          id: 'gen_duration_pattern',
          category: 'hpi',
          textEn: 'How has this symptom been progressing since it first began?',
          textHi: 'जब से यह समस्या शुरू हुई है, इसमें क्या बदलाव आया है?',
          hintEn: 'Getting progressively worse, staying the same, or fluctuating.',
          hintHi: 'धीरे-धीरे बढ़ रहा है, एक जैसा है, या आता-जाता है।',
          optionsEn: ['Getting progressively worse', 'Staying about the same', 'Comes and goes intermittently', 'Slowly improving with rest', 'First time experiencing this'],
          optionsHi: ['लगातार बढ़ रहा है', 'एक जैसा बना हुआ है', 'बार-बार आता-जाता है', 'आराम करने पर सुधरता है', 'पहली बार ऐसा हुआ है'],
          allowsVoice: true,
          allowsSkip: true,
        },
      ];
  }
}

// Detect clinical contradictions in patient answers
export function detectContradiction(interview: ClinicalInterview, newKey: string, newAnswer: string): { hasContradiction: boolean; messageEn?: string; messageHi?: string; resolutionOptions?: string[] } {
  const answerLower = newAnswer.toLowerCase();

  const hasClaimedNoMeds = interview.drugHistory.some(m => m.name.toLowerCase().includes('none') || m.name.toLowerCase().includes('no medicines') || m.name.toLowerCase().includes('कोई दवा नहीं'));
  const mentionsMed = answerLower.includes('metformin') || answerLower.includes('telmisartan') || answerLower.includes('amlodipine') || answerLower.includes('paracetamol') || answerLower.includes('insulin') || answerLower.includes('tablet') || answerLower.includes('capsule') || answerLower.includes('goli');

  if (hasClaimedNoMeds && mentionsMed) {
    return {
      hasContradiction: true,
      messageEn: 'Please Clarify: Earlier you mentioned that you were not taking any daily medicines. You now mentioned a medication. Which information should we record for your doctor?',
      messageHi: 'कृपया स्पष्ट करें: पहले आपने बताया था कि आप कोई नियमित दवा नहीं ले रहे हैं। अब आपने दवाई का जिक्र किया है। आपके डॉक्टर के लिए क्या दर्ज करें?',
      resolutionOptions: ['Yes, I take this medication daily', 'No, I took it only once in the past', 'I am not taking any regular medicine'],
    };
  }

  const hasClaimedNoAllergy = interview.allergies.some(a => a.substance.toLowerCase().includes('no') || a.substance.toLowerCase().includes('none') || a.substance.toLowerCase().includes('कोई नहीं'));
  const mentionsAllergy = answerLower.includes('penicillin') || answerLower.includes('sulfa') || answerLower.includes('reaction') || answerLower.includes('rash') || answerLower.includes('allergy') || answerLower.includes('एलर्जी');

  if (hasClaimedNoAllergy && mentionsAllergy) {
    return {
      hasContradiction: true,
      messageEn: 'Please Clarify: Earlier you stated you had no known drug allergies. You just noted a reaction. Shall we record an allergy for your doctor?',
      messageHi: 'कृपया स्पष्ट करें: पहले आपने बताया था कि आपको कोई एलर्जी नहीं है। क्या हमें डॉक्टर के लिए यह एलर्जी दर्ज करनी चाहिए?',
      resolutionOptions: ['Yes, please record this allergy', 'No, it was just mild temporary upset', 'I am not sure'],
    };
  }

  return { hasContradiction: false };
}

// Generate the complete structured Clinical Report
export function buildClinicalReport(interview: ClinicalInterview, patient: Patient): ClinicalReport {
  const redFlagList = interview.redFlags || [];
  const triagePriority = redFlagList.length > 0 ? 'HIGH' : 'NORMAL';

  const cc = interview.chiefComplaint || 'General Outpatient Consultation';
  const onset = interview.hpi.onset || 'Recently';
  const severity = interview.hpi.severity ? `Severity: ${interview.hpi.severity}` : 'Severity not quantified';
  const character = interview.hpi.character || 'Ache / Discomfort';
  const radiation = interview.hpi.radiation ? `Radiating to: ${interview.hpi.radiation}` : 'No radiation reported';
  const assoc = interview.hpi.associatedSymptoms && interview.hpi.associatedSymptoms.length > 0
    ? `Associated distress: ${interview.hpi.associatedSymptoms.join(', ')}`
    : 'No acute associated distress reported';
  const aggravating = interview.hpi.aggravatingFactors
    ? (Array.isArray(interview.hpi.aggravatingFactors) ? interview.hpi.aggravatingFactors.join(', ') : interview.hpi.aggravatingFactors)
    : 'None reported';
  const relieving = interview.hpi.relievingFactors
    ? (Array.isArray(interview.hpi.relievingFactors) ? interview.hpi.relievingFactors.join(', ') : interview.hpi.relievingFactors)
    : 'None reported';

  const hpiNarrative = `${patient.name}, a ${patient.age}-year-old ${patient.gender}, presents for clinical evaluation of ${cc} (${onset}). The symptom is described as ${character}. ${severity}. ${radiation}. ${assoc}. Aggravating factors: ${aggravating}. Relieving factors: ${relieving}.`;

  const keyPoints: string[] = [];
  if (redFlagList.length > 0) {
    keyPoints.push(`🚨 RED-FLAG ALERT: ${redFlagList.map(r => r.ruleTriggered).join(', ')}`);
  }
  keyPoints.push(`Primary complaint: ${cc} (${onset})`);
  if (interview.pastHistory.length > 0 && !interview.pastHistory.includes('None')) {
    keyPoints.push(`Relevant past medical history: ${interview.pastHistory.join(', ')}`);
  }
  if (interview.drugHistory.length > 0 && !interview.drugHistory[0].name.toLowerCase().includes('none')) {
    keyPoints.push(`Active medications: ${interview.drugHistory.map(m => `${m.name} (${m.dosage})`).join(', ')}`);
  }
  if (interview.allergies.length > 0 && !interview.allergies[0].substance.toLowerCase().includes('no')) {
    keyPoints.push(`⚠️ Known allergies: ${interview.allergies.map(a => `${a.substance} (${a.reaction || 'Allergy'})`).join(', ')}`);
  }
  if (interview.documents && interview.documents.length > 0) {
    keyPoints.push(`Digitized documents: ${interview.documents.length} verified records available for cross-consultation.`);
  }

  const quickSummary = `Pre-consultation digital clinical intake completed via MediKiosk Clinical Intake System. ${hpiNarrative} Triage priority determined as ${triagePriority}. Information verified with patient prior to consultation.`;

  // Calculate algorithmic Risk Stratification Score (0 - 100)
  const priorityScore = calculateRiskStratificationScore({
    chiefComplaint: cc,
    historyOfPresentIllness: hpiNarrative,
    redFlags: redFlagList,
    age: patient.age,
    pastMedicalHistory: interview.pastHistory,
    drugHistory: interview.drugHistory,
    documents: interview.documents,
  });

  // Calculate drug continuity & pharmacological interaction alerts
  const drugSafetyAlerts = checkMedicationSafety(
    interview.drugHistory,
    interview.allergies.map(a => a.substance)
  );

  return {
    id: `REP-${Date.now().toString().slice(-6)}`,
    patientId: patient.id,
    interviewId: interview.id,
    intakeId: interview.intakeId || `INT-${patient.id}`,
    patientName: patient.name,
    age: patient.age,
    gender: patient.gender,
    abhaId: patient.abhaId,
    token: patient.token,
    generatedAt: new Date().toISOString(),
    status: 'AWAITING_DOCTOR_REVIEW',
    summary: {
      quickClinicalSummary: quickSummary,
      keyPointsForDoctor: keyPoints,
    },
    chiefComplaint: cc,
    historyOfPresentIllness: hpiNarrative,
    reviewOfSystems: interview.reviewOfSystems || {},
    pastMedicalHistory: interview.pastHistory.length > 0 ? interview.pastHistory : ['Not reported / No prior diagnosed conditions'],
    pastSurgicalHistory: interview.surgicalHistory.length > 0 ? interview.surgicalHistory.map(s => `${s.surgery} (${s.year || 'Date not recorded'})`) : ['No prior surgeries reported'],
    hospitalizationHistory: interview.hospitalizationHistory.length > 0 ? interview.hospitalizationHistory.map(h => `${h.reason} (${h.year || 'Date not recorded'})`) : ['No prior hospitalizations reported'],
    drugHistory: interview.drugHistory.length > 0 ? interview.drugHistory : [{ name: 'None reported', dosage: '-', frequency: '-', source: 'Patient interview' }],
    allergies: interview.allergies.length > 0 ? interview.allergies : [{ substance: 'No known drug allergies reported', reaction: '-', source: 'Patient interview' }],
    familyHistory: interview.familyHistory.length > 0 ? interview.familyHistory : [{ relationship: 'Family', condition: 'No specific hereditary condition reported' }],
    personalHistory: interview.personalHistory || { diet: 'Vegetarian / Regular', sleep: 'Adequate', physicalActivity: 'Moderate' },
    femaleHealthHistory: patient.gender === 'Female' ? interview.femaleHealthHistory : undefined,
    ayurvedaAssessment: interview.ayurvedaHistory,
    documents: interview.documents || [],
    redFlags: interview.redFlags || [],
    priorityScore,
    drugSafetyAlerts,
    triagePriority,
    demographics: {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      token: patient.token,
      abhaAddress: patient.abhaId,
      phone: patient.phone,
    },
    hpiDetails: {
      onset,
      duration: interview.hpi.duration || 'Acute onset',
      progression: interview.hpi.progression || 'Stable',
      severity: String(interview.hpi.severity || 'Moderate'),
      character,
      location: interview.hpi.location || 'Local / Generalized',
      radiation,
      aggravating,
      relieving,
      associatedSymptoms: interview.hpi.associatedSymptoms && interview.hpi.associatedSymptoms.length > 0
        ? interview.hpi.associatedSymptoms.join(', ')
        : 'None reported',
    },
    disclaimer: 'AI-generated clinical intake summary. This report is intended to assist healthcare professionals and is not a medical diagnosis.',
  };
}
