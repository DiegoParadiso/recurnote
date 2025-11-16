describe('Smoke', () => {
  it('loads the app', () => {
    cy.visit('http://localhost:3000');
    cy.get('#root').should('exist');
  });
});
