import { AuthUser } from "../entities/AuthUser";
import { User } from "../entities/User";

export type AuthUserProfile = {
  id: string;
  email: string;
  role?: string;
  emailConfirmed: boolean;
  createdAt: Date;
};

export interface IAuthUserRepository {
  create(authUser: AuthUser): Promise<User["id"]>;
  signIn(email: string, password: string): Promise<String>;
  findByEmail(email: string): Promise<AuthUserProfile | null>;
  delete(userId: string): Promise<void>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
  updateMetadata(
    userId: string,
    metadata: Record<string, unknown>
  ): Promise<void>;
}
