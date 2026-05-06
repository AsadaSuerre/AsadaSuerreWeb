import React from 'react';
import { DialogProvider, useDialog } from '../../context/DialogContext';
import FullScreenDialog from './FullScreenDialog';

const GlobalDialogContent: React.FC = () => {
  const { isOpen, dialogConfig, closeDialog } = useDialog();

  if (!dialogConfig) return null;

  return (
    <FullScreenDialog
      open={isOpen}
      onClose={closeDialog}
      title={dialogConfig.title}
      actions={dialogConfig.actions}
      maxWidth={dialogConfig.maxWidth}
      fullWidth={dialogConfig.fullWidth}
      image={dialogConfig.image}
      icon={dialogConfig.icon}
    >
      {dialogConfig.content}
    </FullScreenDialog>
  );
};

interface GlobalDialogProps {
  children: React.ReactNode;
}

const GlobalDialog: React.FC<GlobalDialogProps> = ({ children }) => {
  return (
    <DialogProvider>
      {children}
      <GlobalDialogContent />
    </DialogProvider>
  );
};

export default GlobalDialog;
