describe('register page', () => {
  it('should navigates to the sessions page when registered succesfuly', () => {
    const email = `jean.${Date.now()}@example.com`

    cy.visit('/register')

    cy.get('[data-cy="firstName"]').type('Jean')
    cy.get('[data-cy="lastName"]').type('Dupont')
    cy.get('[data-cy="email"]').type(email)
    cy.get('[data-cy="password"]').type('secret1234')

    cy.get('[data-cy="register-btn"]').click()

    cy.url().should('include', '/sessions')
  })
  it('should navigate to the login page', () => {
    cy.visit('/register')

    cy.get('[data-cy="login-link"]').click()

    cy.url().should('include', '/login')
  })
  it('should prevent registration when a required field is empty', () => {
    cy.visit('/register')

    cy.get('[data-cy="register-btn"]').click()

    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'password'
    ]

    requiredFields.forEach((field) => {
      cy.get(`[data-cy="${field}"]`).should(($input) => {
        expect(($input[0] as HTMLInputElement).validity.valueMissing)
          .to.be.true
      })
    })

    cy.url().should('include', '/register')
  })
})