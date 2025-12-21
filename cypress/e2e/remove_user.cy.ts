/// <reference types="cypress" />

describe('IT Repair app - Remove user (staff)', () => {
  const ts = Date.now();
  const staff = { username: `staff${ts}`, email: `staff${ts}@example.test`, password: 'Password123!' };
  const customer = { username: `cust${ts}`, email: `cust${ts}@example.test`, password: 'Password123!' };
  it('registers a customer, registers staff, staff removes customer', () => {
    cy.visit('/');
    // Register customer and then remove
    cy.get('[data-testid="open-register"]').click();
    cy.get('[data-testid="register-username-input"]').type(customer.username);
    cy.get('[data-testid="register-email-input"]').type(customer.email);
    cy.get('[data-testid="register-password-input"]').type(customer.password);
    cy.get('[data-testid="register-submit"]').click();
    cy.get('[data-testid="nav-username"]').click();
    cy.get('[data-testid="remove-user-btn"]').click();
    cy.contains(customer.username).should('not.exist');
    // Register staff and then remove
    cy.visit('/');
    cy.get('[data-testid="open-register"]').click();
    cy.get('[data-testid="register-username-input"]').type(staff.username);
    cy.get('[data-testid="register-email-input"]').type(staff.email);
    cy.get('[data-testid="register-password-input"]').type(staff.password);
    cy.get('[data-testid="register-staff-checkbox"]').click();
    cy.get('[data-testid="register-submit"]').click();
    cy.get('[data-testid="nav-username"]').click();
    cy.get('[data-testid="remove-user-btn"]').click();
    cy.contains(staff.username).should('not.exist');
  });
});