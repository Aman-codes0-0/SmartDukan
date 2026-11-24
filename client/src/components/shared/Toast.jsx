import { useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

let setToastsGlobal = null;

export const toast = {
  success: (msg) => addToast('success', msg),
  error: (msg) => addToast('error', msg),
  info: (msg) => addToast('info', msg),
};

const addToast = (type, message) => {
  const id = Date.now();
  const newToast = { id, type, message };
  if (setToastsGlobal) {
    setToastsGlobal((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToastsGlobal((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }
};

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 size={18} className="toast-icon" />;
    case 'error':
      return <AlertCircle size={18} className="toast-icon" />;
    default:
      return <Info size={18} className="toast-icon" />;
  }
};

export const ToastContainer = () => {
  const [toastList, setToastList] = useState([]);
  setToastsGlobal = setToastList;

  return (
    <div className="toast-container">
      {toastList.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon-wrap">{getIcon(t.type)}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
