"use client";

import dynamic from "next/dynamic";

const ContactForm = dynamic(
  () => import("@/components/contact-form").then((module) => module.ContactForm),
  {
    ssr: false,
    loading: () => <div className="contact-form contact-form-placeholder">Cargando formulario...</div>
  }
);

export function DeferredContactForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  return <ContactForm turnstileSiteKey={turnstileSiteKey} />;
}
