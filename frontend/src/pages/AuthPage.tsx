import { useState } from 'react';
import { useLogin } from '../hooks/auth/useLogin';
import { useRegister } from '../hooks/auth/useRegister';
import type { AxiosError } from 'axios';
import type { ApiError } from '../types/common.types';
import { useLanguageStore } from '../stores/useLanguageStore';
import { translations } from '../i18n/translations';

type Tab = 'login' | 'register';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export function AuthPage() {
  const language = useLanguageStore((s) => s.language);
  const t = translations[language];

  const [tab, setTab] = useState<Tab>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({ email: '', password: '' });

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regErrors, setRegErrors] = useState({ name: '', email: '', password: '' });
  const [duplicateEmailError, setDuplicateEmailError] = useState('');

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  function validateEmail(value: string): string {
    if (!value) return t.auth.emailRequired;
    if (!EMAIL_REGEX.test(value)) return t.auth.emailInvalid;
    return '';
  }

  function validatePassword(value: string): string {
    if (!value) return t.auth.passwordRequired;
    if (!PASSWORD_REGEX.test(value)) return t.auth.passwordInvalid;
    return '';
  }

  function validateName(value: string): string {
    if (!value.trim()) return t.auth.nameRequired;
    if (value.trim().length > 50) return t.auth.nameTooLong;
    return '';
  }

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailErr = validateEmail(loginEmail);
    const passwordErr = validatePassword(loginPassword);
    setLoginErrors({ email: emailErr, password: passwordErr });
    if (emailErr || passwordErr) return;
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  }

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDuplicateEmailError('');
    const nameErr = validateName(regName);
    const emailErr = validateEmail(regEmail);
    const passwordErr = validatePassword(regPassword);
    setRegErrors({ name: nameErr, email: emailErr, password: passwordErr });
    if (nameErr || emailErr || passwordErr) return;

    registerMutation.mutate(
      { name: regName.trim(), email: regEmail, password: regPassword },
      {
        onError: (error: unknown) => {
          const axiosError = error as AxiosError<ApiError>;
          const code = axiosError.response?.data?.error?.code;
          if (code === 'DUPLICATE_EMAIL') {
            setDuplicateEmailError(t.auth.duplicateEmail);
          }
        },
      },
    );
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--color-bg-body-start) 0%, var(--color-bg-body-end) 100%)',
    padding: 'var(--space-4)',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxWidth: '400px',
    padding: 'var(--space-8)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-bold)' as React.CSSProperties['fontWeight'],
    color: 'var(--color-primary)',
    textAlign: 'center',
    marginBottom: 'var(--space-6)',
  };

  const tabContainerStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid var(--color-border)',
    marginBottom: 'var(--space-6)',
  };

  function tabStyle(active: boolean): React.CSSProperties {
    return {
      flex: 1,
      padding: 'var(--space-3) 0',
      background: 'none',
      border: 'none',
      borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
      color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
      fontWeight: active
        ? ('var(--font-weight-semibold)' as React.CSSProperties['fontWeight'])
        : ('var(--font-weight-regular)' as React.CSSProperties['fontWeight']),
      fontSize: 'var(--font-size-md)',
      cursor: 'pointer',
      marginBottom: '-1px',
      transition: 'all var(--duration-fast)',
    };
  }

  const fieldStyle: React.CSSProperties = {
    marginBottom: 'var(--space-4)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-1)',
  };

  function inputStyle(hasError: boolean): React.CSSProperties {
    return {
      width: '100%',
      border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--space-2) var(--space-3)',
      fontSize: 'var(--font-size-md)',
      outline: 'none',
      boxSizing: 'border-box',
      background: 'var(--color-bg-panel)',
      color: 'var(--color-text-primary)',
    };
  }

  const errorTextStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-error)',
    marginTop: 'var(--space-1)',
  };

  const submitBtnStyle: React.CSSProperties = {
    background: 'var(--color-primary)',
    color: 'white',
    width: '100%',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-md)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    border: 'none',
    marginTop: 'var(--space-2)',
    cursor: 'pointer',
  };

  const linkTextStyle: React.CSSProperties = {
    textAlign: 'center',
    marginTop: 'var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  };

  const linkBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>{t.auth.title}</h1>
        <div style={tabContainerStyle}>
          <button
            style={tabStyle(tab === 'login')}
            onClick={() => setTab('login')}
            type="button"
            aria-label={t.auth.loginTab}
          >
            {t.auth.loginTab}
          </button>
          <button
            style={tabStyle(tab === 'register')}
            onClick={() => setTab('register')}
            type="button"
            aria-label={t.auth.registerTab}
          >
            {t.auth.registerTab}
          </button>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} noValidate>
            <div style={fieldStyle}>
              <label htmlFor="login-email" style={labelStyle}>{t.auth.email}</label>
              <input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={inputStyle(!!loginErrors.email)}
                placeholder={t.auth.emailPlaceholder}
                autoComplete="email"
              />
              {loginErrors.email && (
                <p style={errorTextStyle} role="alert">{loginErrors.email}</p>
              )}
            </div>
            <div style={fieldStyle}>
              <label htmlFor="login-password" style={labelStyle}>{t.auth.password}</label>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={inputStyle(!!loginErrors.password)}
                placeholder={t.auth.passwordPlaceholder}
                autoComplete="current-password"
              />
              {loginErrors.password && (
                <p style={errorTextStyle} role="alert">{loginErrors.password}</p>
              )}
            </div>
            <button
              type="submit"
              style={submitBtnStyle}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? t.auth.loginPending : t.auth.loginBtn}
            </button>
            <p style={linkTextStyle}>
              {t.auth.noAccount}{' '}
              <button
                type="button"
                style={linkBtnStyle}
                onClick={() => setTab('register')}
              >
                {t.auth.registerTab}
              </button>
            </p>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} noValidate>
            <div style={fieldStyle}>
              <label htmlFor="reg-name" style={labelStyle}>{t.auth.name}</label>
              <input
                id="reg-name"
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                style={inputStyle(!!regErrors.name)}
                placeholder={t.auth.namePlaceholder}
                autoComplete="name"
              />
              {regErrors.name && (
                <p style={errorTextStyle} role="alert">{regErrors.name}</p>
              )}
            </div>
            <div style={fieldStyle}>
              <label htmlFor="reg-email" style={labelStyle}>{t.auth.email}</label>
              <input
                id="reg-email"
                type="email"
                value={regEmail}
                onChange={(e) => {
                  setRegEmail(e.target.value);
                  setDuplicateEmailError('');
                }}
                style={inputStyle(!!regErrors.email || !!duplicateEmailError)}
                placeholder={t.auth.emailPlaceholder}
                autoComplete="email"
              />
              {regErrors.email && (
                <p style={errorTextStyle} role="alert">{regErrors.email}</p>
              )}
              {!regErrors.email && duplicateEmailError && (
                <p style={errorTextStyle} role="alert">{duplicateEmailError}</p>
              )}
            </div>
            <div style={fieldStyle}>
              <label htmlFor="reg-password" style={labelStyle}>{t.auth.password}</label>
              <input
                id="reg-password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                style={inputStyle(!!regErrors.password)}
                placeholder={t.auth.passwordHint}
                autoComplete="new-password"
              />
              {regErrors.password && (
                <p style={errorTextStyle} role="alert">{regErrors.password}</p>
              )}
            </div>
            <button
              type="submit"
              style={submitBtnStyle}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? t.auth.registerPending : t.auth.registerBtn}
            </button>
            <p style={linkTextStyle}>
              {t.auth.hasAccount}{' '}
              <button
                type="button"
                style={linkBtnStyle}
                onClick={() => setTab('login')}
              >
                {t.auth.loginTab}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
