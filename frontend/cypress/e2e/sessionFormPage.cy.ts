describe('Session Form page - Admin status', () => {
    beforeEach(() => {
        cy.clearLocalStorage()
        cy.visit('/login')

        cy.get('[data-cy="email"]').type('yoga@studio.com')
        cy.get('[data-cy="password"]').type('test!1234')
        cy.get('[data-cy="login-btn"]').click()

        cy.url().should('include', '/sessions')
        cy.visit('/sessions/create')
    })

    afterEach(() => {
        cy.clearLocalStorage()
    })

    it('should create a session', () => {
        cy.intercept('GET', '**/api/teacher', {
            statusCode: 200,
            body: [
                {
                id: 1,
                firstName: 'Margot',
                lastName: 'Delahaye',
                },
            ],
        }).as('getTeachers')

        cy.intercept('POST', '**/api/session', {
            statusCode: 201,
            body: {
                message: 'Session created successfully',
            },
        }).as('createSession')

        cy.visit('/sessions/create')
        cy.wait('@getTeachers')

        cy.get('[data-cy="name"]').type('Test Yoga')
        cy.get('[data-cy="date"]').type('2027-05-20')
        cy.get('[data-cy="teacherId"]').select('1')
        cy.get('[data-cy="description"]').type('Description de test')

        cy.get('[data-cy="submit-btn"]').click()

        cy.wait('@createSession').then(({ request }) => {
            expect(request.body).to.deep.equal({
                name: 'Test Yoga',
                date: '2027-05-20',
                teacherId: 1,
                description: 'Description de test',
            })
        })

        cy.url().should('include', '/sessions')
    })
    it('should display an error when session creation fails', () => {
        cy.intercept('GET', '**/api/teacher', {
            statusCode: 200,
            body: [{
                id: 1,
                firstName: 'Margot',
                lastName: 'Delahaye'
            }],
        }).as('getTeachers')

        cy.intercept('POST', '**/api/session', {
            statusCode: 500,
            body: { message: 'Internal Server Error' },
        }).as('createSessionFailed')

        cy.visit('/sessions/create')
        cy.wait('@getTeachers')

        cy.get('[data-cy="name"]').type('Test Yoga')
        cy.get('[data-cy="date"]').type('2027-05-20')
        cy.get('[data-cy="teacherId"]').select('1')
        cy.get('[data-cy="description"]').type('Description de test')

        cy.get('[data-cy="submit-btn"]').click()

        cy.wait('@createSessionFailed')
        cy.contains('Failed to save session').should('be.visible')
        cy.url().should('include', '/sessions/create')
    })
    it('should prevent submission when required fields are empty', () => {
        cy.visit('/sessions/create')

        cy.get('[data-cy="name"]').then(($input) => {
            expect(($input[0] as HTMLInputElement).validity.valueMissing).to.be.true
        })

        cy.get('[data-cy="submit-btn"]').click()

        cy.url().should('include', '/sessions/create')
    })
    it('should navigate to the sessions page if cancel', () => {
        cy.get('[data-cy="cancel-btn"]').click()

        cy.url().should('include', '/sessions')
    })
    it('should show an error if failed to fetch teachers', () => {
        cy.intercept('GET', '**/api/teacher', {
            statusCode: 500,
            body: { message: 'Internal Server Error' },
        }).as('getTeachersFailed')

        cy.visit('/sessions/create')

        cy.wait('@getTeachersFailed').its('response.statusCode').should('equal', 500)

        cy.get('[data-cy="name"]').should('be.visible')
        cy.get('[data-cy="teacherId"]').should('be.visible')
        cy.get('[data-cy="teacherId"] option').should('have.length', 1)
    })
    it('should load session data in edit mode', () => {

        cy.intercept('GET', '**/api/teacher', {
            body: [
            { id: 1, firstName: 'Margot', lastName: 'Delahaye' }
            ]
        }).as('getTeachers')
        cy.intercept('GET', '**/api/session/1', {
        body: {
            name: 'Yoga Vinyasa',
            date: '2026-02-15T00:00:00.000Z',
            description: 'Un cours dynamique qui synchronise le mouvement et la respiration. Idéal pour renforcer le corps et améliorer la flexibilité.',
            teacher: { id: 1 }
            }
        }).as('getSession')
 
        cy.visit('/sessions/edit/1')

        cy.wait('@getTeachers')
        cy.wait('@getSession')
        

        cy.get('[data-cy="name"]').should('have.value', 'Yoga Vinyasa')
        cy.get('[data-cy="date"]').should('have.value', '2026-02-15')
        cy.get('[data-cy="description"]').should('have.value', 'Un cours dynamique qui synchronise le mouvement et la respiration. Idéal pour renforcer le corps et améliorer la flexibilité.')
        cy.get('[data-cy="teacherId"]').should('have.value', '1')
    })
            
})

describe('Session Form page - User status', () => {
    it('should redirect a non-admin user to sessions', () => {
        cy.clearLocalStorage()
        cy.visit('/login')

        cy.get('[data-cy="email"]').type('user@test.com')
        cy.get('[data-cy="password"]').type('test!1234')
        cy.get('[data-cy="login-btn"]').click()

        cy.url().should('include', '/sessions')

        cy.visit('/sessions/create')

        cy.url().should('include', '/sessions')
    })
})