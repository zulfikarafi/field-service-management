import { z } from "zod";
import { UserRole } from "@prisma/client";
import { ERROR } from "../../../constants/messages";

const passwordSchema = z
  .string()
  .min(8, { message: ERROR.MIN_LENGTH_ERROR })
  .max(20, { message: ERROR.MAX_LENGTH_ERROR })
  .refine(password => /[A-Z]/.test(password), {
    message: ERROR.UPPERCASE_ERROR,
  })
  .refine(password => /[a-z]/.test(password), {
    message: ERROR.LOWERCASE_ERROR,
  })
  .refine(password => /[0-9]/.test(password), { message: ERROR.NUMBER_ERROR })
  .refine(password => /[!@#$%^&*]/.test(password), {
    message: ERROR.SPECIAL_CHARACTER_ERROR,
  });

// Create User
export const createUserSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),

  email: z.string().email({
    message: "Invalid email address",
  }),

  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),

  role: z
    .nativeEnum(UserRole, {
      message: "Invalid user role",
    })
    .optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Invalid email format' })
    .nonempty({ message: 'Email is required' }),
  password: z.string().nonempty({ message: 'Password is required' }),
});

// Update User Password

export const updatePasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: ERROR.PASSWORD_MISMATCH_ERROR,
      });
    }
  });
