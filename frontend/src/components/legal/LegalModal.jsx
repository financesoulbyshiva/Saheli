import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { LegalTrustCenter } from './LegalTrustCenter';

/**
 * LegalModal Component
 * Interactive modal dialog hosting the complete Privacy, Terms, Disclaimer,
 * and Cookie Information Center.
 */
export function LegalModal({ isOpen, onClose, initialTab = 'privacy' }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Safety, Legal & Privacy Center"
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="primary" size="md" onClick={onClose}>
            Close & Return
          </Button>
        </div>
      }
    >
      <div style={{ maxHeight: '76vh', overflowY: 'auto', paddingRight: '6px' }}>
        <LegalTrustCenter initialTab={initialTab} />
      </div>
    </Modal>
  );
}
