import { beforeEach, describe, it, vi, expect } from 'vitest'
import { SessionService } from '../services/session.service'

const { findManyMock, findUniqueMock, userFindUniqueMock, teacherFindUniqueMock, createMock, updateMock, deleteMock, participationDeleteMock, participationFindUniqueMock, participationCreateMock } = vi.hoisted(() => ({
    findManyMock: vi.fn(),
    findUniqueMock: vi.fn(),
    userFindUniqueMock: vi.fn(),
    teacherFindUniqueMock: vi.fn(),
    createMock: vi.fn(),
    updateMock: vi.fn(),
    deleteMock: vi.fn(),
    participationFindUniqueMock: vi.fn(),
    participationCreateMock: vi.fn(),
    participationDeleteMock: vi.fn(),
}))

vi.mock('@prisma/client', () => ({
    PrismaClient: class {
        session = {
            findMany: findManyMock,
            findUnique: findUniqueMock,
            create: createMock,
            update: updateMock,
            delete: deleteMock
        }
        user = {
            findUnique: userFindUniqueMock,
        }
        teacher = {
            findUnique: teacherFindUniqueMock,
        }
        sessionParticipation = {
            findUnique: participationFindUniqueMock,
            create: participationCreateMock,
            delete: participationDeleteMock,
        }
    }
}))

 beforeEach(() => {
    vi.clearAllMocks()
})

const sessionService = new SessionService()

describe('SessionService - getAll', () => {
    const session = {
        id: 1,
        name: 'Yoga',
        date: new Date('2026-10-20T00:00:00.000Z'),
        description: 'Cours de yoga pour débutant',
        teacher: {
            id: 1, 
            firstName: 'Jean',
            lastName: 'Dupont'
        },
        participants: [{user: { id: 2}}, {user: { id: 3}}],
        createdAt: new Date('2026-10-20T00:00:00.000Z'),
        updatedAt: new Date('2026-10-20T00:00:00.000Z'),
    }

    it('should find all sessions', async () => {
        findManyMock.mockResolvedValue([session])

        const result = await sessionService.getAll()

        expect(findManyMock).toHaveBeenCalledWith({ include: {teacher: true, participants: {include: { user: true}}} })
        expect(result).toEqual([{
            id: session.id,
            name: session.name,
            date: session.date,
            description: session.description,
            teacher: {
                id: session.teacher.id,
                firstName: session.teacher.firstName,
                lastName: session.teacher.lastName,
            },
            users: [2, 3],
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
        }])
    })
})

describe('SessionService - getById', () => {
    const session = {
        id: '1',
        name: 'Yoga',
        date: new Date('2026-10-20T00:00:00.000Z'),
        description: 'Cours de yoga pour débutant',
        teacher: {
            id: 1, 
            firstName: 'Jean',
            lastName: 'Dupont'
        },
        participants: [{user: { id: 2}}, {user: { id: 3}}],
        createdAt: new Date('2026-10-20T00:00:00.000Z'),
        updatedAt: new Date('2026-10-20T00:00:00.000Z'),
    }

    it('should find a session by id', async () => {
        findUniqueMock.mockResolvedValue(session)
        const sessionId = parseInt(session.id)

        const result = await sessionService.getById(session.id)

        expect(findUniqueMock).toHaveBeenCalledWith({ where: { id : sessionId }, include: {teacher: true, participants: {include: { user: true}}} })
        expect(result).toEqual({
            id: '1',
            name: 'Yoga',
            date: new Date('2026-10-20T00:00:00.000Z'),
            description: 'Cours de yoga pour débutant',
            teacher: {
                id: 1, 
                firstName: 'Jean',
                lastName: 'Dupont'
            },
            users: [2, 3],
            createdAt: new Date('2026-10-20T00:00:00.000Z'),
            updatedAt: new Date('2026-10-20T00:00:00.000Z'),
        })
    })
    it('should throw an error if the id is not a number', async () => {
        await expect(sessionService.getById('string')).rejects.toThrow('Invalid session ID')
    })
    it('should throw an error if there is no session find by the id', async () => {
        findUniqueMock.mockResolvedValue(null)
    
        await expect(sessionService.getById(session.id)).rejects.toThrow('Session not found')
    })
})

describe('SessionService - create', () => {
    it('shloud throw an error if the teacher does not exist', async () => {
        userFindUniqueMock.mockResolvedValue({ id: 2, admin: true})
        teacherFindUniqueMock.mockResolvedValue(null)
        
        await expect(sessionService.create(
            'Yoga',
            '2026-10-20',
            'Cours de yoga pour débutant',
            1,
            2,
        )).rejects.toThrow('Teacher not found')
    })
    it('should throw an error if the user is not an admin', async () => {
        userFindUniqueMock.mockResolvedValue({id: 2, admin: false})

        await expect(
            sessionService.create(
            'Yoga',
            '2026-10-20',
            'Yoga pour débutant',
            1,
            2,
            )
        ).rejects.toThrow('Admin access required')
    })
    it('should create a new session', async () => {
        userFindUniqueMock.mockResolvedValue({id: 2, admin: true})
        teacherFindUniqueMock.mockResolvedValue({ id: 1, firstName: 'Jean', lastName: 'Dupont'})
        createMock.mockResolvedValue({
            id: 1,
            name: 'Yoga',
            date: new Date('2026-10-20T00:00:00.000Z'),
            description: 'Yoga pour débutant',
            teacher: {
                id: 1,
                firstName: 'Jean',
                lastName: 'Dupont',
            },
            participants: [],
            createdAt: new Date('2026-10-20T00:00:00.000Z'),
            updatedAt: new Date('2026-10-20T00:00:00.000Z'),
        })

        const result =  await sessionService.create(
            'Yoga',
            '2026-10-20',
            'Yoga pour débutant',
            1,
            2,
        )
    
        expect(createMock).toHaveBeenCalledWith({
            data: {
            name: 'Yoga',
            date: new Date('2026-10-20'),
            description: 'Yoga pour débutant',
            teacherId: 1,
            },
            include: {
            teacher: true,
            participants: true,
            }
        })
        expect(result).toEqual({
            id: 1,
            name: 'Yoga',
            date: new Date('2026-10-20T00:00:00.000Z'),
            description: 'Yoga pour débutant',
            teacher: {
            id: 1,
            firstName: 'Jean',
            lastName: 'Dupont',
            },
            users: [],
            createdAt: new Date('2026-10-20T00:00:00.000Z'),
            updatedAt: new Date('2026-10-20T00:00:00.000Z'),
        })
    })
})

describe('SessionService - update', () => {
  const admin = { id: 2, admin: true }

  const teacher = {
    id: 1,
    firstName: 'Jean',
    lastName: 'Dupont',
  }

  const existingSession = {
    id: 1,
    name: 'Yoga',
    date: new Date('2026-10-20T00:00:00.000Z'),
    description: 'Ancienne description',
    teacherId: 1,
  }

  const updatedSession = {
    id: 1,
    name: 'Yoga avancé',
    date: new Date('2026-10-21T00:00:00.000Z'),
    description: 'Nouvelle description',
    teacher,
    participants: [{ user: { id: 3 } }],
    createdAt: new Date('2026-10-20T00:00:00.000Z'),
    updatedAt: new Date('2026-10-21T00:00:00.000Z'),
  }

    it('should throw an error if the user is not an admin', async () => {
        userFindUniqueMock.mockResolvedValue({id: 2, admin: false})

        await expect(
            sessionService.update(
            '1',
            'Yoga',
            '2026-10-20',
            'Yoga pour débutant',
            1,
            2,
            )
        ).rejects.toThrow('Admin access required')
    })
    it('should throw an error if the session does not exist', async () => {
        userFindUniqueMock.mockResolvedValue({ id: 2, admin: true })
        findUniqueMock.mockResolvedValue(null)

        await expect(
            sessionService.update(
            '1',
            undefined,
            undefined,
            undefined,
            undefined,
            2,
            )
        ).rejects.toThrow('Session not found')
    })
    it('should throw an error if the session already exist', async () => {
        userFindUniqueMock.mockResolvedValue({ id: 2, admin: true })
        const sessionId = 'string'

        await expect(
            sessionService.update(
            sessionId,
            undefined,
            undefined,
            undefined,
            undefined,
            2,
            )
        ).rejects.toThrow('Invalid session ID')
    })
    it('should update a session', async () => { 
        userFindUniqueMock.mockResolvedValue(admin)
        findUniqueMock.mockResolvedValue(existingSession)
        updateMock.mockResolvedValue(updatedSession)

        const result = await sessionService.update(
            '1',
            'Yoga avancé',
            '2026-10-21',
            'Nouvelle description',
            undefined,
            2,
        )

        expect(updateMock).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
            name: 'Yoga avancé',
            date: new Date('2026-10-21'),
            description: 'Nouvelle description',
            },
            include: {
            teacher: true,
            participants: {
                include: { user: true },
            }
            }
        })
        expect(result).toEqual({
            id: 1,
            name: 'Yoga avancé',
            date: new Date('2026-10-21T00:00:00.000Z'),
            description: 'Nouvelle description',
            teacher,
            users: [3],
            createdAt: updatedSession.createdAt,
            updatedAt: updatedSession.updatedAt,
        })
    })
})

describe('SessionService - delete', () => {
    const existingSession = {
        id: 1,
        name: 'Yoga',
        date: new Date('2026-10-20T00:00:00.000Z'),
        description: 'Ancienne description',
        teacherId: 1 }
    const admin = { id: 2, admin: true }

    it('should verify if the session exist by their id', async () => {
        userFindUniqueMock.mockResolvedValue(admin)
        findUniqueMock.mockResolvedValue(existingSession)

        const result = await sessionService.delete('1', 1)
    
        expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: 1 } })
        expect(deleteMock).toHaveBeenCalledWith({where: {id: 1}})
        expect(result).toEqual({message:'Session deleted successfully'})
    })
})

describe('SessionService - participate', () => {
  const sessionId = '1'
  const userId = '2'

  it('should throw an error if the session ID is invalid', async () => {
    await expect(sessionService.participate('abc', userId)).rejects.toThrow('Invalid session ID')
  })
  it('should throw an error if the user ID is invalid', async () => {
    await expect(sessionService.participate(sessionId, 'abc')).rejects.toThrow('Invalid user ID')
  })
  it('should throw an error if the session does not exist', async () => {
    findUniqueMock.mockResolvedValue(null)

    await expect(sessionService.participate(sessionId, userId)).rejects.toThrow('Session not found')
  })
  it('should throw an error if the user does not exist', async () => {
    findUniqueMock.mockResolvedValue({ id: 1 })
    userFindUniqueMock.mockResolvedValue(null)

    await expect(sessionService.participate(sessionId, userId)).rejects.toThrow('User not found')
  })
  it('should throw an error if the user is already participating', async () => {
    findUniqueMock.mockResolvedValue({ id: 1 })
    userFindUniqueMock.mockResolvedValue({ id: 2 })
    participationFindUniqueMock.mockResolvedValue({sessionId: 1,userId: 2})

    await expect(sessionService.participate(sessionId, userId)).rejects.toThrow('User already participating in this session')
    expect(participationCreateMock).not.toHaveBeenCalled()
  })
  it('should create a participation', async () => {
    findUniqueMock.mockResolvedValue({ id: 1 })
    userFindUniqueMock.mockResolvedValue({ id: 2 })
    participationFindUniqueMock.mockResolvedValue(null)

    const result = await sessionService.participate(sessionId, userId)

    expect(participationFindUniqueMock).toHaveBeenCalledWith({
      where: {
        sessionId_userId: {
          sessionId: 1,
          userId: 2,
        }
      }
    })
    expect(participationCreateMock).toHaveBeenCalledWith({data: { sessionId: 1, userId: 2}})
    expect(result).toEqual({ message: 'Successfully joined the session' })
  })
})

describe('SessionService - unparticipate', () => {
  const sessionId = '1'
  const userId = '2'

  it('should throw an error if the session ID is invalid', async () => {
    await expect(sessionService.unparticipate('abc', userId)).rejects.toThrow('Invalid session ID')
  })
  it('should throw an error if the user ID is invalid', async () => {
    await expect(sessionService.unparticipate(sessionId, 'abc')).rejects.toThrow('Invalid user ID')
  })
  it('should throw an error if the participation does not exist', async () => {
    participationFindUniqueMock.mockResolvedValue(null)

    await expect(sessionService.unparticipate(sessionId, userId)).rejects.toThrow('Participation not found')
    expect(participationDeleteMock).not.toHaveBeenCalled()
  })
  it('should delete the participation if it exists', async () => {
    participationFindUniqueMock.mockResolvedValue({sessionId: 1, userId: 2})
    const result = await sessionService.unparticipate(sessionId, userId)

    expect(participationDeleteMock).toHaveBeenCalledWith({
      where: {
        sessionId_userId: {
          sessionId: 1,
          userId: 2,
        }
      }
    })
    expect(result).toEqual({message: 'Successfully left the session'})
  })
})