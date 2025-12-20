import React from 'react';
import { mount } from 'cypress/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CreateUser from '../../src/components/CreateUser';

const theme = createTheme();

describe('Create customer user component', () => {
	it('renders the form fields', () => {
		mount(
			<ThemeProvider theme={theme}>
				<CreateUser onRegister={cy.stub()} onBack={() => {}} />
			</ThemeProvider>
		);
		cy.get('[data-testid="register-username-input"]').should('exist');
		cy.get('[data-testid="register-email-input"]').should('exist');
		cy.get('[data-testid="register-password-input"]').should('exist');
		cy.get('[data-testid="register-submit"]').should('exist');
	});

	it('submits the form with correct values', () => {
		const onRegister = cy.stub().as('onRegister');
		mount(
			<ThemeProvider theme={theme}>
				<CreateUser onRegister={onRegister} onBack={() => {}} />
			</ThemeProvider>
		);
		cy.get('[data-testid="register-username-input"]').type('alice');
		cy.get('[data-testid="register-email-input"]').type('alice@example.com');
		cy.get('[data-testid="register-password-input"]').type('secret123');
		cy.get('[data-testid="register-submit"]').click();
		cy.get('@onRegister').should('have.been.calledWith', Cypress.sinon.match({
			username: 'alice',
			email: 'alice@example.com',
			password: 'secret123',
			isStaff: false
		}));
	});
});

describe('Create staff user component', () => {
	it('renders the form fields', () => {
		mount(
			<ThemeProvider theme={theme}>
				<CreateUser onRegister={cy.stub()} onBack={() => {}} />
			</ThemeProvider>
		);
		cy.get('[data-testid="register-username-input"]').should('exist');
		cy.get('[data-testid="register-email-input"]').should('exist');
		cy.get('[data-testid="register-password-input"]').should('exist');
		cy.get('[data-testid="register-submit"]').should('exist');
	});

	it('submits the form with correct values', () => {
		const onRegister = cy.stub().as('onRegister');
		mount(
			<ThemeProvider theme={theme}>
				<CreateUser onRegister={onRegister} onBack={() => {}} />
			</ThemeProvider>
		);
		cy.get('[data-testid="register-username-input"]').type('alice');
		cy.get('[data-testid="register-email-input"]').type('alice@example.com');
		cy.get('[data-testid="register-password-input"]').type('secret123');
        cy.get('[data-testid="register-staff-checkbox"]').click();
		cy.get('[data-testid="register-submit"]').click();
		cy.get('@onRegister').should('have.been.calledWith', Cypress.sinon.match({
			username: 'alice',
			email: 'alice@example.com',
			password: 'secret123',
			isStaff: true
		}));
	});
});
