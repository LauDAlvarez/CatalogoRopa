"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import {
  countRecentMessagesByIpHash,
  createContactMessage
} from "@/lib/dev-store";
import { prisma } from "@/lib/prisma";
import { getWhatsappBubbleConfig } from "@/lib/whatsapp-config";
import { buildWhatsappUrl, renderContactWhatsappMessage } from "@/lib/whatsapp";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  redirectUrl?: string;
  fieldErrors?: Record<string, string[]>;
};

const contactSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Ingresa al menos 2 caracteres.")
    .max(80, "El nombre es demasiado largo."),
  lastName: z
    .string()
    .trim()
    .min(2, "Ingresa al menos 2 caracteres.")
    .max(80, "El apellido es demasiado largo."),
  email: z.string().trim().email("Ingresa un email valido.").max(160),
  phone: z
    .string()
    .trim()
    .min(8, "Ingresa un numero de contacto.")
    .max(40, "El numero es demasiado largo.")
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 8 && digits.length <= 15;
    }, "Ingresa un numero valido."),
  comment: z
    .string()
    .trim()
    .min(10, "El comentario tiene que tener al menos 10 caracteres.")
    .max(1200, "El comentario no puede superar los 1200 caracteres."),
  website: z.string().optional(),
  startedAt: z.coerce.number()
});

const fallbackRateLimit = new Map<string, { count: number; resetAt: number }>();

function getMaxContactMessagesPerHour() {
  const configured = Number(process.env.CONTACT_MAX_PER_HOUR || 3);
  return Number.isFinite(configured) && configured > 0 ? configured : 3;
}

function getClientIp(headerStore: Headers) {
  const cfConnectingIp = headerStore.get("cf-connecting-ip");
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  return cfConnectingIp || forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
}

function hashIp(ip: string) {
  const salt =
    process.env.CONTACT_HASH_SALT ||
    process.env.AUTH_SECRET ||
    "local-contact-form-development-salt";

  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function hasTooManyLinks(comment: string) {
  const urlMatches = comment.match(/https?:\/\/|www\./gi);
  return (urlMatches?.length || 0) > 2;
}

function passesFallbackRateLimit(key: string) {
  const now = Date.now();
  const existing = fallbackRateLimit.get(key);

  if (!existing || existing.resetAt < now) {
    fallbackRateLimit.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (existing.count >= getMaxContactMessagesPerHour()) {
    return false;
  }

  existing.count += 1;
  return true;
}

async function verifyTurnstile(token: FormDataEntryValue | null, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return true;
  }

  if (!token || typeof token !== "string") {
    return false;
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip
      })
    }
  );

  const result = (await response.json()) as { success?: boolean };
  return Boolean(result.success);
}

async function originIsAllowed(headerStore: Headers) {
  const origin = headerStore.get("origin");
  const host = headerStore.get("host");

  if (!origin || !host) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function submitContact(
  _previousState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const headerStore = await headers();

  if (!(await originIsAllowed(headerStore))) {
    return {
      status: "error",
      message: "No pudimos validar el origen del formulario."
    };
  }

  const parsed = contactSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    comment: formData.get("comment"),
    website: formData.get("website"),
    startedAt: formData.get("startedAt")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los datos del formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  if (parsed.data.website) {
    return {
      status: "success",
      message: "Gracias. Recibimos tu mensaje."
    };
  }

  const elapsedMs = Date.now() - parsed.data.startedAt;

  if (elapsedMs < 2500 || elapsedMs > 2 * 60 * 60 * 1000) {
    return {
      status: "error",
      message: "Actualiza la pagina e intenta enviar el formulario nuevamente."
    };
  }

  if (hasTooManyLinks(parsed.data.comment)) {
    return {
      status: "error",
      message: "El comentario no puede incluir tantos enlaces."
    };
  }

  const ip = getClientIp(headerStore);
  const ipHash = hashIp(ip);
  const maxPerHour = getMaxContactMessagesPerHour();
  const whatsappSettings = await getWhatsappBubbleConfig();
  const whatsappMessage = renderContactWhatsappMessage(whatsappSettings.message, parsed.data);
  const whatsappUrl = buildWhatsappUrl(whatsappSettings.phone, whatsappMessage);

  if (!whatsappUrl) {
    return {
      status: "error",
      message: "WhatsApp no esta configurado en este momento. Intenta mas tarde."
    };
  }

  if (!(await verifyTurnstile(formData.get("cf-turnstile-response"), ip))) {
    return {
      status: "error",
      message: "No pudimos validar el desafio anti-spam."
    };
  }

  if (prisma) {
    try {
      const recentCount = await prisma.contactMessage.count({
        where: {
          ipHash,
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000)
          }
        }
      });

      if (recentCount >= maxPerHour) {
        return {
          status: "error",
          message: "Recibimos varios mensajes desde tu conexion. Intenta mas tarde."
        };
      }

      await prisma.contactMessage.create({
        data: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          comment: parsed.data.comment,
          ipHash,
          userAgent: headerStore.get("user-agent")?.slice(0, 240)
        }
      });

      return {
        status: "success",
        message: "Te estamos redirigiendo a WhatsApp.",
        redirectUrl: whatsappUrl
      };
    } catch {
    }
  }

  const recentCount = await countRecentMessagesByIpHash(
    ipHash,
    new Date(Date.now() - 60 * 60 * 1000)
  ).catch(() => undefined);

  if (recentCount !== undefined) {
    if (recentCount >= maxPerHour) {
      return {
        status: "error",
        message: "Recibimos varios mensajes desde tu conexion. Intenta mas tarde."
      };
    }

    await createContactMessage({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      comment: parsed.data.comment,
      ipHash,
      userAgent: headerStore.get("user-agent")?.slice(0, 240) || null
    });
  } else if (!passesFallbackRateLimit(ipHash)) {
    return {
      status: "error",
      message: "Recibimos varios mensajes desde tu conexion. Intenta mas tarde."
    };
  }

  return {
    status: "success",
    message: "Te estamos redirigiendo a WhatsApp.",
    redirectUrl: whatsappUrl
  };
}
