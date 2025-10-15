import { AuthUser } from "../domain/entities/AuthUser";
import { AuthUserRepository } from "../infra/repositories/AuthUser.repo";
import { UsersRepository } from "../infra/repositories/User.repo";
import type { User } from "../domain/entities/User";

// Simple random generators (no external deps)
const FIRST_NAMES = [
  "Juan",
  "María",
  "Pedro",
  "Lucía",
  "Sofía",
  "Diego",
  "Valentina",
  "Carlos",
  "Ana",
  "Mateo",
];

const LAST_NAMES = [
  "García",
  "Fernández",
  "López",
  "Martínez",
  "González",
  "Rodríguez",
  "Pérez",
  "Sánchez",
  "Ramírez",
  "Torres",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomName() {
  return pick(FIRST_NAMES);
}

function randomLastName() {
  return pick(LAST_NAMES);
}

function randomPhone(): number {
  // 10-digit number: 3xx-xxxxxxx (common mobile pattern in many LATAM regions)
  const prefix = 300 + Math.floor(Math.random() * 700); // 300-999
  const suffix = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
  return Number(`${prefix}${suffix}`);
}

function slugify(str: string) {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .toLowerCase();
}

function makeEmail(name: string, last: string, idx: number) {
  // Use a local-ish domain; Supabase accepts any valid email format
  const sName = slugify(name);
  const sLast = slugify(last);
  const pad = String(idx).padStart(4, "0");
  return `${sName}.${sLast}.${pad}@seed.local`;
}

async function waitForUser(
  usersRepo: UsersRepository,
  userId: string,
  maxRetries = 30,
  intervalMs = 250
): Promise<User | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const u = await usersRepo.findById(userId);
    if (u) return u;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return null;
}

async function main() {
  const total = Number(process.argv[2] ?? 500);
  if (!Number.isFinite(total) || total <= 0) {
    // eslint-disable-next-line no-console
    console.error("Cantidad inválida. Uso: node dist/scripts/seed-users.js [cantidad]");
    process.exit(1);
  }

  const authRepo = new AuthUserRepository();
  const usersRepo = new UsersRepository();

  let created = 0;
  let failed = 0;

  for (let i = 1; i <= total; i++) {
    const name = randomName();
    const last = randomLastName();
    const phone = randomPhone();
    const email = makeEmail(name, last, i);
    const password = `Passw0rd!${Math.floor(Math.random() * 1_000_000)}`;

    const authUser = new AuthUser(
      email,
      password,
      {
        role: "user",
        name,
        last_name: last,
        phone,
      },
      true
    );

    try {
      const id = await authRepo.create(authUser);

      const synced = await waitForUser(usersRepo, id);
      if (!synced) {
        // eslint-disable-next-line no-console
        console.warn(`[#${i}] Usuario ${email} creado en Auth, pero no sincronizado en DB`);
        failed++;
        continue;
      }

      // Ensure profile fields are set (in case trigger didn't copy metadata)
      await usersRepo.updateProfile(id, {
        name,
        last_name: last,
        phone,
        email,
      });

      // Ensure role is user (consistency between auth metadata and DB)
      if (synced.role !== "user") {
        await usersRepo.updateRole(id, "user");
      }

      created++;
      if (i % 25 === 0 || i === total) {
        // eslint-disable-next-line no-console
        console.log(`Progreso: ${i}/${total} (ok: ${created}, fallidos: ${failed})`);
      }
    } catch (err: any) {
      failed++;
      // eslint-disable-next-line no-console
      console.error(`[#${i}] Error creando ${email}:`, err?.message ?? err);
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Listo. Creados: ${created}, Fallidos: ${failed}, Total: ${total}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("Error inesperado en seed:", e);
  process.exit(1);
});

