import { Router } from "express";
import { AuthController } from "../controllers/AuthControllers";
import { UserService } from "../../domain/services/User.service";
import { UsersRepository } from "../../infra/repositories/User.repo";
import { AuthUserRepository } from "../../infra/repositories/AuthUser.repo";
import { ValidatorJwt } from "../../core/middlewares/tokenValidator";
export const JwtValidator = new ValidatorJwt();

const router = Router();
const controller = new AuthController(
  new UserService(new UsersRepository(), new AuthUserRepository())
);

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout",JwtValidator.validateJwt, controller.logout);
router.get("/session", JwtValidator.validateJwt, controller.getSession);
export default router;
