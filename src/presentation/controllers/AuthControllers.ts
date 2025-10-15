import { Request, Response, NextFunction } from "express";
import { UserService } from "../../domain/services/User.service";
import {
  loginSchema,
  registerSchema,
} from "../../infra/validators/user.validator";
import { AppError } from "../../core/errors/AppErrors";

export class AuthController {
  constructor(private readonly userService: UserService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = registerSchema.parse(req.body);

      console.log(parsed);
      const result = await this.userService.register(parsed);
      res.status(201).json(result);
    } catch (err) {
      next(this.toAppError(err));
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = loginSchema.parse(req.body);
      const result = await this.userService.login(parsed);

      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      });

      res.json(result);
    } catch (err) {
      next(this.toAppError(err));
    }
  };

  logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("token");
      res.status(200).json({ msg: "Sesion cerrada" });
    } catch (err) {
      next(this.toAppError(err));
    }
  };

  private toAppError(err: unknown) {
    if ((err as any)?.issues)
      return new AppError("Validacion fallida", 400, (err as any).issues);
    return err as any;
  }

  getSession = (req: Request, res: Response) => {
    try {
      res
        .status(200)
        .json({ message: "Session Activa", user: req.cookies.user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  };
}
