import { Router } from "express";

import { PrismaService } from "../../../config/prisma.config";
import { auth } from "../../../middleware/auth.middleware";
import { validateRequest } from "../../../middleware/validation.middleware";
import { UserController } from "../controllers/user.controller";
import { UserRepository } from "../repositories/user.repository";
import {
  createUserSchema,
  loginSchema,
  updatePasswordSchema
} from "../schemas/user.schema";
import { UserService } from "../services/user.service";

// Dependency Injection
const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;

const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = Router();

router.post(
  "/register",
  validateRequest(createUserSchema),
  userController.register
);

router.post(
  "/login",
  validateRequest(loginSchema),
  userController.login
);

router.put(
  "/update-password",
  validateRequest(updatePasswordSchema),
  auth,
  userController.updatePassword
);

router.get(
  "/:userId",
  auth,
  userController.getUserById
);


export default router;