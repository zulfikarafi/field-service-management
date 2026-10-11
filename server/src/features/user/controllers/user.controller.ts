import { NextFunction, Request, Response } from "express";

import { UserService } from "../services/user.service";
import { LoginInputTypes, RegisterInputTypes } from "../types/user.type";

export class UserController {
  private UserService: UserService;

  constructor(UserService: UserService) {
    this.UserService = UserService;
  }

  register = async (
    req: Request<{}, {}, RegisterInputTypes>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const registerInput: RegisterInputTypes = req.body;
      const response = await this.UserService.register(
        registerInput
      );

      res.status(response.success ? 201 : 400).json(response);
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request<{}, {}, LoginInputTypes>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const loginInputObj: LoginInputTypes = req.body; // Map request body to Obj
      const result = await this.UserService.login(loginInputObj);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const response = await this.UserService.getUserById(userId);
      res.status(response.success ? 200 : 404).json(response);
    } catch (error) {
      next(error);
    }
  };

  updatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // const { userId } = req.body;
      const userId = req.userId; // Assuming userId is set in the auth middleware
      const { newPassword } = req.body; 

      if (userId) {
        const response =
        await this.UserService.updateUserPassword(userId, newPassword);
        res.status(response.success ? 200 : 400).json(response);
      }
    } catch (error) {
      next(error);
    }
  };
}