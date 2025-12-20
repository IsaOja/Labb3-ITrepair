import React from 'react';
import CustomerView from './views/CustomerView';
import StaffView from './views/StaffView';
import type { User } from './types';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Avatar, Typography, Chip, Button, Menu, MenuItem } from '@mui/material';
import RemoveUser from './components/RemoveUser';
import CreateUser from './components/CreateUser';
import LoginForm from './components/LoginForm';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [showRegister, setShowRegister] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleLogin = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        return 'Invalid username or password';
      }
      const data = await res.json();
      setUser({
        _id: data.user._id,
        username: data.user.username,
        email: data.user.email,
        isStaff: data.user.isStaff,
        token: data.token,
      });
      return null;
    } catch {
      return 'Login failed';
    }
  };

  const handleRegister = async (userData: { username: string; email: string; password: string; isStaff: boolean }) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const errMsg = await res.text();
        return errMsg || 'Registration failed';
      }
      const data = await res.json();
      setUser({
        _id: data.user._id,
        username: data.user.username,
        email: data.user.email,
        isStaff: data.user.isStaff,
        token: data.token,
      });
      setShowRegister(false);
      return null;
    } catch {
      return 'Registration failed';
    }
  };


  const handleLogout = () => setUser(null);

  const handleRemoveUser = async (id: string) => {
    await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': user?.token ? `Bearer ${user.token}` : '' },
    });
    setUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!user ? (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.palette.background.default }}>
          {!showRegister ? (
            <LoginForm onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />
          ) : (
            <CreateUser onRegister={handleRegister} onBack={() => setShowRegister(false)} />
          )}
        </div>
      ) : (
        <>
          <AppBar position="sticky" color="default" elevation={2} sx={{ mb: 4 }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>IT</Avatar>
                <Typography variant="h6" color="primary" fontWeight={700}>IT Repair</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    color="inherit"
                    data-testid="nav-username"
                    onClick={e => setAnchorEl(e.currentTarget)}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  >
                    {user.username}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem disableRipple sx={{ p: 0 }}>
                      <RemoveUser
                        userId={user._id}
                        onRemove={handleRemoveUser}
                      />
                    </MenuItem>
                  </Menu>
                </Box>
                <Chip label={user.isStaff ? 'Staff' : 'Customer'} color={user.isStaff ? 'secondary' : 'primary'} variant="outlined" data-testid="nav-role" />
                <Button onClick={handleLogout} color="error" variant="contained" data-testid="nav-logout">Log Out</Button>
              </Box>
            </Toolbar>
          </AppBar>
          <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
            {user.isStaff ? <StaffView user={user} /> : <CustomerView user={user} />}
          </Box>
        </>
      )}
    </ThemeProvider>
  );
}

export default App;
