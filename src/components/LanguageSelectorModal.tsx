import React, { useState, useMemo } from 'react';
import {
  Globe,
  Search,
  Check,
  X,
  Volume2,
  Sparkles,
  MapPin,
  Languages,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n/languages';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageSelected?: (lang: string) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  onLanguageSelected,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'india' | 'international'>('all');
  const [playingCode, setPlayingCode] = useState<string | null>(null);

  const filteredLanguages = useMemo(() => {
    return SUPPORTED_LANGUAGES.filter((item) => {
      // Region filter
      if (regionFilter !== 'all' && item.region !== regionFilter) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(query) ||
        item.nativeName.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.script.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, regionFilter]);

  if (!isOpen) return null;

  const handleSelect = (lang: SupportedLanguage) => {
    setLanguage(lang.code);
    onLanguageSelected?.(lang.code);
    onClose();
  };

  const handlePreviewSpeech = (e: React.MouseEvent, lang: SupportedLanguage) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setPlayingCode(lang.code);

    const utterance = new SpeechSynthesisUtterance(lang.samplePhrases.greeting);
    utterance.lang = lang.bcp47;
    utterance.rate = 0.95;

    // Find best voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(lang.code));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => setPlayingCode(null);
    utterance.onerror = () => setPlayingCode(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="global-language-selector-modal"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/60 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Select Your Language</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                  {SUPPORTED_LANGUAGES.length} Languages
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Kiosk navigation, consultations, and OPD instructions will adapt to your choice
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200/70 flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Region Filter Bar */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language (e.g. हिन्दी, Marathi, தமிழ், বাংলা, Arabic)..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900 placeholder:text-slate-400 transition"
              autoFocus
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setRegionFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                regionFilter === 'all'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Languages ({SUPPORTED_LANGUAGES.length})
            </button>
            <button
              onClick={() => setRegionFilter('india')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                regionFilter === 'india'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🇮🇳 Indian Official Languages ({SUPPORTED_LANGUAGES.filter(l => l.region === 'india').length})
            </button>
            <button
              onClick={() => setRegionFilter('international')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                regionFilter === 'international'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🌐 Global Languages ({SUPPORTED_LANGUAGES.filter(l => l.region === 'international').length})
            </button>
          </div>
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredLanguages.map((item) => {
            const isSelected = language === item.code;
            const isPlaying = playingCode === item.code;

            return (
              <div
                key={item.code}
                onClick={() => handleSelect(item)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/70 shadow-sm shadow-teal-700/10 ring-2 ring-teal-600/30'
                    : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50/80 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform group-hover:scale-105 ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-800'
                    }`}
                  >
                    {item.code.toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                        {item.nativeName}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        ({item.name})
                      </span>
                      {item.dir === 'rtl' && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                          RTL
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5" title={item.samplePhrases.greeting}>
                      {item.samplePhrases.greeting}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {/* Voice sample preview button */}
                  {item.ttsSupport && (
                    <button
                      type="button"
                      onClick={(e) => handlePreviewSpeech(e, item)}
                      title={`Listen to sample greeting in ${item.nativeName}`}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        isPlaying
                          ? 'bg-teal-600 text-white animate-pulse'
                          : 'text-slate-400 hover:text-teal-700 hover:bg-slate-100'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredLanguages.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Languages className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold">No languages found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by English or native script</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Language preference is applied immediately across all screens</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
