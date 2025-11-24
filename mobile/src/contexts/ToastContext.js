import React, { createContext, useState, useContext } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
    position: 'top'
  });

  const showToast = ({ message, type = 'info', duration = 3000, position = 'top', icon }) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
      position,
      icon
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Convenience methods
  const success = (message, duration) => {
    showToast({ message, type: 'success', duration });
  };

  const error = (message, duration) => {
    showToast({ message, type: 'error', duration });
  };

  const warning = (message, duration) => {
    showToast({ message, type: 'warning', duration });
  };

  const info = (message, duration) => {
    showToast({ message, type: 'info', duration });
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, success, error, warning, info }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        position={toast.position}
        icon={toast.icon}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};
