import React from 'react';
import { render, screen } from '@testing-library/react';
import DynamicItemsInput from './DynamicItemsInput';

// Mock FileUpload since it uses import.meta
jest.mock('../FileUpload/FileUpload', () => {
  return {
    __esModule: true,
    default: () => <div>Mock FileUpload</div>,
  };
});

describe('DynamicItemsInput', () => {
  it('renders without crashing', () => {
    render(<DynamicItemsInput value={[]} onChange={() => {}} />);
  });
});
