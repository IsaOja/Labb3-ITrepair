import React from 'react';
import { mount } from 'cypress/react';
import TicketList from '../../src/components/TicketList';
import type { Ticket, User } from '../../src/types';

describe('TicketList component', () => {
  const tickets: Ticket[] = [
    { _id: 't1', title: 'A', description: 'desc', status: 'created', user: 'u1', type: 'hardware', priority: 'high', image: '', assignedTo: null },
    { _id: 't2', title: 'B', description: 'desc', status: 'created', user: 'u1', type: 'software', priority: 'low', image: '', assignedTo: null },
  ];
  const userMap: Record<string, User> = {};
  it('renders tickets and handles select', () => {
    const onSelect = cy.stub().as('onSelect');
    mount(
      <TicketList tickets={tickets} userMap={userMap} onSelect={onSelect} onEdit={() => {}} />
    );
    cy.contains('A').click();
    cy.get('@onSelect').should('have.been.called');
  });
  it('calls onEdit when edit button clicked', () => {
    const onEdit = cy.stub().as('onEdit');
    mount(
      <TicketList tickets={tickets} userMap={userMap} onSelect={() => {}} onEdit={onEdit} />
    );
    cy.get('button').contains('Edit').first().click();
    cy.get('@onEdit').should('have.been.called');
  });
  it('shows empty state if no tickets', () => {
    mount(
      <TicketList tickets={[]} userMap={{}} onSelect={() => {}} onEdit={() => {}} />
    );
    cy.contains('No tickets yet').should('exist');
  });
});
