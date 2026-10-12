export type UserRole = "ADMIN" | "PELAPOR" | "APPROVER";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdatePasswordPayload {
  newPassword: string;
  confirmPassword: string;
}

// Shape of the JWT payload issued by the server (generateToken)
export interface JwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  userId: string;
  role: UserRole;
}
