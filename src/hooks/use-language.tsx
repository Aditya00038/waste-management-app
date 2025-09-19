
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import mr from '@/locales/mr.json';

type Locale = 'en' | 'hi' | 'mr';

const translations = { en, hi, mr };

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Locale>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem("swachh-lang") as Locale | null;
    if (storedLang && ['en', 'hi', 'mr'].includes(storedLang)) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang);
    localStorage.setItem("swachh-lang", lang);
  };
  
  const t = useCallback((key: string, values?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof typeof translations[Locale]] || key;
    if (values) {
        Object.keys(values).forEach(placeholder => {
            translation = translation.replace(`{${placeholder}}`, String(values[placeholder]));
        })
    }
    return translation;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
