export interface QuestionPrompt {
  id: string;
  stepArea: string;
  questionEn: string;
  questionHi: string;
  questionMr?: string;
  hintEn: string;
  hintHi: string;
  hintMr?: string;
  optionsEn: string[];
  optionsHi: string[];
  optionsMr?: string[];
  allowsVoice: boolean;
  allowsTouch: boolean;
  allowsText: boolean;
}

export const CLINICAL_ONTOLOGY_FLOW: QuestionPrompt[] = [
  {
    id: 'q_cc',
    stepArea: 'Chief Complaint',
    questionEn: 'What is the main problem bringing you to the hospital today?',
    questionHi: 'आज आप अस्पताल किस मुख्य समस्या या तकलीफ के लिए आए हैं?',
    questionMr: 'आज तुम्ही दवाखान्यात कोणत्या मुख्य त्रासासाठी किंवा आजारासाठी आला आहात?',
    hintEn: 'Describe your primary symptom (e.g. fever, chest pain, joint pain, cough).',
    hintHi: 'अपनी मुख्य समस्या बताएं (जैसे बुखार, सीने में दर्द, जोड़ों का दर्द, खांसी)।',
    hintMr: 'तुमचा मुख्य त्रास सांगा (जसे की ताप, छातीत दुखणे, सांधेदुखी, खोकला).',
    optionsEn: ['Fever & Chills', 'Chest Discomfort / Pain', 'Breathing Difficulty', 'Severe Headache', 'Joint / Body Pain', 'Stomach Pain / Indigestion', 'Cough & Cold'],
    optionsHi: ['बुखार और ठंड', 'सीने में दर्द / भारीपन', 'सांस लेने में तकलीफ', 'सिरदर्द', 'जोड़ों / शरीर में दर्द', 'पेट दर्द / बदहजमी', 'खांसी और जुकाम'],
    optionsMr: ['ताप आणि थंडी वाजणे', 'छातीत दुखणे किंवा जड वाटणे', 'श्वास घेण्यास त्रास', 'तीव्र डोकेदुखी', 'सांधेदुखी / अंगदुखी', 'पोटदुखी / अपचन', 'खोकला आणि सर्दी'],
    allowsVoice: true,
    allowsTouch: true,
    allowsText: true,
  },
  {
    id: 'q_hpi_onset',
    stepArea: 'History of Present Illness - Onset & Duration',
    questionEn: 'When did this problem start, and how did it begin?',
    questionHi: 'यह समस्या कब से शुरू हुई, और कैसे शुरू हुई थी?',
    questionMr: 'हा त्रास कधीपासून सुरू झाला, आणि कसा सुरू झाला?',
    hintEn: 'Mention duration (e.g. today, 2 days ago, 3 weeks) and if sudden or gradual.',
    hintHi: 'बताएं कब से है (जैसे आज से, 2 दिन पहले, 3 हफ़्ते) और अचानक हुआ या धीरे-धीरे।',
    hintMr: 'कालावधी सांगा (जसे आजपासून, २ दिवसांपूर्वी, ३ आठवड्यांपासून) आणि अचानक सुरू झाला की हळूहळू.',
    optionsEn: ['Just today (a few hours ago)', '1 to 3 days ago', 'About 1 to 2 weeks ago', 'More than 1 month ago', 'Comes and goes intermittently'],
    optionsHi: ['आज ही (कुछ घंटे पहले)', '1 से 3 दिन पहले', '1 से 2 हफ़्ते पहले', '1 महीने से अधिक से', 'समय-समय पर आता-जाता है'],
    optionsMr: ['आजच (काही तासांपूर्वी)', '१ ते ३ दिवसांपूर्वी', 'सुमारे १ ते २ आठवड्यांपूर्वी', '१ महिन्यापेक्षा जास्त काळापासून', 'कधी येते कधी जाते (अधूनमधून)'],
    allowsVoice: true,
    allowsTouch: true,
    allowsText: true,
  },
  {
    id: 'q_hpi_severity',
    stepArea: 'History of Present Illness - Character & Severity',
    questionEn: 'How severe is the discomfort, and what makes it feel better or worse?',
    questionHi: 'तकलीफ कितनी तेज है, और किस चीज से आराम या बढ़ावा मिलता है?',
    questionMr: 'त्रास किती तीव्र आहे, आणि कशामुळे आराम मिळतो किंवा त्रास वाढतो?',
    hintEn: 'Rate severity and note if exertion, resting, food, or posture affects it.',
    hintHi: 'तीव्रता बताएं, और क्या चलने-फिरने, आराम करने या खाने से बदलाव होता है।',
    hintMr: 'त्रासाची तीव्रता सांगा, आणि चालणे, विश्रांती, जेवण किंवा हालचालीने फरक पडतो का?',
    optionsEn: ['Mild - manageable with rest', 'Moderate - interferes with work', 'Severe - continuous sharp distress', 'Worse with walking/stairs', 'Better after resting'],
    optionsHi: ['हल्का - आराम से संभल जाता है', 'मध्यम - काम में रुकावट होती है', 'गंभीर - लगातार तेज बेचैनी', 'चलने या सीढ़ियों पर बढ़ता है', 'आराम करने पर राहत मिलती है'],
    optionsMr: ['कमी - विश्रांतीने ठीक वाटते', 'मध्यम - रोजच्या कामात अडथळा येतो', 'गंभीर - सतत तीव्र वेदना/त्रास', 'चालल्याने किंवा जिने चढल्याने वाढतो', 'विश्रांती घेतल्यावर बरे वाटते'],
    allowsVoice: true,
    allowsTouch: true,
    allowsText: true,
  },
  {
    id: 'q_pmh',
    stepArea: 'Past Medical History',
    questionEn: 'Do you have any existing diagnosed health conditions?',
    questionHi: 'क्या आपको पहले से कोई पुरानी बीमारी या डॉक्टर की जांच है?',
    questionMr: 'तुम्हाला पूर्वीपासून कोणताही जुना आजार किंवा डॉक्टरांनी तपासलेले निदान आहे का?',
    hintEn: 'E.g. High Blood Pressure, Diabetes, Heart condition, Asthma, Thyroid, Kidney disease.',
    hintHi: 'जैसे उच्च रक्तचाप (BP), शुगर (डायबिटीज), हृदय रोग, दमा (अस्थमा), थायरॉइड।',
    hintMr: 'उदा. उच्च रक्तदाब (BP), मधुमेह (शुगर), हृदयरोग, दमा (अस्थमा), थायरॉईड.',
    optionsEn: ['High Blood Pressure (Hypertension)', 'Diabetes Mellitus (Sugar)', 'Heart Disease / Prior Stent', 'Asthma / Breathing Problem', 'Thyroid Disorder', 'None / No prior conditions'],
    optionsHi: ['उच्च रक्तचाप (High BP)', 'मधुमेह / शुगर (Diabetes)', 'हृदय रोग (Heart Disease)', 'दमा / अस्थमा (Asthma)', 'थायरॉइड (Thyroid)', 'कोई पुरानी बीमारी नहीं'],
    optionsMr: ['उच्च रक्तदाब (High BP)', 'मधुमेह / साखर (Diabetes)', 'हृदयरोग / आधी स्टेंट बसवला आहे', 'दमा / श्वासाचा आजार (Asthma)', 'थायरॉईड विकार', 'काही नाही / कोणताही जुना आजार नाही'],
    allowsVoice: true,
    allowsTouch: true,
    allowsText: true,
  },
  {
    id: 'q_meds',
    stepArea: 'Current Medications',
    questionEn: 'Are you currently taking any daily medicines, tablets, or herbal supplements?',
    questionHi: 'क्या आप अभी रोजाना कोई दवाई, गोली या घरेलू/आयुर्वेदिक औषधि ले रहे हैं?',
    questionMr: 'तुम्ही सध्या दररोज काही औषधे, गोळ्या किंवा आयुर्वेदिक/घरगुती औषधे घेत आहात का?',
    hintEn: 'Name your medicines, or you can scan your prescription in the next step.',
    hintHi: 'दवाइयों का नाम बताएं, या आप अगले चरण में अपनी पर्ची स्कैन कर सकते हैं।',
    hintMr: 'औषधांची नावे सांगा, किंवा पुढील टप्प्यात तुम्ही तुमची प्रिस्क्रिप्शन स्लिप स्कॅन करू शकता.',
    optionsEn: ['Blood pressure medicine daily', 'Diabetes pills / Insulin', 'Painkiller / Gastric tablet', 'Ayurvedic / Herbal remedy', 'Not taking any medicines currently'],
    optionsHi: ['BP की गोली रोजाना', 'शुगर की गोली / इंसुलिन', 'दर्द निवारक / गैस की गोली', 'आयुर्वेदिक / हर्बल दवा', 'वर्तमान में कोई दवा नहीं ले रहे'],
    optionsMr: ['रक्तदाबाची (BP) गोळी दररोज', 'मधुमेहाची गोळी किंवा इन्सुलिन', 'वेदना शामक किंवा ॲसिडिटीची गोळी', 'आयुर्वेदिक / घरगुती उपचार', 'सध्या कोणतीही औषधे घेत नाही'],
    allowsVoice: true,
    allowsTouch: true,
    allowsText: true,
  },
  {
    id: 'q_allergies',
    stepArea: 'Drug Allergies',
    questionEn: 'Do you have any known allergies to medicines, injections, or food?',
    questionHi: 'क्या आपको किसी दवा, इंजेक्शन या खाद्य पदार्थ से कोई एलर्जी या रिएक्शन होता है?',
    questionMr: 'तुम्हाला कोणत्याही औषधाची, इंजेक्शनची किंवा अन्नाची ॲलर्जी किंवा रिॲक्शन होते का?',
    hintEn: 'E.g. Penicillin, Sulfa, Painkillers causing itching, rashes, or face swelling.',
    hintHi: 'जैसे पेनिसिलिन, सल्फा, या दर्द की दवा से खुजली, चकत्ते या चेहरे पर सूजन।',
    hintMr: 'उदा. पेनिसिलिन, सल्फा किंवा वेदनाशामक औषधांनी खाज सुटणे, पुरळ उठणे किंवा चेहऱ्यावर सूज येणे.',
    optionsEn: ['No known drug allergies', 'Penicillin allergy (skin rash)', 'Sulfa drug allergy', 'Painkiller / Aspirin allergy', 'Food allergy'],
    optionsHi: ['कोई ज्ञात एलर्जी नहीं है', 'पेनिसिलिन से एलर्जी (चकत्ते)', 'सल्फा दवा से एलर्जी', 'दर्द निवारक से एलर्जी', 'खाद्य पदार्थ से एलर्जी'],
    optionsMr: ['कोणतीही ज्ञात ॲलर्जी नाही', 'पेनिसिलिन ॲलर्जी (अंगावर पुरळ)', 'सल्फा औषधांची ॲलर्जी', 'वेदनाशामक / ॲस्पिरिन ॲलर्जी', 'अन्नाची ॲलर्जी'],
    allowsVoice: true,
    allowsTouch: true,
    allowsText: true,
  },
  {
    id: 'q_family_personal',
    stepArea: 'Family & Personal Lifestyle History',
    questionEn: 'Is there a family history of early heart disease or diabetes? What is your diet & routine?',
    questionHi: 'क्या परिवार में किसी को दिल का दौरा या शुगर की समस्या रही है? आपका खान-पान कैसा है?',
    questionMr: 'कुटुंबात कोणाला हृदयविकार किंवा मधुमेहाचा इतिहास आहे का? तुमचा आहार व दिनचर्या कशी आहे?',
    hintEn: 'Diet (vegetarian / non-veg), sleep pattern, physical activity, tobacco or smoking.',
    hintHi: 'खान-पान (शाकाहारी / मांसाहारी), नींद, दिनचर्या, धूम्रपान या तंबाकू की आदत।',
    hintMr: 'आहार (शाकाहारी / मांसाहारी), झोप, रोजची हालचाल, तंबाखू किंवा धुम्रपानाची सवय.',
    optionsEn: ['Family history of Heart Attack', 'Family history of Diabetes', 'Vegetarian diet, regular routine', 'Irregular meals & high stress', 'Non-smoker, no alcohol'],
    optionsHi: ['परिवार में दिल के दौरे का इतिहास', 'परिवार में शुगर का इतिहास', 'शाकाहारी भोजन, सामान्य दिनचर्या', 'अनियमित भोजन और अधिक तनाव', 'धूम्रपान व शराब से मुक्त'],
    optionsMr: ['कुटुंबात हृदयविकाराचा झटका आलेला इतिहास', 'कुटुंबात मधुमेहाचा इतिहास', 'शाकाहारी सात्त्विक आहार, नियमित दिनचर्या', 'अनियमित जेवण आणि जास्त ताणतणाव', 'तंबाखू व मद्यपानापासून पूर्ण दूर'],
    allowsVoice: true,
    allowsTouch: true,
    allowsText: true,
  },
];

export const AYUSH_ONTOLOGY_FLOW: QuestionPrompt[] = [
  {
    id: 'q_ayush_agni',
    stepArea: 'Ayush - Agni Pariksha (Digestive Fire)',
    questionEn: 'How is your digestion and appetite (Agni)?',
    questionHi: 'आपकी पाचन शक्ति और भूख (अग्नि) कैसी रहती है?',
    questionMr: 'तुमची पचनशक्ती आणि भूक (अग्नि) कशी राहते?',
    hintEn: 'Manda (sluggish/heaviness), Tikshna (intense hunger/burning), Vishama (irregular), or Sama (balanced)?',
    hintHi: 'मन्दाग्नि (धीमी भूख/भारीपन), तीक्ष्णाग्नि (तीव्र भूख/जलन), विषमाग्नि (अनियमित), या समाग्नि (संतुलित)?',
    hintMr: 'मंदाग्नि (भूक मंद/पोट जड), तीक्ष्णाग्नि (तीव्र भूक/छातीत जळजळ), विषमाग्नि (अनियमित), किंवा समाग्नि (संतुलित)?',
    optionsEn: ['Manda Agni (Sluggish digestion, heaviness after food)', 'Tikshna Agni (Intense hunger, acid burning)', 'Vishama Agni (Sometimes hungry, sometimes not)', 'Sama Agni (Healthy balanced digestion)'],
    optionsHi: ['मन्दाग्नि (पाचन धीमा, भोजन के बाद भारीपन)', 'तीक्ष्णाग्नि (अत्यधिक भूख, जलन व खट्टी डकार)', 'विषमाग्नि (अनियमित, कभी भूख कभी नहीं)', 'समाग्नि (संतुलित व स्वस्थ पाचन)'],
    optionsMr: ['मंदाग्नि (पचन मंद, जेवणानंतर पोट जड वाटणे)', 'तीक्ष्णाग्नि (अति भूक, छातीत व पोटात जळजळ)', 'विषमाग्नि (अनियमित, कधी भूक लागते कधी नाही)', 'समाग्नि (संतुलित व निरोगी पचन)'],
    allowsVoice: true,
    allowsTouch: true,
    allowsText: true,
  },
  {
    id: 'q_ayush_koshtha',
    stepArea: 'Ayush - Koshtha Pariksha (Bowel Pattern)',
    questionEn: 'What is your bowel habit and stool pattern (Koshtha)?',
    questionHi: 'आपका पेट साफ होने का स्वभाव और मल प्रवृत्ति (कोष्ठ) कैसी है?',
    questionMr: 'तुमचे पोट साफ होण्याचा स्वभाव आणि मलप्रवृत्ती (कोष्ठ) कशी आहे?',
    hintEn: 'Krura (hard/constipated), Mridu (soft/loose stools easily), or Madhyama (moderate regular)?',
    hintHi: 'क्रूर कोष्ठ (कड़ा मल/कब्ज), मृदु कोष्ठ (आसानी से दस्त/नरम मल), या मध्यम कोष्ठ (सामान्य नियमित)?',
    hintMr: 'क्रूर कोष्ठ (बद्धकोष्ठता/कठीण मल), मृदू कोष्ठ (सहज पोट साफ/पातळ संडास), किंवा मध्यम कोष्ठ (नियमित)?',
    optionsEn: ['Krura Koshtha (Hard stools, constipation tendency)', 'Mridu Koshtha (Soft or frequent stools easily)', 'Madhyama Koshtha (Regular once daily evacuation)'],
    optionsHi: ['क्रूर कोष्ठ (कब्जियत, कड़ा मल, कठिनाई)', 'मृदु कोष्ठ (नरम मल, आसानी से पेट साफ होना)', 'मध्यम कोष्ठ (दिन में एक बार सामान्य पेट साफ)'],
    optionsMr: ['क्रूर कोष्ठ (बद्धकोष्ठता, कठीण मल, त्रास)', 'मृदू कोष्ठ (मऊ मल, सहज पोट साफ होणे)', 'मध्यम कोष्ठ (दिवसातून एकदा नियमित पोट साफ)'],
    allowsVoice: true,
    allowsTouch: true,
    allowsText: true,
  },
  {
    id: 'q_ayush_prakriti',
    stepArea: 'Ayush - Prakriti & Deha Swabhava',
    questionEn: 'Which physical characteristics best describe your natural constitution?',
    questionHi: 'आपकी शारीरिक प्रकृति के अनुसार कौन से लक्षण आपसे सबसे अधिक मेल खाते हैं?',
    questionMr: 'तुमच्या शारीरिक प्रकृतीनुसार कोणती लक्षणे तुमच्याशी सर्वात जास्त जुळतात?',
    hintEn: 'Vata (dry skin, quick movements, cold intolerance), Pitta (warm body, sweating, sharp appetite), Kapha (solid build, calm, slow digestion).',
    hintHi: 'वात (रूखी त्वचा, ठंड बर्दाश्त न होना), पित्त (गर्म स्वभाव, अधिक पसीना, तेज भूख), कफ (मजबूत शरीर, शांत स्वभाव, कफ प्रवृत्ति)।',
    hintMr: 'वात (कोरडी त्वचा, थंडी न सोसणे), पित्त (उष्ण शरीर, जास्त घाम, तीव्र भूक), कफ (मजबूत बांधा, शांत, मंद हालचाल).',
    optionsEn: ['Vata dominant (Dry skin, joint clicks, light sleep)', 'Pitta dominant (Body heat, quick sweating, acidity)', 'Kapha dominant (Heavier build, deep sleep, cold easily)', 'Vata-Pitta mixed', 'Kapha-Vata mixed'],
    optionsHi: ['वात प्रधान (रूखी त्वचा, हल्की नींद, जल्दी थकान)', 'पित्त प्रधान (शरीर में गर्मी, अधिक पसीना, पित्त प्रकोप)', 'कफ प्रधान (भारी शरीर, गहरी नींद, धीमी गति)', 'वात-पित्त मिश्रित', 'कफ-वात मिश्रित'],
    optionsMr: ['वात प्रधान (कोरडी त्वचा, हलकी झोप, सांधे वाजणे)', 'पित्त प्रधान (उष्णता, जास्त घाम, ॲसिडिटी)', 'कफ प्रधान (मजबूत शरीर, गाढ झोप, सर्दी-कफ लवकर)', 'वात-पित्त मिश्रित', 'कफ-वात मिश्रित'],
    allowsVoice: true,
    allowsTouch: true,
    allowsText: true,
  },
  {
    id: 'q_ayush_ahara',
    stepArea: 'Ayush - Ahara & Vihara (Dietary habits & Lifestyle)',
    questionEn: 'What is your dietary preference and daily sleep routine?',
    questionHi: 'आपकी खान-पान की आदतें और सोने-जागने की दिनचर्या कैसी है?',
    questionMr: 'तुमच्या खाण्यापिण्याच्या सवयी आणि झोपण्याची दिनचर्या कशी आहे?',
    hintEn: 'Diet (Snigdha/Ruksha, Katu/Amla/Madhura), day-sleeping (Divasvapna), late nights (Ratri Jagarana).',
    hintHi: 'स्निग्ध या रूखा भोजन, दिन में सोना (दिवास्वप्न), रात में देर तक जागना (रात्रि जागरण)।',
    hintMr: 'स्निग्ध किंवा कोरडे अन्न, दिवसा झोपणे (दिवास्वप्न), रात्री उशिरापर्यंत जागे राहणे (रात्रौ जागरण).',
    optionsEn: ['Regular homemade fresh food, timely sleep', 'Late night dinners, screen use, daytime naps', 'High spicy / oily food intake', 'Irregular meal timings (Vishamashana)'],
    optionsHi: ['नियमित ताजा सात्विक भोजन, समय पर नींद', 'देर रात भोजन, दिन में सोना, रात को जागना', 'अधिक तला-भुना, तीखा या खट्टा भोजन', 'अनियमित भोजन समय (विषमाशन)'],
    optionsMr: ['नियमित ताजा घरगुती आहार, वेळेवर झोप', 'रात्री उशिरा जेवण, दिवसा झोप, रात्री जागरण', 'जास्त तेलकट, तिखट किंवा मसालेदार आहार', 'जेवणाच्या अनियमित वेळा (विषमाशन)'],
    allowsVoice: true,
    allowsTouch: true,
    allowsText: true,
  },
];

export function getLocalizedQuestionPrompt(q: QuestionPrompt, lang: string): { question: string; hint: string; options: string[] } {
  if (lang === 'mr') {
    return {
      question: q.questionMr || q.questionHi || q.questionEn,
      hint: q.hintMr || q.hintHi || q.hintEn,
      options: q.optionsMr || q.optionsHi || q.optionsEn,
    };
  }
  if (lang === 'hi') {
    return {
      question: q.questionHi || q.questionEn,
      hint: q.hintHi || q.hintEn,
      options: q.optionsHi || q.optionsEn,
    };
  }
  return {
    question: q.questionEn,
    hint: q.hintEn,
    options: q.optionsEn,
  };
}
