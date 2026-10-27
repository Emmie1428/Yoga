describe('Profile page', () => {
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
    it('should navigate to the sessions page', () => {
        cy.get('[data-cy="sessions-link"]').click()

        cy.url().should('include', '/sessions')
    })
    it('should keep the account when deletion is cancelled', () => {
        cy.on('window:confirm', () => false)

        cy.get('[data-cy="delete-btn"]').click()

        cy.url().should('include', '/profile')
        cy.get('[data-cy="firstName"]').should('be.visible').and('contain', 'Admin')
    })
    it('shloud display an alert if account deletion fails', () => {
        cy.intercept('DELETE', '**/api/user/*', {
            statusCode: 500,
            body: { message: 'Internal Server Error'},
        }).as('deleteAccount')
        cy.on('window:alert', (message) => {
            expect(message).to.equal('Failed to delete account')
        })

        cy.on('window:confirm', () => true)
        cy.get('[data-cy="delete-btn"]').click()
        cy.wait('@deleteAccount')

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
        cy.on('window:confirm', () => true)

        cy.get('[data-cy="delete-btn"]').click()

        cy.url().should('include', '/login')

        cy.window().then((win) => {
            expect(win.localStorage.getItem('token')).to.be.null
            expect(win.localStorage.getItem('user')).to.be.null
        })
    })
})