import React, { createContext, useContext, ReactNode } from 'react';
import { es, Translations } from '../locales/es';

type Language = 'es' | 'en';

interface TranslationContextType {
  t: Translations;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  language?: Language;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ 
  children, 
  language = 'es' 
}) => {
  const [currentLanguage, setCurrentLanguage] = React.useState<Language>(language);

  const translations: Record<Language, Translations> = {
    es: es,
    en: es, // For now, English uses Spanish translations
  };

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  const value: TranslationContextType = {
    t: translations[currentLanguage],
    language: currentLanguage,
    setLanguage,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
