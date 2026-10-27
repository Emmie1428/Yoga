describe('register page', () => {
  beforeEach(() => {
        cy.visit('/register')
    })
  it('should navigates to the sessions page when registered succesfuly', () => {
    const email = `jean.${Date.now()}@example.com`

    cy.get('[data-cy="firstName"]').type('Jean')
    cy.get('[data-cy="lastName"]').type('Dupont')
    cy.get('[data-cy="email"]').type(email)
    cy.get('[data-cy="password"]').type('secret1234')

    cy.get('[data-cy="register-btn"]').click()

    cy.url().should('include', '/sessions')
  })
  it('should navigate to the login page', () => {
    cy.get('[data-cy="login-link"]').click()

    cy.url().should('include', '/login')
  })
  it('should prevent registration when a required field is empty', () => {
    cy.get('[data-cy="register-btn"]').click()

    cy.url().should('include', '/register')
  })
  it('should show an error when the email is already used', () => {
    cy.get('[data-cy="firstName"]').type('Jean')
    cy.get('[data-cy="lastName"]').type('Dupont')
    cy.get('[data-cy="email"]').type('yoga@studio.com') //email existant dans la bd//
    cy.get('[data-cy="password"]').type('secret1234')

    cy.get('[data-cy="register-btn"]').click()

    cy.get('[data-cy="error"]').should('be.visible').and('contain', 'Unable to create account. Please check your information.')
    cy.url().should('include', '/register')
  })
})