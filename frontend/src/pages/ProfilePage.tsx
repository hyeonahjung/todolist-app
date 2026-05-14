import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMe } from '../hooks/user/useMe';
import { useUpdateMe } from '../hooks/user/useUpdateMe';
import { useDeleteMe } from '../hooks/user/useDeleteMe';
import { Modal } from '../components/common/Modal';

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,64}$/;

function validateName(value: string): string {
  if (!value.trim()) return '이름을 입력해주세요.';
  if (value.trim().length > 50) return '이름은 50자 이하여야 합니다.';
  return '';
}

function validateNewPassword(value: string): string {
  if (!value) return '';
  if (!PASSWORD_REGEX.test(value))
    return '비밀번호는 8자 이상, 영문자와 숫자를 각 1자 이상 포함해야 합니다.';
  return '';
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useMe();

  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const updateMutation = useUpdateMe({
    onInvalidPassword: () => {
      setCurrentPasswordError('현재 비밀번호가 올바르지 않습니다.');
    },
  });

  const deleteMutation = useDeleteMe();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPasswordError('');

    const nameErr = validateName(name);
    const newPwErr = validateNewPassword(newPassword);
    setNameError(nameErr);
    setNewPasswordError(newPwErr);

    if (nameErr || newPwErr) return;

    const isChangingPassword = currentPassword !== '' && newPassword !== '';
    if (newPassword && !currentPassword) {
      setCurrentPasswordError('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (currentPassword && !newPassword) {
      setNewPasswordError('새 비밀번호를 입력해주세요.');
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      ...(isChangingPassword ? { currentPassword, newPassword } : {}),
    });
  }

  function handleCancel() {
    navigate(-1);
  }

  function handleDeleteConfirm() {
    if (!deletePassword) return;
    deleteMutation.mutate({ password: deletePassword });
  }

  function handleDeleteDialogClose() {
    setDeleteDialogOpen(false);
    setDeletePassword('');
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    padding: 'var(--space-8) var(--space-4)',
    background: 'var(--color-bg)',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    padding: 'var(--space-8)',
    width: '100%',
    maxWidth: '480px',
    alignSelf: 'flex-start',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-bold)' as React.CSSProperties['fontWeight'],
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-6)',
  };

  const dividerStyle: React.CSSProperties = {
    border: 'none',
    borderTop: '1px solid var(--color-border)',
    margin: 'var(--space-6) 0',
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)' as React.CSSProperties['fontWeight'],
    color: 'var(--color-text-secondary)',
    textAlign: 'center' as React.CSSProperties['textAlign'],
    marginBottom: 'var(--space-4)',
  };

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

  const hintStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-secondary)',
    marginTop: 'var(--space-1)',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-error)',
    marginTop: 'var(--space-1)',
  };

  function inputStyle(hasError: boolean, readOnly?: boolean): React.CSSProperties {
    return {
      width: '100%',
      border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--space-2) var(--space-3)',
      fontSize: 'var(--font-size-md)',
      outline: 'none',
      boxSizing: 'border-box',
      background: readOnly ? 'var(--color-bg-subtle, #f5f5f5)' : undefined,
      color: readOnly ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
      cursor: readOnly ? 'default' : undefined,
    };
  }

  const noteStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-bg-subtle, #f9f9f9)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--space-3)',
    marginTop: 'var(--space-6)',
  };

  const cancelBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-5)',
    fontSize: 'var(--font-size-md)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  };

  const saveBtnStyle: React.CSSProperties = {
    background: 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-5)',
    fontSize: 'var(--font-size-md)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    cursor: 'pointer',
  };

  const dangerZoneStyle: React.CSSProperties = {
    border: '1px solid var(--color-error)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'var(--space-6)',
  };

  const deleteBtnStyle: React.CSSProperties = {
    background: 'var(--color-error)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-5)',
    fontSize: 'var(--font-size-md)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    cursor: 'pointer',
  };

  const dialogWarningStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-error)',
    background: 'rgba(229, 57, 53, 0.08)',
    border: '1px solid rgba(229, 57, 53, 0.2)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
  };

  const dialogLabelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--space-1)',
  };

  const dialogActionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--space-3)',
    marginTop: 'var(--space-4)',
  };

  const dialogCancelBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  };

  const dialogConfirmBtnStyle: React.CSSProperties = {
    background: 'var(--color-error)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    cursor: 'pointer',
  };

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={{ color: 'var(--color-text-secondary)' }}>불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>개인정보 수정</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div style={fieldStyle}>
            <label htmlFor="profile-name" style={labelStyle}>
              이름 (name) <span style={{ color: 'var(--color-error)' }}>*필수</span>
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError('');
              }}
              style={inputStyle(!!nameError)}
              maxLength={50}
            />
            {nameError ? (
              <p style={errorStyle} role="alert">{nameError}</p>
            ) : (
              <p style={hintStyle}>최소 1자, 최대 50자</p>
            )}
          </div>

          <div style={fieldStyle}>
            <label htmlFor="profile-email" style={labelStyle}>이메일 (email)</label>
            <input
              id="profile-email"
              type="email"
              value={user?.email ?? ''}
              readOnly
              style={inputStyle(false, true)}
            />
          </div>

          <hr style={dividerStyle} />

          <p style={sectionLabelStyle}>--- 비밀번호 변경 (선택사항) ---</p>

          <div style={fieldStyle}>
            <label htmlFor="profile-current-password" style={labelStyle}>현재 비밀번호</label>
            <input
              id="profile-current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setCurrentPasswordError('');
              }}
              style={inputStyle(!!currentPasswordError)}
              autoComplete="current-password"
            />
            {currentPasswordError && (
              <p style={errorStyle} role="alert">{currentPasswordError}</p>
            )}
          </div>

          <div style={fieldStyle}>
            <label htmlFor="profile-new-password" style={labelStyle}>새 비밀번호</label>
            <input
              id="profile-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setNewPasswordError('');
              }}
              style={inputStyle(!!newPasswordError)}
              autoComplete="new-password"
            />
            {newPasswordError ? (
              <p style={errorStyle} role="alert">{newPasswordError}</p>
            ) : (
              <p style={hintStyle}>영문자·숫자 각 1자 이상, 8~64자</p>
            )}
          </div>

          <p style={noteStyle}>
            ※ 비밀번호 변경을 원하지 않으면 비워두세요.
          </p>

          <div style={actionsStyle}>
            <button type="button" style={cancelBtnStyle} onClick={handleCancel}>
              취소
            </button>
            <button type="submit" style={saveBtnStyle} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>

        <div style={dangerZoneStyle}>
          <button
            type="button"
            style={deleteBtnStyle}
            onClick={() => setDeleteDialogOpen(true)}
          >
            회원 탈퇴
          </button>
        </div>
      </div>

      <Modal isOpen={deleteDialogOpen} onClose={handleDeleteDialogClose} title="회원 탈퇴">
        <p style={dialogWarningStyle}>
          주의: 탈퇴 시 내 계정, 카테고리, 할일이 즉시 삭제되며 복구할 수 없습니다.
        </p>
        <label htmlFor="delete-password" style={dialogLabelStyle}>
          비밀번호를 입력하세요:
        </label>
        <input
          id="delete-password"
          type="password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          style={inputStyle(false)}
          autoComplete="current-password"
        />
        <div style={dialogActionsStyle}>
          <button type="button" style={dialogCancelBtnStyle} onClick={handleDeleteDialogClose}>
            취소
          </button>
          <button
            type="button"
            style={dialogConfirmBtnStyle}
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? '처리 중...' : '탈퇴 확인'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
