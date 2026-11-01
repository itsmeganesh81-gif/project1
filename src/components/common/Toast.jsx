import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const icons = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
};

const colors = {
  success: { bg: '#d1fae5', border: '#a7f3d0', text: '#065f46', icon: '#10B981' },
  error: { bg: '#fee2e2', border: '#fecaca', text: '#991b1b', icon: '#EF4444' },
  info: { bg: '#dbeafe', border: '#bfdbfe', text: '#1e40af', icon: '#3B82F6' },
  warning: { bg: '#fef3c7', border: '#fde68a', text: '#92400e', icon: '#F59E0B' },
};

export default function Toast() {
  const { toast, dismissToast } = useApp();
  if (!toast) return null;

  const c = colors[toast.type] || colors.info;

  return (
    <div
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        minWidth: 280, maxWidth: 380,
        background: c.bg, border: `1px solid ${c.border}`, color: c.text,
        borderRadius: 12, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <span style={{ color: c.icon, flexShrink: 0 }}>{icons[toast.type]}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{toast.message}</span>
      <button onClick={dismissToast} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, opacity: 0.7, padding: 2 }}>
        <X size={16} />
      </button>
    </div>
  );
}
