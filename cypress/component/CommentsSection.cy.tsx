import React from 'react';
import { mount } from 'cypress/react';
import CommentsSection from '../../src/components/CommentsSection';

describe('CommentsSection component', () => {
  const comments = [
    { _id: 'c1', author: 'alice', text: 'Hello', createdAt: new Date().toISOString() },
    { _id: 'c2', author: 'bob', text: 'Hi', createdAt: new Date().toISOString() },
  ];
  it('renders comments and input', () => {
    mount(
      <CommentsSection
        comments={comments}
        userName="alice"
        input=""
        loading={false}
        onInput={() => {}}
        onSend={() => {}}
      />
    );
    cy.contains('Comments');
    cy.get('input,textarea').should('exist');
    cy.contains('Hello');
    cy.contains('Hi');
  });
  it('calls onInput and onSend', () => {
    const onInput = cy.stub().as('onInput');
    const onSend = cy.stub().as('onSend');
    mount(
      <CommentsSection
        comments={[]}
        userName="alice"
        input="test"
        loading={false}
        onInput={onInput}
        onSend={onSend}
      />
    );
    cy.get('[data-testid="customer-comment-input"]').type('a');
    cy.get('@onInput').should('have.been.called');
    cy.get('[data-testid="customer-comment-send"]').click();
    cy.get('@onSend').should('have.been.called');
  });
});
