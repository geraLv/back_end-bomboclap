"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const AppErrors_1 = require("../../core/errors/AppErrors");
const AuthUser_1 = require("../entities/AuthUser");
const tokenValidator_1 = require("../../core/middlewares/tokenValidator");
const USER_SYNC_MAX_RETRIES = 5;
const USER_SYNC_INTERVAL_MS = 200;
class UserService {
    constructor(users, authUsers) {
        this.users = users;
        this.authUsers = authUsers;
        this.jwtValidator = new tokenValidator_1.ValidatorJwt();
    }
    async register(data) {
        const normalizedEmail = data.email.toLowerCase();
        const desiredRole = (data.role ?? "user");
        if (desiredRole === "admin")
            throw new AppErrors_1.AppError("No podes registrarte como administrador. Solicita el cambio a un admin existente.", 403);
        const exists = await this.authUsers.findByEmail(normalizedEmail);
        if (exists)
            throw new AppErrors_1.AppError("Email ya registrado", 409);
        const authUser = new AuthUser_1.AuthUser(normalizedEmail, data.password, {
            role: desiredRole,
            name: data.name,
            last_name: data.lastName,
            phone: data.phone,
        }, true);
        const createdId = await this.authUsers.create(authUser);
        const synced = await this.waitForUser(createdId);
        if (!synced)
            throw new Error("Usuario no sincronizado con la base de datos");
        let finalUser = synced;
        if (synced.role !== desiredRole) {
            await this.users.updateRole(synced.id, desiredRole);
            finalUser = (await this.users.findById(synced.id)) ?? synced;
        }
        return { user: this.toPublic(finalUser) };
    }
    async login(data) {
        const normalizedEmail = data.email.toLowerCase();
        const user = await this.users.findByEmail(normalizedEmail);
        if (!user)
            throw new AppErrors_1.AppError("No existe este email", 401);
        const refreshtoken = await this.authUsers.signIn(normalizedEmail, data.password);
        const token = await this.jwtValidator.createJwt(user.id);
        return { user: this.toPublic(user), token, refreshtoken };
    }
    async updateProfile(requesterId, targetUserId, data) {
        const requester = await this.users.findById(requesterId);
        if (!requester)
            throw new AppErrors_1.AppError("Usuario autenticado no encontrado", 404);
        if (requester.id !== targetUserId && requester.role !== "admin")
            throw new AppErrors_1.AppError("No estas autorizado para actualizar este usuario", 403);
        const target = await this.users.findById(targetUserId);
        if (!target)
            throw new AppErrors_1.AppError("Usuario objetivo no encontrado", 404);
        const patch = {};
        if (data.name !== undefined)
            patch.name = data.name;
        if (data.lastName !== undefined)
            patch.last_name = data.lastName;
        if (data.phone !== undefined)
            patch.phone = data.phone;
        if (!Object.keys(patch).length)
            throw new AppErrors_1.AppError("Debes enviar al menos un campo para actualizar", 400);
        const updated = await this.users.updateProfile(targetUserId, patch);
        await this.authUsers.updateMetadata(targetUserId, {
            role: updated.role,
            name: updated.name,
            last_name: updated.last_name,
            phone: updated.phone,
        });
        return this.toPublic(updated);
    }
    async deleteAccount(requesterId, targetUserId) {
        const requester = await this.users.findById(requesterId);
        if (!requester)
            throw new AppErrors_1.AppError("Usuario autenticado no encontrado", 404);
        if (requester.id !== targetUserId && requester.role !== "admin")
            throw new AppErrors_1.AppError("No estas autorizado para eliminar este usuario", 403);
        const target = await this.users.findById(targetUserId);
        if (!target)
            throw new AppErrors_1.AppError("Usuario objetivo no encontrado", 404);
        await this.authUsers.delete(targetUserId);
        await this.users.delete(targetUserId);
    }
    async waitForUser(userId) {
        for (let attempt = 0; attempt < USER_SYNC_MAX_RETRIES; attempt++) {
            const user = await this.users.findById(userId);
            if (user)
                return user;
            await new Promise((resolve) => setTimeout(resolve, USER_SYNC_INTERVAL_MS));
        }
        return null;
    }
    toPublic(u) {
        const { ...rest } = u;
        return rest;
    }
}
exports.UserService = UserService;
