import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { SessionService } from '../services/session.service';

const sessionService = new SessionService();

export class SessionController {
  private getAuthenticatedUserId(req: AuthRequest): number {
    if (req.userId === undefined) {
      throw new Error('Authenticated user ID is missing');
    }

    return req.userId;
  }

  private getParam(value: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

  async getAll(
    req: AuthRequest,
    res: Response,
  ) {
    const sessions = await sessionService.getAll();

    return res.status(200).json(sessions);
  }

  async getById(
    req: AuthRequest,
    res: Response,
  ) {
    const session = await sessionService.getById(
      this.getParam(req.params.id)
    );

    return res.status(200).json(session);
  }

  async create(
    req: AuthRequest,
    res: Response,
  ) {
    const { name, date, description, teacherId } = req.body;

    const session = await sessionService.create(
      name,
      date,
      description,
      teacherId,
      this.getAuthenticatedUserId(req),
    );

    return res.status(201).json(session);
  }

  async update(
    req: AuthRequest,
    res: Response,
  ) {
    const id = this.getParam(req.params.id);
    const { name, date, description, teacherId } = req.body;

    const session = await sessionService.update(
      id,
      name,
      date,
      description,
      teacherId,
      this.getAuthenticatedUserId(req),
    );

    return res.status(200).json(session);
  }

  async delete(
    req: AuthRequest,
    res: Response,
  ) {
    const id = this.getParam(req.params.id);

    const response = await sessionService.delete(
      id,
      this.getAuthenticatedUserId(req),
    );

    return res.status(200).json(response);
  }

  async participate(
    req: AuthRequest,
    res: Response,
  ) {
    const id = this.getParam(req.params.id);
    const userId = this.getParam(req.params.userId);

    const response = await sessionService.participate(
      id,
      userId,
    );

    return res.status(200).json(response);
  }

  async unparticipate(
    req: AuthRequest,
    res: Response,
  ) {
    const id = this.getParam(req.params.id);
    const userId = this.getParam(req.params.userId);

    const response = await sessionService.unparticipate(
      id,
      userId,
    );

    return res.status(200).json(response);
  }
}