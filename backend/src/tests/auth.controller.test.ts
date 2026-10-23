import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest'
import type { Server } from 'node:http'
import app from '../app'
import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

let server: Server
let baseUrl: string

beforeAll(async () => {
  server = app.listen(0)

  await new Promise<void>((resolve) => {
    server.once('listening', resolve)
  });

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Impossible de démarrer le serveur de test')
  }

  baseUrl = `http://127.0.0.1:${address.port}`
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

describe('POST /api/auth/login', () => {
  it('should return a token when credentials are valid', async () => {
    const credentials = {
      email: 'yoga@studio.com',
      password: 'test!1234',
    }
    const response = await fetch(
      `${baseUrl}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      }
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toHaveProperty('token')
  })
})

describe('POST /api/auth/register', () => {
  it('should create a user and return a token', async () => {
    const newUser = {
      email: `jeanDupont@example.com`,
      password: 'secret123',
      firstName: 'Jean',
      lastName: 'Dupont'
    }

    try {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      const body = await response.json()

      expect(response.status).toBe(201)
      expect(body).toHaveProperty('token')
    } finally {
      //Supprime le compte pour éviter d'en créer plein//
      await prisma.user.deleteMany({
        where: { email: newUser.email }
      })
    }
  })
})

describe('POST /api/auth/login - error.middleware', () => {
  it('should return 400 when the email is missing', async () => {
    const invalidCredential = {
      password: 'test!1234'
    }
    const response = await fetch(
      `${baseUrl}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidCredential)
      }
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toHaveProperty('message', 'Validation error')
    expect(body).toHaveProperty('errors')
  })
  it('should return 401 when the credentials are invalid', async () => {
    const invalidCredentials = {
      email: 'yoga@studio.com',
      password: 'wrond-password',
    }
    const response = await fetch(
      `${baseUrl}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidCredentials)
      }
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toHaveProperty('message')
  })
})

///////////////////////////////////////////////////
/*tests unitaire pour l'erreur de la function privée getAuthenticatedUserId et getParam*/
import { Request, Response, NextFunction } from 'express'
import { errorMiddleware } from '../middleware/error.middleware'

describe('errorMiddleware', () => {
  it('should return 500 for an unexpected error', () => {
    const error = new Error('Unexpected error')

    const json = vi.fn()
    const status = vi.fn().mockReturnValue({ json })
    const res = { status } as unknown as Response

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    try {
      errorMiddleware(
        error,
        {} as Request,
        res,
        vi.fn() as NextFunction
      )

      expect(status).toHaveBeenCalledWith(500)
      expect(json).toHaveBeenCalledWith({
        message: 'Internal server error',
      })
    } finally {
      consoleErrorSpy.mockRestore()
    }
  })
})