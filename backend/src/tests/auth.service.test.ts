import { beforeEach, describe, it, vi, expect } from 'vitest'
import { AuthService } from '../services/auth.service'


const { findUniqueMock, compareMock, generateTokenMock } = vi.hoisted(() => ({
    findUniqueMock: vi.fn(),
    compareMock: vi.fn(),
    generateTokenMock: vi.fn()
}))

vi.mock('@prisma/client', () => ({
    PrismaClient: class {
        user = {
            findUnique: findUniqueMock,
            create: vi.fn()
        }
    }
}))

vi.mock('bcrypt', () => ({
  compare: compareMock,
  hash: vi.fn(),
}))

vi.mock('../src/utils/jwt.util.ts', () => ({
    generateToken: generateTokenMock
}))

const authService = new AuthService()

describe('AuthService - login', () => {
    const email = 'jean@example.com'
    const password = 'secret'

    const user = {
        id: 1,
        email, 
        password: 'hashed-secret',
        firstName: 'Jean',
        lastName: 'Dupont',
        admin: false
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should find the user by email', async () => {
        findUniqueMock.mockResolvedValue(user)
        compareMock.mockResolvedValue(true)
        generateTokenMock.mockReturnValue('fake-token')

        await authService.login(email, password)

        expect(findUniqueMock).toHaveBeenCalledWith({ where: {email}})
    })
    it('should throw an error if the user does not exist', async () => {
        findUniqueMock.mockResolvedValue(null)

        await expect( authService.login(email, password)).rejects.toThrow('Invalid credentials')
    })
    it('should compare the password with the stored hash', async () => {
        findUniqueMock.mockResolvedValue(user)
        compareMock.mockResolvedValue(true)

        await authService.login(email, password)

        expect(compareMock).toHaveBeenCalledWith(password, user.password)
    })

    it('should throw an error if the password is invalid')

    it('should generate a token and return the user infis if the password is valid')

})