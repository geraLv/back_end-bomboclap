"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
class DataBase {
    constructor() {
        this.publicClient = (0, supabase_js_1.createClient)(env_1.ENV.SUPABASE_URL, env_1.ENV.SUPABASE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
        this.serviceClient = (0, supabase_js_1.createClient)(env_1.ENV.SUPABASE_URL, env_1.ENV.SERVICE_ROL, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
            },
        });
    }
    static obtenerInstancia() {
        if (!DataBase.instancia) {
            DataBase.instancia = new DataBase();
        }
        return DataBase.instancia;
    }
    public_db() {
        return this.publicClient;
    }
    service_rol() {
        return this.serviceClient;
    }
}
exports.DataBase = DataBase;
