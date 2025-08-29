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

export default function CircleLarge({ showSmall, selectedDay, setSelectedDay, onItemDrag, displayOptions, setLocalItemsByDate }) {
  const { width } = useWindowDimensions();
  const [circleSize, setCircleSize] = useState(680);
  const { itemsByDate: contextItemsByDate, setItemsByDate: contextSetItemsByDate } = useItems();
  const { user, token } = useAuth();
  
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
    if (width <= 640) {
      setCircleSize(Math.min(width - 40, 360));
    } else {
      setCircleSize(680);
    }
  }, [width]);

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
      className="relative select-none uppercase"
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
        className={
          isSmallScreen
            ? 'absolute inset-0 flex items-center justify-center z-[1]'
            : 'rounded-full border flex items-center justify-center overflow-hidden'
        }
        style={{
          width: isSmallScreen ? '100%' : circleSize,
          height: isSmallScreen ? '100dvh' : circleSize,
          margin: isSmallScreen ? undefined : '0 auto',
          transform: isSmallScreen ? 'none' : `rotate(${rotationAngle}deg)`,
          borderColor: isSmallScreen ? 'transparent' : 'var(--circle-border-light)',
          borderStyle: isSmallScreen ? 'none' : 'solid',
          position: 'relative',
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