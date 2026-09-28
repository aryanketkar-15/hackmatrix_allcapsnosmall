import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAt } from '../test/renderApp';

async function fill(user: ReturnType<typeof userEvent.setup>, u: string, p: string) {
  await user.clear(screen.getByLabelText('Username'));
  if (u) await user.type(screen.getByLabelText('Username'), u);
  if (p) await user.type(screen.getByLabelText('Password'), p);
}

describe('demo auth gate', () => {
  beforeEach(() => { sessionStorage.clear(); localStorage.clear(); });

  it('signs in with the demo credentials and lands on the dashboard', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/login', { signedIn: false });
    await fill(user, 'priya.sharma', 'demo-only-123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'));
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
  });

  it('rejects a wrong password with a generic error and no session', async () => {
    const user = userEvent.setup();
    renderAt('/login', { signedIn: false });
    await fill(user, 'priya.sharma', 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid username or password');
    expect(sessionStorage.getItem('khoji.session')).toBeNull();
  });

  it('validates empty fields', async () => {
    const user = userEvent.setup();
    renderAt('/login', { signedIn: false });
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(screen.getByText('Enter your username')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
  });

  it('redirects signed-out users to login with a next param, then returns after login', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/alerts', { signedIn: false });
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.search).toBe('?next=%2Falerts');
    await fill(user, 'priya.sharma', 'demo-only-123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/alerts'));
  });

  it('ignores unsafe next redirects', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/login?next=//evil.example', { signedIn: false });
    await fill(user, 'priya.sharma', 'demo-only-123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'));
  });

  it('signs out and guards protected routes again', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/dashboard');
    await user.click(screen.getByRole('button', { name: /Priya Sharma/ }));
    await user.click(screen.getByRole('menuitem', { name: /Sign out/ }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    await router.navigate('/alerts');
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
  });

  it('treats a corrupt session as signed out without crashing', () => {
    sessionStorage.setItem('khoji.session', '{not json');
    const { router } = renderAt('/dashboard', { signedIn: false });
    sessionStorage.setItem('khoji.session', '{not json');
    expect(router.state.location.pathname).toBe('/login');
  });

  it('remember me stores only the username', async () => {
    const user = userEvent.setup();
    renderAt('/login', { signedIn: false });
    await fill(user, 'priya.sharma', 'demo-only-123');
    await user.click(screen.getByLabelText('Remember me'));
    await user.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(localStorage.getItem('khoji.rememberedUsername')).toBe('priya.sharma');
    const all = JSON.stringify({ ...localStorage });
    expect(all).not.toContain('demo-only-123');
  });

  it('password field is masked and the eye toggles it', async () => {
    const user = userEvent.setup();
    renderAt('/login', { signedIn: false });
    const pw = screen.getByLabelText('Password');
    expect(pw).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(pw).toHaveAttribute('type', 'text');
  });

  it('login copy avoids claiming security (deviation C3)', () => {
    renderAt('/login', { signedIn: false });
    expect(screen.getByText(/Evidence-backed · Explainable · Investigator-Focused/)).toBeInTheDocument();
    expect(screen.queryByText(/^Secure$/)).not.toBeInTheDocument();
  });
});
