import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const langs = [
    { code: "en", label: "EN" },
    { code: "pt", label: "PT" },
    { code: "ar", label: "عربي" },
  ];

  return (
    <div className="flex gap-1">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => i18n.changeLanguage(l.code)}
          className={`text-xs px-2 py-1 rounded-md font-display font-semibold transition-all ${
            i18n.language === l.code
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
