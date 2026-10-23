import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import type { Server } from 'node:http'
import app from '../app'
import { generateToken } from '../utils/jwt.util'

let server: Server
let baseUrl: string
let token: string
let teacherId: number

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
  teacherId = 1
  token = generateToken(teacherId)
})

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
})

describe('GET /api/teacher/', () => {
    it('should return all the teachers when the token is valid', async () => {
        const response = await fetch(`${baseUrl}/api/teacher/`, {
            headers: {
            Authorization: `Bearer ${token}`
            }
        })

        expect(response.status).toBe(200)
    })
})

describe('GET /api/teacher/:id', () => {
    it('should return the teacher when the token is valid', async () => {
        const response = await fetch(`${baseUrl}/api/teacher/${teacherId}`, {
            headers: {
            Authorization: `Bearer ${token}`
            }
        })

        expect(response.status).toBe(200)
    })
})