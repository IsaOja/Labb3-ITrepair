/// <reference types="cypress" />


describe('IT Repair app - Create new users and tickets', () => {
  const ts = Date.now();
  const customer = { username: `cust${ts}`, email: `cust${ts}@example.test`, password: 'Password123!' };
  const staff = { username: `staff${ts}`, email: `staff${ts}@example.test`, password: 'Password123!' };

  it('registers a customer, creates a ticket and posts a comment', () => {
    cy.visit('/');
    cy.get('[data-testid="open-register"]').click();
    cy.get('[data-testid="register-username-input"]').type(customer.username);
    cy.get('[data-testid="register-email-input"]').type(customer.email);
    cy.get('[data-testid="register-password-input"]').type(customer.password);
    // ensure not registering as staff
    cy.get('[data-testid="register-submit"]').click();

    // Create a ticket
    cy.get('[data-testid="create-ticket-button"]').click();
    cy.get('[data-testid="create-ticket-title-input"]').type(`My test ticket ${ts}`);
    cy.get('[data-testid="create-ticket-description-input"]').type('This is a test ticket created by Cypress.');
    cy.get('[data-testid="create-ticket-submit"]').click();

    // Ticket should appear in list
    cy.contains(`My test ticket ${ts}`).should('exist');

    // Open ticket and post a comment
    cy.contains(`My test ticket ${ts}`).click();
    cy.get('[data-testid="customer-comment-input"]').type('Hello from customer');
    cy.get('[data-testid="customer-comment-send"]').click();
    cy.contains('Hello from customer').should('exist');
    cy.get('[data-testid="CloseIcon"]').click();

    // Log out
    cy.get('[data-testid="nav-logout"]').click();
  });

  it('registers a staff user and sees the customer ticket and comment', () => {
    cy.visit('/');
    cy.get('[data-testid="open-register"]').click();
    cy.get('[data-testid="register-username-input"]').type(staff.username);
    cy.get('[data-testid="register-email-input"]').type(staff.email);
    cy.get('[data-testid="register-password-input"]').type(staff.password);
    // register as staff
    cy.get('[data-testid="register-staff-checkbox"]').click();
    cy.get('[data-testid="register-submit"]').click();

    // Staff view should show Kanban board and the ticket created earlier
    cy.get('[data-testid="staff-board-title"]').should('exist');
    cy.contains(`My test ticket ${ts}`).should('exist');

    // Open ticket and verify comment
    cy.contains(`My test ticket ${ts}`).click();
    cy.contains('Hello from customer').should('exist');
    cy.get('[data-testid="staff-popup-edit"]').click();
    cy.contains('em' ,'Unassigned').click();
    cy.contains('li', staff.username).click();
    cy.get('[data-testid="editTicketForm-submit"]').click();
    cy.contains(`Assigned to: ${staff.username}`).should('exist');
    cy.get('[data-testid="CloseIcon"]').click();
    
    // Log out
    cy.get('[data-testid="nav-logout"]').click();
  });
});
