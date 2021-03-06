import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Login } from './Login';
import { authenticate, IDToken } from '../domain/loginService';

jest.mock('../domain/loginService');

const authenticateMock = authenticate as jest.Mock<Promise<IDToken>>;

describe('Login component', () => {
  let signInButton: HTMLElement;
  let emailField: HTMLElement;
  let passwordField: HTMLElement;
  let errorInfo: HTMLElement | null;
  const history = { push: jest.fn() };

  beforeEach(() => {
    const { getByTestId, queryByTestId } = render(
      <MemoryRouter>
        <Login history={history} />
      </MemoryRouter>
    );
    signInButton = getByTestId(/sign-in/i);
    emailField = getByTestId(/email/i);
    passwordField = getByTestId(/password/i);
    errorInfo = queryByTestId(/error-info/i);

    authenticateMock.mockResolvedValue({
      name: 'foo bar',
      email: 'foo@bar.com',
      email_verified: true,
      sub: 'foo-000',
    });
  });

  it('should render component in empty state', () => {
    expect(signInButton).toBeInTheDocument();
    expect(emailField).toBeInTheDocument();
    expect(passwordField).toBeInTheDocument();
    expect(errorInfo).not.toBeInTheDocument();
  });

  it('should set state accordingly', () => {
    fireEvent.change(emailField, { target: { value: 'foo@bar.com' } });
    fireEvent.change(passwordField, { target: { value: 'password' } });

    expect(emailField).toHaveValue('foo@bar.com');
    expect(passwordField).toHaveValue('password');
  });

  it('should send state to service', async () => {
    const email = 'foo@bar.com';
    fireEvent.change(emailField, { target: { value: email } });
    const password = 'password';
    fireEvent.change(passwordField, { target: { value: password } });

    await fireEvent.click(signInButton);

    await expect(authenticateMock).toHaveBeenCalledWith(email, password);
  });
});
