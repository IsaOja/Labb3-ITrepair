import React from 'react';
import { mount } from 'cypress/react';
import KanbanBoard from '../../src/components/KanbanBoard';
import KanbanColumn from '../../src/components/KanbanColumn';
import type { Ticket, User } from '../../src/types';

describe('KanbanColumn component', () => {
  const tickets: Ticket[] = [
    { _id: 't1', title: 'A', description: 'desc', status: 'created', user: 'u1', type: 'hardware', priority: 'high', image: '', assignedTo: null },
    { _id: 't2', title: 'B', description: 'desc', status: 'created', user: 'u1', type: 'software', priority: 'low', image: '', assignedTo: null },
  ];
  it('renders tickets and column title', () => {
    mount(
      <KanbanColumn status="created" tickets={tickets} />
    );
    cy.get('[data-testid="column-created-title"]').should('contain.text', 'created');
    cy.get('[data-testid="ticket-t1-title"]').should('exist');
    cy.get('[data-testid="ticket-t2-title"]').should('exist');
  });
});

describe('KanbanBoard component', () => {
  const tickets: Ticket[] = [
    { _id: 't1', title: 'A', description: 'desc', status: 'created', user: 'u1', type: 'hardware', priority: 'high', image: '', assignedTo: null },
    { _id: 't2', title: 'B', description: 'desc', status: 'in progress', user: 'u1', type: 'software', priority: 'low', image: '', assignedTo: null },
  ];
  const userMap: Record<string, User> = {};
  const columns = {
    created: [tickets[0]],
    'in progress': [tickets[1]],
    closed: [],
  };
  it('renders all columns and tickets', () => {
    mount(
      <KanbanBoard
        columns={columns}
        statuses={['created', 'in progress', 'closed']}
        userMap={userMap}
        onTicketClick={() => {}}
        onEditClick={() => {}}
        onDragEnd={() => {}}
      />
    );
    cy.get('[data-testid^="column-"]').not('[data-testid$="-title"]').should('have.length', 3);
    cy.get('[data-testid="ticket-t1-title"]').should('exist');
    cy.get('[data-testid="ticket-t2-title"]').should('exist');
  });
});
