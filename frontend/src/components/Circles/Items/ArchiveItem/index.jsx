import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import UnifiedContainer from '@components/common/UnifiedContainer';
import WithContextMenu from '@components/common/WithContextMenu';
import { handleFile } from '@utils/fileHandler';
import { useTranslation } from 'react-i18next';

import '@styles/components/circles/items/ArchivoItem.css';
import { useAuth } from '@context/AuthContext';
import { useItems } from '@context/ItemsContext';
import { computePolarFromXY } from '@utils/helpers/geometry';
import { useCallback } from 'react';
import useItemDrag from '../hooks/useItemDrag';
import { measureTextWidth } from '@utils/measureTextWidth';

const calculateContainerDimensions = (item, minWidthPx, isImage, isExpanded, imageDimensions, isSmallScreen) => {
  if (!item.content?.fileData) {
    const side = Math.max(minWidthPx, 110);
    return { width: side, height: side };
  }

  if (isImage && isExpanded && imageDimensions.width > 0) {
    if (item.width && item.height) {
      return { width: item.width, height: item.height };
    }

    const maxSize = 300;
    const aspectRatio = imageDimensions.width / imageDimensions.height;
    let finalWidth, finalHeight;

    if (aspectRatio > 1) {
      finalWidth = Math.min(imageDimensions.width, maxSize);
      finalHeight = finalWidth / aspectRatio;
    } else {
      finalHeight = Math.min(imageDimensions.height, maxSize);
      finalWidth = finalHeight * aspectRatio;
    }

    return {
      width: Math.round(finalWidth + 16),
      height: Math.round(finalHeight + 16)
    };
  }

  const baseHeight = isImage ? 180 : 130;
  const mobileExtraHeight = isSmallScreen ? 30 : 0;
  return { width: Math.max(minWidthPx, 180), height: baseHeight + mobileExtraHeight };
};

const calculateMinWidth = (item, isImage) => {
  if (!item.content?.fileData?.name) return 110;
  if (isImage) return 110;

  const name = item.content?.fileData?.name || 'Subir archivo...';
  const font = '10px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  const textWidth = measureTextWidth(name, font);

  const padding = 32; // 8 + 8 + 16
  const borders = 2;
  const desired = Math.ceil(textWidth + padding + borders);
  return Math.max(110, Math.min(300, desired));
};

export default function ArchivoItem({
  id,
  x,
  y,
  rotation,
  rotationEnabled = true,
  item,
  onUpdate,
  onDelete,
  cx,
  cy,
  circleSize,
  maxRadius,
  isSmallScreen,
  onItemDrag,
  onItemDrop,
  isActive,
  onActivate,
  onErrorToast,
  fullboardMode = false,
}) {
  const { t } = useTranslation();
  const fileInputRef = useRef();
  const [isExpanded, setIsExpanded] = useState(!!item.isExpanded);

  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const hasAutoExpandedRef = useRef(false);
  const { user } = useAuth();
  const { duplicateItem, captureUndoState } = useItems();
  const [minWidthPx, setMinWidthPx] = useState(110);

  const {
    isDragging,
    wasDraggingRef,
    handleContainerDragStart,
    handleContainerDragEnd,
  } = useItemDrag({ id, onActivate, onItemDrop });

  const isImage =
    item.content?.fileData?.type === 'image/jpeg' ||
    item.content?.fileData?.type === 'image/png';

  // Cargar las dimensiones naturales de la imagen cuando se sube
  useEffect(() => {
    if (item.content?.base64 && isImage) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight
        });

        // Si no hay estado de expansión guardado y no se ha expandido automáticamente antes, expandir por defecto
        if (!hasAutoExpandedRef.current && (item.isExpanded === undefined || item.isExpanded === null)) {
          hasAutoExpandedRef.current = true;
          setIsExpanded(true);
          onUpdate?.(
            id,
            item.content || {},
            null,
            null,
            null,
            { isExpanded: true }
          );
        }
      };
      img.src = item.content.base64;
    }
  }, [item.content?.base64, isImage, item.isExpanded, id, onUpdate]);

  const onFileChange = (e) => {
    const { error } = handleFile(e, onUpdate, id, item, x, y, null, !!user?.is_vip);
    if (error) {
      onErrorToast?.(error);
    } else {
      // sin toast local
    }
  };

  const handleContainerClick = (e) => {
    // No permitir carga de archivo si se está arrastrando
    if (isDragging || wasDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (!item.content?.fileData) {
      fileInputRef.current?.click();
    }
  };

  const handleImageDoubleClick = (e) => {
    // No cambiar vista si se está arrastando
    if (isDragging || wasDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.stopPropagation();
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // Guardar el estado en la base de datos
    onUpdate?.(
      id,
      item.content || {},
      null,
      null,
      null,
      { isExpanded: newExpandedState }
    );
  };



  const handleDownload = (e) => {
    e.stopPropagation();
    if (!item.content?.base64 || !item.content?.fileData) return;

    const link = document.createElement('a');
    link.href = item.content.base64;
    link.download = item.content.fileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renameFile = () => {
    const newName = prompt(t('file.renamePrompt'), item.content?.fileData?.name || '');
    if (newName && newName.trim() !== '') {
      const updatedFileData = { ...item.content.fileData, name: newName.trim() };
      onUpdate?.(
        id,
        { ...item.content, fileData: updatedFileData },
        null,
        { width: item.width, height: item.height },
        { x, y }
      );
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateItem(id);
    } catch (error) {
      onErrorToast?.(t('file.duplicateError'));
    }
  };

  // Determinar qué opciones mostrar en el menú contextual
  const getContextMenuOptions = () => {
    const options = [];

    // Solo mostrar opciones si hay un archivo subido
    if (item.content?.fileData && item.content?.base64) {
      options.push({ label: 'file.rename', onClick: renameFile });

      // Solo mostrar opción de imagen si es realmente una imagen
      if (isImage) {
        options.push({
          label: isExpanded ? 'file.collapseImage' : 'file.expandImage',
          onClick: () => {
            const newExpandedState = !isExpanded;
            setIsExpanded(newExpandedState);

            // Guardar el estado en la base de datos
            onUpdate?.(
              id,
              item.content || {},
              null,
              null,
              null,
              { isExpanded: newExpandedState }
            );
          }
        });
      }

      options.push({ label: 'file.download', onClick: handleDownload });
    }

    return options;
  };

  const { width, height } = calculateContainerDimensions(item, minWidthPx, isImage, isExpanded, imageDimensions, isSmallScreen);

  return (
    <>
      <WithContextMenu
        onDelete={() => onDelete?.(id)}
        extraOptions={getContextMenuOptions()}
      >
        <UnifiedContainer
          x={x}
          y={y}
          rotation={rotationEnabled ? rotation : 0}
          width={width}
          height={height}
          minWidth={item.content?.fileData && isImage && isExpanded ? 120 : minWidthPx}
          maxWidth={item.content?.fileData && isImage && isExpanded ? 600 : (item.content?.fileData ? Math.max(minWidthPx, width) : width)}
          minHeight={item.content?.fileData && isImage && isExpanded ? 90 : (item.content?.fileData ? height : width)}
          maxHeight={item.content?.fileData && isImage && isExpanded ? 600 : (item.content?.fileData ? height : width)}
          disableResize={!(isImage && isExpanded)}
          aspectRatio={aspectRatio}
          onResize={handleResize}
          onMove={({ x: newX, y: newY }) => {
            // Calcular el ángulo y distancia desde el centro del círculo
            const { angle, distance } = computePolarFromXY(newX, newY, cx, cy);
            onUpdate?.(
              id,
              item.content || {},
              null,
              { width, height },
              { x: newX, y: newY },
              { angle, distance, fromDrag: true, fullboardMode } // Combinar extra en un solo objeto
            );
            onItemDrag?.(id, { x: newX, y: newY });
          }}
          onDrag={handleContainerDragStart}
          onDrop={handleContainerDragEnd}
          circleCenter={{ cx, cy }}
          maxRadius={maxRadius}
          isSmallScreen={isSmallScreen}
          fullboardMode={fullboardMode}
          isActive={isActive}
          onActivate={() => {
            onActivate?.();
            captureUndoState?.(id);
          }}
          zIndexOverride={item.zIndexOverride}
        >
          <div
            className={`archivo-item-container ${isExpanded ? 'expanded' : ''} ${!item.content?.fileData ? 'empty' : ''}`}
            onClick={handleContainerClick}
            style={{
              cursor: !item.content?.fileData ? 'pointer' : 'default',
              userSelect: isDragging ? 'none' : 'auto',
              WebkitUserSelect: isDragging ? 'none' : 'auto',
              MozUserSelect: isDragging ? 'none' : 'auto',
              msUserSelect: isDragging ? 'none' : 'auto',
              pointerEvents: isDragging ? 'none' : 'auto',
            }}
            data-drag-container="true"
          >
            {isImage && (
              <img
                src={item.content.base64}
                alt={item.content.fileData.name}
                className="archivo-image"
                onDoubleClick={handleImageDoubleClick}
                title="Doble click para expandir/colapsar imagen"
              />
            )}

            {!isExpanded && item.content?.fileData && (
              <>
                {!isImage && (
                  <span className="material-symbols-outlined" style={{ marginTop: 8, marginBottom: 4 }}>
                    docs
                  </span>
                )}
                <p
                  className="truncate"
                  title={item.content.fileData.name}
                  style={{
                    marginTop: isImage ? 6 : 0,
                  }}
                >
                  {item.content.fileData.name}
                </p>
                <p className="text-gray-500" style={{ marginTop: 2, marginBottom: 4 }}>
                  {(item.content.fileData.size / (1024 * 1024)).toFixed(2)} MB
                </p>

                {isSmallScreen && (
                  <button
                    onClick={handleDownload}
                    className="btn-download"
                    type="button"
                    title="Descargar archivo"
                  >
                    Descargar
                  </button>
                )}
              </>
            )}

            {!item.content?.fileData && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                  />
                </svg>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </UnifiedContainer>
      </WithContextMenu>

      {/* Toasts delegados al Home vía onErrorToast */}
    </>
  );
}

ArchivoItem.propTypes = {
  id: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  rotation: PropTypes.number.isRequired,
  rotationEnabled: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDragStart: PropTypes.func,
  circleSize: PropTypes.number,
  maxRadius: PropTypes.number,
  isSmallScreen: PropTypes.bool,
  isActive: PropTypes.bool,
  onActivate: PropTypes.func,
  zIndex: PropTypes.number,
  fullboardMode: PropTypes.bool,
};