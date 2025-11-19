import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Traduções
import pt from "./locales/pt.json";
import en from "./locales/en.json";
import es from "./locales/es.json";

i18n
  .use(LanguageDetector) // Detecta idioma do browser
  .use(initReactI18next) // Passa i18n para react-i18next
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: "pt", // Idioma padrão
    lng: "pt", // Idioma inicial
    interpolation: {
      escapeValue: false, // React já faz escape
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
