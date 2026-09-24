import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  MessageSquare,
  Send,
  Volume2,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  Phone,
  Pill,
  Users,
  GitFork,
  Baby,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const MultilingualHealthcareChatbot: React.FC = () => {
  const { language, isMarathi, isHindi } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: isMarathi
        ? 'नमस्कार! मी मेडीकियोस्क ग्रामीण आरोग्य सहाय्यक आहे. मी आपणास ओपीडी रांग, टोकन क्रमांक, डॉक्टर उपलब्धता, मोफत प्रयोगशाळा चाचण्या, औषध साठा आणि संदर्भ सेवा याबद्दल माहिती देऊ शकतो. खालील प्रश्नांपैकी निवडा किंवा आपला प्रश्न विचारा.'
        : isHindi
        ? 'नमस्ते! मैं मेडीकियोस्क ग्रामीण स्वास्थ्य सहायक हूँ। मैं आपको ओपीडी कतार, टोकन स्थिति, डॉक्टर उपलब्धता, दवा स्टॉक और रेफरल सेवा की जानकारी दे सकता हूँ। आप क्या जानना चाहते हैं?'
        : 'Hello! I am the MediKiosk Rural Healthcare Assistant. I can help you check live OPD queue tokens, doctor schedules, diagnostic lab test availability, pharmacy medicine stocks, and referral status across public healthcare facilities. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const quickPrompts = isMarathi
    ? [
        { label: 'थेट रांग व टोकन', query: 'सध्या कोणते टोकन सुरू आहे?' },
        { label: '१०८ रुग्णवाहिका मदत', query: '१०८ रुग्णवाहिका तातडीची मदत कशी मिळेल?' },
        { label: 'औषध साठा तपासा', query: 'भोर प्राथमिक आरोग्य केंद्रात औषध साठा उपलब्ध आहे का?' },
        { label: 'ससून रुग्णालय संदर्भ', query: 'ससून रुग्णालयाचा संदर्भ कसा ट्रॅक करावा?' },
        { label: 'गर्भवती माता तपासणी', query: 'गर्भवती माता तपासणी व लसीकरण माहिती' },
      ]
    : isHindi
    ? [
        { label: 'लाइव कतार व टोकन', query: 'वर्तमान में कौन सा टोकन चल रहा है?' },
        { label: '१०८ एम्बुलेंस आपातकाल', query: '१०८ एम्बुलेंस सहायता की जानकारी दें' },
        { label: 'दवा स्टॉक उपलब्धता', query: 'पीएचसी में आवश्यक दवाएं उपलब्ध हैं क्या?' },
        { label: 'रेफरल ट्रैकिंग', query: 'ससून अस्पताल के लिए रेफरल कैसे ट्रैक करें?' },
        { label: 'मातृ एवं शिशु स्वास्थ्य', query: 'गर्भवती महिलाओं के लिए स्वास्थ्य सुविधाएं' },
      ]
    : [
        { label: 'Live Queue & Token', query: 'What is the current live OPD token number?' },
        { label: '108 Emergency Ambulance', query: 'How to request 108 Emergency Ambulance?' },
        { label: 'Medicine Stock', query: 'Check essential medicine availability at Bhor PHC' },
        { label: 'Sassoon Hospital Referral', query: 'How is tertiary referral to Sassoon Hospital tracked?' },
        { label: 'Maternal ANC Care', query: 'Maternal ANC checkup and child immunization details' },
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/rural/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (isMarathi) utterance.lang = 'mr-IN';
      else if (isHindi) utterance.lang = 'hi-IN';
      else utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      utterance.onstart = () => setSpeakingText(text);
      utterance.onend = () => setSpeakingText(null);
      utterance.onerror = () => setSpeakingText(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col h-[700px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-md shadow-teal-100">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                {isMarathi
                  ? 'मेडीकियोस्क बहुभाषिक आरोग्य सहाय्यक'
                  : isHindi
                  ? 'बहुभाषी ग्रामीण स्वास्थ्य सहायक'
                  : 'Multilingual Rural Health Assistant'}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-300">
                {isMarathi ? 'मराठी / हिंदी / इंग्रजी' : 'MR / HI / EN'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Voice-enabled service navigator for rural OPD, medicines & referral tracking
            </p>
          </div>
        </div>

        {speakingText && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold animate-pulse">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Speaking...</span>
          </div>
        )}
      </div>

      {/* Non-medical guidance disclaimer */}
      <div className="my-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-[11px] text-slate-600">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          {isMarathi
            ? 'सूचना: हा सहाय्यक रुग्णालय सेवा, रांग व औषध साठ्याची माहिती देतो. आपत्कालीन वैद्यकीय सल्ल्यासाठी थेट डॉक्टरांशी संपर्क साधा.'
            : 'Disclaimer: This tool assists with public healthcare navigation and services. Always consult an in-person physician for acute diagnoses.'}
        </span>
      </div>

      {/* Quick Query Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(p.query)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 my-2">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-teal-700 text-white shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white font-medium rounded-tr-xs'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-tl-xs font-medium'
              }`}
            >
              <div>{msg.text}</div>
              <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>
                {msg.sender === 'bot' && (
                  <button
                    onClick={() => handleSpeak(msg.text)}
                    className="text-slate-500 hover:text-teal-700 font-bold flex items-center gap-1 transition"
                    title="Play Audio Speech"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{isMarathi ? 'ऐका' : 'Listen'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 w-fit text-xs text-slate-500">
            <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span>{isMarathi ? 'माहिती शोधत आहे...' : 'Consulting healthcare records...'}</span>
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          placeholder={
            isMarathi
              ? 'आपला प्रश्न येथे लिहा (उदा. ओपीडी टोकन, औषध साठा, १०८ मदत)...'
              : isHindi
              ? 'अपना प्रश्न यहाँ लिखें...'
              : 'Ask a question about queue tokens, medicines, 108 ambulance, or referrals...'
          }
          className="flex-1 px-4 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-teal-100 flex items-center gap-1.5 transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isMarathi ? 'पाठवा' : 'Send'}</span>
        </button>
      </form>
    </div>
  );
};
