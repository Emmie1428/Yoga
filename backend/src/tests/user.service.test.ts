import { beforeEach, afterEach, describe, it, vi, expect } from 'vitest'
import { UserService } from '../services/user.service'


const { findUniqueMock, deleteMock, updateMock } = vi.hoisted(() => ({
    findUniqueMock: vi.fn(),
    deleteMock: vi.fn(),
    updateMock: vi.fn()
}))

vi.mock('@prisma/client', () => ({
    PrismaClient: class {
        user = {
            findUnique: findUniqueMock,
            delete: deleteMock,
            update: updateMock
        }
    }
}))

beforeEach(() => {
    vi.clearAllMocks()
})

const devNodeEnv = process.env.NODE_ENV
afterEach(() => {
    process.env.NODE_ENV = devNodeEnv ?? 'development'
})

const userService = new UserService()

describe('UserService - getById', () => {
    const user = {
        id: '1',
        firstName: 'Jean',
        lastName: 'Dupont',
        admin: false,
        createdAt: new Date('2026-10-20T00:00:00.000Z'),
        updatedAt: new Date('2026-10-20T00:00:00.000Z'),
    }
    it('should find a user by their id', async () => {
        findUniqueMock.mockResolvedValue(user)
        const userId = parseInt(user.id)

        const result = await userService.getById(user.id)

        expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: userId} })
        expect(result).toEqual({
            id: '1',
            firstName: 'Jean',
            lastName: 'Dupont',
            admin: false,
            createdAt: new Date('2026-10-20T00:00:00.000Z'),
            updatedAt: new Date('2026-10-20T00:00:00.000Z'),
        })
    })
    it('should throw an error if the id is not a number', async () => {
       await expect(userService.getById('string')).rejects.toThrow('Invalid user ID')
    })
    it('should throw an error if there is no user find by the id', async () => {
        findUniqueMock.mockResolvedValue(null)

       await expect(userService.getById(user.id)).rejects.toThrow('User not found')
    })
})

describe('UserService - delete', () => {
    const authenticatedUserId = 1
    const user = {
        id: '1',
        firstName: 'Jean',
        lastName: 'Dupont',
        admin: false,
        createdAt: new Date('2026-10-20T00:00:00.000Z'),
        updatedAt: new Date('2026-10-20T00:00:00.000Z'),
    }
    it('should throw an error if the id is not a number', async () => {
       await expect(userService.delete('string', 1)).rejects.toThrow('Invalid user ID')
    })
    it('should throw an error if the account is not deleted by its owner', async () => {
        const authenticatedUserId = 2

        expect(findUniqueMock).not.toHaveBeenCalled()
        await expect(userService.delete(user.id, authenticatedUserId)).rejects.toThrow('You can only delete your own account')
    })
    it('should verify if the user exist by their id', async () => {
        findUniqueMock.mockResolvedValue(user)

        await userService.delete(user.id, authenticatedUserId)

        expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: 1 } })
    })
    it('should throw an error if there is no user find by the id', async () => {
        findUniqueMock.mockResolvedValue(null)

       await expect(userService.delete(user.id, authenticatedUserId)).rejects.toThrow('User not found')
    })
    it('should delete the account', async () => {
        findUniqueMock.mockResolvedValue(user)
        deleteMock.mockResolvedValue(user)

       const result = await userService.delete('1', 1)

       expect(findUniqueMock).toHaveBeenCalledWith({where: {id: 1}})
       expect(deleteMock).toHaveBeenCalledWith({where: {id: 1}})
       expect(result).toEqual({message:'User deleted successfully'})
    })
})

describe('UserService - promoteSelfToAdmin', () => {
    const userId= 1

    it('should throw an error if not in dev mode', async () => {
        process.env.NODE_ENV = 'production'
        
       await expect(userService.promoteSelfToAdmin(userId)).rejects.toThrow('Admin self-promotion is only available in development')
    })
    it('should find the user by id and promote them to admin', async () => {
        process.env.NODE_ENV = 'development'

        findUniqueMock.mockResolvedValue({
            id: 1,
            email: 'jean@example.com',
            firstName: 'Jean',
            lastName: 'Dupont',
            admin: false,
            createdAt: new Date('2026-10-20T00:00:00.000Z'),
            updatedAt: new Date('2026-10-20T00:00:00.000Z'),
        })

        updateMock.mockResolvedValue({
            id: 1,
            email: 'jean@example.com',
            firstName: 'Jean',
            lastName: 'Dupont',
            admin: true,
            createdAt: new Date('2026-10-20T00:00:00.000Z'),
            updatedAt: new Date('2026-10-20T00:00:00.000Z'),
        })

        await userService.promoteSelfToAdmin(userId)

        expect(updateMock).toHaveBeenCalledWith({ where: { id: 1 }, data: { admin: true } })
    })
    it('should throw an error if the user is not found', async () => {
        process.env.NODE_ENV = 'development'
        findUniqueMock.mockResolvedValue(null)

       await expect(userService.promoteSelfToAdmin(userId)).rejects.toThrow('User not found')
    })
    it('should return the curent user if already admin', async () => {
        process.env.NODE_ENV = 'development'
        const admin = {
            id: 1,
            email: 'jean@example.com',
            firstName: 'Jean',
            lastName: 'Dupont',
            admin: true,
            createdAt: new Date('2026-10-20T00:00:00.000Z'),
            updatedAt: new Date('2026-10-20T00:00:00.000Z'),
        }
        findUniqueMock.mockResolvedValue(admin)

        const result = await userService.promoteSelfToAdmin(1)

        expect(findUniqueMock).toHaveBeenCalledWith({ where: { id : 1 }})
        expect(result).toEqual(admin)
        expect(updateMock).not.toHaveBeenCalled()
    })
})
