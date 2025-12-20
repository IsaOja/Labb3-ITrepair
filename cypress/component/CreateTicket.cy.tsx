import React from 'react';
import { mount } from 'cypress/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CreateTicketForm from '../../src/components/CreateTicketForm';
import type { User } from '../../src/types';

const theme = createTheme();

describe('CreateTicketForm component', () => {
	const user: User = { _id: '1', username: 'test', email: 'test@example.com', isStaff: false, token: 'token' };

	it('renders the form fields', () => {
		mount(
			<ThemeProvider theme={theme}>
				<CreateTicketForm user={user} onCreate={() => {}} onCancel={() => {}} />
			</ThemeProvider>
		);
		cy.get('[data-testid="create-ticket-title"]').should('exist');
		cy.get('[data-testid="create-ticket-title-input"]').should('exist');
		cy.get('[data-testid="create-ticket-description-input"]').should('exist');
		cy.get('[data-testid="create-ticket-type-select"]').should('exist');
		cy.get('[data-testid="create-ticket-priority-select"]').should('exist');
		cy.get('[data-testid="create-ticket-submit"]').should('exist');
	});

	it('submits the form with correct values', () => {
		const onCreate = cy.stub().as('onCreate');
		mount(
			<ThemeProvider theme={theme}>
				<CreateTicketForm user={user} onCreate={onCreate} onCancel={() => {}} />
			</ThemeProvider>
		);
		cy.get('[data-testid="create-ticket-title-input"]').type('Printer broken');
		cy.get('[data-testid="create-ticket-description-input"]').type('The printer is not working.');
		cy.get('[data-testid="create-ticket-type-select"]').parent().find('div[role="combobox"]').click();
		cy.get('li[data-value="hardware"]').click();
		cy.get('[data-testid="create-ticket-priority-select"]').parent().find('div[role="combobox"]').click();
		cy.get('li[data-value="high"]').click();
		cy.get('[data-testid="create-ticket-submit"]').click();
		cy.get('@onCreate').should('have.been.calledWith',
			Cypress.sinon.match({
				title: 'Printer broken',
				description: 'The printer is not working.',
				type: 'hardware',
				priority: 'high',
			}),
			Cypress.sinon.match.array
		);
	});
});
