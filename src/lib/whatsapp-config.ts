import { unstable_noStore as noStore } from "next/cache";
import { getWhatsappSettingsFromStore } from "@/lib/dev-store";
import { siteConfig } from "@/lib/site-config";

export type WhatsappBubbleConfig = {
  phone: string;
  message: string;
  productMessage: string;
  bubbleLabel: string;
  productCta: string;
};

export async function getWhatsappBubbleConfig(): Promise<WhatsappBubbleConfig> {
  noStore();

  try {
    const storedSettings = await getWhatsappSettingsFromStore();

    if (storedSettings) {
      return {
        phone: storedSettings.phone,
        message: storedSettings.message,
        productMessage:
          typeof storedSettings.productMessage === "string"
            ? storedSettings.productMessage
            : siteConfig.whatsappProductMessage,
        bubbleLabel:
          typeof storedSettings.bubbleLabel === "string" && storedSettings.bubbleLabel.trim()
            ? storedSettings.bubbleLabel
            : siteConfig.whatsappFloatCta,
        productCta:
          typeof storedSettings.productCta === "string" && storedSettings.productCta.trim()
            ? storedSettings.productCta
            : siteConfig.whatsappProductCta
      };
    }
  } catch {
    // Fallback a variables de entorno si el archivo compartido no esta disponible.
  }

  return {
    phone: siteConfig.whatsappPhone,
    message: siteConfig.whatsappMessage,
    productMessage: siteConfig.whatsappProductMessage,
    bubbleLabel: siteConfig.whatsappFloatCta,
    productCta: siteConfig.whatsappProductCta
  };
}
