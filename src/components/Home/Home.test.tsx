import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Home', () => {
  it('renders without crashing', () => {
    render(<div>Mock Home</div>);
  });
});
