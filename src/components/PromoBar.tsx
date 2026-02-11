import { useTranslation } from "react-i18next";

const PromoBar = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-sm font-display font-semibold">
      {t("free_delivery")}
    </div>
  );
};

export default PromoBar;
