import { getWhatsappBubbleConfig } from "@/lib/whatsapp-config";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export async function WhatsappFloat() {
  const settings = await getWhatsappBubbleConfig();
  const whatsappUrl = buildWhatsappUrl(settings.phone, settings.message);

  if (!whatsappUrl) {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      className="whatsapp-float"
      target="_blank"
      rel="noreferrer"
      aria-label={settings.bubbleLabel}
      title={settings.bubbleLabel}
    >
      <span className="whatsapp-float-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M19.05 4.94A9.9 9.9 0 0 0 12 2a9.94 9.94 0 0 0-8.61 14.9L2 22l5.24-1.37A9.94 9.94 0 1 0 19.05 4.94Zm-7.05 15a8.26 8.26 0 0 1-4.21-1.15l-.3-.18-3.11.82.83-3.03-.2-.31A8.27 8.27 0 1 1 12 19.94Zm4.54-6.18c-.25-.12-1.47-.72-1.7-.8-.23-.08-.4-.12-.57.12-.17.25-.65.8-.8.96-.15.17-.3.19-.55.06-.25-.12-1.05-.39-2-1.25-.74-.66-1.24-1.48-1.38-1.73-.14-.25-.01-.38.11-.51.11-.11.25-.3.37-.45.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.57-1.38-.78-1.88-.21-.5-.42-.43-.57-.44h-.49c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.04 0 1.2.88 2.37 1 2.53.12.17 1.72 2.63 4.17 3.69.58.25 1.03.4 1.38.51.58.18 1.1.15 1.51.09.46-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.22-.17-.47-.29Z" />
        </svg>
      </span>
      <span className="whatsapp-float-label">{settings.bubbleLabel}</span>
    </a>
  );
}
