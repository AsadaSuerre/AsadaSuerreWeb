import React from 'react';
import { render } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders footer component', () => {
    render(<Footer />);
    // Check that footer renders
    const container = document.querySelector('.MuiContainer-root');
    expect(container).toBeInTheDocument();
  });
});
