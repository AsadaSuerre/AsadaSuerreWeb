import React from 'react';
import { render } from '@testing-library/react';
import FullScreenDialog from './FullScreenDialog';

// Mock GenericCard since it uses import.meta
jest.mock('../GenericCard/GenericCard', () => {
  return {
    __esModule: true,
    default: () => <div>Mock GenericCard</div>,
    iconMap: {},
  };
});

describe('FullScreenDialog', () => {
  it('renders without crashing', () => {
    render(
      <FullScreenDialog
        open={false}
        onClose={() => {}}
        title="Test"
      >
        <div>Test content</div>
      </FullScreenDialog>
    );
  });
});
