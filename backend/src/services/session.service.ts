import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/appError';

const prisma = new PrismaClient();

export class SessionService {
    //Méthode privé utilisable que dans session.service pour vérifier si admin//
    private async checkAdmin(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user || !user.admin) {
        throw new AppError('Admin access required', 403);
    }

    return user;
    }

    async getAll() {
    const sessions = await prisma.session.findMany({
        include: {
        teacher: true,
        participants: {
            include: {
            user: true,
            },
        },
        },
    });

    return sessions.map((session) => ({
        id: session.id,
        name: session.name,
        date: session.date,
        description: session.description,
        teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
        },
        users: session.participants.map((p) => p.user.id),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    }));
    }

    async getById(id: string) {
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
        throw new AppError('Invalid session ID', 400);
    }

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
        teacher: true,
        participants: {
            include: {
            user: true,
            },
        },
        },
    });

    if (!session) {
        throw new AppError('Session not found', 404);
    }

    return {
        id: session.id,
        name: session.name,
        date: session.date,
        description: session.description,
        teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
        },
        users: session.participants.map((p) => p.user.id),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    };
    }

    async create(
    name: string,
    date: string,
    description: string,
    teacherId: number,
    userId: number,
    ) {
    await this.checkAdmin(userId);

    const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
    });

    if (!teacher) {
        throw new AppError('Teacher not found', 404);
    }

    const session = await prisma.session.create({
        data: {
        name,
        date: new Date(date),
        description,
        teacherId,
        },
        include: {
        teacher: true,
        participants: true,
        },
    });

    return {
        id: session.id,
        name: session.name,
        date: session.date,
        description: session.description,
        teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
        },
        users: [],
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    };
    }
   
    async update(
  id: string,
  name: string | undefined,
  date: string | undefined,
  description: string | undefined,
  teacherId: number | undefined,
  userId: number,
) {
  await this.checkAdmin(userId);

  const sessionId = parseInt(id);

  if (isNaN(sessionId)) {
    throw new AppError('Invalid session ID', 400);
  }

  const existingSession = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!existingSession) {
    throw new AppError('Session not found', 404);
  }

  const updateData: {
    name?: string;
    date?: Date;
    description?: string;
    teacherId?: number;
  } = {};

  if (name !== undefined) {
    updateData.name = name;
  }

  if (date !== undefined) {
    updateData.date = new Date(date);
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  if (teacherId !== undefined) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    updateData.teacherId = teacherId;
  }

  const session = await prisma.session.update({
    where: { id: sessionId },
    data: updateData,
    include: {
      teacher: true,
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  return {
    id: session.id,
    name: session.name,
    date: session.date,
    description: session.description,
    teacher: {
      id: session.teacher.id,
      firstName: session.teacher.firstName,
      lastName: session.teacher.lastName,
    },
    users: session.participants.map((p) => p.user.id),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    };
    }

    async delete(id: string, userId: number) {
    await this.checkAdmin(userId);

    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
        throw new AppError('Invalid session ID', 400);
    }

    const existingSession = await prisma.session.findUnique({
        where: { id: sessionId },
    });

    if (!existingSession) {
        throw new AppError('Session not found', 404);
    }

    await prisma.session.delete({
        where: { id: sessionId },
    });

    return {
        message: 'Session deleted successfully',
    };
    }

    async participate(
    id: string,
    userId: string,
    ) {
    const sessionId = parseInt(id);
    const participantUserId = parseInt(userId);

    if (isNaN(sessionId)) {
        throw new AppError('Invalid session ID', 400);
    }

    if (isNaN(participantUserId)) {
        throw new AppError('Invalid user ID', 400);
    }

    const session = await prisma.session.findUnique({
        where: { id: sessionId },
    });

    if (!session) {
        throw new AppError('Session not found', 404);
    }

    const user = await prisma.user.findUnique({
        where: { id: participantUserId },
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    const existingParticipation =
        await prisma.sessionParticipation.findUnique({
        where: {
            sessionId_userId: {
            sessionId,
            userId: participantUserId,
            },
        },
        });

    if (existingParticipation) {
        throw new AppError(
        'User already participating in this session',
        400,
        );
    }

    await prisma.sessionParticipation.create({
        data: {
        sessionId,
        userId: participantUserId,
        },
    });

    return {
        message: 'Successfully joined the session',
    };
    }

    async unparticipate(
    id: string,
    userId: string,
    ) {
    const sessionId = parseInt(id);
    const participantUserId = parseInt(userId);

    if (isNaN(sessionId)) {
        throw new AppError('Invalid session ID', 400);
    }

    if (isNaN(participantUserId)) {
        throw new AppError('Invalid user ID', 400);
    }

    const participation =
        await prisma.sessionParticipation.findUnique({
        where: {
            sessionId_userId: {
            sessionId,
            userId: participantUserId,
            },
        },
        });

    if (!participation) {
        throw new AppError('Participation not found', 404);
    }

    await prisma.sessionParticipation.delete({
        where: {
        sessionId_userId: {
            sessionId,
            userId: participantUserId,
        },
        },
    });

    return {
        message: 'Successfully left the session',
    };
    }


}