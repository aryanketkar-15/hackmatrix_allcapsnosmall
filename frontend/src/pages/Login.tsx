import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lightbulb, Network, ScanSearch, ShieldAlert, Waypoints } from 'lucide-react';
import { Button, Logo, PrototypeBadge, useToast } from '../components/ui';
import { getRememberedUsername, useAuth } from '../auth/AuthContext';
import { safeNext } from '../auth/ProtectedRoute';

const FEATURES = [
  { icon: ShieldAlert, label: 'Detect Insider Risk' },
  { icon: Waypoints, label: 'Trace Money Flows' },
  { icon: Lightbulb, label: 'Explain Every Alert' },
  { icon: ScanSearch, label: 'Empower Investigators' },
];

/** Inline SVG skyline (no hotlinked photo, deviation C16). */
function Skyline() {
  return (
    <svg viewBox="0 0 600 220" className="absolute bottom-0 left-0 w-full opacity-90" aria-hidden preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="sk" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#93c5fd" stopOpacity="0.9" />
          <stop offset="1" stopColor="#dbeafe" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <g fill="url(#sk)">
        <rect x="20" y="120" width="60" height="100" /><rect x="90" y="90" width="50" height="130" />
        <rect x="150" y="60" width="120" height="160" /><rect x="280" y="100" width="70" height="120" />
        <rect x="360" y="70" width="60" height="150" /><rect x="430" y="110" width="80" height="110" />
        <rect x="520" y="130" width="60" height="90" />
      </g>
      <g fill="#ffffff" opacity="0.55">
        {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 8 }).map((__, c) => (
          <rect key={`${r}-${c}`} x={158 + c * 14} y={72 + r * 22} width="7" height="10" />
        )))}
      </g>
      <text x="210" y="50" fontSize="14" fontWeight="700" fill="#1d4ed8" textAnchor="middle" letterSpacing="3">BANK</text>
    </svg>
  );
}

export default function Login() {
  const { user, signIn } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [username, setUsername] = useState(getRememberedUsername());
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(getRememberedUsername() !== '');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; form?: string }>({});

  const next = safeNext(params.get('next'));
  if (user) return <Navigate to={next} replace />;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!username.trim()) errs.username = 'Enter your username';
    if (!password) errs.password = 'Enter your password';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!signIn(username, password, remember)) {
      setErrors({ form: 'Invalid username or password' });
      return;
    }
    navigate(next, { replace: true });
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-page lg:grid-cols-[1.15fr_1fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 p-12 lg:block">
        <Logo size="lg" />
        <h1 className="mt-6 max-w-sm text-2xl font-semibold leading-snug text-ink">Uncovering the Real Story Behind Every Transaction</h1>
        <p className="mt-2 text-sm text-muted">Linking People · Actions · Money</p>
        <Skyline />
        <div className="absolute inset-x-12 bottom-24 grid grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-white text-primary shadow-sm"><Icon size={20} /></span>
              <span className="text-[11px] font-medium text-ink">{label}</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-5 text-center text-[11px] text-muted">
          <p className="font-medium text-ink">A Comprehensive Financial Crime Investigation Platform</p>
          <p>Evidence-backed · Explainable · Investigator-Focused</p>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center p-6">
        <div className="lg:hidden mb-6"><Logo size="lg" /></div>
        <form onSubmit={onSubmit} noValidate className="w-full max-w-sm rounded-xl border border-line bg-surface p-8 shadow-sm" aria-label="Sign in">
          <h2 className="text-xl font-semibold">Welcome to KHOJI</h2>
          <p className="mb-6 mt-1 text-xs text-muted">Sign in to your account</p>

          <label htmlFor="username" className="mb-1 block text-xs font-medium">Username</label>
          <input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username" aria-invalid={errors.username ? true : undefined}
            className="mb-1 h-10 w-full rounded-md border border-line px-3 text-sm" />
          {errors.username ? <p role="alert" className="mb-2 text-xs text-risk-high">{errors.username}</p> : <div className="mb-3" />}

          <label htmlFor="password" className="mb-1 block text-xs font-medium">Password</label>
          <div className="relative">
            <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
              aria-invalid={errors.password ? true : undefined} className="h-10 w-full rounded-md border border-line px-3 pr-10 text-sm" />
            <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password ? <p role="alert" className="mt-1 text-xs text-risk-high">{errors.password}</p> : null}

          <div className="my-4 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
            <button type="button" className="text-primary hover:underline" onClick={() => push('Not available in the prototype', 'info')}>Forgot password?</button>
          </div>
          {errors.form ? <p role="alert" className="mb-3 rounded bg-red-50 px-3 py-2 text-xs text-risk-high">{errors.form}</p> : null}
          <Button type="submit" className="h-10 w-full">Sign In</Button>
        </form>
        <div className="mt-5 flex flex-col items-center gap-1.5 text-[11px] text-muted">
          <PrototypeBadge />
          <p className="flex items-center gap-1"><Network size={11} aria-hidden /> Demo sign-in is a UI gate only (not security).</p>
        </div>
      </section>
    </div>
  );
}
