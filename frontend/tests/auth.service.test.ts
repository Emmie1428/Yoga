import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../src/services/auth.service'


beforeEach(()=> {
    localStorage.clear();
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
        localStorage.setItem('token', 'valeurtoken')
        localStorage.setItem('user', 'usertest')
        
        authService.logout()
        
        expect(localStorage.getItem('token')).toBeNull()
        expect(localStorage.getItem('user')).toBeNull()
    })
})

describe('authService - getToken', () => {
    it('should return the token from local storage', () => {
        localStorage.setItem('token', 'valeurtoken')
        
        const result = authService.getToken()
        
        expect(result).toBe('valeurtoken')
    })
    it('should return null if there is no token', () => {
        const result = authService.getToken()
        
        expect(result).toBeNull()
    })
})

describe('authService - isAuthenticated', () => {
    it('should return true if there is a token', () => {
        localStorage.setItem('token', 'valeurtoken')
        
        const result = authService.isAuthenticated()
        
        expect(result).toBe(true)
    })
    it('should return false if there is no token', () => {
        const result = authService.isAuthenticated()
        
        expect(result).toBe(false)
    })
})