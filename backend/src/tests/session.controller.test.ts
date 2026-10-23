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
let userIdAdmin: number
let sessionId: number

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
  userIdAdmin = 2 //Admin true//
  sessionId = 1
  token = generateToken(userIdAdmin)
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

describe('GET /api/session/', () => {
    it('should return all the sessions when the token is valid', async () => {
        const response = await fetch(`${baseUrl}/api/session/`, {
            headers: {
            Authorization: `Bearer ${token}`
            }
        })

        expect(response.status).toBe(200)
    })
})

describe('GET /api/session/:id', () => {
    it('should return the session when the token is valid', async () => {
        const response = await fetch(`${baseUrl}/api/session/${sessionId}`, {
            headers: {
            Authorization: `Bearer ${token}`
            }
        })

        expect(response.status).toBe(200)
    })
})

describe('POST /api/session/ - create', () => {
     it('should return create a session when the token is valid', async () => {
        const newSession = {
            name: 'Test session Creation',
            date: new Date().toISOString(),
            description: 'Create session test',
            teacherId: 1
        }
        try {
            const response = await fetch(`${baseUrl}/api/session/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSession)
            })
            const body = await response.json()

            expect(response.status).toBe(201)
            expect(body).toHaveProperty('id')

            
        } finally {
            await prisma.session.deleteMany({
                where: { name: newSession.name }
        })
        }
    })
})

describe('PUT /api/session/:id - update', () => {
    it('should update a session when the token is valid', async () => {
        let sessionId: number | undefined

        try {
            const createResponse = await fetch(`${baseUrl}/api/session/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'Test session to update',
                    date: new Date().toISOString(),
                    description: 'Session for update test',
                    teacherId: 1
                })
            })
            const createdBody = await createResponse.json() as { id: number }

            expect(createResponse.status).toBe(201)
            expect(createdBody.id).toBeDefined()

            sessionId = createdBody.id

            const updateResponse = await fetch(`${baseUrl}/api/session/${sessionId}`,{
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Test session updated',
                    date: new Date().toISOString(),
                    description: 'Updated session test',
                    teacherId: 1,
                })
            })
            const updatedBody = await updateResponse.json() as { name: string }

            expect(updateResponse.status).toBe(200)
            expect(updatedBody.name).toBe('Test session updated')
        } finally {
            if (sessionId !== undefined) {
                await prisma.session.deleteMany({
                where: { id: sessionId }
                })
            }
        }
    })
})

describe('DELETE /api/session/:id -delete ', () => {
    it('should delete the session', async () => {
       let sessionId: number | undefined

        const createResponse = await fetch(`${baseUrl}/api/session/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test session to delete',
                date: new Date().toISOString(),
                description: 'Session for delete test',
                teacherId: 1
            })
        })
        const createdBody = await createResponse.json() as { id: number }

        expect(createResponse.status).toBe(201)
        expect(createdBody.id).toBeDefined()

        sessionId = createdBody.id
        const updateResponse = await fetch(`${baseUrl}/api/session/${sessionId}`,{
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        expect(updateResponse.status).toBe(200)
    })
})

describe('POST /api/session/:id/participate/:userId - participate ', () => {
     it('should add a participant when not admin', async () => {
        let sessionId: number | undefined
        const participantUserId = 1
        
        try {
            const session = await prisma.session.create({
                data: {
                name: 'Test participation',
                date: new Date(),
                description: 'Session for participation test',
                teacherId: 1,
                }
            })

            sessionId = session.id

            const response = await fetch(`${baseUrl}/api/session/${sessionId}/participate/${participantUserId}`, {
                method: 'POST',
                headers: {Authorization: `Bearer ${token}`}
            })
            const body = await response.json() as { message: string }

            expect(response.status).toBe(200)
            expect(body.message).toBe('Successfully joined the session')

            const participation = await prisma.sessionParticipation.findUnique({
                where: {sessionId_userId: {sessionId, userId: participantUserId}}
            })

            expect(participation).not.toBeNull()
        } finally {
            if (sessionId !== undefined) {
                await prisma.session.delete({
                where: { id: sessionId },
                })
            }
        }
    })
})

describe('DELETE /api/session/:id/participate/:userId - unparticipate ', () => {
     it('should remove a participant', async () => {
        let sessionId: number | undefined
        const participantUserId = 1
        
        try {
            const session = await prisma.session.create({
                data: {
                    name: 'Test unparticipation',
                    date: new Date(),
                    description: 'Session for unparticipation test',
                    teacherId: 1,
                }
            })
            sessionId = session.id
            await prisma.sessionParticipation.create({
                data: {sessionId, userId: participantUserId}
            })

            const response = await fetch(`${baseUrl}/api/session/${sessionId}/participate/${participantUserId}`, {
                method: 'DELETE',
                headers: {Authorization: `Bearer ${token}`}
            })
            const body = await response.json() as { message: string }

            expect(response.status).toBe(200)
            expect(body.message).toBe('Successfully left the session')

            const participation = await prisma.sessionParticipation.findUnique({
                where: {
                    sessionId_userId: {
                        sessionId,
                        userId: participantUserId
                    }
                }
            })

            expect(participation).toBeNull()
        } finally {
            if (sessionId !== undefined) {
                await prisma.session.delete({
                where: { id: sessionId }
                })
            }
        }
    })
})


///////////////////////////////////////////////////
/*tests unitaire pour l'erreur de la function privée getAuthenticatedUserId et getParam*/

import { SessionController } from '../controllers/session.controller'
import { AuthRequest } from '../middleware/auth.middleware'
import { Response } from 'express'

describe('SessionController - getAuthenticatedUserId', () => {
  it('should throw an error when userId is undefined', async () => {
    const controller = new SessionController()

    const req = {
      params: { id: '1' },
    } as unknown as AuthRequest

    const res = {} as Response

    await expect(controller.delete(req, res)).rejects.toMatchObject({
      message: 'Authenticated user ID is missing'
    })
  })
})

describe('SessionController - getParam', () => {
  it('should use the first value when the parameter is an array', async () => {
    const controller = new SessionController()

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