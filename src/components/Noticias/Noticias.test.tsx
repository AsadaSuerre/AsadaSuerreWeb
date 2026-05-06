import React from 'react';
import { render, screen } from '@testing-library/react';
import Noticias from './Noticias';

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

describe('Noticias', () => {
  it('renders without crashing', () => {
    render(<Noticias />);
  });
});
