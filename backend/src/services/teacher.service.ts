import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/appError';

const prisma = new PrismaClient();

export class TeacherService {
    async getAll() {
        const teachers = await prisma.teacher.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });

    return teachers.map((teacher) => ({
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt,
      }));
    }

    async getById(id: string) {
        const teacherId = parseInt(id)

        if (isNaN(teacherId)) {
            throw new AppError('Invalid teacher ID', 400);
        }

        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
        });

        if (!teacher) {
            throw new AppError('Teacher not found', 404);
        }

        return {
            id: teacher.id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            createdAt: teacher.createdAt,
            updatedAt: teacher.updatedAt,
        };
    }
}

