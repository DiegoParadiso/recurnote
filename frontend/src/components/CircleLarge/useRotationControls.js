import { useEffect, useRef } from 'react';

export default function useRotationControls({
  containerRef,
  rotationAngle,
  setRotationAngle,
  rotationSpeed = 2,
}) {
  const isDragging = useRef(false);
  const lastMouseAngle = useRef(null);
  const prevRotationRef = useRef(rotationAngle);

  // Calcular ángulo desde el centro del container hacia el mouse
  const getAngleFromCenter = (x, y) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  };

  const onMouseDown = (e) => {
    if (
      e.target.tagName === 'TEXTAREA' ||
      e.target.tagName === 'INPUT' ||
      e.target.isContentEditable ||
      e.target.closest('.draggable-note')
    ) {
      return;
    }

    e.preventDefault();
    isDragging.current = true;
    lastMouseAngle.current = getAngleFromCenter(e.clientX, e.clientY);
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const currentAngle = getAngleFromCenter(e.clientX, e.clientY);
    if (lastMouseAngle.current !== null) {
      let diff = currentAngle - lastMouseAngle.current;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      setRotationAngle((prev) => Math.round((prev + diff + 360) % 360));
    }
    lastMouseAngle.current = currentAngle;
  };

  const onMouseUp = (e) => {
    e.preventDefault();
    isDragging.current = false;
    lastMouseAngle.current = null;
  };

  // Teclado
  useEffect(() => {
    let animationFrameId;
    let isRotating = false;
    let currentKey = null;

    const rotate = () => {
      setRotationAngle((prev) => {
        let newAngle = prev;
        if (isRotating) {
          if (currentKey === 'ArrowUp' || currentKey === 'ArrowRight') {
            newAngle = (prev + rotationSpeed) % 360;
          } else if (currentKey === 'ArrowDown' || currentKey === 'ArrowLeft') {
            newAngle = (prev - rotationSpeed + 360) % 360;
          }
        }
        return newAngle;
      });

      if (isRotating) {
        animationFrameId = requestAnimationFrame(rotate);
      }
    };

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        currentKey = e.key;
        if (!isRotating) {
          isRotating = true;
          rotate();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'].includes(e.key)) {
        isRotating = false;
        currentKey = null;
        cancelAnimationFrame(animationFrameId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [rotationSpeed, setRotationAngle]);

  // Devolver los handlers de mouse para uso en el componente
  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    prevRotationRef,
    isDragging,
    lastMouseAngle,
    getAngleFromCenter,
  };
}
