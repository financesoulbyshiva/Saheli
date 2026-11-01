import { useState, useRef } from 'react';

/**
 * TiltCard Component
 * Interactive 3D Perspective Tilt Card with specular shine highlight.
 * Gives cards a tactile, spatial feel matching high-end SaaS designs.
 */
export function TiltCard({ children, className = '', style = {}, maxTilt = 10, ...props }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('');
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`);
    setShine({
      x: ((x / rect.width) * 100).toFixed(1),
      y: ((y / rect.height) * 100).toFixed(1),
      opacity: 0.12,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setShine((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`tilt-card-container ${className}`}
      style={{
        transform,
        transition: 'transform 0.15s ease-out, box-shadow 0.2s ease',
        transformStyle: 'preserve-3d',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      {/* Dynamic Specular Shine Highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255, 255, 255, 0.45) 0%, transparent 60%)`,
          opacity: shine.opacity,
          pointerEvents: 'none',
          transition: 'opacity 0.25s ease',
          zIndex: 2,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}
