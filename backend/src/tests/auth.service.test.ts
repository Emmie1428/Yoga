import { beforeEach, describe, it, vi, expect } from 'vitest'
import { AuthService } from '../services/auth.service'


const { findUniqueMock, createMock, compareMock, generateTokenMock, hashMock } = vi.hoisted(() => ({
    findUniqueMock: vi.fn(),
    createMock: vi.fn(),
    compareMock: vi.fn(),
    generateTokenMock: vi.fn(),
    hashMock: vi.fn()
}))

vi.mock('@prisma/client', () => ({
    PrismaClient: class {
        user = {
            findUnique: findUniqueMock,
            create: createMock
        }
    }
}))

vi.mock('bcrypt', () => ({
  compare: compareMock,
  hash: hashMock,
}))

vi.mock('../utils/jwt.util.ts', () => ({
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

        await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials')
    })
    it('should compare the password with the stored hash', async () => {
        findUniqueMock.mockResolvedValue(user)
        compareMock.mockResolvedValue(true)

        await authService.login(email, password)

        expect(compareMock).toHaveBeenCalledWith(password, user.password)
    })
    it('should throw an error if the password is invalid', async () => {
        findUniqueMock.mockResolvedValue(user)
        compareMock.mockResolvedValue(false)


        await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials')
    })
    it('should generate a token and return the user infos if the password is valid', async () => {
        findUniqueMock.mockResolvedValue(user)
        compareMock.mockResolvedValue(true)
        generateTokenMock.mockReturnValue('fake-token')

        const result = await authService.login(email, password)

        expect(generateTokenMock).toHaveBeenCalledWith(user.id)
        expect(result.token).toBe('fake-token')
        expect(result).toEqual({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            admin: user.admin,
            token: 'fake-token',
        })
    })
})

describe('AuthService - register', () => {
    const newUser = {
        email: 'new@example.com',
        password: 'secret',
        firstName: 'New',
        lastName: 'User',
        id: 1,
        admin: false
    }
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should throw an error if the email already exist', async () => {
        findUniqueMock.mockResolvedValue({email: 'jean@example.com'})
        
        await expect(authService.register(
            'jean@example.com',
            'secret',
            'Jean',
            'Dupont'
        )).rejects.toThrow('Email already exists')

        expect(findUniqueMock).toHaveBeenCalledWith({ where: {email:'jean@example.com'}})
    })
    it('should create a new user', async () => {
        findUniqueMock.mockResolvedValue(null)
        hashMock.mockResolvedValue('hashed-secret')
        createMock.mockResolvedValue({
            id: newUser.id,
            email: newUser.email,
            password: 'hashed-secret',
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            admin: newUser.admin,
        })
        generateTokenMock.mockReturnValue('fake-token')

        const result = await authService.register(newUser.email, newUser.password, newUser.firstName, newUser.lastName)

        expect(generateTokenMock).toHaveBeenCalledWith(newUser.id)
        expect(result).toEqual({
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            admin: newUser.admin,
            token: 'fake-token',
        })
    })
})