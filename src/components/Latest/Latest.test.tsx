import React from 'react';
import { render } from '@testing-library/react';
import Latest from './Latest';

describe('Latest', () => {
  it('renders without crashing', () => {
    render(<Latest />);
  });
  test('renders latest component', () => {
    render(<Latest />);
    // The component renders, just check it exists
    const grid = document.querySelector('.MuiGrid-root');
    expect(grid).toBeInTheDocument();
  });
});
