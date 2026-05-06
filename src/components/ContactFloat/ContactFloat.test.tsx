import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactFloat from './ContactFloat';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

// Mock window.open and location
global.open = jest.fn();
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
  configurable: true,
});

describe('ContactFloat', () => {
  test('renders contact button with custom icon', () => {
    render(
      <ContactFloat
        icon={<WhatsAppIcon />}
        link="https://example.com"
        tooltipTitle="Test Contact"
        ariaLabel="Test contact button"
      />
    );
    
    expect(screen.getByLabelText(/Test contact button/i)).toBeInTheDocument();
  });

  test('opens external link when clicked', () => {
    render(
      <ContactFloat
        icon={<WhatsAppIcon />}
        link="https://example.com"
        tooltipTitle="Test Contact"
        ariaLabel="Test contact button"
      />
    );
    
    const button = screen.getByLabelText(/Test contact button/i);
    fireEvent.click(button);
    expect(global.open).toHaveBeenCalledWith('https://example.com', '_blank');
  });

  test('handles mailto links correctly', () => {
    render(
      <ContactFloat
        icon={<WhatsAppIcon />}
        link="mailto:test@example.com"
        tooltipTitle="Email Contact"
        ariaLabel="Email contact button"
      />
    );
    
    const button = screen.getByLabelText(/Email contact button/i);
    fireEvent.click(button);
    expect(window.location.href).toBe('mailto:test@example.com');
  });

  test('uses custom onClick handler when provided', () => {
    const mockOnClick = jest.fn();
    render(
      <ContactFloat
        icon={<WhatsAppIcon />}
        link="https://example.com"
        tooltipTitle="Test Contact"
        ariaLabel="Test contact button"
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByLabelText(/Test contact button/i);
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalled();
    expect(global.open).not.toHaveBeenCalled();
  });

  test('uses custom target when provided', () => {
    render(
      <ContactFloat
        icon={<WhatsAppIcon />}
        link="https://example.com"
        tooltipTitle="Test Contact"
        ariaLabel="Test contact button"
        target="_self"
      />
    );
    
    const button = screen.getByLabelText(/Test contact button/i);
    fireEvent.click(button);
    expect(global.open).toHaveBeenCalledWith('https://example.com', '_self');
  });
});
