import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, PhoneCall, Volume2, Mic, User, Shield, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * FakeCallModal Component
 * Discrete de-escalation tool designed to help women safely exit uncomfortable
 * situations (cabs, deserted streets, unwanted conversation).
 */
export function FakeCallModal({ isOpen, onClose }) {
  const [stage, setStage] = useState('setup'); // 'setup' | 'ringing' | 'connected'
  const [callerType, setCallerType] = useState('father');
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const timerRef = useRef(null);
  const durationRef = useRef(null);

  const callers = {
    father: {
      name: 'Papa (Home)',
      number: '+91 98111 22334',
      dialogues: [
        { caller: 'Beta, where have you reached? Dinner is ready on the table.', userPrompt: 'Yes Papa, I am just 2 minutes away at the corner. Please wait outside with the car.' },
        { caller: 'I am already standing outside by the main gate. Did you share your live location?', userPrompt: 'Yes, location is shared with you. I can see the lights now.' },
        { caller: 'Good. Tell the driver you have arrived at the society gate.', userPrompt: 'Yes Papa, stepping out right now. See you in a second.' },
      ],
    },
    police: {
      name: 'Sub-Inspector Sharma (PCR-12)',
      number: 'National Police Desk (112)',
      dialogues: [
        { caller: 'SAHELI Central Police Control. Confirming your active route check-in.', userPrompt: 'Officer, I am currently inside vehicle number DL-01-AB-1234 heading towards Campus.' },
        { caller: 'Understood. We are tracking your live coordinates on GPS. Unit 04 is 300 meters away.', userPrompt: 'Thank you officer, I will keep the line connected until I reach the gate.' },
      ],
    },
    brother: {
      name: 'Kabir (Brother)',
      number: '+91 98222 33445',
      dialogues: [
        { caller: 'Hey, are you almost here? Mom sent me downstairs to pick you up.', userPrompt: 'Hey Kabir, yes I am right outside near the pharmacy. Walk towards the gate.' },
        { caller: 'I am walking towards the gate right now with the dog. See you in 1 minute.', userPrompt: 'Great, see you right now.' },
      ],
    },
  };

  const activeCaller = callers[callerType] || callers.father;

  // Handle Delay countdown to ringing
  useEffect(() => {
    if (stage === 'waiting') {
      const timeout = setTimeout(() => {
        setStage('ringing');
      }, delaySeconds * 1000);
      return () => clearTimeout(timeout);
    }
  }, [stage, delaySeconds]);

  // Handle In-call duration timer
  useEffect(() => {
    if (stage === 'connected') {
      durationRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationRef.current) clearInterval(durationRef.current);
      setCallDuration(0);
    }
    return () => {
      if (durationRef.current) clearInterval(durationRef.current);
    };
  }, [stage]);

  // Rotate dialogues every 6 seconds in call
  useEffect(() => {
    if (stage === 'connected') {
      timerRef.current = setInterval(() => {
        setDialogueIndex((prev) => (prev + 1) % activeCaller.dialogues.length);
      }, 7000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDialogueIndex(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, activeCaller]);

  if (!isOpen) return null;

  const handleStartCall = () => {
    if (delaySeconds > 0) {
      setStage('waiting');
    } else {
      setStage('ringing');
    }
  };

  const handleAccept = () => {
    setStage('connected');
  };

  const handleDecline = () => {
    setStage('setup');
    onClose();
  };

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 6, 12, 0.92)',
        backdropFilter: 'blur(16px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* 1. SETUP SCREEN */}
      {stage === 'setup' && (
        <div
          style={{
            maxWidth: '440px',
            width: '100%',
            backgroundColor: '#0E1424',
            borderRadius: '20px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(56, 189, 248, 0.15)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284C7 0%, #6366F1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <PhoneCall size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#FFFFFF' }}>
                Discrete Fake Incoming Call
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Simulate a real phone call to exit awkward or risky situations.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label className="label-text">Select Caller Persona</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(callers).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCallerType(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: callerType === key ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid',
                    borderColor: callerType === key ? '#38BDF8' : 'rgba(255, 255, 255, 0.1)',
                    color: callerType === key ? '#FFFFFF' : '#94A3B8',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: callerType === key ? '#FFFFFF' : '#E2E8F0' }}>
                      {val.name}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>{val.number}</div>
                  </div>
                  {callerType === key && <span style={{ color: '#38BDF8', fontWeight: 800 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="label-text">Call Timing</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[0, 10, 30].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setDelaySeconds(sec)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: delaySeconds === sec ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid',
                    borderColor: delaySeconds === sec ? '#6366F1' : 'rgba(255, 255, 255, 0.1)',
                    color: delaySeconds === sec ? '#FFFFFF' : '#94A3B8',
                    cursor: 'pointer',
                  }}
                >
                  {sec === 0 ? 'Immediately' : `In ${sec}s`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <Button variant="ghost" size="md" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleStartCall} style={{ flex: 2 }} icon={<PhoneCall size={16} />}>
              Trigger Call
            </Button>
          </div>
        </div>
      )}

      {/* 2. WAITING STATE (IF DELAY SET) */}
      {stage === 'waiting' && (
        <div
          style={{
            maxWidth: '380px',
            width: '100%',
            backgroundColor: '#0E1424',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Clock size={32} style={{ color: '#38BDF8', animation: 'spin 4s linear infinite' }} />
          <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 800 }}>
            Call scheduled in {delaySeconds} seconds
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            Keep your screen on or pocket your phone. The phone will ring realistically.
          </p>
          <Button variant="ghost" size="sm" onClick={() => setStage('setup')}>
            Cancel Timer
          </Button>
        </div>
      )}

      {/* 3. REALISTIC INCOMING CALL (RINGING) */}
      {stage === 'ringing' && (
        <div
          style={{
            maxWidth: '360px',
            width: '100%',
            height: '620px',
            backgroundColor: '#070A12',
            borderRadius: '36px',
            border: '3px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(56, 189, 248, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px 24px 36px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Speaker notch */}
          <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '18px', backgroundColor: '#1E293B', borderRadius: '10px' }} />

          {/* Caller Details */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 600 }}>
              Incoming Call
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', marginTop: '8px' }}>
              {activeCaller.name}
            </h2>
            <div style={{ fontSize: '0.875rem', color: '#38BDF8', marginTop: '4px', fontFamily: 'var(--font-family-mono)' }}>
              {activeCaller.number}
            </div>

            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                border: '2px solid rgba(56, 189, 248, 0.4)',
                margin: '32px auto 0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
                boxShadow: '0 0 30px rgba(56, 189, 248, 0.35)',
                animation: 'status-pulse 1.4s infinite ease-in-out',
              }}
            >
              <User size={52} />
            </div>
          </div>

          {/* Accept / Decline Action Controls */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              {/* Decline Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleDecline}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#EF4444',
                    border: 'none',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
                  }}
                  aria-label="Decline fake call"
                >
                  <PhoneOff size={28} />
                </button>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Decline</span>
              </div>

              {/* Accept Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleAccept}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    border: 'none',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.6)',
                    animation: 'status-pulse 1.2s infinite',
                  }}
                  aria-label="Accept fake call"
                >
                  <Phone size={28} />
                </button>
                <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 700 }}>Accept</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACTIVE CONNECTED CALL WITH SCRIPTED PROMPTER */}
      {stage === 'connected' && (
        <div
          style={{
            maxWidth: '380px',
            width: '100%',
            height: '640px',
            backgroundColor: '#070A12',
            borderRadius: '36px',
            border: '3px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '36px 20px 28px 20px',
            position: 'relative',
          }}
        >
          {/* Top In-Call Header */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#10B981', fontWeight: 800, letterSpacing: '0.08em' }}>
              ● CALL IN PROGRESS
            </span>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
              {activeCaller.name}
            </h2>
            <div style={{ fontSize: '1rem', color: '#38BDF8', fontWeight: 700, fontFamily: 'var(--font-family-mono)', marginTop: '2px' }}>
              {formatDuration(callDuration)}
            </div>
          </div>

          {/* Scripted Prompter Dialogue Card */}
          <div
            style={{
              backgroundColor: '#0E1424',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Volume2 size={16} style={{ color: '#38BDF8' }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase' }}>
                Caller Says (Audio Simulation):
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#F8FAFC', fontStyle: 'italic', lineHeight: 1.45, margin: 0 }}>
              "{activeCaller.dialogues[dialogueIndex].caller}"
            </p>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '12px', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#FBBF24', textTransform: 'uppercase' }}>
                Your Speaking Cue (Say this aloud):
              </span>
              <p style={{ fontSize: '0.875rem', color: '#FBBF24', fontWeight: 700, marginTop: '2px', margin: 0 }}>
                "{activeCaller.dialogues[dialogueIndex].userPrompt}"
              </p>
            </div>
          </div>

          {/* In-Call Phone Action Controls */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px', opacity: 0.8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94A3B8', fontSize: '0.6875rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Volume2 size={20} />
                </div>
                <span>Speaker</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94A3B8', fontSize: '0.6875rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mic size={20} />
                </div>
                <span>Mute</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#34D399', fontSize: '0.6875rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={20} />
                </div>
                <span>Safe</span>
              </div>
            </div>

            {/* Red End Call Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleDecline}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)',
                }}
                aria-label="End call"
              >
                <PhoneOff size={28} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
