import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Navigation, Clock, User, MapPin } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';

/**
 * SafeWalkSetup Component
 * Compact journey configuration interface.
 * Fields: From, To, Expected arrival, Guardian.
 */
export function SafeWalkSetup({ onCancel = null, className = '' }) {
  const { startSafeWalk, guardians, locationStatus } = useSafety();

  const primaryName = guardians.find((g) => g.isPrimary || g.priority === 'Primary')?.name || guardians[0]?.name || 'Primary Contact';

  const defaultEta = () => {
    const etaDate = new Date(Date.now() + 30 * 60000);
    return etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const [from, setFrom] = useState(locationStatus?.coords ? 'Current GPS Location' : 'Starting Point');
  const [to, setTo] = useState('Home');
  const [expectedArrival, setExpectedArrival] = useState(defaultEta());
  const [guardianName, setGuardianName] = useState(primaryName);

  const handleSubmit = (e) => {
    e.preventDefault();
    startSafeWalk({ from, to, expectedArrival, guardianName });
  };

  return (
    <Card className={`saheli-safewalk-setup ${className}`}>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-brand-subtle)',
              color: 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Navigation size={20} />
          </div>
          <div>
            <CardTitle>Start SafeWalk Session</CardTitle>
            <CardDescription>Setup companion journey monitoring with automated check-ins.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="label-text" htmlFor="safewalk-from">
              From (Starting Point)
            </label>
            <div className="input-with-icon">
              <MapPin size={16} className="input-icon" />
              <input
                id="safewalk-from"
                type="text"
                className="saheli-input"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label-text" htmlFor="safewalk-to">
              To (Destination)
            </label>
            <div className="input-with-icon">
              <Navigation size={16} className="input-icon" />
              <input
                id="safewalk-to"
                type="text"
                className="saheli-input"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label-text" htmlFor="safewalk-arrival">
                Expected Arrival
              </label>
              <div className="input-with-icon">
                <Clock size={16} className="input-icon" />
                <input
                  id="safewalk-arrival"
                  type="text"
                  className="saheli-input"
                  value={expectedArrival}
                  onChange={(e) => setExpectedArrival(e.target.value)}
                  placeholder="e.g. 7:30 PM"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label-text" htmlFor="safewalk-guardian">
                Primary Guardian
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <select
                  id="safewalk-guardian"
                  className="saheli-input saheli-select"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                >
                  {guardians.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name} ({g.relationship})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            {onCancel && (
              <Button variant="ghost" size="md" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              icon={<Navigation size={18} />}
            >
              Start SafeWalk
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
