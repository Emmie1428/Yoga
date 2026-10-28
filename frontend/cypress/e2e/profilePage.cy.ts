describe('Profile page - Admin status', () => {
    beforeEach(() => {
        cy.clearLocalStorage()
        cy.visit('/login')

        cy.get('[data-cy="email"]').type('yoga@studio.com')
        cy.get('[data-cy="password"]').type('test!1234')
        cy.get('[data-cy="login-btn"]').click()

        cy.url().should('include', '/sessions')
        cy.visit('/profile')
    })

    afterEach(() => {
        cy.clearLocalStorage()
    })

    it('should display the user information', () => {
        cy.get('[data-cy="firstName"]').should('be.visible').and('contain', 'Admin')
        cy.get('[data-cy="lastName"]').should('be.visible').and('contain', 'Yoga')
        cy.get('[data-cy="email"]').should('be.visible').and('contain', 'yoga@studio.com')
        cy.get('[data-cy="account-type"]').should('be.visible').and('contain', 'Administrator')
        cy.get('[data-cy="member-since"]').should('be.visible').and('contain', 'October 22, 2026')
    })
    it('should not be able to promote to admin because already admin', () => {
        cy.get('[data-cy="promote-bnt"]').should('not.exist')
    })
    it('should navigate to the sessions page', () => {
        cy.get('[data-cy="sessions-link"]').click()

        cy.url().should('include', '/sessions')
    })
    it('should keep the account when deletion is cancelled', () => {
        cy.window().then((win) => {
            cy.stub(win, 'confirm').returns(false)
        })

        cy.get('[data-cy="delete-btn"]').click()

        cy.url().should('include', '/profile')
        cy.get('[data-cy="firstName"]').should('be.visible').and('contain', 'Admin')
    })
    it('shloud display an alert if account deletion fails', () => {
        cy.intercept('DELETE', '**/api/user/*', {
            statusCode: 500,
            body: { message: 'Internal Server Error'},
        }).as('deleteAccount')
        cy.window().then((win) => {
            cy.stub(win, 'alert').as('alert')
        })

        cy.window().then((win) => {
            cy.stub(win, 'confirm').returns(true)
        })
        cy.get('[data-cy="delete-btn"]').click()
        cy.wait('@deleteAccount')
        cy.get('@alert').should('have.been.calledWith', 'Failed to delete account')

        cy.url().should('include', '/profile')
        cy.get('[data-cy="firstName"]').should('be.visible').and('contain', 'Admin')
    })
})

describe('Profile page - delete account', () => {
    let testUser: any

    beforeEach(() => {
        const email = `cypress-delete-${Date.now()}@example.com`

        cy.request('POST', '/api/auth/register', {
            firstName: 'Cypress',
            lastName: 'Delete',
            email,
            password: 'Test!1234',
        }).then((response) => {
            testUser = response.body

            cy.visit('/login')

            cy.window().then((windowObject) => {
                windowObject.localStorage.setItem('token', testUser.token)
                windowObject.localStorage.setItem('user', JSON.stringify(testUser))
            })

            cy.visit('/profile')
        })
    })
    afterEach(() => {
        if (testUser?.id && testUser?.token) {
            cy.request({
                method: 'DELETE',
                url: `/api/user/${testUser.id}`,
                headers: {
                    Authorization: `Bearer ${testUser.token}`,
                },
                failOnStatusCode: false
            })
        }
        cy.clearLocalStorage()
    })

    it('should delete the account when deletion is confirmed', () => {
        cy.window().then((win) => {
            cy.stub(win, 'confirm').returns(true)
        })

        cy.get('[data-cy="delete-btn"]').click()

        cy.url().should('include', '/login')

        cy.window().then((win) => {
            expect(win.localStorage.getItem('token')).to.be.null
            expect(win.localStorage.getItem('user')).to.be.null
        })
    })
})

describe('Profile page - User status', () => {
    beforeEach(() => {
        cy.clearLocalStorage()
        cy.visit('/login')

        cy.get('[data-cy="email"]').type('user@test.com')
        cy.get('[data-cy="password"]').type('test!1234')
        cy.get('[data-cy="login-btn"]').click()

        cy.url().should('include', '/sessions')
        cy.visit('/profile')
    })

    afterEach(() => {
        cy.clearLocalStorage()
    })

    it('should display the user information', () => {
        cy.get('[data-cy="firstName"]').should('be.visible').and('contain', 'John')
        cy.get('[data-cy="lastName"]').should('be.visible').and('contain', 'Doe')
        cy.get('[data-cy="email"]').should('be.visible').and('contain', 'user@test.com')
        cy.get('[data-cy="account-type"]').should('be.visible').and('contain', 'User')
        cy.get('[data-cy="member-since"]').should('be.visible').and('contain', 'October 22, 2026')
    })
    it('should promote to admin if in dev mode', () => {
        cy.intercept('POST', '**/api/user/promote-admin', {
        statusCode: 200,
        body: {
            id: 2,
            firstName: 'John',
            lastName: 'Doe',
            email: 'user@test.com',
            admin: true,
            createdAt: '2026-10-22T00:00:00.000Z'
            }
        }).as('promoteAdmin')

        cy.get('[data-cy="promote-btn"]').should('be.visible').click()

        cy.wait('@promoteAdmin').its('response.statusCode').should('equal', 200)

        cy.get('[data-cy="account-type"]').should('contain', 'Administrator')
        cy.get('[data-cy="promote-btn"]').should('not.exist')
    })
    it('should display an error when promotion fails', () => {
        cy.intercept('POST', '**/api/user/promote-admin', {
            statusCode: 500,
            body: {},
        }).as('promoteAdmin')

        cy.get('[data-cy="promote-btn"]').click()

        cy.wait('@promoteAdmin')

        cy.contains('Failed to promote to admin').should('be.visible')
        cy.get('[data-cy="promote-btn"]').should('be.enabled')
    })
})