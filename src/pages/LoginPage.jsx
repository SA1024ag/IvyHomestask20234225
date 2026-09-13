import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Zap,
  UserCheck
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    id: 1,
    name: 'Demo 1',
    email: 'demo1@ivy.homes',
    password: 'b42f2e3a58',
    role: 'Primary Tester'
  },
  {
    id: 2,
    name: 'Demo 2',
    email: 'demo2@ivy.homes',
    password: 'b42f2e3a58',
    role: 'Agent Persona'
  },
  {
    id: 3,
    name: 'Demo 3',
    email: 'demo3@ivy.homes',
    password: 'b42f2e3a58',
    role: 'Buyer Persona'
  }
];

export default function LoginPage() {
  const { user, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('demo1@ivy.homes');
  const [password, setPassword] = useState('b42f2e3a58');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeDemoId, setActiveDemoId] = useState(1);
  const [fillFeedback, setFillFeedback] = useState('');

  // Handle filling the form fields without submitting
  const handleFillForm = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setActiveDemoId(account.id);
    setErrorMessage('');
    setFillFeedback(`Filled credentials for ${account.name} (${account.email})`);
    setTimeout(() => setFillFeedback(''), 3000);
  };

  // Explicit instant login handler
  const handleDirectLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setActiveDemoId(account.id);
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(account.email, account.password);
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      background: 'radial-gradient(ellipse at 50% 0%, var(--accent-subtle) 0%, var(--bg-canvas) 70%)'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        
        {/* Already logged in notice banner (if user revisits /login) */}
        {isAuthenticated && user && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-subtle)',
            border: '1px solid var(--accent-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} color="var(--accent-primary)" />
              <div style={{ fontSize: '0.825rem', color: 'var(--accent-text)' }}>
                Active session: <strong>{user.email}</strong>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              Enter Home →
            </button>
          </div>
        )}

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 1.25rem',
            borderRadius: '16px',
            backgroundColor: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(67, 56, 202, 0.4)',
            transform: 'rotate(-2deg)'
          }}>
            <Building2 size={32} strokeWidth={2.2} />
          </div>

          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            color: 'var(--text-heading)',
            letterSpacing: '-0.03em',
            lineHeight: 1.2
          }}>
            Ivy<span style={{ color: 'var(--accent-primary)' }}>Homes</span> Portal
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.925rem',
            marginTop: '0.5rem'
          }}>
            Real Estate Discovery & Analytics Platform — Mumbai Region
          </p>
        </div>

        {/* Quick Demo Fill Grid */}
        <div className="ivy-card" style={{
          marginBottom: '1.5rem',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)' }}>
              <Zap size={16} color="var(--accent-primary)" />
              <span>Demo Accounts</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Click to fill form
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = activeDemoId === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => handleFillForm(acc)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface-subtle)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Click to fill form with ${acc.email}`}
                >
                  <div>
                    <div style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--accent-text)' : 'var(--text-heading)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>{acc.name}</span>
                      {isSelected && <CheckCircle2 size={12} color="var(--accent-primary)" />}
                    </div>
                    <div style={{
                      fontSize: '0.68rem',
                      color: isSelected ? 'var(--accent-text)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '2px'
                    }}>
                      {acc.email}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirectLogin(acc);
                    }}
                    disabled={isLoading}
                    style={{
                      marginTop: '6px',
                      padding: '3px 6px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface-hover)',
                      color: isSelected ? '#ffffff' : 'var(--text-body)',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      width: 'fit-content'
                    }}
                    title={`Instant 1-click sign in as ${acc.email}`}
                  >
                    <span>Instant In</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              );
            })}
          </div>

          {fillFeedback && (
            <div style={{
              marginTop: '0.65rem',
              fontSize: '0.75rem',
              color: 'var(--accent-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500
            }}>
              <CheckCircle2 size={13} color="var(--accent-primary)" />
              <span>{fillFeedback}</span>
            </div>
          )}
        </div>

        {/* Main Card Form */}
        <div className="ivy-card" style={{ padding: '2rem' }}>
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--status-amber-bg)',
              border: '1px solid var(--status-amber-border)',
              color: 'var(--status-amber-text)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <strong style={{ fontWeight: 700 }}>Authentication error: </strong>
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="email-input">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setActiveDemoId(null);
                  }}
                  placeholder="demo1@ivy.homes"
                  required
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label" htmlFor="password-input">
                  Demo Password
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  b42f2e3a58
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter demo password"
                  required
                  className="input-field"
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.95rem',
                marginTop: '0.5rem'
              }}
            >
              {isLoading ? (
                <>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Token Lifecycle Callout */}
        <div style={{
          marginTop: '1.5rem',
          padding: '0.9rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <ShieldCheck size={20} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>Automatic 30+ Min Session Renewal: </span>
            Tokens are safely persisted in localStorage and proactively refreshed via <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-text)' }}>/auth/refresh</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
