"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUserRepository = void 0;
const database_1 = require("../../config/database");
function toProfile(user) {
    if (!user.email)
        throw new Error("Usuario sin email en Supabase");
    const metadataRole = (user.user_metadata?.role ?? user.user_metadata?.rol);
    const confirmedAt = user.email_confirmed_at ?? user.confirmed_at;
    return {
        id: user.id,
        email: user.email,
        role: metadataRole,
        emailConfirmed: Boolean(confirmedAt),
        createdAt: new Date(user.created_at),
    };
}
class AuthUserRepository {
    constructor() {
        this.db = database_1.DataBase.obtenerInstancia().public_db();
        this.serviceRol = database_1.DataBase.obtenerInstancia().service_rol();
    }
    async create(authUser) {
        const { data, error } = await this.serviceRol.auth.admin.createUser({
            email: authUser.email,
            password: authUser.password,
            email_confirm: authUser.email_confirm,
            user_metadata: authUser.metadata,
        });
        if (error)
            throw error;
        const created = data.user?.id;
        if (!created)
            throw new Error("No se recibio el id del usuario creado");
        return created;
    }
    async signIn(email, password) {
        const normalized = email.toLowerCase();
        const { data: { user, session }, error, } = await this.serviceRol.auth.signInWithPassword({
            email: normalized,
            password,
        });
        if (error || !user || !session)
            throw error ?? new Error("Credenciales invalidas");
        console.log(session);
        return session?.access_token;
    }
    async signOut(refreshToken) {
        const { error } = await this.serviceRol.auth.admin.signOut(refreshToken);
        if (error)
            throw error;
    }
    async findByEmail(email) {
        const normalized = email.toLowerCase();
        const { data, error } = await this.serviceRol.auth.admin.listUsers({
            page: 1,
            perPage: 100,
        });
        if (error)
            throw error;
        const users = data?.users ?? [];
        const user = users.find((u) => u.email?.toLowerCase() === normalized);
        if (!user)
            return null;
        return toProfile(user);
    }
    async delete(userId) {
        const { error } = await this.serviceRol.auth.admin.deleteUser(userId);
        if (error)
            throw error;
    }
    async updatePassword(userId, newPassword) {
        const { error } = await this.serviceRol.auth.admin.updateUserById(userId, {
            password: newPassword,
        });
        if (error)
            throw error;
    }
    async updateMetadata(userId, metadata) {
        const { error } = await this.serviceRol.auth.admin.updateUserById(userId, {
            user_metadata: metadata,
        });
        if (error)
            throw error;
    }
}
exports.AuthUserRepository = AuthUserRepository;
