import { Modal } from './Modal';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isPending?: boolean;
  variant?: 'danger' | 'primary';
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Emin misiniz?',
  message,
  confirmLabel,
  cancelLabel = 'Vazgeç',
  isPending = false,
  variant = 'danger',
}: ConfirmModalProps) {
  const handleClose = () => {
    if (!isPending) {
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <p className="mb-6 leading-relaxed text-muted">{message}</p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className={
            variant === 'danger'
              ? 'flex-1 rounded-full border border-red-200 bg-transparent px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60'
              : 'btn-primary flex-1'
          }
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={handleClose}
          disabled={isPending}
          className="btn-secondary flex-1"
        >
          {cancelLabel}
        </button>
      </div>
    </Modal>
  );
}
