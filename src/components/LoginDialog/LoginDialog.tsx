import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/TranslationContext';

interface LoginDialogProps {
  onSuccess?: () => void;
}

const LoginDialogContent: React.FC<LoginDialogProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          py: 2
        }}
      >        
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TextField
          label={t.auth.username}
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          autoFocus
          autoComplete="username"
        />

        <TextField
          label={t.auth.password}
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isLoading || !username || !password}
          sx={{ mt: 2 }}
        >
          {isLoading ? <CircularProgress size={24} /> : t.auth.login}
        </Button>
      </Box>
    </Container>
  );
};

export default LoginDialogContent;
