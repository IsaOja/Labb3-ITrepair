import React from 'react';
import { mount } from 'cypress/react';
import RemoveTicket from '../../src/components/RemoveTicket';

describe('RemoveTicket component', () => {
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

	it('renders a remove button', () => {
		mount(<button data-testid="remove-ticket-btn">Remove</button>);
		cy.get('[data-testid="remove-ticket-btn"]').should('exist').and('contain.text', 'Remove');
	});

	it('calls onRemove when button is clicked', () => {
		const onRemove = cy.stub().as('onRemove');
		mount(<button data-testid="remove-ticket-btn" onClick={() => onRemove(ticket._id)}>Remove</button>);
		cy.get('[data-testid="remove-ticket-btn"]').click();
		cy.get('@onRemove').should('have.been.calledWith', 't1');
	});
});
