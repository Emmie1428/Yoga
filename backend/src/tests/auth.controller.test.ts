import { describe, it, expect } from 'vitest'


describe('POST /api/auth/login', () => {
  it('should return a token when credentials are valid', async () => {
    const credentials = {
      email: 'yoga@studio.com',
      password: 'test!1234',
    }

    const response = await fetch(
      'http://localhost:8090/api/auth/login',
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
  it('should return create a user and a token after registering', async () => {
    const newUser = {
      email: `jean${crypto.randomUUID().slice(0, 8)}@example.com`,
      password: 'secret123',
      firstName: 'Jean',
      lastName: 'Dupont'
    }

    const response = await fetch(
      'http://localhost:8090/api/auth/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      }
    )

    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body).toHaveProperty('token')
  })
})