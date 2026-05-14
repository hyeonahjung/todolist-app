import { useEffect } from 'react';
import { useToastStore } from '../../stores/useToastStore';
import type { ToastItem } from '../../stores/useToastStore';

function ToastNotification({ toast }: { toast: ToastItem }) {
  const removeToast = useToastStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const colorMap: Record<string, string> = {
    success: 'var(--color-success)',
    error: 'var(--color-error)',
    warning: 'var(--color-warning)',
  };

  const itemStyle: React.CSSProperties = {
    background: 'var(--color-bg-card)',
    border: `1px solid ${colorMap[toast.variant]}`,
    borderLeft: `4px solid ${colorMap[toast.variant]}`,
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-md)',
    padding: 'var(--space-3) var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-3)',
    minWidth: '240px',
    maxWidth: '360px',
  };

  const closeStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-md)',
    lineHeight: 1,
    flexShrink: 0,
    padding: 0,
  };

  return (
    <div style={itemStyle} role="alert">
      <span>{toast.message}</span>
      <button style={closeStyle} onClick={() => removeToast(toast.id)} aria-label="닫기">×</button>
    </div>
  );
}

export function Toast() {
  const toasts = useToastStore((s) => s.toasts);

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 'var(--space-6)',
    right: 'var(--space-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    zIndex: 300,
  };

  if (toasts.length === 0) return null;

  return (
    <div style={containerStyle}>
      {toasts.map((t) => (
        <ToastNotification key={t.id} toast={t} />
      ))}
    </div>
  );
}
