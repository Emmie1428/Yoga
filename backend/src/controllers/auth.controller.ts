import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const response = await authService.login(email, password);

    return res.status(200).json(response);
  }

  async register(req: Request, res: Response) {
    const { email, password, firstName, lastName } = req.body;

    const response = await authService.register(
      email,
      password,
      firstName,
      lastName,
    );

    return res.status(201).json(response);
  }
}