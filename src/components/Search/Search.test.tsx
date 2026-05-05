import React from 'react';
import { render, screen } from '@testing-library/react';
import Search from './Search';

describe('Search', () => {
  it('renders without crashing', () => {
    render(<Search value="" onChange={() => {}} />);
  });

  it('displays search input', () => {
    render(<Search value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
