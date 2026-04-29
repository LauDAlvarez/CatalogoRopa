import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function isPlaceholderDatabaseUrl(databaseUrl: string) {
  return (
    databaseUrl.includes("USUARIO_DB") ||
    databaseUrl.includes("PASSWORD_DB") ||
    databaseUrl.includes("HOST_DB") ||
    databaseUrl.includes("usuario:password@host")
  );
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim().length === 0) {
    return null;
  }

  if (isPlaceholderDatabaseUrl(databaseUrl)) {
    return null;
  }

  const adapter = new PrismaMariaDb(databaseUrl);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
