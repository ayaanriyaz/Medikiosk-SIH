import React from 'react';
import { ArrowLeft, Home, LayoutDashboard } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n';

export interface BackButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'back' | 'dashboard' | 'home';
  language?: Language;
  className?: string;
  id?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label,
  variant = 'back',
  language = 'en',
  className = '',
  id,
}) => {
  const t = translations[language] || translations.en;

  // Default localized labels based on variant
  let displayLabel = label;
  if (!displayLabel) {
    if (variant === 'dashboard') {
      displayLabel = language === 'hi' ? '← डैशबोर्ड' : '← Dashboard';
    } else if (variant === 'home') {
      displayLabel = language === 'hi' ? '← मुख्य पृष्ठ' : '← Home';
    } else {
      displayLabel = t.back || (language === 'hi' ? 'पीछे जाएं' : 'Back');
    }
  }

  return (
    <button
      id={id || `btn-back-${variant}`}
      type="button"
      onClick={onClick}
      aria-label={displayLabel}
      className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-teal-900 bg-white hover:bg-slate-100 border border-slate-200 hover:border-teal-300 shadow-2xs transition-all cursor-pointer select-none active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${className}`}
    >
      {variant === 'home' ? (
        <Home className="w-4 h-4 text-teal-700 shrink-0" />
      ) : variant === 'dashboard' ? (
        <LayoutDashboard className="w-4 h-4 text-teal-700 shrink-0" />
      ) : (
        <ArrowLeft className="w-4 h-4 text-teal-700 shrink-0" />
      )}
      <span className="leading-none">{displayLabel}</span>
    </button>
  );
};
