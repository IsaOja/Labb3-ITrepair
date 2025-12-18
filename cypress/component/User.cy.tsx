import React from 'react';
import { mount } from 'cypress/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Typography, Chip } from '@mui/material';

const theme = createTheme();

const UserBadge: React.FC<{ username: string; isStaff: boolean }> = ({ username, isStaff }) => (
  <Box>
    <Typography data-testid="component-username">{username}</Typography>
    <Chip data-testid="component-role" label={isStaff ? 'Staff' : 'Customer'} />
  </Box>
);

describe('User badge (simple component)', () => {
  it('shows username and role', () => {
    mount(
      <ThemeProvider theme={theme}>
        <UserBadge username="alice" isStaff={true} />
      </ThemeProvider>
    );

    cy.get('[data-testid="component-username"]').should('have.text', 'alice');
    cy.get('[data-testid="component-role"]').should('contain.text', 'Staff');
  });
});
