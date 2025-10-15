"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), "src/config/.env") });
const getEnv = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Falta la variable de entorno: ${name}`);
    }
    return value;
};
exports.ENV = {
    PORT: parseInt(process.env.PORT || "3000", 10),
    HOST: process.env.HOST || "0.0.0.0",
    JWT_SECRET: getEnv("JWT_SECRET"),
    SUPABASE_URL: getEnv("SUPABASE_URL"),
    SUPABASE_KEY: getEnv("SUPABASE_ANON_KEY"),
    SERVICE_ROL: getEnv("SERVICE_ROL_KEY"),
};
