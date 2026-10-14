import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from '../src/services/auth.service'
import { LoginCredentials, AuthResponse, RegisterData } from '../src/types';
import api from '../src/services/api';


beforeEach(()=> {
    localStorage.clear();
})

afterEach(() => {
  vi.restoreAllMocks();
})

describe('authService - login', () => { 
    const credentials: LoginCredentials = {
            email: 'jean@example.com',
            password: 'secret',
        }
    it('should save the token and user in local storage after connexion', async () => {
        const responseData: AuthResponse = {
            token: 'fake-token',
            id: 1,
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean@example.com',
            admin: false,
        }

        vi.spyOn(api, 'post').mockResolvedValue({
            data: responseData
        })

        const result = await authService.login(credentials)

        expect(result).toEqual(responseData)
        expect(localStorage.getItem('token')).toBe('fake-token')
        expect(localStorage.getItem('user')).toBe(JSON.stringify(responseData))
        expect(api.post).toHaveBeenCalledWith('/auth/login', credentials)
    })
    it('should not save token or user if the response has no token', async () => {
        const responseData: AuthResponse = {
            id: 1,
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean@example.com',
            admin: false,
            token: '',
        }

        vi.spyOn(api, 'post').mockResolvedValue({
            data: responseData
        })

        const result = await authService.login(credentials)

        expect(result).toEqual(responseData)
        expect(localStorage.getItem('token')).toBeNull()
        expect(localStorage.getItem('user')).toBeNull()
    })
})

describe('authService - register', () => { 
    const data: RegisterData = {
            email: 'jean@example.com',
            password: 'secret',
            firstName: 'Jean',
            lastName: 'Dupont'
        }
    it('should save the token and user in local storage after registration', async () => {
        const responseData: AuthResponse = {
            token: 'fake-token',
            id: 1,
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean@example.com',
            admin: false,
        }

        vi.spyOn(api, 'post').mockResolvedValue({
            data: responseData
        })

        const result = await authService.register(data)

        expect(result).toEqual(responseData)
        expect(localStorage.getItem('token')).toBe('fake-token')
        expect(localStorage.getItem('user')).toBe(JSON.stringify(responseData))
        expect(api.post).toHaveBeenCalledWith('/auth/register', data)
    })
    it('should not save token or user if the response has no token', async () => {
        const responseData = {
            id: 1,
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean@example.com',
            admin: false,
            token: '',
        }

        vi.spyOn(api, 'post').mockResolvedValue({
            data: responseData
        })

        const result = await authService.register(data)

        expect(result).toEqual(responseData)
        expect(localStorage.getItem('token')).toBeNull()
        expect(localStorage.getItem('user')).toBeNull()
    })
})


describe('authService - getCurrentUser', () => {
    const user = {
        id: 1,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        admin: false,
    };
    it('should return null if there is no user', () => {
        const result = authService.getCurrentUser()
        
        expect(result).toBe(null)
    })
    it('should return the user from the local storage', () => {
        localStorage.setItem('user', JSON.stringify(user))
        
        const result = authService.getCurrentUser()
        
        expect(result).toEqual(user)
    })
})

describe('authService - updateCurrentUser', () => {
    const user = {
        id: 1,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        admin: false,
    };
    it('should return null if there is no user', () => {
        const result = authService.updateCurrentUser({})
        
        expect(result).toBe(null)
    })
    it('should update the user', () => {
        localStorage.setItem('user', JSON.stringify(user))
        
        const updatedUser = {
            ...user,
            firstName: 'Marie'
        }
        const result = authService.updateCurrentUser({firstName: 'Marie'})
        expect(result).toEqual(updatedUser)

        const storedUser = JSON.parse(localStorage.getItem('user')!)
        expect(storedUser).toEqual(updatedUser)
    })
})

describe('authService - logout', () => {
    it('should remove the token and user from the local storage', () => {
        localStorage.setItem('token', 'fake-token')
        localStorage.setItem('user', 'user-test')
        
        authService.logout()
        
        expect(localStorage.getItem('token')).toBeNull()
        expect(localStorage.getItem('user')).toBeNull()
    })
})

describe('authService - getToken', () => {
    it('should return the token from local storage', () => {
        localStorage.setItem('token', 'fake-token')
        
        const result = authService.getToken()
        
        expect(result).toBe('fake-token')
    })
    it('should return null if there is no token', () => {
        const result = authService.getToken()
        
        expect(result).toBeNull()
    })
})

describe('authService - isAuthenticated', () => {
    it('should return true if there is a token', () => {
        localStorage.setItem('token', 'fake-token')
        
        const result = authService.isAuthenticated()
        
        expect(result).toBe(true)
    })
    it('should return false if there is no token', () => {
        const result = authService.isAuthenticated()
        
        expect(result).toBe(false)
    })
})