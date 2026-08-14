export type ModalType = 'confirm' | 'success' | 'warning' | 'error';

export interface ModalOptions {
  type: ModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const SHOW_MODAL_EVENT = 'SHOW_GLOBAL_MODAL';

export const confirmAction = (
  title: string,
  message: string,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
): Promise<boolean> => {
  return new Promise((resolve) => {
    const event = new CustomEvent(SHOW_MODAL_EVENT, {
      detail: {
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      } as ModalOptions,
    });
    window.dispatchEvent(event);
  });
};

export const showAlert = (
  type: 'success' | 'warning' | 'error',
  title: string,
  message: string,
  confirmText = 'OK'
): Promise<boolean> => {
  return new Promise((resolve) => {
    const event = new CustomEvent(SHOW_MODAL_EVENT, {
      detail: {
        type,
        title,
        message,
        confirmText,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(true), // alerts resolve true on close
      } as ModalOptions,
    });
    window.dispatchEvent(event);
  });
};
