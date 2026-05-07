"use client";

import { useActionState, useEffect, useState } from "react";
import { submitContact, type ContactFormState } from "@/app/actions/contact";

const initialState: ContactFormState = {
  status: "idle",
  message: ""
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="field-error">{errors[0]}</p>;
}

export function ContactForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const [startedAt, setStartedAt] = useState("");

  useEffect(() => {
    setStartedAt(Date.now().toString());
  }, []);

  useEffect(() => {
    if (state.status === "success" && state.redirectUrl) {
      window.location.assign(state.redirectUrl);
    }
  }, [state.redirectUrl, state.status]);

  return (
    <form action={formAction} className="contact-form" noValidate>
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className="spam-field" aria-hidden="true">
        <label htmlFor="website">Sitio web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="form-grid">
        <label>
          <span>Nombre</span>
          <input name="firstName" type="text" autoComplete="given-name" required />
          <FieldError errors={state.fieldErrors?.firstName} />
        </label>
        <label>
          <span>Apellido</span>
          <input name="lastName" type="text" autoComplete="family-name" required />
          <FieldError errors={state.fieldErrors?.lastName} />
        </label>
      </div>

      <label>
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" required />
        <FieldError errors={state.fieldErrors?.email} />
      </label>

      <label>
        <span>Comentario</span>
        <textarea name="comment" rows={6} required />
        <FieldError errors={state.fieldErrors?.comment} />
      </label>

      {turnstileSiteKey ? (
        <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
      ) : null}

      <div className="form-footer">
        <button type="submit" className="button" disabled={pending}>
          {pending ? "Preparando WhatsApp..." : "Enviar por WhatsApp"}
        </button>
        {state.message ? (
          <p className={`form-status ${state.status === "success" ? "success" : "error"}`}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
