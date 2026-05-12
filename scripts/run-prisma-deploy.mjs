import "dotenv/config";
import { spawn } from "node:child_process";

function isPlaceholderDatabaseUrl(databaseUrl) {
  return (
    databaseUrl.includes("USUARIO_DB") ||
    databaseUrl.includes("PASSWORD_DB") ||
    databaseUrl.includes("HOST_DB") ||
    databaseUrl.includes("usuario:password@host")
  );
}

const databaseUrl = process.env.DATABASE_URL?.trim() || "";

if (!databaseUrl || isPlaceholderDatabaseUrl(databaseUrl)) {
  console.log("[catalogo-web] Prisma migrate deploy omitido: DATABASE_URL no esta configurada.");
  process.exit(0);
}

const prismaBin = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(prismaBin, ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
  shell: false
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
