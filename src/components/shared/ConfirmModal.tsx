import { Modal } from './Modal';
import { Button } from './Button';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  title: string;
  body: string;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'danger';
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  body,
  confirmLabel,
  confirmVariant = 'danger',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal onClose={onCancel} variant={confirmVariant === 'danger' ? 'danger' : 'default'}>
      <h2 className="text-h1">{title}</h2>
      <p className={styles.body}>{body}</p>
      <div className={styles.actions}>
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </Modal>
  );
}
