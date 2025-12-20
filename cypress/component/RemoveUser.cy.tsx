import React from 'react';
import { mount } from 'cypress/react';
import RemoveUser from '../../src/components/RemoveUser';

describe('RemoveUser component', () => {
	const user = {
		_id: 'u1',
		username: 'alice',
		email: 'a@x.com',
		isStaff: false,
		token: '',
	} as any;


	it('renders a remove button', () => {
		mount(<RemoveUser userId={user._id} onRemove={() => {}} />);
		cy.get('[data-testid="remove-user-btn"]').should('exist').and('contain.text', 'Remove');
	});


	it('calls onRemove when button is clicked', () => {
		const onRemove = cy.stub().as('onRemove');
		mount(<RemoveUser userId={user._id} onRemove={onRemove} />);
		cy.get('[data-testid="remove-user-btn"]').click();
		cy.get('@onRemove').should('have.been.calledWith', 'u1');
	});
});
