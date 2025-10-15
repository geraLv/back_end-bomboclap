"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const user_validator_1 = require("../../infra/validators/user.validator");
const AppErrors_1 = require("../../core/errors/AppErrors");
class AuthController {
    constructor(userService) {
        this.userService = userService;
        this.register = async (req, res, next) => {
            try {
                const parsed = user_validator_1.registerSchema.parse(req.body);
                console.log(parsed);
                const result = await this.userService.register(parsed);
                res.status(201).json(result);
            }
            catch (err) {
                next(this.toAppError(err));
            }
        };
        this.login = async (req, res, next) => {
            try {
                const parsed = user_validator_1.loginSchema.parse(req.body);
                const result = await this.userService.login(parsed);
                res.cookie("token", result.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 3600000,
                });
                res.json(result);
            }
            catch (err) {
                next(this.toAppError(err));
            }
        };
        this.logout = async (_req, res, next) => {
            try {
                res.clearCookie("token");
                res.status(200).json({ msg: "Sesion cerrada" });
            }
            catch (err) {
                next(this.toAppError(err));
            }
        };
        this.getSession = (req, res) => {
            try {
                res
                    .status(200)
                    .json({ message: "Session Activa", user: req.cookies.user });
            }
            catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Error en el servidor" });
            }
        };
    }
    toAppError(err) {
        if (err?.issues)
            return new AppErrors_1.AppError("Validacion fallida", 400, err.issues);
        return err;
    }
}
exports.AuthController = AuthController;
