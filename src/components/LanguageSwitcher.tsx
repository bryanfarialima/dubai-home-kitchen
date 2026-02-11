import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const langs = [
    { code: "en", label: "EN 🇬🇧" },
    { code: "pt", label: "PT 🇧🇷" },
    { code: "ar", label: "عربي 🇸🇦" },
  ];

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("language", code);
  };

  return (
    <div className="flex gap-1">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => handleLanguageChange(l.code)}
          className={`text-xs px-2 py-1 rounded-md font-display font-semibold transition-all ${i18n.language === l.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
            }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
