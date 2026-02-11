import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // Check if already installed
        window.addEventListener("appinstalled", () => {
            setShowPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
                setShowPrompt(false);
            }
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-40 bg-card rounded-lg border border-border shadow-lg p-4 space-y-3 animate-in slide-in-from-bottom-4">
            <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="font-display font-bold text-foreground">Instale Sabor de Casa</p>
                    <p className="text-sm text-muted-foreground">Acesse a app diretamente da tela inicial</p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={handleInstall}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-full font-display font-bold text-sm hover:brightness-110 transition-all"
                >
                    Instalar
                </button>
                <button
                    onClick={handleDismiss}
                    className="flex-1 bg-muted text-muted-foreground px-4 py-2 rounded-full font-display font-bold text-sm hover:bg-muted/80 transition-all"
                >
                    Depois
                </button>
            </div>
        </div>
    );
};

export default InstallPrompt;
