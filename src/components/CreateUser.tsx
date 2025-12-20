import React, { useState } from 'react';
import { Paper, Typography, Stack, TextField, Checkbox, FormControlLabel, Button, Alert } from '@mui/material';

interface CreateUserProps {
  onRegister: (user: { username: string; email: string; password: string; isStaff: boolean }) => Promise<string | null>;
  onBack: () => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ onRegister, onBack }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = await onRegister({ username, email, password, isStaff });
    if (err) setError(err);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" fontWeight={700} color="primary" gutterBottom>IT Repair</Typography>
        <Typography variant="h6" align="center" color="text.secondary" gutterBottom>Create Account</Typography>
        <Stack spacing={3}>
          <TextField
            label="Username"
            name="username"
            value={username}
            data-testid="register-username-input"
            onChange={e => setUsername(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={email}
            data-testid="register-email-input"
            onChange={e => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={password}
            data-testid="register-password-input"
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
          <Button onClick={onBack} color="primary" fullWidth data-testid="register-back">Back to Sign In</Button>
        </Stack>
      </Paper>
    </form>
  );
};

export default CreateUser;
