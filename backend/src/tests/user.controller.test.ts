import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest'
import type { Server } from 'node:http'
import app from '../app'
import { generateToken } from '../utils/jwt.util'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

let server: Server
let baseUrl: string
let token: string
let userId: number

beforeAll(async () => {
  server = app.listen(0)

  await new Promise<void>((resolve) => {
    server.once('listening', resolve)
  })

  const address = server.address()

  if (!address || typeof address === 'string') {
    throw new Error('Impossible de démarrer le serveur de test')
  }

  baseUrl = `http://127.0.0.1:${address.port}`
  userId = 1
  token = generateToken(userId)
})

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
  await prisma.$disconnect()
})

describe('GET /api/user/:id', () => {
    it('should return the user when the token is valid', async () => {
        const response = await fetch(`${baseUrl}/api/user/${userId}`, {
            headers: {
            Authorization: `Bearer ${token}`
            }
        })

        expect(response.status).toBe(200)
    })
    it('should return 401 + message when no token is provided - auth.middleware', async () => {
        const response = await fetch(`${baseUrl}/api/user/${userId}`)

        expect(response.status).toBe(401)
        expect(await response.json()).toEqual({
            message: 'No token provided'
        })
    })
    it('should return 401 + message when the token is in the wrong format - auth.middleware', async () => {
        const response = await fetch(`${baseUrl}/api/user/${userId}`, {
            headers: {
            Authorization: 'password'
            }
        })

        expect(response.status).toBe(401)
        expect(await response.json()).toEqual({
            message: 'Invalid token format'
        })
    })
    it('should return 401 + message when no the token is expired - auth.middleware', async () => {
        const expiredToken = jwt.sign(
            { userId: 1 },
            process.env.JWT_SECRET || 'default-secret-key',
            { expiresIn: -1 }
            )
        const response = await fetch(`${baseUrl}/api/user/${userId}`, {
            headers: {
            Authorization: `Bearer ${expiredToken}`
            }
        })

        expect(response.status).toBe(401)
        expect(await response.json()).toEqual({
            message: 'Invalid or expired token'
        })
    })
})

describe('DELETE /api/user/:id', () => {
    it('should delete the user', async () => {
        const userToDelete = await prisma.user.create({
            data: {
            email: 'delete@example.com',
            firstName: 'Test',
            lastName: 'Delete',
            password: 'password-hash',
            admin: false
            }
        })
        const token = generateToken(userToDelete.id)
        const response = await fetch(`${baseUrl}/api/user/${userToDelete.id}`, {
            method: 'DELETE',
            headers: {
            Authorization: `Bearer ${token}`
            }
        })

        expect(response.status).toBe(200)
    })
})

describe('POST /api/user/promote-admin', () => {
  it('should return 403 outside development', async () => {
    const userToPromote = await prisma.user.create({
      data: {
        email: 'promote-test@example.com',
        firstName: 'Test',
        lastName: 'Promote',
        password: 'password-hash',
        admin: false,
      },
    })

    try {
      const token = generateToken(userToPromote.id)
      const response = await fetch(
        `${baseUrl}/api/user/promote-admin`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      expect(response.status).toBe(403)
      expect(await response.json()).toEqual({
        message: 'Admin self-promotion is only available in development',
      })
    } finally {
      await prisma.user.delete({
        where: { email: 'promote-test@example.com' }
      })
    }
  })
  it('should promote to admin if in development', async () => {
    const userToPromote = await prisma.user.create({
      data: {
        email: 'promote-test-pass@example.com',
        firstName: 'Test',
        lastName: 'Promote',
        password: 'password-hash',
        admin: false,
      },
    })
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    try {
        const token = generateToken(userToPromote.id)
        const response = await fetch(
        `${baseUrl}/api/user/promote-admin`,
        {
            method: 'POST',
            headers: {
            Authorization: `Bearer ${token}`,
            }
        })

        expect(response.status).toBe(200)
        expect(await response.json()).toMatchObject({admin: true})
    } finally {
        if (originalNodeEnv === undefined) {
            delete process.env.NODE_ENV
        } else {
            process.env.NODE_ENV = originalNodeEnv
        }

        await prisma.user.delete({
            where: { email: 'promote-test-pass@example.com' }
        })
    }
  })
})



///////////////////////////////////////////////////
/*tests unitaire pour les erreur 401 et la fonction privée getParam*/

import { UserController } from '../controllers/user.controller'
import { AuthRequest } from '../middleware/auth.middleware'
import { Response } from 'express'

describe('UserController - delete', () => {
  it('should throw 401 when userId is undefined', async () => {
    const controller = new UserController()

    const req = {
      params: { id: '1' },
    } as unknown as AuthRequest

    const res = {} as Response

    await expect(controller.delete(req, res)).rejects.toMatchObject({
      message: 'Unauthorized',
      statusCode: 401,
    })
  })
})

describe('UserController - promoteSelfToAdmin', () => {
  it('should throw 401 when userId is undefined', async () => {
    const controller = new UserController()

    const req = {
      params: { id: '1' },
    } as unknown as AuthRequest

    const res = {} as Response

    await expect(controller.promoteSelfToAdmin(req, res)).rejects.toMatchObject({
      message: 'Unauthorized',
      statusCode: 401,
    })
  })
})


describe('UserController - getParam', () => {
  it('should use the first value when the parameter is an array', async () => {
    const controller = new UserController()

    const req = {
      params: { id: ['1', '2'] },
    } as unknown as AuthRequest

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response

    await controller.getById(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
  })
})