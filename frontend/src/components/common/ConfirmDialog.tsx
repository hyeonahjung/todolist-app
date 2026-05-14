import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'default',
}: ConfirmDialogProps) {
  const messageStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-md)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-6)',
    lineHeight: 'var(--line-height-normal)',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--space-3)',
  };

  const cancelBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  };

  const confirmBtnStyle: React.CSSProperties = {
    background: variant === 'danger' ? 'var(--color-error)' : 'var(--color-primary)',
    color: 'var(--color-text-on-primary)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={messageStyle}>{message}</p>
      <div style={actionsStyle}>
        <button style={cancelBtnStyle} onClick={onClose}>{cancelLabel}</button>
        <button style={confirmBtnStyle} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
