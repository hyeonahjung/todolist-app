import { useState } from 'react';
import { useLogin } from '../hooks/auth/useLogin';
import { useRegister } from '../hooks/auth/useRegister';
import type { AxiosError } from 'axios';
import type { ApiError } from '../types/common.types';

type Tab = 'login' | 'register';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

function validateEmail(value: string): string {
  if (!value) return '이메일을 입력해주세요.';
  if (!EMAIL_REGEX.test(value)) return '올바른 이메일 형식이 아닙니다.';
  return '';
}

function validatePassword(value: string): string {
  if (!value) return '비밀번호를 입력해주세요.';
  if (!PASSWORD_REGEX.test(value))
    return '비밀번호는 8자 이상, 영문자와 숫자를 각 1자 이상 포함해야 합니다.';
  return '';
}

function validateName(value: string): string {
  if (!value.trim()) return '이름을 입력해주세요.';
  if (value.trim().length > 50) return '이름은 50자 이하여야 합니다.';
  return '';
}

export function AuthPage() {
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
            setDuplicateEmailError('이미 사용 중인 이메일입니다.');
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
    background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
    padding: 'var(--space-4)',
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
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
        <h1 style={titleStyle}>TodoListApp</h1>
        <div style={tabContainerStyle}>
          <button
            style={tabStyle(tab === 'login')}
            onClick={() => setTab('login')}
            type="button"
            aria-label="로그인 탭"
          >
            로그인
          </button>
          <button
            style={tabStyle(tab === 'register')}
            onClick={() => setTab('register')}
            type="button"
            aria-label="회원가입 탭"
          >
            회원가입
          </button>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} noValidate>
            <div style={fieldStyle}>
              <label htmlFor="login-email" style={labelStyle}>이메일</label>
              <input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={inputStyle(!!loginErrors.email)}
                placeholder="이메일을 입력하세요"
                autoComplete="email"
              />
              {loginErrors.email && (
                <p style={errorTextStyle} role="alert">{loginErrors.email}</p>
              )}
            </div>
            <div style={fieldStyle}>
              <label htmlFor="login-password" style={labelStyle}>비밀번호</label>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={inputStyle(!!loginErrors.password)}
                placeholder="비밀번호를 입력하세요"
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
              {loginMutation.isPending ? '로그인 중...' : '로그인'}
            </button>
            <p style={linkTextStyle}>
              계정이 없으신가요?{' '}
              <button
                type="button"
                style={linkBtnStyle}
                onClick={() => setTab('register')}
              >
                회원가입
              </button>
            </p>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} noValidate>
            <div style={fieldStyle}>
              <label htmlFor="reg-name" style={labelStyle}>이름</label>
              <input
                id="reg-name"
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                style={inputStyle(!!regErrors.name)}
                placeholder="이름을 입력하세요"
                autoComplete="name"
              />
              {regErrors.name && (
                <p style={errorTextStyle} role="alert">{regErrors.name}</p>
              )}
            </div>
            <div style={fieldStyle}>
              <label htmlFor="reg-email" style={labelStyle}>이메일</label>
              <input
                id="reg-email"
                type="email"
                value={regEmail}
                onChange={(e) => {
                  setRegEmail(e.target.value);
                  setDuplicateEmailError('');
                }}
                style={inputStyle(!!regErrors.email || !!duplicateEmailError)}
                placeholder="이메일을 입력하세요"
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
              <label htmlFor="reg-password" style={labelStyle}>비밀번호</label>
              <input
                id="reg-password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                style={inputStyle(!!regErrors.password)}
                placeholder="8자 이상, 영문자·숫자 포함"
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
              {registerMutation.isPending ? '처리 중...' : '가입하기'}
            </button>
            <p style={linkTextStyle}>
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                style={linkBtnStyle}
                onClick={() => setTab('login')}
              >
                로그인
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
