// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Dynamically import the React mount helper so Vite/Cypress can resolve it
(async () => {
  try {
    const mod = await import('@cypress/react');
    // Augment the Cypress namespace to include type definitions for your custom command.
    // Alternatively, can be defined in cypress/support/component.d.ts with a <reference path="./component" /> at the top of your spec.
    declare global {
      namespace Cypress {
        interface Chainable {
          mount: typeof mod.mount
        }
      }
    }

    Cypress.Commands.add('mount', mod.mount);
  } catch (err) {
    // Fail silently here and log to console — this makes the error clearer in the browser devtools
    // If this import fails, component mounting will not be available and component tests will error.
    // The user can check that `cypress/react` is resolvable and that the dev server is running.
    // eslint-disable-next-line no-console
    console.error('Failed to import cypress/react in support/component.ts', err);
  }
})();

// Example use:
// cy.mount(<MyComponent />)