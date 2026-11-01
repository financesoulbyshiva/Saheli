import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TiltCard } from '../ui/TiltCard';
import { useSafety } from '../../context/SafetyContext';
import {
  PhoneCall,
  Mail,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

/**
 * ContactFeedbackSection Component
 * TailGrids SaaSly-styled contact & feedback interface.
 * Connects users to 24/7 National Emergency lines and allows submitting feedback,
 * nominating new verified safe havens, and requesting support.
 */
export function ContactFeedbackSection({ className = '' }) {
  const { showToast } = useSafety();

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    category: 'feedback',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const helplines = [
    { number: '112', title: 'National Emergency Helpline', desc: 'Police, Fire, Ambulance (All India 24/7)', color: '#EF4444' },
    { number: '1091', title: 'Women Helpline Desk', desc: 'Specialized 24/7 women distress & safety support', color: '#3758F9' },
    { number: '181', title: 'Women in Distress (Toll Free)', desc: 'Immediate psychological & rescue assistance', color: '#10B981' },
    { number: '108', title: 'Emergency Medical & Trauma', desc: 'Rapid ambulance dispatch & first aid unit', color: '#F59E0B' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contact.trim() || !formData.message.trim()) {
      showToast('Please fill out all required fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      showToast('Thank you! Your feedback has been received.', 'success');
      setFormData({ name: '', contact: '', category: 'feedback', message: '' });
    }, 700);
  };

  return (
    <section id="contact" className={`contact-feedback-section ${className}`} style={{ padding: '5rem 0', backgroundColor: 'var(--color-bg-surface-subtle)' }}>
      <div className="app-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '9999px', backgroundColor: 'rgba(55, 88, 249, 0.08)', border: '1px solid rgba(55, 88, 249, 0.2)', color: '#3758F9', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Mail size={15} />
            <span>24/7 SUPPORT & COMMUNITY FEEDBACK</span>
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.025em', lineHeight: 1.25 }}>
            Get in Touch & Emergency Helplines
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginTop: '0.75rem', lineHeight: 1.6 }}>
            Have a question, suggestion, or want to nominate a new verified safe haven in your neighborhood? Reach our team directly or call immediate 24/7 national emergency hotlines.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Left Column: 24/7 Emergency Hotlines */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                Instant Emergency Hotlines
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Toll-free direct lines verified and operational 24 hours a day, 365 days a year across India.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {helplines.map((hl) => (
                <TiltCard key={hl.number} maxTilt={4}>
                  <div
                    style={{
                      padding: '1.25rem',
                      backgroundColor: 'var(--color-bg-surface)',
                      borderRadius: '14px',
                      border: '1px solid var(--color-border-subtle)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          backgroundColor: `${hl.color}15`,
                          color: hl.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.125rem',
                          flexShrink: 0,
                          border: `1px solid ${hl.color}30`,
                        }}
                      >
                        <PhoneCall size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                          {hl.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {hl.desc}
                        </div>
                      </div>
                    </div>

                    <a
                      href={`tel:${hl.number}`}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        backgroundColor: hl.color,
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        boxShadow: `0 4px 12px ${hl.color}35`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexShrink: 0,
                      }}
                    >
                      Call {hl.number}
                    </a>
                  </div>
                </TiltCard>
              ))}
            </div>

            {/* Verification Guarantee */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <ShieldCheck size={24} style={{ color: '#10B981', flexShrink: 0 }} />
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                <strong style={{ color: '#10B981' }}>Government Integration:</strong> SAHELI coordinates directly with public dispatch networks to accelerate response times and ensure authentic shelter assistance.
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Feedback Form */}
          <div>
            <Card style={{ padding: '2rem', backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', borderRadius: '20px', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.06)' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  Send Feedback or Nominate a Safe Place
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Help us expand our network of verified safe places or tell us how we can make SAHELI safer.
                </p>
              </div>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    Message Received
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '6px', maxWidth: '400px', margin: '6px auto 1.5rem auto' }}>
                    Thank you for contributing to women's safety. Our safety audit team reviews all submissions within 24 hours.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Response
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                  <div className="form-group">
                    <label className="label-text">Your Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Priya Singh"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="label-text">Email Address or Phone Number *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. priya@example.com or +91 98765 43210"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="label-text">Inquiry Category</label>
                    <select
                      className="input-field"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="feedback">General Safety Feedback & Ideas</option>
                      <option value="safe-place">Nominate a New Verified Safe Place (Haven)</option>
                      <option value="guardian">Guardian Network Inquiry</option>
                      <option value="partnership">Police / NGO Partnership</option>
                      <option value="technical">Technical Bug or Feature Request</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="label-text">Message or Sanctuary Details *</label>
                    <textarea
                      className="input-field"
                      rows={4}
                      placeholder="Share your thoughts, or describe the suggested safe location (Address, 24/7 staff, lighting conditions)..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <AlertCircle size={14} style={{ flexShrink: 0, color: '#3758F9' }} />
                    <span>In active emergency, do not wait for a form response. Call 112 immediately.</span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    icon={<Send size={16} />}
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
