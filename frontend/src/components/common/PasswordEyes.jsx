import React, { useState, useEffect, useRef } from 'react';

export default function PasswordEyes({ isFocused }) {
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // If password field is focused, pupils stay in the center
      if (isFocused) {
        setPupilOffset({ x: 0, y: 0 });
        return;
      }

      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      // Calculate center of the SVG container
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate angle from center to mouse
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      
      // Max distance the pupil can move
      const distance = 5;
      
      setPupilOffset({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isFocused]);

  // When focus changes to true, reset immediately
  useEffect(() => {
    if (isFocused) {
      setPupilOffset({ x: 0, y: 0 });
    }
  }, [isFocused]);

  return (
    <div 
      ref={containerRef}
      className="character" 
      style={{ width: '150px', height: '100px', margin: '0 auto 10px', position: 'relative' }}
    >
      <svg viewBox="0 0 200 100" width="100%" height="100%">
        <g className="eyes">
          {/* LEFT EYE */}
          <circle cx="80" cy="50" r="15" fill="white" stroke="var(--color-text-primary)" strokeWidth="3"/>
          {/* RIGHT EYE */}
          <circle cx="120" cy="50" r="15" fill="white" stroke="var(--color-text-primary)" strokeWidth="3"/>
          
          {/* LEFT PUPIL */}
          <circle 
            className="pupil" 
            cx="80" cy="50" r="7" 
            fill="var(--color-text-primary)"
            style={{ 
              transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
              transition: isFocused ? 'transform 0.2s ease-out' : 'none'
            }}
          />
          {/* RIGHT PUPIL */}
          <circle 
            className="pupil" 
            cx="120" cy="50" r="7" 
            fill="var(--color-text-primary)"
            style={{ 
              transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
              transition: isFocused ? 'transform 0.2s ease-out' : 'none'
            }}
          />
        </g>
      </svg>
    </div>
  );
}
