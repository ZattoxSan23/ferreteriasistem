import { spawnSync } from "node:child_process";

const env = { ...process.env };

const directUrl =
  env.DIRECT_URL ??
  env.DATABASE_URL ??
  env.NETLIFY_DATABASE_URL_UNPOOLED ??
  env.DATABASE_URL_POOLED ??
  env.NETLIFY_DATABASE_URL;

if (!directUrl) {
  console.error(
    "No hay base de datos configurada. Configura DATABASE_URL o una integración de Postgres en Netlify."
  );
  process.exit(1);
}

env.DATABASE_URL = directUrl;

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit", env, shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npx", ["prisma", "generate"]);
run("npx", ["prisma", "migrate", "deploy"]);
run("npx", ["tsx", "prisma/seed.ts"]);
run("npx", ["next", "build"]);
