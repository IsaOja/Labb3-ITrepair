import React from 'react';
import { mount } from 'cypress/react';
import KanbanTicket from '../../src/components/KanbanTicket';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

describe('KanbanTicket component', () => {
  const ticket = {
    _id: 't1',
    title: 'Test Ticket',
    description: 'desc',
    type: 'hardware',
    priority: 'high',
    status: 'created',
    assignedTo: 'u1',
    image: null,
  } as any;

  const userMap = {
    u1: { _id: 'u1', username: 'alice', email: 'a@x.com', isStaff: true, token: '' },
  } as any;

  it('renders title, assigned user and priority', () => {
    mount(
      <ThemeProvider theme={theme}>
        <KanbanTicket ticket={ticket} userMap={userMap} />
      </ThemeProvider>
    );

    cy.get('[data-testid="ticket-t1-title"]').should('contain.text', 'Test Ticket');
    cy.get('[data-testid="ticket-t1-assigned"]').should('contain.text', 'alice');
    cy.get('[data-testid="ticket-t1-priority"]').should('contain.text', 'high');
    cy.get('[aria-label="Drag handle"]').should('exist');
  });

  it('calls edit handler when edit button clicked', () => {
    const onEdit = cy.stub().as('onEdit');
    mount(
      <ThemeProvider theme={theme}>
        <KanbanTicket ticket={ticket} userMap={userMap} onEditClick={onEdit} />
      </ThemeProvider>
    );

    cy.get('[data-testid="ticket-t1-edit"]').click().then(() => {
      expect(onEdit).to.have.been.called;
    });
  });
});
