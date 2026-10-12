import { apiRequest } from "./http";
import type {
  LoginPayload,
  RegisterPayload,
  UpdatePasswordPayload,
} from "../model/auth";

interface TokenResponse {
  token: string;
}

// POST /v1/users/login -> { token }
export const login = async (payload: LoginPayload): Promise<string> => {
  const data = await apiRequest<TokenResponse>("/users/login", {
    method: "POST",
    body: payload,
  });
  return data.token;
};

// POST /v1/users/register (Admin only) -> { token }
export const registerUser = async (
  payload: RegisterPayload,
  token: string
): Promise<TokenResponse> => {
  return apiRequest<TokenResponse>("/users/register", {
    method: "POST",
    token,
    body: payload,
  });
};

// PUT /v1/users/update-password
export const updatePassword = async (
  payload: UpdatePasswordPayload,
  token: string
): Promise<void> => {
  await apiRequest<null>("/users/update-password", {
    method: "PUT",
    token,
    body: payload,
  });
};
