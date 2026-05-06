import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginDialogContent from './LoginDialog';

describe('LoginDialog', () => {
  it('renders without crashing', () => {
    render(<LoginDialogContent />);
  });

  it('displays username and password fields', () => {
    render(<LoginDialogContent />);
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });
});
