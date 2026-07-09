import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login.jsx';

// Mock useAuth hook
const mockLogin = vi.fn();
vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page', () => {
  it('should render the login form elements', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password', { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should display validation error if submitted empty', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/please fill in all fields/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should call login and navigate to feed on successful submission', async () => {
    mockLogin.mockResolvedValueOnce({ uid: 'user123' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passInput = screen.getByLabelText('Password', { selector: 'input' });
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/feed');
    });
  });

  it('should show error alert if login fails', async () => {
    mockLogin.mockRejectedValueOnce({ code: 'auth/wrong-password' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passInput = screen.getByLabelText('Password', { selector: 'input' });
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passInput, { target: { value: 'wrong-pass' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument();
  });
});
