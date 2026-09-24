export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  bcp47: string;
  dir: 'ltr' | 'rtl';
  speechRecognition: boolean;
  textToSpeech: boolean;
  script: string;
  region: 'indian' | 'international';
  sampleGreeting: string;
}

export const SUPPORTED_LANGUAGES_REGISTRY: LanguageConfig[] = [
  // --- Indian Languages & Regional Scripts ---
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    bcp47: 'en-IN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Latin',
    region: 'indian',
    sampleGreeting: 'Hello! I am Anna, your AI clinical intake assistant. What health problem brings you here today?',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    bcp47: 'hi-IN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Devanagari',
    region: 'indian',
    sampleGreeting: 'नमस्ते! मैं अन्ना हूँ, आपकी एआई क्लिनिकल इंटेक सहायक। आज आप डॉक्टर को किस स्वास्थ्य समस्या के बारे में बताना चाहते हैं?',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    bcp47: 'mr-IN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Devanagari',
    region: 'indian',
    sampleGreeting: 'नमस्कार! मी अण्णा आहे, तुमची एआय क्लिनिकल सहाय्यक. आज तुम्हाला डॉक्टरकडे कोणत्या त्रासाबद्दल सांगायचे आहे?',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    bcp47: 'bn-IN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Bengali',
    region: 'indian',
    sampleGreeting: 'নমস্কার! আমি আন্না, আপনার এআই ক্লিনিকাল সহায়ক। আজ আপনি ডাক্তারের সাথে কোন সমস্যা আলোচনা করতে চান?',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    bcp47: 'gu-IN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Gujarati',
    region: 'indian',
    sampleGreeting: 'નમસ્તે! હું અન્ના છું, તમારી એઆઈ ક્લિનિકલ સહાયક. આજે તમે ડૉક્ટરને કઈ સ્વાસ્થ્ય સમસ્યા વિશે જણાવવા માંગો છો?',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    bcp47: 'pa-IN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Gurmukhi',
    region: 'indian',
    sampleGreeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਅੰਨਾ ਹਾਂ, ਤੁਹਾਡੀ ਏਆਈ ਕਲੀਨਿਕਲ ਸਹਾਇਕ। ਅੱਜ ਤੁਸੀਂ ਡਾਕਟਰ ਨੂੰ ਕਿਸ ਬਿਮਾਰੀ ਬਾਰੇ ਦੱਸਣਾ ਚਾਹੁੰਦੇ ਹੋ?',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    bcp47: 'ta-IN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Tamil',
    region: 'indian',
    sampleGreeting: 'வணக்கம்! நான் அன்னா, உங்கள் மருத்துவ உதவியாளர். இன்று மருத்துவரிடம் என்ன உடல்நலப் பிரச்சனை பற்றி கூற விரும்புகிறீர்கள்?',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    bcp47: 'te-IN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Telugu',
    region: 'indian',
    sampleGreeting: 'నమస్కారం! నేను అన్నా, మీ ఏఐ క్లినికల్ అసిస్టెంట్. ఈరోజు మీరు వైద్యుడికి ఏ ఆరోగ్య సమస్య గురించి చెప్పాలనుకుంటున్నారు?',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    bcp47: 'kn-IN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Kannada',
    region: 'indian',
    sampleGreeting: 'ನಮಸ್ಕಾರ! ನಾನು ಅನ್ನಾ, ನಿಮ್ಮ ಎಐ ಕ್ಲಿನಿಕಲ್ ಸಹಾಯಕ. ಇಂದು ನೀವು ವೈದ್ಯರಿಗೆ ಯಾವ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ಹೇಳಲು ಬಯಸುತ್ತೀರಿ?',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    bcp47: 'ml-IN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Malayalam',
    region: 'indian',
    sampleGreeting: 'നമസ്കാരം! ഞാൻ അന്ന, നിങ്ങളുടെ ക്ലിനിക്കൽ അസിസ്റ്റന്റ്. ഇന്ന് ഡോക്ടറോട് ഏത് ആരോഗ്യപ്രശ്നത്തെക്കുറിച്ചാണ് സംസാരിക്കേണ്ടത്?',
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    bcp47: 'or-IN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Odia',
    region: 'indian',
    sampleGreeting: 'ନମସ୍କାର! ମୁଁ ଆନ୍ନା, ଆପଣଙ୍କ ଏଆଇ କ୍ଲିନିକାଲ୍ ସହାୟିକା। ଆଜି ଡାକ୍ତରଙ୍କୁ କେଉଁ ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା ବିଷୟରେ ଜଣାଇବାକୁ ଚାହୁଁଛନ୍ତି?',
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    bcp47: 'as-IN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Bengali',
    region: 'indian',
    sampleGreeting: 'নমস্কাৰ! মই আন্না, আপোনাৰ এআই ক্লিনিকীয় সহায়িকা। আজি আপুনি চিকিৎসকক কি স্বাস্থ্য সমস্যাৰ বিষয়ে ক’ব খোজে?',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    bcp47: 'ur-IN',
    dir: 'rtl',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Arabic',
    region: 'indian',
    sampleGreeting: 'السلام علیکم! میں اینا ہوں، آپ کی اے آئی کلینیکل اسسٹنٹ۔ آج آپ ڈاکٹر کو کس صحت کے مسئلے کے بارے میں بتانا چاہتے ہیں؟',
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    bcp47: 'ne-NP',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Devanagari',
    region: 'indian',
    sampleGreeting: 'नमस्ते! म अन्ना हुँ, तपाईंको एआई क्लिनिकल सहायक। आज तपाईं डाक्टरसँग कुन स्वास्थ्य समस्याबारे कुरा गर्न चाहनुहुन्छ?',
  },
  {
    code: 'ks',
    name: 'Kashmiri',
    nativeName: 'कॉशुर / کٲشُر',
    bcp47: 'ks-IN',
    dir: 'rtl',
    speechRecognition: false,
    textToSpeech: true,
    script: 'Arabic',
    region: 'indian',
    sampleGreeting: 'سلام! با چھس انا، تۄہنز کلینکل مددگار۔ از کم صحتک مسلہ چھیو ڈاکٹرس ونن؟',
  },
  {
    code: 'kok',
    name: 'Konkani',
    nativeName: 'कोंकणी',
    bcp47: 'kok-IN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Devanagari',
    region: 'indian',
    sampleGreeting: 'नमस्कार! हांव आन्ना, तुमची एआय क्लिनिकल सहाय्यक। आयज तुमी दोतोराक खंयची भलायकी समस्या सांगूंक सोदतात?',
  },
  {
    code: 'mni',
    name: 'Manipuri (Meitei)',
    nativeName: 'মৈতৈলোন্',
    bcp47: 'mni-IN',
    dir: 'ltr',
    speechRecognition: false,
    textToSpeech: true,
    script: 'Bengali',
    region: 'indian',
    sampleGreeting: 'খুরুমজরি! ঐনা আন্না নি, অদোমগী এআই ক্লিনিকল মতেং পাংবা। ঙসি অদোমনা দোক্তরদা করি হকশেলগী ৱাফম ফোংদোকপা পাম্বগে?',
  },
  {
    code: 'sa',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    bcp47: 'sa-IN',
    dir: 'ltr',
    speechRecognition: false,
    textToSpeech: true,
    script: 'Devanagari',
    region: 'indian',
    sampleGreeting: 'नमस्ते! अहं आन्ना, भवतः स्वास्थ्यसहायिका अस्मि। अद्य भवन्तः वैद्याय किं वक्तुम् इच्छन्ति?',
  },

  // --- Major International Languages ---
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    bcp47: 'es-ES',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Latin',
    region: 'international',
    sampleGreeting: '¡Hola! Soy Anna, su asistente clínica de IA. ¿Qué problema de salud le gustaría consultar hoy con el médico?',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    bcp47: 'fr-FR',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Latin',
    region: 'international',
    sampleGreeting: 'Bonjour ! Je suis Anna, votre assistante clinique IA. Quel problème de santé souhaitez-vous signaler au médecin aujourd’hui ?',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    bcp47: 'de-DE',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Latin',
    region: 'international',
    sampleGreeting: 'Guten Tag! Ich bin Anna, Ihre klinische KI-Assistentin. Welches gesundheitliche Problem möchten Sie heute dem Arzt schildern?',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    bcp47: 'pt-BR',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Latin',
    region: 'international',
    sampleGreeting: 'Olá! Sou a Anna, sua assistente clínica de IA. Qual problema de saúde você gostaria de relatar ao médico hoje?',
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    bcp47: 'it-IT',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Latin',
    region: 'international',
    sampleGreeting: 'Ciao! Sono Anna, la tua assistente clinica AI. Quale problema di salute desideri riferire al medico oggi?',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    bcp47: 'ar-SA',
    dir: 'rtl',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Arabic',
    region: 'international',
    sampleGreeting: 'مرحباً! أنا آنا، مساعدتكم الطبية للرعاية الصحية. ما هي المشكلة الصحية التي تودون إخبار الطبيب بها اليوم؟',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    bcp47: 'ru-RU',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Cyrillic',
    region: 'international',
    sampleGreeting: 'Здравствуйте! Я Анна, ваш клинический ассистент ИИ. О какой проблеме со здоровьем вы хотите рассказать врачу?',
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '中文 (简体)',
    bcp47: 'zh-CN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Han',
    region: 'international',
    sampleGreeting: '您好！我是安娜，您的AI临床预诊助手。今天您想向医生咨询哪些健康问题？',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    bcp47: 'ja-JP',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Japanese',
    region: 'international',
    sampleGreeting: 'こんにちは！私はAI医療問診アシスタントのアンナです。本日はどのような症状で受診をご希望ですか？',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    bcp47: 'ko-KR',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Hangul',
    region: 'international',
    sampleGreeting: '안녕하세요! 저는 AI 임상 접수 도우미 안나입니다. 오늘 의사 선생님께 어떤 건강 문제로 진료를 받고 싶으신가요?',
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    bcp47: 'tr-TR',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Latin',
    region: 'international',
    sampleGreeting: 'Merhaba! Ben Anna, yapay zeka klinik danışmanınız. Bugün doktorunuza hangi sağlık sorununuz hakkında bilgi vermek istersiniz?',
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    bcp47: 'id-ID',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Latin',
    region: 'international',
    sampleGreeting: 'Halo! Saya Anna, asisten asupan klinis AI Anda. Masalah kesehatan apa yang ingin Anda sampaikan ke dokter hari ini?',
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    bcp47: 'vi-VN',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Latin',
    region: 'international',
    sampleGreeting: 'Xin chào! Tôi là Anna, trợ lý y tế lâm sàng AI của bạn. Hôm nay bạn muốn thông báo cho bác sĩ vấn đề sức khỏe nào?',
  },
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    bcp47: 'th-TH',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Thai',
    region: 'international',
    sampleGreeting: 'สวัสดีค่ะ! ฉันคือแอนนา ผู้ช่วยซักประวัติคลินิก AI ของคุณ วันนี้คุณต้องการปรึกษาแพทย์เรื่องปัญหาสุขภาพใดคะ?',
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    bcp47: 'nl-NL',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Latin',
    region: 'international',
    sampleGreeting: 'Hallo! Ik ben Anna, uw klinische AI-intakeassistent. Welk gezondheidsprobleem wilt u vandaag met de arts bespreken?',
  },
  {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    bcp47: 'pl-PL',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Latin',
    region: 'international',
    sampleGreeting: 'Dzień dobry! Jestem Anna, Państwa asystentka medyczna AI. Jaki problem zdrowotny chcieliby Państwo skonsultować dzisiaj z lekarzem?',
  },
  {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    bcp47: 'uk-UA',
    dir: 'ltr',
    speechRecognition: true,
    textToSpeech: true,
    script: 'Cyrillic',
    region: 'international',
    sampleGreeting: 'Вітаю! Я Анна, ваша медична асистентка ШІ. Про яку проблему зі здоров’ям ви хочете повідомити лікаря сьогодні?',
  },
];

/**
 * Get all supported languages in the registry
 */
export function getSupportedLanguages(): LanguageConfig[] {
  return SUPPORTED_LANGUAGES_REGISTRY;
}

/**
 * Get language configuration by code (defaults to English)
 */
export function getLanguageConfig(code: string): LanguageConfig {
  const cleanCode = (code || '').toLowerCase().trim();
  const match = SUPPORTED_LANGUAGES_REGISTRY.find(l => l.code === cleanCode || l.bcp47.toLowerCase().startsWith(cleanCode));
  return match || SUPPORTED_LANGUAGES_REGISTRY[0]; // fallback English
}

/**
 * Detect language from text (supporting Devanagari, regional scripts, international alphabets, and Hinglish)
 */
export function detectLanguageFromText(text: string): { code: string; confidence: number; isHinglish?: boolean } {
  if (!text || text.trim().length === 0) {
    return { code: 'en', confidence: 0.5 };
  }

  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. Script-based Unicode block detection
  let devanagariCount = 0;
  let bengaliCount = 0;
  let gurmukhiCount = 0;
  let gujaratiCount = 0;
  let tamilCount = 0;
  let teluguCount = 0;
  let kannadaCount = 0;
  let malayalamCount = 0;
  let odiaCount = 0;
  let arabicCount = 0;
  let cyrillicCount = 0;
  let hanCount = 0;
  let japaneseCount = 0;
  let hangulCount = 0;
  let thaiCount = 0;

  for (let i = 0; i < clean.length; i++) {
    const cp = clean.codePointAt(i) || 0;
    if (cp >= 0x0900 && cp <= 0x097f) devanagariCount++;
    else if (cp >= 0x0980 && cp <= 0x09ff) bengaliCount++;
    else if (cp >= 0x0a00 && cp <= 0x0a7f) gurmukhiCount++;
    else if (cp >= 0x0a80 && cp <= 0x0aff) gujaratiCount++;
    else if (cp >= 0x0b80 && cp <= 0x0bff) tamilCount++;
    else if (cp >= 0x0c00 && cp <= 0x0c7f) teluguCount++;
    else if (cp >= 0x0c80 && cp <= 0x0cff) kannadaCount++;
    else if (cp >= 0x0d00 && cp <= 0x0d7f) malayalamCount++;
    else if (cp >= 0x0b00 && cp <= 0x0b7f) odiaCount++;
    else if (cp >= 0x0600 && cp <= 0x06ff) arabicCount++;
    else if (cp >= 0x0400 && cp <= 0x04ff) cyrillicCount++;
    else if (cp >= 0x4e00 && cp <= 0x9fff) hanCount++;
    else if ((cp >= 0x3040 && cp <= 0x309f) || (cp >= 0x30a0 && cp <= 0x30ff)) japaneseCount++;
    else if (cp >= 0xac00 && cp <= 0xd7af) hangulCount++;
    else if (cp >= 0x0e00 && cp <= 0x0e7f) thaiCount++;
  }

  // Devanagari disambiguation: Marathi vs Nepali vs Konkani vs Sanskrit vs Hindi
  if (devanagariCount >= 2) {
    const marathiKeywords = /आहे|नाही|होते|त्रास|पोटात|डोके|औषध|सांगा|कधीपासून|रुग्ण|डॉक्टरकडे|फार|खूप|चालू|करणे|येत/;
    if (marathiKeywords.test(clean)) {
      return { code: 'mr', confidence: 0.95 };
    }
    const nepaliKeywords = /छ|छैन|भयो|गर्छ|दुख्छ|औषधी|समस्या|पेट|टाउको|कहिलेदेखि/;
    if (nepaliKeywords.test(clean)) {
      return { code: 'ne', confidence: 0.95 };
    }
    const konkaniKeywords = /हांव|आसा|ना|दिसता|दोतोर|भलायकी|खंय/;
    if (konkaniKeywords.test(clean)) {
      return { code: 'kok', confidence: 0.95 };
    }
    const sanskritKeywords = /अहम्|अस्मि|अस्ति|भवतः|वैद्याय|कुरु/;
    if (sanskritKeywords.test(clean)) {
      return { code: 'sa', confidence: 0.95 };
    }
    return { code: 'hi', confidence: 0.95 };
  }

  // Bengali script: Bengali vs Assamese vs Manipuri
  if (bengaliCount >= 2) {
    if (/মই|আপোনাৰ|ক’ব|খোজে|চিকিৎসক|হৈছে/.test(clean)) {
      return { code: 'as', confidence: 0.95 };
    }
    if (/ঐনা|অদোমগী|হকশেলগী|দোক্তর/.test(clean)) {
      return { code: 'mni', confidence: 0.95 };
    }
    return { code: 'bn', confidence: 0.95 };
  }

  if (gujaratiCount >= 2) return { code: 'gu', confidence: 0.95 };
  if (gurmukhiCount >= 2) return { code: 'pa', confidence: 0.95 };
  if (tamilCount >= 2) return { code: 'ta', confidence: 0.95 };
  if (teluguCount >= 2) return { code: 'te', confidence: 0.95 };
  if (kannadaCount >= 2) return { code: 'kn', confidence: 0.95 };
  if (malayalamCount >= 2) return { code: 'ml', confidence: 0.95 };
  if (odiaCount >= 2) return { code: 'or', confidence: 0.95 };

  // Arabic script: Urdu vs Arabic vs Kashmiri
  if (arabicCount >= 2) {
    if (/چھس|تۄہنز|مسلہ|ونم/.test(clean)) return { code: 'ks', confidence: 0.95 };
    if (/مجھے|ہے|ہیں|درد|طبیب|ڈاکٹر|تکلیف|بخار/.test(clean)) return { code: 'ur', confidence: 0.95 };
    return { code: 'ar', confidence: 0.95 };
  }

  // Cyrillic: Ukrainian vs Russian
  if (cyrillicCount >= 2) {
    if (/[іїєґ]/i.test(clean) || /лікар|біль|здоров|віта/.test(lower)) return { code: 'uk', confidence: 0.95 };
    return { code: 'ru', confidence: 0.95 };
  }

  if (japaneseCount >= 2) return { code: 'ja', confidence: 0.95 };
  if (hanCount >= 2) return { code: 'zh', confidence: 0.95 };
  if (hangulCount >= 2) return { code: 'ko', confidence: 0.95 };
  if (thaiCount >= 2) return { code: 'th', confidence: 0.95 };

  // 2. Hinglish / Romanized Hindi phonetic detection
  const hinglishPatterns = [
    /\b(mujhe|mera|meri|mere|humko|apna|apni|aapko)\b/i,
    /\b(dard|bukhar|sirdard|pet|chhati|khansi|saans|goli|dawa|dawai|ulti|chakkar)\b/i,
    /\b(hai|hain|tha|thi|the|hoga|hogi|raha|rahi|rahe|karta|karti|ho\s*raha)\b/i,
    /\b(din\s*se|kal\s*se|aaj\s*subah|do\s*din|teen\s*din|hafte\s*se|pehle)\b/i,
    /\b(bohot|bahut|thoda|halka|tez|zyada|jada|kuch)\b/i,
    /\b(kaisa|kaise|kya|kyun|kab|kahan)\b/i,
    /\b(bataiye|dikhaana|de\s*do|khata\s*hoon|liya\s*tha|li\s*thi)\b/i,
    /\b(doctor\s*se\s*milna|checkup\s*karwana|ilaj)\b/i,
  ];

  let hinglishScore = 0;
  for (const pat of hinglishPatterns) {
    if (pat.test(lower)) hinglishScore++;
  }

  if (hinglishScore >= 2 || (hinglishScore >= 1 && (lower.includes('mujhe') || lower.includes('dard') || lower.includes('bukhar')))) {
    return { code: 'hi', confidence: 0.92, isHinglish: true };
  }

  // 3. International Latin languages detection
  // Spanish
  if (/\b(tengo|dolor|cabeza|pecho|fiebre|desde|ayer|dias|estomago|medico|doctora|pastillas|siento)\b/i.test(lower)) {
    return { code: 'es', confidence: 0.9 };
  }
  // French
  if (/\b(j'ai|douleur|tete|ventre|poitrine|fievre|depuis|hier|jours|medecin|medicament|mal)\b/i.test(lower)) {
    return { code: 'fr', confidence: 0.9 };
  }
  // German
  if (/\b(ich\s*habe|schmerzen|kopfschmerzen|brustschmerzen|fieber|seit|gestern|tage|arzt|medikamente|mir\s*geht)\b/i.test(lower)) {
    return { code: 'de', confidence: 0.9 };
  }
  // Portuguese
  if (/\b(estou|tenho|dor|cabeca|peito|febre|desde|ontem|dias|remedio|medico|sinto)\b/i.test(lower)) {
    return { code: 'pt', confidence: 0.9 };
  }
  // Italian
  if (/\b(ho|dolore|testa|petto|febbre|da|ieri|giorni|dottore|medico|farmaco|male)\b/i.test(lower)) {
    return { code: 'it', confidence: 0.9 };
  }
  // Dutch
  if (/\b(ik\s*heb|pijn|hoofdpijn|borstpijn|koorts|sinds|gisteren|dagen|dokter|arts|medicijnen)\b/i.test(lower)) {
    return { code: 'nl', confidence: 0.9 };
  }
  // Polish
  if (/\b(mam|boli|glowa|brzuch|goraczka|od|wczoraj|dni|lekarz|leki|pacjent)\b/i.test(lower)) {
    return { code: 'pl', confidence: 0.9 };
  }
  // Turkish
  if (/\b(agrim|agri|basim|gogsum|ates|dun|beri|gun|doktor|ilac|hastayim)\b/i.test(lower)) {
    return { code: 'tr', confidence: 0.9 };
  }
  // Indonesian
  if (/\b(saya|sakit|kepala|dada|demam|sejak|kemarin|hari|dokter|obat)\b/i.test(lower)) {
    return { code: 'id', confidence: 0.9 };
  }
  // Vietnamese
  if (/\b(toi|dau|dau\s*dau|sot|tu|hom\s*qua|ngay|bac\s*si|thuoc)\b/i.test(lower)) {
    return { code: 'vi', confidence: 0.9 };
  }

  // Default to English
  return { code: 'en', confidence: 0.8 };
}
