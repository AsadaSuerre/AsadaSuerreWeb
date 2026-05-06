import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DialogConfig {
  title?: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  image?: string;
  icon?: string;
}

interface DialogContextType {
  isOpen: boolean;
  dialogConfig: DialogConfig | null;
  openDialog: (config: DialogConfig) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

  const openDialog = (config: DialogConfig) => {
    setDialogConfig(config);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setDialogConfig(null);
  };

  return (
    <DialogContext.Provider value={{ isOpen, dialogConfig, openDialog, closeDialog }}>
      {children}
    </DialogContext.Provider>
  );
};

export default DialogProvider;
