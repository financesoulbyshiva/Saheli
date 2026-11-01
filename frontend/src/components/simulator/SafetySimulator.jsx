import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatusIndicator } from '../ui/StatusIndicator';
import { useSafety } from '../../context/SafetyContext';
import { SIMULATOR_SCENARIOS } from '../../data/simulatorScenarios';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';

/**
 * SafetySimulator Component
 * Interactive scenario engine for professors & evaluators.
 * Step-by-step control allowing presenter to explain how SAHELI responds.
 */
export function SafetySimulator({ className = '' }) {
  const {
    setSafetyState,
    triggerEmergency,
    resolveEmergency,
    escalateToThreat,
    addTimelineEvent,
    showToast,
  } = useSafety();

  // Selected scenario and active step pointer
  const [activeScenario, setActiveScenario] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Badge variant mapping
  const badgeVariantMap = {
    SAFE: 'safe',
    CAUTION: 'caution',
    THREAT: 'threat',
    EMERGENCY: 'emergency',
    RECOVERED: 'recovered',
  };

  // Section 6: Safety State Integration
  const applySafetyStateForStep = (step) => {
    if (step.state === 'EMERGENCY') {
      triggerEmergency();
    } else if (step.state === 'RECOVERED') {
      resolveEmergency();
    } else if (step.state === 'THREAT') {
      escalateToThreat();
    } else if (step.state === 'CAUTION') {
      setSafetyState('CAUTION', `[Simulation] ${step.title}: ${step.description}`);
    } else {
      setSafetyState('SAFE', `[Simulation] ${step.title}: ${step.description}`);
    }
  };

  // 1. Start a Scenario
  const handleStartScenario = (scenario) => {
    setActiveScenario(scenario);
    setCurrentStepIndex(0);
    setIsCompleted(false);

    // Initial state of the scenario's first step
    const firstStep = scenario.steps[0];
    applySafetyStateForStep(firstStep);

    addTimelineEvent({
      state: firstStep.state,
      title: `[SIMULATOR] ${firstStep.title}`,
      description: `${firstStep.description} (Scenario: ${scenario.title}).`,
    });

    showToast(`Simulation started: ${scenario.title}`, 'info');
  };

  // 2. Advance Exactly One Step
  const handleNextStep = () => {
    if (!activeScenario) return;

    const nextIndex = currentStepIndex + 1;

    if (nextIndex < activeScenario.steps.length) {
      const nextStep = activeScenario.steps[nextIndex];
      setCurrentStepIndex(nextIndex);

      // Section 6: Integrate with SafetyContext single source of truth
      applySafetyStateForStep(nextStep);

      addTimelineEvent({
        state: nextStep.state,
        title: `[SIMULATOR] ${nextStep.title}`,
        description: nextStep.description,
      });

      showToast(`Step ${nextIndex + 1}: ${nextStep.title} (${nextStep.state})`, 'info');
    } else {
      // Reached conclusion
      setIsCompleted(true);
      setSafetyState('SAFE', 'Simulator scenario complete. Baseline monitoring restored.');

      addTimelineEvent({
        state: 'SAFE',
        title: '[SIMULATOR COMPLETE] Scenario Demonstrated',
        description: `SAHELI successfully demonstrated risk detection to recovery for: ${activeScenario.title}.`,
      });

      showToast(`Simulation complete: ${activeScenario.title}`, 'success');
    }
  };

  // 3. Reset Scenario
  const handleReset = () => {
    setActiveScenario(null);
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setSafetyState('SAFE', 'Simulator reset to scenario selection.');
    showToast('Simulator reset to scenario selection.', 'info');
  };

  // Active step details
  const currentStep = activeScenario ? activeScenario.steps[currentStepIndex] : null;

  return (
    <div className={`saheli-simulator-view ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '880px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">SAFETY SIMULATOR</h1>
            <Badge variant="primary" size="sm">
              PROTOTYPE • EDUCATIONAL SIMULATION
            </Badge>
          </div>
          <p className="body-text" style={{ marginTop: '0.25rem' }}>
            Explore how SAHELI responds as a situation changes.
          </p>
        </div>

        {activeScenario && (
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={15} />}
            onClick={handleReset}
          >
            Reset Scenario
          </Button>
        )}
      </div>

      {/* ================================================================
          MODE A: SCENARIO SELECTION LIST
         ================================================================ */}
      {!activeScenario && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: 'var(--color-brand-primary)' }} />
            <h3 className="section-title" style={{ margin: 0 }}>
              Select a Demonstration Scenario
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
            {SIMULATOR_SCENARIOS.map((scenario) => {
              const isRec = scenario.isRecommended;

              return (
                <Card
                  key={scenario.id}
                  className={`scenario-card ${isRec ? 'scenario-card--recommended' : ''}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: isRec
                      ? '5px solid #EF4444'
                      : '3px solid var(--color-border-subtle)',
                    background: isRec
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(14, 20, 36, 0.85) 100%)'
                      : 'var(--color-glass-bg)',
                    borderColor: isRec ? 'rgba(239, 68, 68, 0.4)' : 'var(--color-border-subtle)',
                    boxShadow: isRec ? '0 0 25px rgba(239, 68, 68, 0.18)' : 'none',
                  }}
                >
                  <div>
                    {/* Recommended Badge for BEING FOLLOWED */}
                    {isRec && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                        <Sparkles size={14} style={{ color: 'var(--color-state-emergency)' }} />
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            color: 'var(--color-state-emergency)',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                          }}
                        >
                          RECOMMENDED DEMO
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <h4 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        {scenario.title}
                      </h4>
                      <Badge variant={scenario.badgeVariant} size="sm">
                        {scenario.safetyLevel}
                      </Badge>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.375rem', lineHeight: 1.45 }}>
                      {scenario.description}
                    </p>

                    {isRec && scenario.recommendationNote && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-state-emergency-dark)', fontWeight: 600, marginTop: '0.5rem' }}>
                        ★ {scenario.recommendationNote}
                      </p>
                    )}

                    {/* Step Count Overview */}
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                      {scenario.steps.length} Simulation Steps • Step-by-Step Presenter Control
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.75rem' }}>
                    <Button
                      variant={isRec ? 'danger' : 'primary'}
                      size="md"
                      fullWidth
                      icon={<Play size={16} />}
                      onClick={() => handleStartScenario(scenario)}
                    >
                      RUN SCENARIO
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================
          MODE B: ACTIVE SIMULATION & STEP ENGINE
         ================================================================ */}
      {activeScenario && !isCompleted && currentStep && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Active Simulation Header Card */}
          <Card
            style={{
              backgroundColor: `var(--color-state-${currentStep.state.toLowerCase()}-bg)`,
              borderColor: `var(--color-state-${currentStep.state.toLowerCase()}-border)`,
              borderLeft: `5px solid var(--color-state-${currentStep.state.toLowerCase()})`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: `var(--color-state-${currentStep.state.toLowerCase()}-text)`,
                  }}
                >
                  ACTIVE SIMULATION
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>•</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Scenario: {activeScenario.title}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Safety State:</span>
                <StatusIndicator state={currentStep.state} showLabel />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Current Step ({currentStepIndex + 1} of {activeScenario.steps.length}):
                </span>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  "{currentStep.title}"
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', lineHeight: 1.45 }}>
                  {currentStep.description}
                </p>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: `var(--color-state-${currentStep.state.toLowerCase()}-dark)`, marginTop: '0.5rem' }}>
                  → Action: {currentStep.action}
                </div>
              </div>

              <Badge variant={badgeVariantMap[currentStep.state] || 'neutral'} size="md">
                {currentStep.state}
              </Badge>
            </div>
          </Card>

          {/* PRIMARY PRESENTER CONTROL: NEXT STEP */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '0.75rem' }}>
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={22} />}
              onClick={handleNextStep}
              style={{ fontSize: '1.125rem', padding: '1rem 1.5rem', fontWeight: 800, letterSpacing: '0.02em' }}
            >
              {currentStepIndex + 1 < activeScenario.steps.length
                ? `NEXT STEP (${currentStepIndex + 2}/${activeScenario.steps.length})`
                : 'COMPLETE SIMULATION'}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              icon={<RotateCcw size={18} />}
              onClick={handleReset}
            >
              RESET SCENARIO
            </Button>
          </div>

          {/* Progress Timeline Checklist */}
          <Card>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <CardTitle>Scenario Progress Checklist</CardTitle>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Step {currentStepIndex + 1} of {activeScenario.steps.length}
                </span>
              </div>
              <CardDescription>
                Step-by-step timeline of events triggered in this scenario.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {activeScenario.steps.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const isUpcoming = idx > currentStepIndex;

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.625rem 0.875rem',
                        borderRadius: '8px',
                        backgroundColor: isCurrent
                          ? `var(--color-state-${step.state.toLowerCase()}-bg)`
                          : isDone
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid',
                        borderColor: isCurrent
                          ? `var(--color-state-${step.state.toLowerCase()}-border)`
                          : 'var(--color-border-subtle)',
                        opacity: isUpcoming ? 0.6 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isDone ? (
                          <CheckCircle2 size={18} style={{ color: 'var(--color-state-safe)', flexShrink: 0 }} />
                        ) : isCurrent ? (
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: `var(--color-state-${step.state.toLowerCase()})`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                              fontSize: '10px',
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            ●
                          </span>
                        ) : (
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: '1.5px solid var(--color-border-default)',
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                        )}

                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: isCurrent ? 800 : 500,
                            color: isCurrent
                              ? 'var(--color-text-primary)'
                              : isDone
                              ? 'var(--color-text-secondary)'
                              : 'var(--color-text-muted)',
                          }}
                        >
                          {step.title}
                        </span>
                      </div>

                      <Badge variant={badgeVariantMap[step.state] || 'neutral'} size="sm">
                        {step.state}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Simulated Action Panel */}
          <Card style={{ backgroundColor: 'var(--color-bg-surface-subtle)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-brand-primary)', marginBottom: '0.5rem' }}>
              SIMULATED RESPONSE:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              <div>✓ Guardian alert prepared</div>
              <div>✓ Safe place identified</div>
              <div>✓ Safety event logged in Incident Timeline</div>
            </div>

            <div
              style={{
                marginTop: '0.75rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                fontSize: '0.6875rem',
                color: 'var(--color-text-muted)',
              }}
            >
              <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                All actions shown here are simulations. No real calls, messages, location sharing or emergency services are triggered.
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* ================================================================
          MODE C: SIMULATION COMPLETION STATE
         ================================================================ */}
      {isCompleted && activeScenario && (
        <Card
          style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            backgroundColor: 'var(--color-state-safe-bg)',
            borderColor: 'var(--color-state-safe-border)',
            borderLeft: '5px solid var(--color-state-safe)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              color: '#34D399',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <ShieldCheck size={36} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-state-safe-text)' }}>
            SIMULATION COMPLETE
          </h2>

          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', maxWidth: '520px', margin: '0.5rem auto 1.5rem auto', lineHeight: 1.5 }}>
            "SAHELI successfully guided the user from risk detection to recovery."
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '2rem' }}>
            <Badge variant="safe" size="md">
              SAFE
            </Badge>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-state-safe-text)' }}>
              ✓ Scenario completed
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="md"
              icon={<RotateCcw size={16} />}
              onClick={() => handleStartScenario(activeScenario)}
            >
              RUN AGAIN
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Layers size={16} />}
              onClick={handleReset}
            >
              CHOOSE ANOTHER SCENARIO
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
