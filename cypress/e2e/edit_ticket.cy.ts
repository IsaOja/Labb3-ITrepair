/// <reference types="cypress" />

describe('IT Repair app - Edit ticket (customer)', () => {
  const ts = Date.now();
  const customer = { username: `cust${ts}`, email: `cust${ts}@example.test`, password: 'Password123!' };
  it('registers, creates, edits a ticket', () => {
    cy.visit('/');
    cy.get('[data-testid="open-register"]').click();
    cy.get('[data-testid="register-username-input"]').type(customer.username);
    cy.get('[data-testid="register-email-input"]').type(customer.email);
    cy.get('[data-testid="register-password-input"]').type(customer.password);
    cy.get('[data-testid="register-submit"]').click();
    cy.get('[data-testid="create-ticket-button"]').click();
    cy.get('[data-testid="create-ticket-title-input"]').type(`Edit Test Ticket ${ts}`);
    cy.get('[data-testid="create-ticket-description-input"]').type('Ticket to test editing.');
    cy.get('[data-testid="create-ticket-submit"]').click();
    cy.contains(`Edit Test Ticket ${ts}`).should('exist').click();
    cy.get('[data-testid="ticket-popup-title"]').should('contain.text', `Edit Test Ticket ${ts}`);
    cy.get('[data-testid="editTicketForm-edit-btn"]').click();
    cy.get('[data-testid="edit-title"]').clear().type('Edited Title');
    cy.get('[data-testid="editTicketForm-submit"]').click();
    cy.contains('Edited Title').should('exist');
    cy.get('[data-testid="CloseIcon"]').click();
    cy.get('[data-testid="nav-logout"]').click();
  });
});
