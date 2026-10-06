import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';
import { AppError } from '../utils/appError';

const userService = new UserService();

export class UserController {
  private getParam(value: string | string[]): string {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }

  async getById(req: AuthRequest, res: Response) {
    const user = await userService.getById(
        this.getParam(req.params.id)
    );

    return res.status(200).json(user)
  }

  async delete(req: AuthRequest, res: Response) {
    const userId = this.getParam(req.params.id);
    if (req.userId === undefined) {
      throw new AppError('Unauthorized', 401);
    }
    const response = await userService.delete(
      userId,
      req.userId
    );

    return res.status(200).json(response);
    
  }

  async promoteSelfToAdmin(req: AuthRequest, res: Response) {
    if (!req.userId) {
        throw new AppError('Unauthorized', 401)
      }

      const user = await userService.promoteSelfToAdmin(req.userId)

      return res.status(200).json(user)
  }
}

