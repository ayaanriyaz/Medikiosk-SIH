/**
 * Central Language Registry for MediKiosk
 * Supports Global & Eighth Schedule Indian Regional Languages
 * Designed for dynamic provider-agnostic expansion (ASR, TTS, LLM)
 */

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  bcp47: string;
  dir: 'ltr' | 'rtl';
  region: 'india' | 'international';
  script: string;
  speechRecognitionSupport: boolean;
  ttsSupport: boolean;
  samplePhrases: {
    greeting: string;
    queueQuery: string;
    appointmentQuery: string;
    medicineQuery: string;
    emergencyWarning: string;
  };
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  // --- Indian Regional & Official Languages ---
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    bcp47: 'hi-IN',
    dir: 'ltr',
    region: 'india',
    script: 'Devanagari',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'नमस्ते! मैं आपकी स्वास्थ्य सहायक हूँ। मैं आपकी क्या मदद कर सकती हूँ?',
      queueQuery: 'ओपीडी कतार में मेरा टोकन नंबर क्या है?',
      appointmentQuery: 'मेरा अगला डॉक्टर अपॉइंटमेंट कब है?',
      medicineQuery: 'क्या प्राथमिक स्वास्थ्य केंद्र में पैरासिटामोल उपलब्ध है?',
      emergencyWarning: 'तत्काल 108 एम्बुलेंस आपातकालीन सेवा से संपर्क किया जा रहा है।',
    },
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    bcp47: 'mr-IN',
    dir: 'ltr',
    region: 'india',
    script: 'Devanagari',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'नमस्कार! मी तुमची आरोग्य सहाय्यक आहे. मी तुम्हाला कशी मदत करू शकते?',
      queueQuery: 'ओपीडी रांगेत माझा टोकन क्रमांक काय आहे?',
      appointmentQuery: 'माझी पुढची डॉक्टरांची भेट कधी आहे?',
      medicineQuery: 'प्राथमिक आरोग्य केंद्रात औषधे उपलब्ध आहेत का?',
      emergencyWarning: 'तातडीने १०८ रुग्णवाहिका आपत्कालीन सेवेशी संपर्क केला जात आहे.',
    },
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    bcp47: 'en-IN',
    dir: 'ltr',
    region: 'india',
    script: 'Latin',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'Hello! I am your healthcare assistant. How can I help you today?',
      queueQuery: 'What is my token number in the live OPD queue?',
      appointmentQuery: 'When is my next doctor consultation scheduled?',
      medicineQuery: 'Is paracetamol available at the local health centre?',
      emergencyWarning: 'Emergency detected. Alerting medical officers and 108 ambulance.',
    },
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    bcp47: 'bn-IN',
    dir: 'ltr',
    region: 'india',
    script: 'Bengali',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'নমস্কার! আমি আপনার স্বাস্থ্য সহকারী। আজ আপনাকে কীভাবে সাহায্য করতে পারি?',
      queueQuery: 'ওপিডি লাইনে আমার টোকেন নম্বর কত?',
      appointmentQuery: 'আমার পরবর্তী ডাক্তারের অ্যাপয়েন্টমেন্ট কখন?',
      medicineQuery: 'স্বাস্থ্য কেন্দ্রে কি ওষুধ পাওয়া যাচ্ছে?',
      emergencyWarning: 'জরুরি অবস্থা সনাক্ত হয়েছে। অবিলম্বে ১০৮ অ্যাম্বুলেন্স ডাকা হচ্ছে।',
    },
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    bcp47: 'gu-IN',
    dir: 'ltr',
    region: 'india',
    script: 'Gujarati',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'નમસ્તે! હું તમારી સ્વાસ્થ્ય સહાયક છું. હું તમારી શી મદદ કરી શકું?',
      queueQuery: 'ઓપીડી કતારમાં મારો ટોકન નંબર શું છે?',
      appointmentQuery: 'મારી આગામી ડૉક્ટર એપોઇન્ટમેન્ટ ક્યારે છે?',
      medicineQuery: 'શું આરોગ્ય કેન્દ્રમાં દવાઓ ઉપલબ્ધ છે?',
      emergencyWarning: 'તાત્કાલિક ૧૦૮ એમ્બ્યુલન્સ સેવાનો સંપર્ક કરવામાં આવી રહ્યો છે.',
    },
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    bcp47: 'pa-IN',
    dir: 'ltr',
    region: 'india',
    script: 'Gurmukhi',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਸਿਹਤ ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ?',
      queueQuery: 'ਕਤਾਰ ਵਿੱਚ ਮੇਰਾ ਟੋਕਨ ਨੰਬਰ ਕੀ ਹੈ?',
      appointmentQuery: 'ਮੇਰੀ ਅਗਲੀ ਡਾਕਟਰ ਨਾਲ ਮੁਲਾਕਾਤ ਕਦੋਂ ਹੈ?',
      medicineQuery: 'ਕੀ ਸਿਹਤ ਕੇਂਦਰ ਵਿੱਚ ਦਵਾਈ ਉਪਲਬਧ ਹੈ?',
      emergencyWarning: 'ਤੁਰੰਤ 108 ਐਂਬੂਲੈਂਸ ਐਮਰਜੈਂਸੀ ਸੇਵਾ ਨਾਲ ਸੰਪਰਕ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।',
    },
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    bcp47: 'ta-IN',
    dir: 'ltr',
    region: 'india',
    script: 'Tamil',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'வணக்கம்! நான் உங்கள் மருத்துவ உதவியாளர். நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
      queueQuery: 'வரிசையில் எனது டோக்கன் எண் என்ன?',
      appointmentQuery: 'எனது அடுத்த மருத்துவ சந்திப்பு எப்போது?',
      medicineQuery: 'ஆரோக்கிய மையத்தில் மருந்துகள் கிடைக்கிறதா?',
      emergencyWarning: 'அவசர நிலை கண்டறியப்பட்டது. 108 ஆம்புலன்ஸ் உடனடியாக அழைக்கப்படுகிறது.',
    },
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    bcp47: 'te-IN',
    dir: 'ltr',
    region: 'india',
    script: 'Telugu',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'నమస్కారం! నేను మీ ఆరోగ్య సహాయకురాలిని. నేను మీకు ఎలా సహాయపడగలను?',
      queueQuery: 'క్యూలో నా టోకెన్ సంఖ్య ఎంత?',
      appointmentQuery: 'నా తదుపరి డాక్టర్ అపాయింట్‌మెంట్ ఎప్పుడు?',
      medicineQuery: 'ఆరోగ్య కేంద్రంలో మందులు అందుబాటులో ఉన్నాయా?',
      emergencyWarning: 'అత్యవసర పరిస్థితి గుర్తించబడింది. 108 అంబులెన్స్‌కు సమాచారం ఇవ్వబడుతోంది.',
    },
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    bcp47: 'kn-IN',
    dir: 'ltr',
    region: 'india',
    script: 'Kannada',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
      queueQuery: 'ಸರತಿಯಲ್ಲಿ ನನ್ನ ಟೋಕನ್ ಸಂಖ್ಯೆ ಯಾವುದು?',
      appointmentQuery: 'ನನ್ನ ಮುಂದಿನ ವೈದ್ಯರ ಭೇಟಿ ಯಾವಾಗ?',
      medicineQuery: 'ಆರೋಗ್ಯ ಕೇಂದ್ರದಲ್ಲಿ ಔಷಧಿ ಲಭ್ಯವಿದೆಯೇ?',
      emergencyWarning: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಪತ್ತೆಯಾಗಿದೆ. ತಕ್ಷಣ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ.',
    },
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    bcp47: 'ml-IN',
    dir: 'ltr',
    region: 'india',
    script: 'Malayalam',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ആരോഗ്യ സഹായി. ഞാൻ എങ്ങിനെ സഹായിക്കണം?',
      queueQuery: 'വരിയിൽ എന്റെ ടോക്കൺ നമ്പർ എന്താണ്?',
      appointmentQuery: 'എന്റെ അടുത്ത ഡോക്ടർ അപ്പോയിന്റ്മെന്റ് എപ്പോഴാണ്?',
      medicineQuery: 'ആരോഗ്യ കേന്ദ്രത്തിൽ മരുന്നുകൾ ലഭ്യമാണോ?',
      emergencyWarning: 'അടിയന്തര സാഹചര്യം. ഉടൻ 108 ആംബുലൻസ് വിളിക്കുന്നു.',
    },
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    bcp47: 'or-IN',
    dir: 'ltr',
    region: 'india',
    script: 'Odia',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟିକା। ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
      queueQuery: 'ଧାଡ଼ିରେ ମୋର ଟୋକନ୍ ନମ୍ବର କେତେ?',
      appointmentQuery: 'ମୋର ପରବର୍ତ୍ତୀ ଡାକ୍ତର ସାକ୍ଷାତ କେବେ?',
      medicineQuery: 'ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ରରେ ଔଷଧ ଉପଲବ୍ଧ ଅଛି କି?',
      emergencyWarning: 'ଜରୁରୀ ପରିସ୍ଥିତି! ୧୦୮ ଆମ୍ବୁଲାନ୍ସ ଡକାଯାଉଛି।',
    },
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    bcp47: 'as-IN',
    dir: 'ltr',
    region: 'india',
    script: 'Bengali-Assamese',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'নমস্কাৰ! মই আপোনাৰ স্বাস্থ্য সহায়ক। মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?',
      queueQuery: 'শাৰীত মোৰ টোকেন নম্বৰ কি?',
      appointmentQuery: 'মোৰ পৰৱৰ্তী চিকিৎসকৰ সাক্ষাত কেতিয়া?',
      medicineQuery: 'স্বাস্থ্য কেন্দ্ৰত ঔষধ উপলব্ধ নেকি?',
      emergencyWarning: 'জৰুৰী অৱস্থা ধৰা পৰিছে। তৎকালীনভাৱে ১০৮ এম্বুলেন্স মাতি থকা হৈছে।',
    },
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    bcp47: 'ur-IN',
    dir: 'rtl',
    region: 'india',
    script: 'Arabic-Nastaliq',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'السلام علیکم! میں آپ کی صحت کی معاون ہوں۔ میں آپ کی کیا مدد کر سکتی ہوں؟',
      queueQuery: 'او پی ڈی قطار میں میرا ٹوکن نمبر کیا ہے؟',
      appointmentQuery: 'میری اگلی ڈاکٹر اپائنٹمنٹ کب ہے؟',
      medicineQuery: 'کیا صحت مرکز میں ادویات دستیاب ہیں؟',
      emergencyWarning: 'ہنگامی صورتحال! 108 ایمبولینس سے فوری رابطہ کیا جا رہا ہے۔',
    },
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    bcp47: 'ne-NP',
    dir: 'ltr',
    region: 'india',
    script: 'Devanagari',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'नमस्ते! म तपाईंको स्वास्थ्य सहायक हुँ। म तपाईंलाई कसरी मद्दत गर्न सक्छु?',
      queueQuery: 'लाममा मेरो टोकन नम्बर कति छ?',
      appointmentQuery: 'मेरो अर्को डाक्टर भेट कहिले छ?',
      medicineQuery: 'के स्वास्थ्य केन्द्रमा औषधि उपलब्ध छ?',
      emergencyWarning: 'आपतकालीन अवस्था! तुरुन्तै १०८ एम्बुलेन्स बोलाइँदै छ।',
    },
  },
  {
    code: 'sa',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    bcp47: 'sa-IN',
    dir: 'ltr',
    region: 'india',
    script: 'Devanagari',
    speechRecognitionSupport: false,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'नमस्ते! अहं भवतः आरोग्य सहायिका। कथं भवतः साहाय्यं कर्तुं शक्नोमि?',
      queueQuery: 'पङ्क्तौ मम टोकन् सङ्ख्या का?',
      appointmentQuery: 'मम अग्रिमः वैद्य परामर्शः कदा अस्ति?',
      medicineQuery: 'आरोग्यकेन्द्रे औषधानि उपलभ्यन्ते किम्?',
      emergencyWarning: 'आपत्कालः! त्वरितम् १०८ रुग्णवाहिनी सूच्यते।',
    },
  },

  // --- International Languages ---
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    bcp47: 'ar-SA',
    dir: 'rtl',
    region: 'international',
    script: 'Arabic',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'مرحباً! أنا مساعدتكم للرعاية الصحية. كيف يمكنني مساعدتكم اليوم؟',
      queueQuery: 'ما هو رقم دوري في قائمة الانتظار؟',
      appointmentQuery: 'متى موعدي القادم مع الطبيب؟',
      medicineQuery: 'هل الدواء متوفر في المركز الصحي؟',
      emergencyWarning: 'تم الكشف عن حالة طارئة. يجري الاتصال بخدمة الإسعاف 108.',
    },
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    bcp47: 'es-ES',
    dir: 'ltr',
    region: 'international',
    script: 'Latin',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: '¡Hola! Soy su asistente de salud. ¿Cómo puedo ayudarle hoy?',
      queueQuery: '¿Cuál es mi número de turno en la lista de espera?',
      appointmentQuery: '¿Cuándo es mi próxima cita médica?',
      medicineQuery: '¿Hay medicamentos disponibles en el centro de salud?',
      emergencyWarning: 'Emergencia detectada. Contactando servicios de ambulancia.',
    },
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    bcp47: 'fr-FR',
    dir: 'ltr',
    region: 'international',
    script: 'Latin',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'Bonjour ! Je suis votre assistante santé. Comment puis-je vous aider ?',
      queueQuery: 'Quel est mon numéro dans la file d’attente ?',
      appointmentQuery: 'Quand a lieu mon prochain rendez-vous médical ?',
      medicineQuery: 'Des médicaments sont-ils disponibles au centre médical ?',
      emergencyWarning: 'Urgence détectée. Alerte envoyée aux services d’urgence.',
    },
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    bcp47: 'de-DE',
    dir: 'ltr',
    region: 'international',
    script: 'Latin',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'Guten Tag! Ich bin Ihre Gesundheitsassistentin. Wie kann ich helfen?',
      queueQuery: 'Was ist meine Wartenummer in der Warteschlange?',
      appointmentQuery: 'Wann ist mein nächster Arzttermin?',
      medicineQuery: 'Sind Medikamente im Gesundheitszentrum verfügbar?',
      emergencyWarning: 'Notfall erkannt. Rettungsdienst wird sofort kontaktiert.',
    },
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    bcp47: 'ru-RU',
    dir: 'ltr',
    region: 'international',
    script: 'Cyrillic',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'Здравствуйте! Я ваш медицинский ассистент. Чем я могу помочь?',
      queueQuery: 'Какой у меня номер в очереди?',
      appointmentQuery: 'Когда мой следующий прием у врача?',
      medicineQuery: 'Есть ли лекарства в медицинском центре?',
      emergencyWarning: 'Обнаружена экстренная ситуация. Вызывается скорая помощь.',
    },
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    bcp47: 'zh-CN',
    dir: 'ltr',
    region: 'international',
    script: 'Han',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: '您好！我是您的健康助手。今天我能为您做些什么？',
      queueQuery: '我在候诊队列中的号码是多少？',
      appointmentQuery: '我的下一次医生预约是什么时候？',
      medicineQuery: '卫生院有可用药品吗？',
      emergencyWarning: '检测到紧急情况。正在紧急呼叫108救护车。',
    },
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    bcp47: 'ja-JP',
    dir: 'ltr',
    region: 'international',
    script: 'Japanese',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'こんにちは！医療アシスタントです。どのようなご用件でしょうか？',
      queueQuery: '待機列での私の受付番号は何番ですか？',
      appointmentQuery: '次の診察予約はいつですか？',
      medicineQuery: '診療所に薬の在庫はありますか？',
      emergencyWarning: '緊急事態が検知されました。救急車を手配しています。',
    },
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    bcp47: 'ko-KR',
    dir: 'ltr',
    region: 'international',
    script: 'Hangul',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: '안녕하세요! 저는 건강 도우미입니다. 무엇을 도와드릴까요?',
      queueQuery: '대기 줄에서 제 번호표는 몇 번인가요?',
      appointmentQuery: '다음 진료 예약은 언제인가요?',
      medicineQuery: '보건소에 약이 준비되어 있나요?',
      emergencyWarning: '응급 상황이 감지되었습니다. 즉시 108 구급차를 호출합니다.',
    },
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    bcp47: 'tr-TR',
    dir: 'ltr',
    region: 'international',
    script: 'Latin',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'Merhaba! Ben sağlık asistanınız. Size nasıl yardımcı olabilirim?',
      queueQuery: 'Sıradaki numaram kaç?',
      appointmentQuery: 'Bir sonraki doktor randevum ne zaman?',
      medicineQuery: 'Sağlık merkezinde ilaç mevcut mu?',
      emergencyWarning: 'Acil durum tespit edildi. 108 ambulans servisi aranıyor.',
    },
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    bcp47: 'id-ID',
    dir: 'ltr',
    region: 'international',
    script: 'Latin',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'Halo! Saya asisten kesehatan Anda. Ada yang bisa saya bantu?',
      queueQuery: 'Berapa nomor antrean saya di poliklinik?',
      appointmentQuery: 'Kapan jadwal konsultasi dokter saya berikutnya?',
      medicineQuery: 'Apakah obat tersedia di puskesmas?',
      emergencyWarning: 'Keadaan darurat terdeteksi. Segera menghubungi ambulans 108.',
    },
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    bcp47: 'pt-BR',
    dir: 'ltr',
    region: 'international',
    script: 'Latin',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'Olá! Eu sou sua assistente de saúde. Como posso ajudar hoje?',
      queueQuery: 'Qual é o meu número na fila de espera?',
      appointmentQuery: 'Quando é a minha próxima consulta médica?',
      medicineQuery: 'Há medicamentos disponíveis no posto de saúde?',
      emergencyWarning: 'Emergência detectada. Contactando serviços de ambulância 108.',
    },
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    bcp47: 'it-IT',
    dir: 'ltr',
    region: 'international',
    script: 'Latin',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'Ciao! Sono la tua assistente sanitaria. Come posso aiutarti?',
      queueQuery: 'Qual è il mio numero nella sala d’attesa?',
      appointmentQuery: 'Quando è il mio prossimo appuntamento con il medico?',
      medicineQuery: 'Ci sono farmaci disponibili presso il presidio medico?',
      emergencyWarning: 'Emergenza rilevata. Chiamata ai servizi di soccorso in corso.',
    },
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    bcp47: 'vi-VN',
    dir: 'ltr',
    region: 'international',
    script: 'Latin',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'Xin chào! Tôi là trợ lý y tế của bạn. Tôi có thể giúp gì cho bạn?',
      queueQuery: 'Số thứ tự của tôi trong hàng đợi là bao nhiêu?',
      appointmentQuery: 'Lịch khám bác sĩ tiếp theo của tôi là khi nào?',
      medicineQuery: 'Trạm y tế có sẵn thuốc không?',
      emergencyWarning: 'Phát hiện trường hợp khẩn cấp. Đang liên hệ xe cấp cứu 108.',
    },
  },
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    bcp47: 'th-TH',
    dir: 'ltr',
    region: 'international',
    script: 'Thai',
    speechRecognitionSupport: true,
    ttsSupport: true,
    samplePhrases: {
      greeting: 'สวัสดีค่ะ! ฉันคือผู้ช่วยด้านสุขภาพของคุณ มีอะไรให้ช่วยไหมคะ?',
      queueQuery: 'หมายเลขคิวตรวจของฉันคือหมายเลขใด?',
      appointmentQuery: 'นัดหมายพบแพทย์ครั้งต่อไปของฉันคือเมื่อใด?',
      medicineQuery: 'ที่ศูนย์อนามัยมียาพร้อมให้บริการหรือไม่?',
      emergencyWarning: 'ตรวจพบเหตุฉุกเฉิน กำลังติดต่อสายด่วนรถพยาบาล 108',
    },
  },
];

/**
 * Get configuration for a language code, fallback to English
 */
export function getLanguageConfig(code: string): SupportedLanguage {
  const normalized = (code || 'en').toLowerCase().split('-')[0];
  const found = SUPPORTED_LANGUAGES.find(l => l.code === normalized);
  if (found) return found;
  return SUPPORTED_LANGUAGES.find(l => l.code === 'en')!;
}

/**
 * Check if language is Right-to-Left (e.g. Arabic, Urdu)
 */
export function isRtlLanguage(code: string): boolean {
  const config = getLanguageConfig(code);
  return config.dir === 'rtl';
}

/**
 * Smart Language Auto-Detection based on Unicode character script ranges and common keywords
 * Supports seamless code-switching (Hinglish, Marathi+English, Bengali+English, etc.)
 */
export function detectLanguageFromText(text: string, currentFallback: string = 'en'): string {
  if (!text || text.trim().length === 0) return currentFallback;

  const trimmed = text.trim();

  // 1. Script-based Unicode detection
  let devanagariCount = 0;
  let bengaliCount = 0;
  let tamilCount = 0;
  let teluguCount = 0;
  let gujaratiCount = 0;
  let gurmukhiCount = 0;
  let kannadaCount = 0;
  let malayalamCount = 0;
  let odiaCount = 0;
  let arabicCount = 0;
  let cyrillicCount = 0;
  let hanCount = 0;
  let hiraganaKatakanaCount = 0;
  let hangulCount = 0;
  let thaiCount = 0;

  for (let i = 0; i < trimmed.length; i++) {
    const cp = trimmed.codePointAt(i) || 0;
    if (cp >= 0x0900 && cp <= 0x097f) devanagariCount++;
    else if (cp >= 0x0980 && cp <= 0x09ff) bengaliCount++;
    else if (cp >= 0x0a80 && cp <= 0x0aff) gujaratiCount++;
    else if (cp >= 0x0a00 && cp <= 0x0a7f) gurmukhiCount++;
    else if (cp >= 0x0b80 && cp <= 0x0bff) tamilCount++;
    else if (cp >= 0x0c00 && cp <= 0x0c7f) teluguCount++;
    else if (cp >= 0x0c80 && cp <= 0x0cff) kannadaCount++;
    else if (cp >= 0x0d00 && cp <= 0x0d7f) malayalamCount++;
    else if (cp >= 0x0b00 && cp <= 0x0b7f) odiaCount++;
    else if ((cp >= 0x0600 && cp <= 0x06ff) || (cp >= 0x0750 && cp <= 0x077f)) arabicCount++;
    else if (cp >= 0x0400 && cp <= 0x04ff) cyrillicCount++;
    else if (cp >= 0x4e00 && cp <= 0x9fff) hanCount++;
    else if ((cp >= 0x3040 && cp <= 0x309f) || (cp >= 0x30a0 && cp <= 0x30ff)) hiraganaKatakanaCount++;
    else if (cp >= 0xac00 && cp <= 0xd7af) hangulCount++;
    else if (cp >= 0x0e00 && cp <= 0x0e7f) thaiCount++;
  }

  // Devanagari detection: disambiguate Marathi vs Hindi vs Sanskrit
  if (devanagariCount > 3) {
    const lower = trimmed.toLowerCase();
    // Marathi specific markers & characters (ळ \u0933, आहे, नाही, मला, काय, कधी, औषध)
    if (
      trimmed.includes('ळ') ||
      /\b(आहे|नाही|आहेत|माझा|माझी|माझे|मला|तुम्हाला|काय|कधी|कसे|कुठे|होय|डॉक्टर|रुग्ण|तपासणी|आरोग्य)\b/.test(lower)
    ) {
      return 'mr';
    }
    // Hindi markers (है, हैं, मेरा, मेरी, मुझे, क्या, कब, कहाँ, दवाई, कतार)
    if (/\b(है|हैं|था|थी|मेरा|मेरी|मुझे|आपको|क्या|कब|कहाँ|दवाई|कतार|नमस्ते|अच्छा)\b/.test(lower)) {
      return 'hi';
    }
    // Default to user's current if it's already Hindi or Marathi, else Hindi
    if (currentFallback === 'mr' || currentFallback === 'hi') return currentFallback;
    return 'hi';
  }

  if (bengaliCount > 3) return 'bn';
  if (gujaratiCount > 3) return 'gu';
  if (gurmukhiCount > 3) return 'pa';
  if (tamilCount > 3) return 'ta';
  if (teluguCount > 3) return 'te';
  if (kannadaCount > 3) return 'kn';
  if (malayalamCount > 3) return 'ml';
  if (odiaCount > 3) return 'or';
  if (thaiCount > 3) return 'th';
  if (hangulCount > 3) return 'ko';
  if (hiraganaKatakanaCount > 2) return 'ja';
  if (hanCount > 2) return 'zh';
  if (cyrillicCount > 3) return 'ru';

  if (arabicCount > 3) {
    // Urdu vs Arabic distinction
    if (/[ٹڈڑںےہ]/.test(trimmed) || /\b(کیا|کب|میرا|میری|مجھے|ہے|ہیں|ہو)\b/.test(trimmed)) {
      return 'ur';
    }
    return 'ar';
  }

  // 2. Latin Code-Switching & Hinglish / Marathi-English detection
  const lowerText = trimmed.toLowerCase();

  // Hinglish patterns (Hindi written in Roman/Latin script)
  const hinglishMarkers = [
    /\b(mera|meri|mere|mujhe|humko|kya|kab|kaise|kahan|kyun|hai|hain|nahi|haan|batao|karo|chahiye)\b/,
    /\b(appointment kab|token number|queue mein|line mein|doctor se milna|dawai|chhati me dard|sar dard)\b/,
  ];
  for (const regex of hinglishMarkers) {
    if (regex.test(lowerText)) {
      return 'hi'; // treat Hinglish intent with Hindi engine
    }
  }

  // Marathi-English patterns
  const marathiEnglishMarkers = [
    /\b(majha|majhi|majhe|mala|kay|kadhi|kasa|ahe|nahit|bhetaycha|dava|dawa|aushadh)\b/,
    /\b(doctor la bhetaycha|token kiti|queue madhe|line madhe)\b/,
  ];
  for (const regex of marathiEnglishMarkers) {
    if (regex.test(lowerText)) {
      return 'mr';
    }
  }

  // French markers
  if (/\b(bonjour|merci|rendez-vous|médecin|docteur|médicament|urgence|file d'attente)\b/.test(lowerText)) {
    return 'fr';
  }

  // Spanish markers
  if (/\b(hola|gracias|cita|médico|doctor|medicamento|urgencia|espera|turno)\b/.test(lowerText)) {
    return 'es';
  }

  // German markers
  if (/\b(hallo|danke|arzt|termin|medikament|notfall|warteschlange)\b/.test(lowerText)) {
    return 'de';
  }

  // Arabic transliterated / Urdu romanized
  if (/\b(assalam|shukran|tabeeb|mustashfa|ilaj|dawa)\b/.test(lowerText)) {
    return 'ur';
  }

  // Fallback to active language if no strong signal
  return currentFallback;
}
