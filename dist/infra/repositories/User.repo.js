"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const User_1 = require("../../domain/entities/User");
const database_1 = require("../../config/database");
function toDomain(row) {
    return new User_1.User(row.id, row.name, row.last_name, Number(row.phone ?? 0), row.email, row.role, new Date(row.created_at));
}
function buildUpdatePayload(patch) {
    const payload = {};
    if (patch.name !== undefined)
        payload.name = patch.name;
    if (patch.last_name !== undefined)
        payload.last_name = patch.last_name;
    if (patch.phone !== undefined)
        payload.phone = patch.phone;
    if (patch.email !== undefined)
        payload.email = patch.email;
    return payload;
}
class UsersRepository {
    constructor() {
        this.supabaseDB = database_1.DataBase.obtenerInstancia().public_db();
    }
    async findByEmail(email) {
        const { data, error } = await this.supabaseDB
            .from("usuarios")
            .select("*")
            .eq("email", email)
            .limit(1)
            .maybeSingle();
        if (error)
            throw error;
        if (!data)
            return null;
        return toDomain(data);
    }
    async findById(id) {
        const { data, error } = await this.supabaseDB
            .from("usuarios")
            .select("*")
            .eq("id", id)
            .limit(1)
            .maybeSingle();
        if (error)
            throw error;
        if (!data)
            return null;
        return toDomain(data);
    }
    async list() {
        const { data, error } = await this.supabaseDB
            .from("usuarios")
            .select("*")
            .order("created_at", { ascending: false });
        if (error)
            throw error;
        if (!data?.length)
            return [];
        return data.map(toDomain);
    }
    async updateProfile(userId, patch) {
        const payload = buildUpdatePayload(patch);
        if (!Object.keys(payload).length) {
            const current = await this.findById(userId);
            if (!current)
                throw new Error("Usuario no encontrado");
            return current;
        }
        const { data, error } = await this.supabaseDB
            .from("usuarios")
            .update(payload)
            .eq("id", userId)
            .select("*")
            .maybeSingle();
        if (error)
            throw error;
        if (!data)
            throw new Error("Usuario no encontrado");
        return toDomain(data);
    }
    async updateRole(targetUserId, role) {
        const { data, error } = await this.supabaseDB
            .from("usuarios")
            .update({ role })
            .eq("id", targetUserId)
            .select("id, role")
            .maybeSingle();
        if (error)
            throw error;
        if (!data)
            throw new Error("No se actualizo ningun usuario (id inexistente)");
    }
    async delete(userId) {
        const { error } = await this.supabaseDB
            .from("usuarios")
            .delete()
            .eq("id", userId);
        if (error)
            throw error;
    }
}
exports.UsersRepository = UsersRepository;
