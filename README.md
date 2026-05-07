# catalogo-web

Sitio publico del catalogo de ropa.

## Stack

- Next.js App Router
- TypeScript
- Prisma Client
- MySQL compatible con Hostinger

## Produccion

1. Copia `.env.example` a `.env`.
2. Configura `DATABASE_URL` apuntando a la misma base que `catalogo-admin`.
3. Configura `NEXT_PUBLIC_SITE_URL` con el dominio final.
4. Configura el numero de WhatsApp y, si quieres, Cloudflare Turnstile.
5. Ejecuta:

```bash
npm install
npm run prisma:generate
npm run build
```

## Desarrollo local

```bash
npm run dev
```

El sitio corre por defecto en `http://localhost:3005`.

## Anti-spam y rendimiento

- Honeypot invisible.
- Validacion de tiempo minimo de envio.
- Validacion de origen.
- Limite de enlaces en comentarios.
- Rate limit por hash de IP.
- Limite por defecto de `3` consultas por hora.
- Cloudflare Turnstile opcional con `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY`.
- Caché con TTL para home, catalogo, producto y configuracion de WhatsApp.

## Notas

- Si `DATABASE_URL` no esta configurada, el sitio usa mocks o el archivo compartido `../.catalogo-dev-data.json`.
- La configuracion de WhatsApp se lee desde MySQL en produccion y desde el archivo compartido solo en modo local.
