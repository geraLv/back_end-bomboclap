import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "src/config/.env") });

const getEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno: ${name}`);
  }
  return value;
};

export const ENV = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  HOST: process.env.HOST || "0.0.0.0",
  JWT_SECRET: getEnv("JWT_SECRET"),
  SUPABASE_URL: getEnv("SUPABASE_URL"),
  SUPABASE_KEY: getEnv("SUPABASE_ANON_KEY"),
  SERVICE_ROL: getEnv("SERVICE_ROL_KEY"),
} as const;
