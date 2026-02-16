import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const WATCHDOG_TIMEOUT_MS = 12000;

const AppWatchdog = () => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const hasLoading = () => Boolean(document.querySelector("[data-app-loading='true']"));

  useEffect(() => {
    setShow(false);
    const timer = setTimeout(() => {
      if (hasLoading()) setShow(true);
    }, WATCHDOG_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      if (!hasLoading()) setShow(false);
    }, 1000);
    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 text-center shadow-lg">
        <p className="font-display text-lg font-bold text-foreground">Algo deu errado</p>
        <p className="mt-2 text-sm text-muted-foreground">
          O carregamento demorou mais do que o esperado. Tente recarregar a pagina.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-display font-semibold text-primary-foreground"
          >
            Recarregar
          </button>
          <button
            onClick={() => setShow(false)}
            className="flex-1 rounded-full bg-muted px-4 py-2 text-sm font-display font-semibold text-muted-foreground"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppWatchdog;
