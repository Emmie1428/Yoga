describe('login page', () => {
    beforeEach(() => {
        cy.clearLocalStorage()
        cy.visit('/login')
    })

    afterEach(() => {
        cy.clearLocalStorage()
    })

  it('should navigates to the sessions page when loged succesfuly', () => {
    cy.get('[data-cy="email"]').type('yoga@studio.com')
    cy.get('[data-cy="password"]').type('test!1234')

    cy.get('[data-cy="login-btn"]').click()

    cy.url().should('include', '/sessions')
  })
  it('should show an error message if wrong password and login failed', () => {
    cy.get('[data-cy="email"]').type('yoga@studio.com')
    cy.get('[data-cy="password"]').type('wrong-password')

    cy.get('[data-cy="login-btn"]').click()

    cy.get('[data-cy="error"]').should('be.visible').and('contain', 'Login failed')

    cy.url().should('include', '/login')
  })
  it('should navigate to the register page', () => {
    cy.get('[data-cy="register-link"]').click()

    cy.url().should('include', '/register')
  })
})