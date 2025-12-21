/// <reference types="cypress" />


describe('IT Repair app - progress ticket', () => {
  const ts = Date.now();
  const customer = { username: `test`, password: 'test' };
  const staff = { username: `tester`, password: 'tester' };

  it('customer creates a ticket, staff progresses it through statuses', () => {
    // Customer logs in and creates a ticket
    cy.visit('/');
    cy.get('[data-testid="login-username"]').type(customer.username);
    cy.get('[data-testid="login-password"]').type(customer.password);
    cy.get('[data-testid="login-submit"]').click();
    cy.get('[data-testid="create-ticket-button"]').click();
    cy.get('input[name="title"]').type(`Progress Test Ticket ${ts}`);
    cy.get('textarea[name="description"]').type('Ticket to test status progression.');
    cy.get('[data-testid="create-ticket-submit"]').click();
    cy.contains(`Progress Test Ticket ${ts}`).should('exist');
    cy.get('[data-testid="nav-logout"]').click();

    // Staff logs in to progress the ticket
    cy.visit('/');
    cy.get('[data-testid="login-username"]').type(staff.username);
    cy.get('[data-testid="login-password"]').type(staff.password);
    cy.get('[data-testid="login-submit"]').click();
    cy.get('[data-testid="staff-board-title"]').should('exist');

    // Change status to "in progress"
    cy.contains(`Progress Test Ticket ${ts}`).click();
    cy.get('[data-testid="staff-popup-title"]').should('have.text', `Progress Test Ticket ${ts}`);
    cy.get('[data-testid="ticket-status-select"]').parent().click();
    cy.get('li[data-value="in progress"]').click();
    cy.get('[data-testid="ticket-status-select"]').should('contain.text', 'In progress');
    cy.get('[data-testid="staff-popup-close"]').click();

    // Change status to "closed"
    cy.contains(`Progress Test Ticket ${ts}`).click();
    cy.get('[data-testid="ticket-status-select"]').parent().click();
    cy.get('li[data-value="closed"]').click();
    cy.get('[data-testid="ticket-status-select"]').should('contain.text', 'Closed');
    cy.get('[data-testid="staff-popup-close"]').click();

    cy.get('[data-testid="nav-logout"]').click();

    
  });
});
