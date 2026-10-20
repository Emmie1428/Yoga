import { beforeEach, describe, it, vi, expect } from 'vitest'
import { TeacherService } from '../services/teacher.service'

const { findManyMock, findUniqueMock } = vi.hoisted(() => ({
    findManyMock: vi.fn(),
    findUniqueMock: vi.fn(),
}))

vi.mock('@prisma/client', () => ({
    PrismaClient: class {
        teacher = {
            findMany: findManyMock,
            findUnique: findUniqueMock,
        }
    }
}))

const teacherService = new TeacherService()

describe('TeacherService - getAll', () => {
    const teacher = {
        id: 1,
        firstName: 'Jean',
        lastName: 'Dupont',
        createdAt: new Date('2026-10-20T00:00:00.000Z'),
        updatedAt: new Date('2026-10-20T00:00:00.000Z'),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should find all teachers', async () => {
        findManyMock.mockResolvedValue([teacher])

        const result = await teacherService.getAll()

        expect(findManyMock).toHaveBeenCalledWith({ orderBy: {createdAt: 'desc'} })
        expect(result).toEqual([{
            id: teacher.id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            createdAt: teacher.createdAt,
            updatedAt: teacher.updatedAt,
        }])
    })
})

describe('TeacherService - getById', () => {
    const teacher = {
        id: '1',
        firstName: 'Jean',
        lastName: 'Dupont',
        createdAt: new Date('2026-10-20T00:00:00.000Z'),
        updatedAt: new Date('2026-10-20T00:00:00.000Z'),
    }
    it('should find a teacher by their id', async () => {
        findUniqueMock.mockResolvedValue(teacher)
        const teacherId = parseInt(teacher.id)

        const result = await teacherService.getById(teacher.id)

        expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: teacherId} })
        expect(result).toEqual({
            id: '1',
            firstName: 'Jean',
            lastName: 'Dupont',
            createdAt: new Date('2026-10-20T00:00:00.000Z'),
            updatedAt: new Date('2026-10-20T00:00:00.000Z'),
        })
    })
    it('should throw an error if the id is not a number', async () => {
       await expect(teacherService.getById('string')).rejects.toThrow('Invalid teacher ID')
    })
    it('should throw an error if there is no teacher find by the id', async () => {
        findUniqueMock.mockResolvedValue(null)

       await expect(teacherService.getById(teacher.id)).rejects.toThrow('Teacher not found')
    })
})