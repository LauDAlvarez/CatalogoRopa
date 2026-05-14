import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const mode = process.argv[2];
const defaultPort = process.argv[3];
const minimumNodeVersion = [20, 9, 0];

if (mode !== "dev" && mode !== "build" && mode !== "start") {
  console.error('Uso: node scripts/run-next.mjs <dev|build|start> [defaultPort]');
  process.exit(1);
}

function parseVersion(version) {
  return version
    .split(".")
    .map((part) => Number(part.replace(/[^0-9].*$/, "")) || 0)
    .slice(0, 3);
}

function isVersionLower(current, minimum) {
  for (let index = 0; index < minimum.length; index += 1) {
    const currentPart = current[index] || 0;
    const minimumPart = minimum[index] || 0;

    if (currentPart < minimumPart) {
      return true;
    }

    if (currentPart > minimumPart) {
      return false;
    }
  }

  return false;
}

const currentNodeVersion = parseVersion(process.versions.node);

if (isVersionLower(currentNodeVersion, minimumNodeVersion)) {
  console.error(
    `[catalogo-web] Node ${process.versions.node} no es compatible. Usa Node ${minimumNodeVersion.join(".")} o superior.`
  );
  process.exit(1);
}

const nextBin = path.resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const env = {
  ...process.env,
  NODE_ENV: mode === "dev" ? process.env.NODE_ENV?.trim() || "development" : "production"
};

let args;

if (mode === "build") {
  args = [nextBin, "build"];
  console.log("[catalogo-web] next build en modo production");
} else if (mode === "start") {
  const port = process.env.PORT?.trim() || defaultPort || "3005";
  const hostname = process.env.HOST?.trim() || "0.0.0.0";
  const standaloneServer = path.resolve(process.cwd(), ".next", "standalone", "server.js");

  env.PORT = port;
  env.HOST = hostname;
  env.HOSTNAME = hostname;

  if (existsSync(standaloneServer)) {
    args = [standaloneServer];
    console.log(`[catalogo-web] standalone server escuchando en ${hostname}:${port}`);
  } else {
    args = [nextBin, "start", "--hostname", hostname, "--port", port];
    console.log(`[catalogo-web] next start escuchando en ${hostname}:${port}`);
  }
} else {
  const port = process.env.PORT?.trim() || defaultPort || "3005";
  const hostname = process.env.HOST?.trim() || "0.0.0.0";

  args = [nextBin, "dev", "--hostname", hostname, "--port", port];
  env.PORT = port;
  env.HOST = hostname;
  env.HOSTNAME = hostname;
  console.log(`[catalogo-web] next dev escuchando en ${hostname}:${port}`);
}

const child = spawn(process.execPath, args, {
  stdio: "inherit",
  env
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
