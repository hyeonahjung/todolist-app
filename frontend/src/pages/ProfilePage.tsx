import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMe } from '../hooks/user/useMe';
import { useUpdateMe } from '../hooks/user/useUpdateMe';
import { useDeleteMe } from '../hooks/user/useDeleteMe';
import { Modal } from '../components/common/Modal';
import { useLanguageStore } from '../stores/useLanguageStore';
import { translations } from '../i18n/translations';

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,64}$/;

export function ProfilePage() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useMe();
  const language = useLanguageStore((s) => s.language);
  const t = translations[language];

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
      setCurrentPasswordError(t.profile.currentPasswordInvalid);
    },
  });

  const deleteMutation = useDeleteMe();

  function validateName(value: string): string {
    if (!value.trim()) return t.profile.nameRequiredError;
    if (value.trim().length > 50) return t.profile.nameTooLong;
    return '';
  }

  function validateNewPassword(value: string): string {
    if (!value) return '';
    if (!PASSWORD_REGEX.test(value)) return t.profile.newPasswordInvalid;
    return '';
  }

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
      setCurrentPasswordError(t.profile.currentPasswordRequired);
      return;
    }
    if (currentPassword && !newPassword) {
      setNewPasswordError(t.profile.newPasswordRequired);
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
          <p style={{ color: 'var(--color-text-secondary)' }}>{t.profile.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>{t.profile.pageTitle}</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div style={fieldStyle}>
            <label htmlFor="profile-name" style={labelStyle}>
              {t.profile.nameLabel} <span style={{ color: 'var(--color-error)' }}>{t.profile.nameRequired}</span>
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
              <p style={hintStyle}>{t.profile.nameHint}</p>
            )}
          </div>

          <div style={fieldStyle}>
            <label htmlFor="profile-email" style={labelStyle}>{t.profile.emailLabel}</label>
            <input
              id="profile-email"
              type="email"
              value={user?.email ?? ''}
              readOnly
              style={inputStyle(false, true)}
            />
          </div>

          <hr style={dividerStyle} />

          <p style={sectionLabelStyle}>{t.profile.passwordSection}</p>

          <div style={fieldStyle}>
            <label htmlFor="profile-current-password" style={labelStyle}>{t.profile.currentPasswordLabel}</label>
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
            <label htmlFor="profile-new-password" style={labelStyle}>{t.profile.newPasswordLabel}</label>
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
              <p style={hintStyle}>{t.profile.newPasswordHint}</p>
            )}
          </div>

          <p style={noteStyle}>{t.profile.passwordNote}</p>

          <div style={actionsStyle}>
            <button type="button" style={cancelBtnStyle} onClick={handleCancel}>
              {t.profile.cancel}
            </button>
            <button type="submit" style={saveBtnStyle} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t.profile.saving : t.profile.save}
            </button>
          </div>
        </form>

        <div style={dangerZoneStyle}>
          <button
            type="button"
            style={deleteBtnStyle}
            onClick={() => setDeleteDialogOpen(true)}
          >
            {t.profile.deleteAccount}
          </button>
        </div>
      </div>

      <Modal isOpen={deleteDialogOpen} onClose={handleDeleteDialogClose} title={t.profile.deleteModalTitle}>
        <p style={dialogWarningStyle}>{t.profile.deleteWarning}</p>
        <label htmlFor="delete-password" style={dialogLabelStyle}>
          {t.profile.deletePasswordLabel}
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
            {t.profile.deleteCancel}
          </button>
          <button
            type="button"
            style={dialogConfirmBtnStyle}
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? t.profile.deletePending : t.profile.deleteConfirm}
          </button>
        </div>
      </Modal>
    </div>
  );
}
