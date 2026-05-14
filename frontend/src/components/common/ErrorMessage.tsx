interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  const style: React.CSSProperties = {
    color: 'var(--color-error)',
    fontSize: 'var(--font-size-sm)',
    padding: 'var(--space-2) var(--space-3)',
    background: 'rgba(229, 57, 53, 0.08)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(229, 57, 53, 0.2)',
  };

  return <p style={style}>{message}</p>;
}
