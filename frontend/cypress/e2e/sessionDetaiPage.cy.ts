describe('Session Detail page - Admin status', () => {
    beforeEach(() => {
        cy.clearLocalStorage()
        cy.visit('/login')

        cy.get('[data-cy="email"]').type('yoga@studio.com')
        cy.get('[data-cy="password"]').type('test!1234')
        cy.get('[data-cy="login-btn"]').click()

        cy.url().should('include', '/sessions')
        cy.visit('/sessions/1')
    })

    afterEach(() => {
        cy.clearLocalStorage()
    })

    it('should display the session', () => {
        cy.get('[data-cy="name"]').should('be.visible').and('contain', 'Yoga Vinyasa')
        cy.get('[data-cy="date"]').should('be.visible').and('contain', 'Sunday, February 15, 2026')
        cy.get('[data-cy="teacher"]').should('be.visible').and('contain', 'Margot Delahaye')
        cy.get('[data-cy="participant"]').should('be.visible')
        cy.get('[data-cy="description"]').should('be.visible').and('contain', 'Un cours dynamique qui synchronise le mouvement et la respiration. Idéal pour renforcer le corps et améliorer la flexibilité.')
    })
    it('should display an error when session detail failed to load', () => {
        cy.intercept('GET', '**/api/session/1', {
            statusCode: 500,
            body: { message: 'Internal Server Error' },
        }).as('getSessionDetail')

        cy.visit('/sessions/1')
        cy.wait('@getSessionDetail')

        cy.get('[data-cy="error"]').should('be.visible').and('contain', 'Failed to load session details')
    })
    
    it('should navigate to session edit page', () => {
        cy.get('[data-cy="session-edit-link"]').click()

        cy.url().should('include', '/sessions/edit/1')
    })
    it('should navigate to back to all the sessions', () => {
        cy.get('[data-cy="sessions-link"]').click()

        cy.url().should('include', '/sessions')
    })
    it('should se the participations buttons because admin', () => {
        cy.get('[data-cy="participate-link"]').should('not.exist')
        cy.get('[data-cy="unparticipate-link"]').should('not.exist')

    })
    it('should keep the session when deletion is cancelled', () => {
        cy.on('window:confirm', (message) => {
            expect(message).to.equal('Are you sure you want to delete this session?')
            return false
        })

        cy.get('[data-cy="delete-btn"]').first().click()

        cy.url().should('include', '/sessions/1')
        cy.get('[data-cy="name"]').should('be.visible').and('contain', 'Yoga Vinyasa')
    })
    it('shloud display an error if session deletion fails', () => {
        cy.intercept('DELETE', '**/api/session/1', {
            statusCode: 500,
            body: {},
        }).as('deleteSession')
        cy.on('window:alert', (message) => {
            expect(message).to.equal('Failed to delete session')
        })

        cy.on('window:confirm', () => true)
        cy.get('[data-cy="delete-btn"]').click()
        
        cy.url().should('include', '/sessions/1')
        cy.get('[data-cy="name"]').should('be.visible').and('contain', 'Yoga Vinyasa')
    })
    it('should delete a session successfully and navigate to sessions page', () => {
        cy.intercept('DELETE', '**/api/session/1*', {
            statusCode: 200,
            body: {},
        }).as('deleteSession')

        cy.intercept('GET', '**/api/session/1', {
            statusCode: 200,
            body: []
        }).as('getSessions')

        cy.on('window:confirm', () => true)
        cy.get('[data-cy="delete-btn"]').click()

        cy.wait('@deleteSession')
            .its('response.statusCode')
            .should('equal', 200)
        cy.wait('@getSessions')

        cy.url().should('include', '/sessions')
    })
})