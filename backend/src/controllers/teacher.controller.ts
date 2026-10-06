import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { TeacherService } from '../services/teacher.service';

const teacherService = new TeacherService();

export class TeacherController {
  private getParam(value: string | string[]): string {
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }

  async getAll(req: AuthRequest, res: Response) {
    const teachers = await teacherService.getAll()
    return res.status(200).json(teachers)
  }

  async getById(req: AuthRequest, res: Response) {
    const teacher = await teacherService.getById(
      this.getParam(req.params.id)
    )
    return res.status(200).json(teacher)
  }
}
