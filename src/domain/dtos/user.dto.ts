import type { Rol } from "../types/roles.type";

export type RegisterDTO = {
  name: string;
  lastName: string;
  phone: number;
  email: string;
  password: string;
  role?: Rol;
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type UpdateUserDTO = {
  name?: string;
  lastName?: string;
  phone?: number;
};
