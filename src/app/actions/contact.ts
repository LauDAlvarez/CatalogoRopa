"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
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
  comment: z
    .string()
    .trim()
    .min(10, "El comentario tiene que tener al menos 10 caracteres.")
    .max(1200, "El comentario no puede superar los 1200 caracteres."),
  website: z.string().optional(),
  startedAt: z.coerce.number()
});

const fallbackRateLimit = new Map<string, { count: number; resetAt: number }>();

function getClientIp(headerStore: Headers) {
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");
  return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
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

  if (existing.count >= Number(process.env.CONTACT_MAX_PER_HOUR || 4)) {
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
  const maxPerHour = Number(process.env.CONTACT_MAX_PER_HOUR || 4);

  if (!(await verifyTurnstile(formData.get("cf-turnstile-response"), ip))) {
    return {
      status: "error",
      message: "No pudimos validar el desafio anti-spam."
    };
  }

  if (prisma) {
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
        comment: parsed.data.comment,
        ipHash,
        userAgent: headerStore.get("user-agent")?.slice(0, 240)
      }
    });
  } else if (!passesFallbackRateLimit(ipHash)) {
    return {
      status: "error",
      message: "Recibimos varios mensajes desde tu conexion. Intenta mas tarde."
    };
  }

  return {
    status: "success",
    message: "Gracias. Recibimos tu mensaje."
  };
}

