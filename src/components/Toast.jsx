import { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, Lock } from 'lucide-react';
import './Toast.css';

function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    // Auto close after 3 seconds
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    info: <Info size={20} />,
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <Lock size={20} />,
  };

  return (
    <div className={`toast toast-${type}`} onClick={onClose}>
      <div className="toast-icon">
        {icons[type]}
      </div>
      <div className="toast-message">
        {message}
      </div>
    </div>
  );
}

export default Toast;

