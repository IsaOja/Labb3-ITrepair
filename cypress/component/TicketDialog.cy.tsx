import React from 'react';
import { mount } from 'cypress/react';
import TicketDialog from '../../src/components/TicketDialog';
import type { Ticket, User } from '../../src/types';

describe('TicketDialog component', () => {
  const ticket: Ticket = {
    _id: 't1',
    title: 'A',
    description: 'desc',
    status: 'created',
    user: 'u1',
    type: 'hardware',
    priority: 'high',
    image: '',
    assignedTo: null,
  };
  const user: User = { _id: 'u1', username: 'alice', email: 'a@x.com', isStaff: true, token: 'token' };
  const userMap = {};
  it('renders dialog and switches to edit mode', () => {
    const onEdit = cy.stub().as('onEdit');
    mount(
      <TicketDialog
        ticket={ticket}
        open={true}
        user={user}
        userMap={userMap}
        editMode={false}
        onClose={() => {}}
        onEdit={onEdit}
        onSave={async () => {}}
        onCancelEdit={() => {}}
      />
    );
    cy.get('[data-testid="staff-ticket-dialog"]').should('exist');
    cy.get('[data-testid="staff-popup-edit"]').click();
    cy.get('@onEdit').should('have.been.called');
  });
  it('renders in edit mode', () => {
    mount(
      <TicketDialog
        ticket={ticket}
        open={true}
        user={user}
        userMap={userMap}
        editMode={true}
        onClose={() => {}}
        onEdit={() => {}}
        onSave={async () => {}}
        onCancelEdit={() => {}}
      />
    );
    cy.contains('Edit Ticket').should('exist');
  });
});
