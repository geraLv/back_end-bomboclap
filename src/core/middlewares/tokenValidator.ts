import jwt, { type JwtPayload } from "jsonwebtoken";
import { ENV } from "../../config/env";
import { Request, Response, NextFunction } from "express";
import { UsersRepository } from "../../infra/repositories/User.repo";
import { AppError } from "../errors/AppErrors";
import { HttpStatus } from "../http/HttpStatus";

type Decoded = JwtPayload & { sub?: string; userId?: string };

export class ValidatorJwt {
  private user = new UsersRepository();

  constructor() {}

  async createJwt(userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const payload = { sub: userId };
        jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
          if (err || !token) return reject("No se pudo generar el token");
          resolve(token);
        });
      } catch (error) {
        reject("No se pudo generar el token");
      }
    });
  }

  validateJwt = async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      let token: string | null = null;

      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if ((req as any).cookies && (req as any).cookies.token) {
        token = (req as any).cookies.token as string;
      }

      if (!token) {
        return next(
          new AppError("No se encontró el token", HttpStatus.UNAUTHORIZED)
        );
      }

      const decoded = jwt.verify(token, ENV.JWT_SECRET) as Decoded;
      const userId = decoded.sub || decoded.userId;
      if (!userId) {
        return next(new AppError("Token inválido", HttpStatus.UNAUTHORIZED));
      }

      // Opcional: comprobar que el usuario exista
      const user = await this.user.findById(userId);
      if (!user) {
        return next(
          new AppError("Usuario no encontrado", HttpStatus.UNAUTHORIZED)
        );
      }

      (req as any).authUser = user; // disponible para controladores
      return next();
    } catch (error: any) {
      if (error?.name === "TokenExpiredError")
        return next(new AppError("Token expirado", HttpStatus.UNAUTHORIZED));
      if (error?.name === "JsonWebTokenError")
        return next(new AppError("Token inválido", HttpStatus.UNAUTHORIZED));
      return next(error);
    }
  };
}
