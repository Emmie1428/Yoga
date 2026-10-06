import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/appError';

const prisma = new PrismaClient();

export class UserService {
  async getById(id: string) {
    const userId = parseInt(id)
    if (isNaN(userId)) {
        throw new AppError('Invalid user ID', 400);
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    })

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        admin: user.admin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
  }

  async delete(userId : string, authenticatedUserId: number) {
    const id = parseInt(userId)
    if (isNaN(id)) {
        throw new AppError('Invalid user ID', 400);
    }

    if (id !==  authenticatedUserId) {
        throw new AppError('You can only delete your own account', 403);
    }

    const existingUser = await prisma.user.findUnique({
         where: { id }
    })

    if (!existingUser) {
        throw new AppError('User not found', 404)
    }

    await prisma.user.delete({
        where: { id }
    })

    return { message: 'User deleted successfully' }
  }

  async promoteSelfToAdmin(userId: number) {
    const isDev = (process.env.NODE_ENV || 'development') === 'development'

    if (!isDev) {
        throw new AppError('Admin self-promotion is only available in development', 403)
    }

    const user = await prisma.user.findUnique({
        where: {id: userId}
    })

    if (!user) {
        throw new AppError('User not found', 404)
    }

    if (user.admin) {
        return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        admin: user.admin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        };
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { admin: true },
    });

    return {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        admin: updatedUser.admin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
    };
  }
}
