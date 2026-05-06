import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders footer component', () => {
    render(<Footer />);
    // Check that footer renders
    expect(document.querySelector('.MuiContainer-root')).toBeInTheDocument();
  });
});
