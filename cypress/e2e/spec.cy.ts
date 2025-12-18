/// <reference types="cypress" />

const base = 'http://localhost:5173';

describe('IT Repair app - Create new users and tickets', () => {
  const ts = Date.now();
  const customer = { username: `cust${ts}`, email: `cust${ts}@example.test`, password: 'Password123!' };
  const staff = { username: `staff${ts}`, email: `staff${ts}@example.test`, password: 'Password123!' };

  it('registers a customer, creates a ticket and posts a comment', () => {
    cy.visit(base);
    cy.get('[data-testid="open-register"]').click();
    cy.get('[data-testid="register-username"]').type(customer.username);
    cy.get('[data-testid="register-email"]').type(customer.email);
    cy.get('[data-testid="register-password"]').type(customer.password);
    // ensure not registering as staff
    cy.get('[data-testid="register-submit"]').click();

    // Create a ticket
    cy.get('[data-testid="create-ticket-button"]').click();
    cy.get('input[name="title"]').type(`My test ticket ${ts}`);
    cy.get('textarea[name="description"]').type('This is a test ticket created by Cypress.');
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
    cy.visit(base);
    cy.get('[data-testid="open-register"]').click();
    cy.get('[data-testid="register-username"]').type(staff.username);
    cy.get('[data-testid="register-email"]').type(staff.email);
    cy.get('[data-testid="register-password"]').type(staff.password);
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

describe('IT Repair app - progress ticket', () => {
  const ts = Date.now();
  const customer = { username: `test`, password: 'test' };
  const staff = { username: `tester`, password: 'tester' };

  it('customer creates a ticket, staff progresses it through statuses', () => {
    // Customer logs in and creates a ticket
    cy.visit(base);
    cy.get('[data-testid="login-username"]').type(customer.username);
    cy.get('[data-testid="login-password"]').type(customer.password);
    cy.get('[data-testid="login-submit"]').click();
    cy.get('[data-testid="create-ticket-button"]').click();
    cy.get('input[name="title"]').type(`Progress Test Ticket ${ts}`);
    cy.get('textarea[name="description"]').type('Ticket to test status progression.');
    cy.get('[data-testid="create-ticket-submit"]').click();
    cy.contains(`Progress Test Ticket ${ts}`).should('exist');
    cy.get('[data-testid="nav-logout"]').click();

    // Staff logs in and we'll progress the ticket via API updates (more reliable than simulated drag)
    cy.intercept('POST', '/api/users/login').as('staffLogin');
    cy.get('[data-testid="login-username"]').type(staff.username);
    cy.get('[data-testid="login-password"]').type(staff.password);
    cy.get('[data-testid="login-submit"]').click();
    cy.wait('@staffLogin').its('response.body.token').then((token) => {
      expect(token).to.be.a('string');
      // find the ticket via API
      cy.request({ method: 'GET', url: '/api/tickets', headers: { Authorization: `Bearer ${token}` } }).then((res) => {
        const tickets = res.body as any[];
        const ticket = tickets.find(t => t.title === `Progress Test Ticket ${ts}`);
        expect(ticket, 'created ticket exists').to.exist;
        const ticketId = ticket._id;

        const statuses = ['in progress', 'closed'];
        cy.wrap(statuses).each((status) => {
          // update status via API
          cy.request({
            method: 'PUT',
            url: `/api/tickets/${ticketId}`,
            headers: { Authorization: `Bearer ${token}` },
            body: { status },
          }).then(() => {
            // reload UI so frontend fetches updated tickets and assert it's in the target column
            cy.reload();
            cy.get('[data-testid="login-username"]').type(staff.username);
            cy.get('[data-testid="login-password"]').type(staff.password);
            cy.get('[data-testid="login-submit"]').click(); 
            cy.get(`[data-testid="column-${String(status)}"]`).contains(`Progress Test Ticket ${ts}`).should('exist');
          });
        });
      });
    });
  });
});