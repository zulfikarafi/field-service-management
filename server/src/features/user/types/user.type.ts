import { UserRole } from "@prisma/client";

export interface RegisterInputTypes {
    id?: string;
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}

export interface LoginInputTypes {
  email: string;
  password: string;
}