import { unstable_noStore as noStore } from "next/cache";
import { getWhatsappSettingsFromStore } from "@/lib/dev-store";
import { siteConfig } from "@/lib/site-config";

export type WhatsappBubbleConfig = {
  phone: string;
  message: string;
};

export async function getWhatsappBubbleConfig(): Promise<WhatsappBubbleConfig> {
  noStore();

  try {
    const storedSettings = await getWhatsappSettingsFromStore();

    if (storedSettings) {
      return {
        phone: storedSettings.phone,
        message: storedSettings.message
      };
    }
  } catch {
    // Fallback a variables de entorno si el archivo compartido no esta disponible.
  }

  return {
    phone: siteConfig.whatsappPhone,
    message: siteConfig.whatsappMessage
  };
}
