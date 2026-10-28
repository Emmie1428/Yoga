describe('Sessions page - Admin status', () => {
    beforeEach(() => {
        cy.clearLocalStorage()
        cy.visit('/login')

        cy.get('[data-cy="email"]').type('yoga@studio.com')
        cy.get('[data-cy="password"]').type('test!1234')
        cy.get('[data-cy="login-btn"]').click()

        cy.url().should('include', '/sessions')
    })

    afterEach(() => {
        cy.clearLocalStorage()
    })

    it('should display all the sessions', () => {
        cy.get('[data-cy="session-card"]').should('be.visible')
    })
    it('should display a message when there are no sessions', () => {
        cy.intercept('GET', '**/api/session', {
            statusCode: 200,
            body: [],
        }).as('getSessions')

        cy.visit('/sessions')
        cy.wait('@getSessions')

        cy.contains('No sessions available').should('be.visible')
    })
    it('should display an error when sessions failed to load', () => {
        cy.intercept('GET', '**/api/session', {
            statusCode: 404,
            body: [],
        }).as('getSessions')

        cy.visit('/sessions')
        cy.wait('@getSessions')

        cy.url().should('include', '/sessions')
        cy.get('[data-cy="error"]').should('be.visible').and('contain', 'An error occurred')
    })
    it('should navigate to the create session page', () => {
        cy.get('[data-cy="create-session-link"]').click()

        cy.url().should('include', '/session')
    })
    it('should keep the session when deletion is cancelled', () => {
        cy.window().then((win) => {
            cy.stub(win, 'confirm').returns(false)
        })

        cy.get('[data-cy="delete-btn"]').first().click()

        cy.url().should('include', '/sessions')
        cy.get('[data-cy="session-card"]').should('be.visible')
    })
    it('shloud display an error if session deletion fails', () => {
        cy.intercept('DELETE', '**/api/session/*', {
            statusCode: 500,
            body: {},
        }).as('deleteSession')

        cy.window().then((win) => {
            cy.stub(win, 'confirm').returns(true)
        })
        cy.get('[data-cy="delete-btn"]').first().click()
        cy.wait('@deleteSession').then((interception) => {
            expect(interception.response?.statusCode).to.equal(500)
        })

        cy.url().should('include', '/sessions')
        cy.get('[data-cy="error"]').should('be.visible').and('contain', 'An error occurred')
    })
    it('should delete a session successfully', () => {
        cy.intercept('DELETE', '**/api/session/*', {
            statusCode: 200,
            body: {},
        }).as('deleteSession')

        cy.intercept('GET', '**/api/session', {
            statusCode: 200,
            body: []
        }).as('getSessions')

        cy.window().then((win) => {
            cy.stub(win, 'confirm').returns(true)
        })
        cy.get('[data-cy="delete-btn"]').first().click()

        cy.wait('@deleteSession')
            .its('response.statusCode')
            .should('equal', 200)
        cy.wait('@getSessions')

        cy.contains('No sessions available').should('be.visible')
    })
})