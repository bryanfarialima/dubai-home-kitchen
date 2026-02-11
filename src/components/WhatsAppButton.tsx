import { MessageCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const WhatsAppButton = () => {
  // Get WhatsApp number from env or use default
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "971561234567";
  const message = "Olá! Gostaria de fazer um pedido 🍽️";
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-success hover:bg-success/90 text-success-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </TooltipTrigger>
      <TooltipContent side="left" className="bg-success text-success-foreground">
        Fale conosco no WhatsApp
      </TooltipContent>
    </Tooltip>
  );
};

export default WhatsAppButton;
