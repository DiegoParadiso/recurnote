import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import CircleSmall from '@components/Circles/CircleSmall/CircleSmall';
import NotesArea from '@components/Circles/CircleLarge/NotesArea';
import ItemsOnCircle from '@components/Circles/Items/ItemsOnCircle';
import CircleBackgroundText from '@components/Circles/CircleLarge/CircleBackgroundText';
import EmptyLogo from '@components/common/EmptyLogo';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { useCircleLargeLogic } from '@hooks/useCircleLargeLogic';
import { useDisplayText } from '@hooks/useDisplayText';
import { formatDateKey } from '@utils/formatDateKey';
import useHandleDrop from '@hooks/useDropHandler';
import { useItems } from '@context/ItemsContext';
import { useAuth } from '@context/AuthContext';
import { useTheme } from '@context/ThemeContext';
import '@styles/components/circles/CircleLarge.css';

const calculateCircleSize = (screenWidth) => {
  if (screenWidth <= 480) return Math.min(screenWidth - 40, 300);
  if (screenWidth <= 640) return Math.min(screenWidth - 40, 360);
  if (screenWidth <= 768) return 480;
  if (screenWidth <= 1024) return 580;
  if (screenWidth <= 1366) return 660;
  if (screenWidth <= 1920) return 740;
  return Math.min(screenWidth * 0.4, 900);
};

const getInitialPattern = (user) => {
  if (!user?.is_vip) return 'none';
  const userPattern = user?.preferences?.circlePattern;
  if (userPattern && userPattern !== 'pattern9' && userPattern !== 'pattern10') {
    localStorage.setItem('circlePattern', userPattern);
    return userPattern;
  }
  const saved = localStorage.getItem('circlePattern') || 'none';
  if (saved === 'pattern9' || saved === 'pattern10') {
    localStorage.setItem('circlePattern', 'none');
    return 'none';
  }
  return saved;
};

const getContainerStyle = (isSmallScreen, fullboardMode, circleSize) => ({
  width: '100%',
  height: isSmallScreen ? '100dvh' : (fullboardMode ? '100vh' : circleSize),
  margin: '0 auto',
  isolation: 'isolate',
});

const getLogoWrapperClasses = (isSmallScreen, fullboardMode) => {
  if (isSmallScreen) return 'pointer-events-none absolute inset-0 z-[0]';
  if (fullboardMode) return 'pointer-events-none fixed inset-0';
  return 'pointer-events-none absolute rounded-full overflow-hidden';
};

const getLogoWrapperStyle = (isSmallScreen, fullboardMode, circleSize) => {
  const isSmallOrFull = isSmallScreen || fullboardMode;
  return {
    width: isSmallScreen ? '100%' : (fullboardMode ? '100vw' : circleSize),
    height: isSmallScreen ? '100dvh' : (fullboardMode ? '100vh' : circleSize),
    top: 0,
    left: isSmallOrFull ? 0 : '50%',
    transform: isSmallOrFull ? 'none' : 'translateX(-50%)',
    zIndex: fullboardMode ? 'calc(var(--z-mid) - 1)' : -1,
  };
};

const getMainCircleClasses = (isSmallScreen, fullboardMode) => {
  if (isSmallScreen) return 'absolute inset-0 flex items-center justify-center z-[1]';
  if (fullboardMode) return 'absolute inset-0 flex items-start justify-center';
  return 'rounded-full border flex items-center justify-center overflow-hidden';
};

const getMainCircleStyle = (isSmallScreen, fullboardMode, circleSize, rotationAngle) => {
  const isSmallOrFull = isSmallScreen || fullboardMode;
  return {
    width: isSmallScreen ? '100%' : (fullboardMode ? '100vw' : circleSize),
    height: isSmallScreen ? '100dvh' : (fullboardMode ? '100vh' : circleSize),
    margin: isSmallOrFull ? undefined : '0 auto',
    transform: isSmallOrFull ? 'none' : `rotate(${rotationAngle}deg)`,
    borderColor: isSmallOrFull ? 'transparent' : 'var(--circle-border-light)',
    borderStyle: isSmallOrFull ? 'none' : 'solid',
    position: fullboardMode ? 'fixed' : 'relative',
    top: fullboardMode ? 0 : undefined,
    left: fullboardMode ? 0 : undefined,
    overflow: fullboardMode ? 'visible' : undefined,
    zIndex: fullboardMode ? 'var(--z-mid)' : undefined,
  };
};

export default function CircleLarge({ showSmall, selectedDay, setSelectedDay, onItemDrag, displayOptions, setLocalItemsByDate, onCircleSizeChange, onErrorToast, onInfoToast, fullboardMode = false }) {
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation();
  const [circleSize, setCircleSize] = useState(680);
  const [activeItemId, setActiveItemId] = useState(null);
  const [zOrderMap, setZOrderMap] = useState({}); // { [itemId]: number }
  const [zCounter, setZCounter] = useState(1000);
  const { itemsByDate: contextItemsByDate, setItemsByDate: contextSetItemsByDate } = useItems();
  const { user } = useAuth();
  const { isLightTheme } = useTheme();
  const [selectedPattern, setSelectedPattern] = useState(() => getInitialPattern(user));

  const bringToFront = (itemId) => {
    setActiveItemId(itemId);
    setZOrderMap((prev) => ({ ...prev, [itemId]: zCounter + 1 }));
    setZCounter((c) => c + 1);
  };

  // Función para obtener estilos del pattern de fondo
  const getPatternStyles = () => {
    // Verificación adicional de VIP aquí para asegurar que no se muestre
    if (!user?.is_vip || selectedPattern === 'none' || !selectedDay) {
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

  const isSmallScreen = width <= 640;
  const BORDER_WIDTH = 1;
  // En fullboard mode, radio muy grande para permitir posicionamiento libre
  const radius = fullboardMode ? 10000 : ((circleSize / 2) - BORDER_WIDTH);
  const cx = fullboardMode ? (width / 2) : (circleSize / 2);
  const cy = fullboardMode ? (height / 2) : (circleSize / 2);

  const {
    containerRef,
    rotationAngle,
    toastMessage,
    setToastMessage,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    handleNoteDragStart,
    handleNoteUpdate,
    handleDeleteItem,
    handleItemDrop,
  } = useCircleLargeLogic(selectedDay, onItemDrag, radius, isSmallScreen);

  useEffect(() => {
    const newSize = calculateCircleSize(width);
    setCircleSize(newSize);

    // Notificar al componente padre del nuevo tamaño
    onCircleSizeChange?.(newSize);
  }, [width, onCircleSizeChange]);


  const displayText = useDisplayText(selectedDay, displayOptions);

  // Usar items del ItemsContext (que maneja tanto servidor como local)
  const itemsForSelectedDay = selectedDay ? contextItemsByDate[formatDateKey(selectedDay)] || [] : [];

  const { handleDrop: handleDropFunction, errorToast: dropErrorToast, setErrorToast: setDropErrorToast } = useHandleDrop({
    containerRef,
    selectedDay,
    rotationAngle,
    radius,
    fullboardMode,
    onInvalidDrop: () => setToastMessage(t('alerts.selectDayFirst')),
  });

  // Reenviar errores de drop 
  useEffect(() => {
    if (dropErrorToast) {
      onErrorToast?.(dropErrorToast);
      setDropErrorToast('');
    }
  }, [dropErrorToast, onErrorToast, setDropErrorToast]);

  // Reenviar mensajes-errores informativos 
  useEffect(() => {
    if (toastMessage) {
      onInfoToast?.(toastMessage);
      setToastMessage('');
    }
  }, [toastMessage, onInfoToast, setToastMessage]);

  const isPatternVisible = !isSmallScreen && !fullboardMode && selectedPattern !== 'none' && selectedDay;

  const handleMouseInteraction = (!isSmallScreen && !fullboardMode) ? true : false;
  const interactionOnMouseDown = handleMouseInteraction ? onMouseDown : undefined;
  const interactionOnMouseMove = handleMouseInteraction ? onMouseMove : undefined;
  const interactionOnMouseUp = handleMouseInteraction ? onMouseUp : undefined;

  const notesTransformStyle = { transform: (isSmallScreen || fullboardMode) ? 'none' : `rotate(${-rotationAngle}deg)` };
  const logoCircleSize = isSmallScreen ? circleSize * 3 : circleSize * 0.5;

  return (
    <div
      className="relative select-none uppercase circle-large-container"
      style={getContainerStyle(isSmallScreen, fullboardMode, circleSize)}
    >
      <CircleBackgroundText
        circleSize={circleSize}
        radius={radius}
        displayText={displayText}
        isSmallScreen={isSmallScreen}
        fullboardMode={fullboardMode}
      />

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

      {/* Background Pattern Layer */}
      {isPatternVisible && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none circle-with-pattern-manual"
          style={{
            ...getPatternStyles(),
            width: circleSize,
            height: circleSize,
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: -2,
          }}
        />
      )}

      {/* Non-rotating background wrapper for the logo */}
      {displayOptions?.showLogo !== false && !isPatternVisible && (
        <div
          className={getLogoWrapperClasses(isSmallScreen, fullboardMode)}
          style={getLogoWrapperStyle(isSmallScreen, fullboardMode, circleSize)}
        >
          <EmptyLogo
            circleSize={logoCircleSize}
            isSmallScreen={isSmallScreen}
            isFullboardMode={fullboardMode}
          />
        </div>
      )}

      <div
        ref={containerRef}
        role="application"
        aria-label="Workspace"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropFunction}
        onMouseDown={interactionOnMouseDown}
        onMouseMove={interactionOnMouseMove}
        onMouseUp={interactionOnMouseUp}
        onMouseLeave={interactionOnMouseUp}
        id="circle-large-container"
        className={getMainCircleClasses(isSmallScreen, fullboardMode)}
        style={getMainCircleStyle(isSmallScreen, fullboardMode, circleSize, rotationAngle)}
      >
        {selectedDay && (
          <div style={notesTransformStyle}>
            <NotesArea dayInfo={selectedDay} />
          </div>
        )}

        <ItemsOnCircle
          items={itemsForSelectedDay}
          cx={cx}
          cy={cy}
          rotationAngle={fullboardMode ? 0 : rotationAngle}
          onItemDrag={onItemDrag}
          onItemDrop={handleItemDrop}
          onNoteDragStart={handleNoteDragStart}
          onNoteUpdate={handleNoteUpdate}
          onDeleteItem={handleDeleteItem}
          circleSize={circleSize}
          maxRadius={radius}
          isSmallScreen={isSmallScreen}
          activeItemId={activeItemId}
          onItemActivate={(id) => bringToFront(id)}
          zOrderMap={zOrderMap}
          onErrorToast={onErrorToast}
          rotationEnabled={!fullboardMode}
          fullboardMode={fullboardMode}
          containerWidth={fullboardMode ? width : circleSize}
          containerHeight={fullboardMode ? (typeof window !== 'undefined' ? window.innerHeight : 800) : circleSize}
        />
      </div>
    </div>
  );
}

CircleLarge.propTypes = {
  showSmall: PropTypes.bool,
  selectedDay: PropTypes.object,
  setSelectedDay: PropTypes.func,
  onItemDrag: PropTypes.func,
  displayOptions: PropTypes.object,
  setLocalItemsByDate: PropTypes.func,
  onCircleSizeChange: PropTypes.func,
  onErrorToast: PropTypes.func,
  onInfoToast: PropTypes.func,
  fullboardMode: PropTypes.bool,
};