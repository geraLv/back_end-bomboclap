"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const User_repo_1 = require("../../infra/repositories/User.repo");
const AppErrors_1 = require("../errors/AppErrors");
const HttpStatus_1 = require("../http/HttpStatus");
class ValidatorJwt {
    constructor() {
        this.user = new User_repo_1.UsersRepository();
        this.validateJwt = async (req, _res, next) => {
            try {
                let token = null;
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith("Bearer ")) {
                    token = authHeader.split(" ")[1];
                }
                else if (req.cookies && req.cookies.token) {
                    token = req.cookies.token;
                }
                if (!token) {
                    return next(new AppErrors_1.AppError("No se encontró el token", HttpStatus_1.HttpStatus.UNAUTHORIZED));
                }
                const decoded = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
                const userId = decoded.sub || decoded.userId;
                if (!userId) {
                    return next(new AppErrors_1.AppError("Token inválido", HttpStatus_1.HttpStatus.UNAUTHORIZED));
                }
                // Opcional: comprobar que el usuario exista
                const user = await this.user.findById(userId);
                if (!user) {
                    return next(new AppErrors_1.AppError("Usuario no encontrado", HttpStatus_1.HttpStatus.UNAUTHORIZED));
                }
                req.authUser = user; // disponible para controladores
                return next();
            }
            catch (error) {
                if (error?.name === "TokenExpiredError")
                    return next(new AppErrors_1.AppError("Token expirado", HttpStatus_1.HttpStatus.UNAUTHORIZED));
                if (error?.name === "JsonWebTokenError")
                    return next(new AppErrors_1.AppError("Token inválido", HttpStatus_1.HttpStatus.UNAUTHORIZED));
                return next(error);
            }
        };
    }
    async createJwt(userId) {
        return new Promise((resolve, reject) => {
            try {
                const payload = { sub: userId };
                jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
                    if (err || !token)
                        return reject("No se pudo generar el token");
                    resolve(token);
                });
            }
            catch (error) {
                reject("No se pudo generar el token");
            }
        });
    }
}
exports.ValidatorJwt = ValidatorJwt;
