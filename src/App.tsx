import React, { useState } from 'react';
import CustomerView from './views/CustomerView';
import StaffView from './views/StaffView';
import type { User } from './types';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Paper, Typography, TextField, Button, Alert, Stack, Checkbox, FormControlLabel, AppBar, Toolbar, Avatar, Chip } from '@mui/material';


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
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError('Invalid username or password');
        return;
      }
      const data = await res.json();
      setUser({
        _id: data.user._id,
        username: data.user.username,
        email: data.user.email,
        isStaff: data.user.isStaff,
        token: data.token,
      });
      setUsername('');
      setPassword('');
    } catch (err) {
      setError('Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, isStaff }),
      });
      if (!res.ok) {
        const errMsg = await res.text();
        setError(errMsg || 'Registration failed');
        return;
      }
      
      const data = await res.json();
      setUser({
        _id: data.user._id,
        username: data.user.username,
        email: data.user.email,
        isStaff: data.user.isStaff,
        token: data.token,
      });
      setUsername('');
      setPassword('');
      setEmail('');
      setShowRegister(false);
    } catch (err) {
      setError('Registration failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!user ? (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.palette.background.default }}>
          {!showRegister ? (
            <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: 400 }}>
              <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" align="center" fontWeight={700} color="primary" gutterBottom>IT Repair</Typography>
                <Typography variant="h6" align="center" color="text.secondary" gutterBottom>Sign In</Typography>
                <Stack spacing={3}>
                  <TextField
                    label="Username"
                    value={username}
                    inputProps={{ 'data-testid': 'login-username' }}
                    onChange={e => setUsername(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    inputProps={{ 'data-testid': 'login-password' }}
                    onChange={e => setPassword(e.target.value)}
                    required
                    fullWidth
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button type="submit" variant="contained" color="primary" size="large" fullWidth data-testid="login-submit">Sign In</Button>
                  <Button data-testid="open-register" onClick={() => setShowRegister(true)} color="primary" fullWidth> Create New Account </Button>
                </Stack>
              </Paper>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ width: '100%', maxWidth: 400 }}>
              <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" align="center" fontWeight={700} color="primary" gutterBottom>IT Repair</Typography>
                <Typography variant="h6" align="center" color="text.secondary" gutterBottom>Create Account</Typography>
                <Stack spacing={3}>
                  <TextField
                    label="Username"
                    value={username}
                    inputProps={{ 'data-testid': 'register-username' }}
                    onChange={e => setUsername(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    inputProps={{ 'data-testid': 'register-email' }}
                    onChange={e => setEmail(e.target.value)}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    inputProps={{ 'data-testid': 'register-password' }}
                    onChange={e => setPassword(e.target.value)}
                    required
                    fullWidth
                  />
                  <FormControlLabel
                    control={<Checkbox checked={isStaff} onChange={e => setIsStaff(e.target.checked)} color="primary" data-testid="register-staff-checkbox" />}
                    label="Register as Staff"
                  />
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button type="submit" variant="contained" color="primary" size="large" fullWidth data-testid="register-submit">Create Account</Button>
                  <Button onClick={() => setShowRegister(false)} color="primary" fullWidth data-testid="register-back">Back to Sign In</Button>
                </Stack>
              </Paper>
            </form>
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
                <Typography color="text.primary" fontWeight={500} data-testid="nav-username">{user.username}</Typography>
                <Chip label={user.isStaff ? 'Staff' : 'Customer'} color={user.isStaff ? 'secondary' : 'primary'} variant="outlined" data-testid="nav-role" />
                <Button onClick={handleLogout} color="error" variant="contained" data-testid="nav-logout">Log Out</Button>
              </Box>
            </Toolbar>
          </AppBar>
          <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 4 }}>
            {user.isStaff ? (
              <StaffView user={user} />
            ) : (
              <CustomerView user={user} />
            )}
          </Box>
        </>
      )}
    </ThemeProvider>
  );
}

export default App;
