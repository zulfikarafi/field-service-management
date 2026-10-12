import bcrypt from 'bcrypt';
import { unifiedResponse } from "uni-response";
import { ERROR, SUCCESS } from "../../../constants/messages";
import { UserRepository } from "../repositories/user.repository";
import { LoginInputTypes, RegisterInputTypes } from "../types/user.type";
import { generateToken } from '@/utils/generate-token.util';

export class UserService {
  constructor(
    private readonly UserRepository: UserRepository
  ) {}

  async register(registerInput: RegisterInputTypes) {
    const { name, email, password, role } = registerInput;
    const existingUser = await this.UserRepository.findUserByEmail(email);
    if (existingUser) {
      return unifiedResponse(false, ERROR.USER_EXISTS_WITH_EMAIL);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser =
      await this.UserRepository.register({
        name,
        email,
        password: hashedPassword,
        role,
      });

    const token = generateToken(newUser.id, newUser.role);

    return unifiedResponse(
      true,
      SUCCESS.REGISTRATION_SUCCESSFUL,
      { token }
    );
  }

    async login(loginInputObj: LoginInputTypes) {
    const { email, password } = loginInputObj;
    const user = await this.UserRepository.findUserByEmail(email);

    if (!user) {
      return unifiedResponse(false, ERROR.USER_NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      return unifiedResponse(false, 'Invalid credentials');
    }

    const token = generateToken(user.id, user.role);
    return unifiedResponse(true, SUCCESS.LOGIN_SUCCESSFUL, { token });
  }

  async getUserById(userId: string) {
    const user = await this.UserRepository.findUserById(userId);

    if (!user) {
      return unifiedResponse(false, ERROR.USER_NOT_FOUND);
    }

    return unifiedResponse(true, SUCCESS.USER_FOUND, user);
  }

  async updateUserPassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser =
      await this.UserRepository.updateUserPassword(userId, hashedPassword);

    if (!updatedUser) {
      return unifiedResponse(false, ERROR.USER_NOT_FOUND);
    }

    return unifiedResponse(
      true,
      SUCCESS.PASSWORD_UPDATED
    );
  }
}    