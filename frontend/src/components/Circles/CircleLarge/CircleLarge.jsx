import { useState, useEffect } from 'react';
import CircleSmall from '../CircleSmall/CircleSmall';
import NotesArea from './NotesArea';
import ItemsOnCircle from '../Items/ItemsOnCircle';
import CircleBackgroundText from './CircleBackgroundText';
import EmptyLogo from '../../common/EmptyLogo';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import { useCircleLargeLogic } from '../../../hooks/useCircleLargeLogic';
import { useDisplayText } from '../../../hooks/useDisplayText';
import { formatDateKey } from '../../../utils/formatDateKey';
import BottomToast from '../../common/BottomToast';
import useHandleDrop from '../../../hooks/useDropHandler';
import { useItems } from '../../../context/ItemsContext';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import '../../../styles/components/circles/CircleLarge.css';

export default function CircleLarge({ showSmall, selectedDay, setSelectedDay, onItemDrag, displayOptions, setLocalItemsByDate, onCircleSizeChange }) {
  const { width } = useWindowDimensions();
  const [circleSize, setCircleSize] = useState(680);
  const { itemsByDate: contextItemsByDate, setItemsByDate: contextSetItemsByDate } = useItems();
  const { user, token } = useAuth();
  const { isLightTheme } = useTheme();
  const [selectedPattern, setSelectedPattern] = useState(() => {
    // Priorizar preferencias del usuario si existe
    const userPattern = user?.preferences?.circlePattern;
    if (userPattern && userPattern !== 'pattern9' && userPattern !== 'pattern10') {
      localStorage.setItem('circlePattern', userPattern);
      return userPattern;
    }
    
    const saved = localStorage.getItem('circlePattern') || 'none';
    // Si el pattern guardado es 9 o 10, cambiar a none
    if (saved === 'pattern9' || saved === 'pattern10') {
      localStorage.setItem('circlePattern', 'none');
      return 'none';
    }
    return saved;
  });

  // Función para obtener estilos del pattern de fondo
  const getPatternStyles = () => {
    if (selectedPattern === 'none' || !selectedDay) {
      return {};
    }
    
    const patternUrl = `/assets/${selectedPattern}.png`;
    const filterStyle = isLightTheme 
      ? 'grayscale(100%) brightness(1.4) contrast(0.8)' // Gris claro para modo claro
      : 'grayscale(100%) brightness(0.5) contrast(1.1)'; // Gris oscuro para modo oscuro
    
    const opacity = isLightTheme ? '0.2' : '0.5'; // Más visible en modo oscuro
    
    return {
      '--pattern-url': `url(${patternUrl})`,
      '--pattern-filter': filterStyle,
      '--pattern-opacity': opacity,
    };
  };
  
  // Escuchar cambios de pattern desde ConfigPanel
  useEffect(() => {
    const handlePatternChange = (event) => {
      setSelectedPattern(event.detail);
    };
    
    window.addEventListener('patternChanged', handlePatternChange);
    return () => window.removeEventListener('patternChanged', handlePatternChange);
  }, []);
  
  // Usar setItemsByDate del ItemsContext para todo
  const setItemsByDateForDrop = setLocalItemsByDate || contextSetItemsByDate;
  
  const {
    containerRef,
    rotationAngle,
    setRotationAngle,
    toastMessage,
    setToastMessage,
    errorToast,
    setErrorToast,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    handleNoteDragStart,
    handleNoteUpdate,
    handleDeleteItem,
    handleItemDrop,
    itemsByDate: hookItemsByDate,
    setItemsByDate: hookSetItemsByDate,
  } = useCircleLargeLogic(selectedDay, onItemDrag);

  useEffect(() => {
    // Sistema de tamaños responsivos para diferentes dispositivos
    const calculateCircleSize = (screenWidth) => {
      if (screenWidth <= 480) {
        // Móviles pequeños
        return Math.min(screenWidth - 40, 300);
      } else if (screenWidth <= 640) {
        // Móviles grandes / tablets pequeñas
        return Math.min(screenWidth - 40, 360);
      } else if (screenWidth <= 768) {
        // Tablets
        return 480;
      } else if (screenWidth <= 1024) {
        // Laptops pequeñas
        return 580;
      } else if (screenWidth <= 1366) {
        // Laptops medianas (tu notebook)
        return 660;
      } else if (screenWidth <= 1920) {
        // Laptops grandes / monitores estándar
        return 740;
      } else {
        // Monitores 4K / ultra wide
        return Math.min(screenWidth * 0.4, 900);
      }
    };

    const newSize = calculateCircleSize(width);
    setCircleSize(newSize);
    
    // Notificar al componente padre del nuevo tamaño
    onCircleSizeChange?.(newSize);
  }, [width, onCircleSizeChange]);

  // Rotación y actualización de ítems se maneja dentro del hook useCircleLargeLogic

  const displayText = useDisplayText(selectedDay, displayOptions);

  const isSmallScreen = width <= 640;
  // Ajustar el radio para que sea más preciso y permita mejor movimiento
  const radius = circleSize / 2 - 20; // Reducir de 40 a 20 para más espacio
  const cx = circleSize / 2;
  const cy = circleSize / 2;

  // Usar items del ItemsContext (que maneja tanto servidor como local)
  const itemsForSelectedDay = selectedDay ? contextItemsByDate[formatDateKey(selectedDay)] || [] : [];

  const { handleDrop: handleDropFunction, errorToast: dropErrorToast, setErrorToast: setDropErrorToast } = useHandleDrop({
    containerRef,
    selectedDay,
    rotationAngle,
    radius,
    onInvalidDrop: () => setToastMessage('Para agregar un ítem, primero selecciona un día en el calendario'),
  });

  return (
    <div
      className="relative select-none uppercase circle-large-container"
      style={{
        width: '100%',
        height: isSmallScreen ? '100dvh' : circleSize,
        margin: '0 auto',
      }}
    >
      <CircleBackgroundText
        circleSize={circleSize}
        radius={radius}
        displayText={displayText}
        isSmallScreen={isSmallScreen}
      />

      {/* CircleSmall en desktop ahora se renderiza en Home para drag global */}

      {isSmallScreen && showSmall && (
        <div
          className="fixed flex items-center justify-center"
          style={{
            backgroundColor: 'var(--color-bg)',
            borderRadius: '50%',
            width: circleSize,
            height: circleSize,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 'var(--z-high)'
          }}
        >
          <CircleSmall
            onDayClick={setSelectedDay}
            isSmallScreen={true}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            size={circleSize}
          />
        </div>
      )}

      <div
        ref={containerRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropFunction}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        id="circle-large-container"
        className={`
          ${isSmallScreen
            ? 'absolute inset-0 flex items-center justify-center z-[1]'
            : 'rounded-full border flex items-center justify-center overflow-hidden'
          }
          ${!isSmallScreen && selectedPattern !== 'none' && selectedDay ? 'circle-with-pattern' : ''}
        `}
        style={{
          width: isSmallScreen ? '100%' : circleSize,
          height: isSmallScreen ? '100dvh' : circleSize,
          margin: isSmallScreen ? undefined : '0 auto',
          transform: isSmallScreen ? 'none' : `rotate(${rotationAngle}deg)`,
          borderColor: isSmallScreen ? 'transparent' : 'var(--circle-border-light)',
          borderStyle: isSmallScreen ? 'none' : 'solid',
          position: 'relative',
          ...(isSmallScreen ? {} : getPatternStyles()),
        }}
      >
        {!selectedDay && (
          <EmptyLogo
            circleSize={isSmallScreen ? circleSize * 3 : circleSize * 0.5}
            isSmallScreen={isSmallScreen}
          />
        )}

        {selectedDay && (
          <div style={{ transform: isSmallScreen ? 'none' : `rotate(${-rotationAngle}deg)` }}>
            <NotesArea dayInfo={selectedDay} />
          </div>
        )}

        <ItemsOnCircle
          items={itemsForSelectedDay}
          cx={cx}
          cy={cy}
          rotationAngle={rotationAngle}
          onItemDrag={onItemDrag}
          onItemDrop={handleItemDrop}
          onNoteDragStart={handleNoteDragStart}
          onNoteUpdate={handleNoteUpdate}
          onDeleteItem={handleDeleteItem}
          circleSize={circleSize}
          isSmallScreen={isSmallScreen}
        />
      </div>

      <BottomToast message={toastMessage} onClose={() => setToastMessage('')} />
      
      {/* BottomToast para errores del hook useHandleDrop */}
      <BottomToast message={dropErrorToast} onClose={() => setDropErrorToast('')} duration={5000} />
    </div>
  );
}