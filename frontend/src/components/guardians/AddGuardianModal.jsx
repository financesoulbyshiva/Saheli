import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { User, Heart, Shield } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';

/**
 * AddGuardianModal Component
 * Simple modal to add a trusted contact to the local network.
 */
export function AddGuardianModal({ isOpen, onClose }) {
  const { addGuardian } = useSafety();

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [priority, setPriority] = useState('Secondary');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addGuardian({
      name,
      relationship,
      priority,
      phone: phone.trim() || '+91 98000 12345',
    });

    setName('');
    setRelationship('Friend');
    setPriority('Secondary');
    setPhone('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Trusted Guardian"
      size="sm"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="label-text" htmlFor="guardian-name">
            Contact Name *
          </label>
          <div className="input-with-icon">
            <User size={16} className="input-icon" />
            <input
              id="guardian-name"
              type="text"
              className="saheli-input"
              placeholder="e.g. Sister, Roommate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label-text" htmlFor="guardian-relationship">
            Relationship
          </label>
          <div className="input-with-icon">
            <Heart size={16} className="input-icon" />
            <select
              id="guardian-relationship"
              className="saheli-input saheli-select"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            >
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Sister">Sister</option>
              <option value="Brother">Brother</option>
              <option value="Friend">Friend</option>
              <option value="Colleague">Colleague</option>
              <option value="Campus Warden">Campus Warden</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="label-text" htmlFor="guardian-priority">
            Priority Tier
          </label>
          <div className="input-with-icon">
            <Shield size={16} className="input-icon" />
            <select
              id="guardian-priority"
              className="saheli-input saheli-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Secondary">Secondary Guardian</option>
              <option value="Primary">Primary Guardian (First Alert Contact)</option>
            </select>
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
            Primary guardian receives first alert priority.
          </span>
        </div>

        <div className="form-group">
          <label className="label-text" htmlFor="guardian-phone">
            Phone Number
          </label>
          <input
            id="guardian-phone"
            type="text"
            className="saheli-input"
            style={{ paddingLeft: '12px' }}
            placeholder="e.g. +91 98765 00000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            Save Guardian
          </Button>
        </div>
      </form>
    </Modal>
  );
}
