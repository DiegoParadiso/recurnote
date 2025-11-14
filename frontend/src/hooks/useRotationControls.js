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

  // Calcular el ángulo desde el centro del container hacia el mouse
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

  // Al comenzar a arrastrar
  const onMouseDown = (e) => {
    // Evitar que inputs o elementos editables disparen la rotación
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
    
    // Evitar que el evento genere scroll o selección de texto
    document.body.style.userSelect = 'none'; 
    document.body.style.touchAction = 'none'; 
  };

  // Al mover el mouse durante el arrastre
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();

    const currentAngle = getAngleFromCenter(e.clientX, e.clientY);

    if (lastMouseAngle.current !== null) {
      let diff = currentAngle - lastMouseAngle.current;

      // Corregir salto de ángulo para rotación continua
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      setRotationAngle((prev) => Math.round((prev + diff + 360) % 360));
    }

    lastMouseAngle.current = currentAngle;
  };

  // Al soltar el mouse
  const onMouseUp = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    isDragging.current = false;
    lastMouseAngle.current = null;

    // Restablecer estilos para permitir scroll y selección
    document.body.style.userSelect = '';
    document.body.style.touchAction = '';
  };

  // Control por teclado para rotar con flechas
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
          prevRotationRef.current = newAngle;
        }
        return newAngle;
      });

      if (isRotating) {
        animationFrameId = requestAnimationFrame(rotate);
      }
    };

    const handleKeyDown = (e) => {
      if (e.repeat) return;
      if (!['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'].includes(e.key)) return;

      // No rotar si el foco está en un input/textarea o elemento editable
      const ae = document.activeElement;
      const tag = ae?.tagName?.toLowerCase();
      const isEditable = (
        (tag === 'input' || tag === 'textarea') ||
        ae?.isContentEditable === true ||
        ae?.getAttribute?.('contenteditable') === 'true'
      );
      if (isEditable) return; // permitir que las flechas se usen dentro del campo

      e.preventDefault();
      currentKey = e.key;
      if (!isRotating) {
        isRotating = true;
        rotate();
      }
    };

    const handleKeyUp = (e) => {
      if (!['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'].includes(e.key)) return;
      isRotating = false;
      currentKey = null;
      cancelAnimationFrame(animationFrameId);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [rotationSpeed, setRotationAngle]);

  // Devolver los handlers de mouse para usar en el componente
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
