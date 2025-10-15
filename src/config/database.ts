import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "./env";

export class DataBase {
  private static instancia: DataBase;
  private readonly publicClient: SupabaseClient;
  private readonly serviceClient: SupabaseClient;

  private constructor() {
    this.publicClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    this.serviceClient = createClient(ENV.SUPABASE_URL, ENV.SERVICE_ROL, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }

  static obtenerInstancia(): DataBase {
    if (!DataBase.instancia) {
      DataBase.instancia = new DataBase();
    }

    return DataBase.instancia;
  }

  public_db(): SupabaseClient {
    return this.publicClient;
  }

  service_rol(): SupabaseClient {
    return this.serviceClient;
  }
}
