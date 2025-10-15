"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserSchema = exports.updateUserSchema = exports.loginSchema = exports.registerSchema = exports.rolSchema = void 0;
const zod_1 = require("zod");
exports.rolSchema = zod_1.z.enum(["admin", "user", "provider"]);
exports.registerSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    phone: zod_1.z.number().int(),
    email: zod_1.z.email(),
    password: zod_1.z.string().min(6),
    role: exports.rolSchema.optional().default("user"),
})
    .superRefine((data, ctx) => {
    if (data.role === "admin") {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "No podes registrarte directamente como admin",
            path: ["role"],
        });
    }
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.email(),
    password: zod_1.z.string().min(6),
});
exports.updateUserSchema = zod_1.z
    .object({
    requesterId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.number().int().optional(),
})
    .superRefine((data, ctx) => {
    if (data.name === undefined &&
        data.lastName === undefined &&
        data.phone === undefined) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Debes enviar al menos un campo para actualizar",
            path: ["name"],
        });
    }
});
exports.deleteUserSchema = zod_1.z.object({
    requesterId: zod_1.z.string().uuid(),
});
