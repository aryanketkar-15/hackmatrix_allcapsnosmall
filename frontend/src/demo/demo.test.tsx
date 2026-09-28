import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { dataReady, renderAt } from '../test/renderApp';
import { BEATS, BEAT_MS } from './DemoController';

const press = (key: string) => act(() => { fireEvent.keyDown(window, { key }); });

describe('demo beats', () => {
  it('covers the full path with unique ids and known routes', () => {
    expect(BEATS.length).toBeGreaterThanOrEqual(15);
    expect(new Set(BEATS.map((b) => b.id)).size).toBe(BEATS.length);
    expect(BEATS.every((b) => b.path.startsWith('/') && b.say.length > 10)).toBe(true);
    expect(BEATS.map((b) => b.narrator)).toEqual(expect.arrayContaining(['Rishi', 'Chetan', 'Shanteshwar', 'Aryan']));
  });
});

describe('demo mode', () => {
  beforeEach(() => { sessionStorage.clear(); });

  it('/demo starts at the login beat and the arrow keys walk every beat', async () => {
    const { router } = renderAt('/demo', { signedIn: false });
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(screen.getByTestId('demo-beat')).toHaveTextContent(`Beat 1/${BEATS.length}`);
    for (let i = 1; i < BEATS.length; i += 1) {
      await press('ArrowRight');
      const [path, search = ''] = BEATS[i].path.split('?');
      await waitFor(() => expect(router.state.location.pathname).toBe(path));
      if (search) expect(router.state.location.search).toBe(`?${search}`);
      expect(screen.getByTestId('demo-beat')).toHaveTextContent(`Beat ${i + 1}/${BEATS.length}`);
    }
  });

  it('signs in automatically when leaving the login beat', async () => {
    const { router } = renderAt('/demo', { signedIn: false });
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    await press('ArrowRight');
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'));
    await dataReady();
    expect(screen.getByTestId('prototype-badge')).toBeInTheDocument();
  });

  it('left arrow goes back, R restarts, Escape exits', async () => {
    const { router } = renderAt('/demo', { signedIn: false });
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    await press('ArrowRight'); await press('ArrowRight');
    await waitFor(() => expect(screen.getByTestId('demo-beat')).toHaveTextContent('Beat 3/'));
    await press('ArrowLeft');
    await waitFor(() => expect(screen.getByTestId('demo-beat')).toHaveTextContent('Beat 2/'));
    await press('r');
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    await press('Escape');
    await waitFor(() => expect(screen.queryByTestId('demo-controller')).not.toBeInTheDocument());
  });

  it('space toggles play/pause and playing advances on a fixed timer', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const { router } = renderAt('/demo', { signedIn: false });
      await act(async () => { await vi.advanceTimersByTimeAsync(10); });
      expect(router.state.location.pathname).toBe('/login');
      await press(' ');
      expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
      await act(async () => { await vi.advanceTimersByTimeAsync(BEAT_MS + 50); });
      expect(screen.getByTestId('demo-beat')).toHaveTextContent('Beat 2/');
      await press(' ');
      expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    } finally { vi.useRealTimers(); }
  });

  it('?hide=1 hides the controller but keyboard control still works', async () => {
    const { router } = renderAt('/demo?hide=1', { signedIn: false });
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(screen.queryByTestId('demo-controller')).not.toBeInTheDocument();
    await press('ArrowRight');
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'));
  });

  it('does nothing when no demo is active', async () => {
    const { router } = renderAt('/dashboard');
    await dataReady();
    await press('ArrowRight');
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('signed-in beat pages show the prototype badge', async () => {
    const { router } = renderAt('/demo', { signedIn: false });
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    for (const target of [1, 4, 8]) {
      while (Number(screen.getByTestId('demo-beat').textContent!.match(/Beat (\d+)/)![1]) - 1 < target) await press('ArrowRight');
      await waitFor(() => expect(router.state.location.pathname).toBe(BEATS[target].path.split('?')[0]));
      await dataReady();
      expect(screen.getByTestId('prototype-badge')).toBeInTheDocument();
    }
  });
});
