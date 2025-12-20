import React, { useState } from 'react';
import { Paper, Typography, Stack, TextField, Button, Alert } from '@mui/material';

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<string | null>;
  onShowRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onShowRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = await onLogin(username, password);
    if (err) setError(err);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400 }}>
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
          <Button data-testid="open-register" onClick={onShowRegister} color="primary" fullWidth> Create New Account </Button>
        </Stack>
      </Paper>
    </form>
  );
};

export default LoginForm;
