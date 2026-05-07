import { unstable_cache as cache } from "next/cache";
import { getWhatsappSettingsFromStore } from "@/lib/dev-store";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

export type WhatsappBubbleConfig = {
  phone: string;
  message: string;
  productMessage: string;
  bubbleLabel: string;
  productCta: string;
};

const WHATSAPP_SETTINGS_ID = "default";
const WHATSAPP_SETTINGS_REVALIDATE_SECONDS = 60;

function mapWhatsappSettings(settings: {
  phone: string;
  message: string;
  productMessage?: string | null;
  bubbleLabel?: string | null;
  productCta?: string | null;
}): WhatsappBubbleConfig {
  return {
    phone: settings.phone,
    message: settings.message,
    productMessage:
      typeof settings.productMessage === "string"
        ? settings.productMessage
        : siteConfig.whatsappProductMessage,
    bubbleLabel:
      typeof settings.bubbleLabel === "string" && settings.bubbleLabel.trim()
        ? settings.bubbleLabel
        : siteConfig.whatsappFloatCta,
    productCta:
      typeof settings.productCta === "string" && settings.productCta.trim()
        ? settings.productCta
        : siteConfig.whatsappProductCta
  };
}

const getCachedWhatsappSettings = cache(
  async (): Promise<WhatsappBubbleConfig | null> => {
    if (!prisma) {
      return null;
    }

    const settings = await prisma.whatsappSettings.findUnique({
      where: { id: WHATSAPP_SETTINGS_ID }
    });

    return settings ? mapWhatsappSettings(settings) : null;
  },
  ["whatsapp-settings"],
  { revalidate: WHATSAPP_SETTINGS_REVALIDATE_SECONDS }
);

export async function getWhatsappBubbleConfig(): Promise<WhatsappBubbleConfig> {
  if (prisma) {
    const settings = await getCachedWhatsappSettings();

    if (settings) {
      return settings;
    }
  }

  try {
    const storedSettings = await getWhatsappSettingsFromStore();

    if (storedSettings) {
      return mapWhatsappSettings(storedSettings);
    }
  } catch {
  }

  return {
    phone: siteConfig.whatsappPhone,
    message: siteConfig.whatsappMessage,
    productMessage: siteConfig.whatsappProductMessage,
    bubbleLabel: siteConfig.whatsappFloatCta,
    productCta: siteConfig.whatsappProductCta
  };
}
