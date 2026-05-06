import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('Loading', () => {
  it('renders without crashing', () => {
    render(<Loading />);
  });

  it('displays loading text', () => {
    render(<Loading />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });
});
