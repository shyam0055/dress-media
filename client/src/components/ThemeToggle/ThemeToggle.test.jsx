import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ThemeToggle from './ThemeToggle.jsx';

// Mock useTheme hook
const mockToggleTheme = vi.fn();
vi.mock('../../context/ThemeContext.jsx', () => ({
  useTheme: () => ({
    isDark: true,
    toggleTheme: mockToggleTheme,
  }),
}));

describe('ThemeToggle Component', () => {
  it('should render the toggle button in dark mode', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /switch to light mode/i });
    expect(button).toBeInTheDocument();
  });

  it('should call toggleTheme on click', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
