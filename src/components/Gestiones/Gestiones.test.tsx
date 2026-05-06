import React from 'react';
import { render } from '@testing-library/react';
import Gestiones from './Gestiones';

// Mock GenericCard and AddEditDialogContent since they use import.meta
jest.mock('../GenericCard/GenericCard', () => {
  return {
    __esModule: true,
    default: () => <div>Mock GenericCard</div>,
  };
});

jest.mock('../AddEditDialog/AddEditDialogContent', () => {
  return {
    __esModule: true,
    default: () => <div>Mock AddEditDialogContent</div>,
  };
});

describe('Gestiones', () => {
  it('renders without crashing', () => {
    render(<Gestiones />);
  });
});
