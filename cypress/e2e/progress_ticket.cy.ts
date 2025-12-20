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
