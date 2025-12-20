/// <reference types="cypress" />


describe('IT Repair app - Remove ticket (customer)', () => {
  const ts = Date.now();
  const customer = { username: `cust${ts}`, email: `cust${ts}@example.test`, password: 'Password123!' };
  it('registers, creates, and removes a ticket', () => {
    cy.visit('/');
    cy.get('[data-testid="open-register"]').click();
    cy.get('[data-testid="register-username-input"]').type(customer.username);
    cy.get('[data-testid="register-email-input"]').type(customer.email);
    cy.get('[data-testid="register-password-input"]').type(customer.password);
    cy.get('[data-testid="register-submit"]').click();
    cy.get('[data-testid="create-ticket-button"]').click();
    cy.get('[data-testid="create-ticket-title-input"]').type(`Remove Test Ticket ${ts}`);
    cy.get('[data-testid="create-ticket-description-input"]').type('Ticket to test removal.');
    cy.get('[data-testid="create-ticket-submit"]').click();
    cy.contains(`Remove Test Ticket ${ts}`).should('exist').click();
    cy.get('[data-testid="ticket-popup-title"]').should('contain.text', `Remove Test Ticket ${ts}`);
    cy.get('[data-testid="editTicketForm-edit-btn"]').click();
    cy.get('[data-testid="remove-ticket-btn"]').click();
    cy.contains(`Remove Test Ticket ${ts}`).should('not.exist');
    cy.get('[data-testid="nav-logout"]').click();
  });
});
