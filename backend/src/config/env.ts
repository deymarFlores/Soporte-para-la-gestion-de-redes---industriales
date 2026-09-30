import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

export const env = {
  port: Number(process.env["PORT"] ?? 4000),
  nodeEnv: process.env["NODE_ENV"] ?? "development",
  databaseUrl: required("DATABASE_URL"),
  heartbeatTimeoutSeconds: Number(process.env["HEARTBEAT_TIMEOUT_SECONDS"] ?? 90),
  corsOrigin: process.env["CORS_ORIGIN"] ?? "http://localhost:5173",
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env["JWT_EXPIRES_IN"] ?? "8h",
  accessSessionCleanupIntervalMs: Number(process.env["ACCESS_SESSION_CLEANUP_INTERVAL_MS"] ?? 30_000),
};
