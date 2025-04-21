"use client";

import { useLanguage } from '@/app/providers/LanguageProvider';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 dark:focus:ring-offset-gray-900"
      aria-label={`Switch to ${language === 'en' ? 'Croatian' : 'English'}`}
    >
      <div className="flex items-center justify-center w-6 h-6 font-bold text-sm">
        {language === 'en' ? (
          <span className="text-blue-600 dark:text-blue-400">HR</span>
        ) : (
          <span className="text-blue-600 dark:text-blue-400">EN</span>
        )}
      </div>
    </button>
  );
} 