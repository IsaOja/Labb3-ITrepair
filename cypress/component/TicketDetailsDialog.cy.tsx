import React from 'react';
import { mount } from 'cypress/react';
import TicketDetailsDialog from '../../src/components/TicketDetailsDialog';
import type { Ticket, User } from '../../src/types';

describe('TicketDetailsDialog component', () => {
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
  const comments = [
    { _id: 'c1', author: 'alice', text: 'Hello', createdAt: new Date().toISOString() },
  ];
  it('renders dialog and comments', () => {
    mount(
      <TicketDetailsDialog
        open={true}
        ticket={ticket}
        user={user}
        userMap={userMap}
        comments={comments}
        commentInput={''}
        commentLoading={false}
        zoomedImage={null}
        onClose={() => {}}
        onEdit={() => {}}
        onCommentInput={() => {}}
        onSendComment={() => {}}
        onZoomImage={() => {}}
      />
    );
    cy.contains('Comments');
    cy.contains('Hello');
    cy.get('button').contains('Edit').should('exist');
    cy.get('button').contains('Close').should('exist');
  });
});
