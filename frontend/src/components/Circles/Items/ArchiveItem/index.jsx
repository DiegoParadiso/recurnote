import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import UnifiedContainer from '@components/common/UnifiedContainer';
import WithContextMenu from '@components/common/WithContextMenu';
import { handleFile } from '@utils/fileHandler';
import { useTranslation } from 'react-i18next';

import '@styles/components/circles/items/ArchivoItem.css';
import { useAuth } from '@context/AuthContext';
import { useItems } from '@context/ItemsContext';
import { computePolarFromXY } from '@utils/helpers/geometry';

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
}) {
  const { t } = useTranslation();
  const fileInputRef = useRef();
  const [isExpanded, setIsExpanded] = useState(!!item.isExpanded);
  // Notificaciones se delegan a Home mediante onErrorToast
  const [isDragging, setIsDragging] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const timeoutRef = useRef(null);
  const wasDraggingRef = useRef(false);
  const hasAutoExpandedRef = useRef(false);
  const { user } = useAuth();
  const { duplicateItem } = useItems();
  const [minWidthPx, setMinWidthPx] = useState(110);

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

  const handleContainerDragStart = () => {
    onActivate?.();
    // Pequeño delay para permitir clicks rápidos
    timeoutRef.current = setTimeout(() => {
      setIsDragging(true);
      wasDraggingRef.current = true;
    }, 100);
  };

  const handleContainerDragEnd = () => {
    // Limpiar timeout si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Reset drag state inmediatamente al terminar
    setIsDragging(false);

    // Notificar al padre que el drop ha terminado
    onItemDrop?.(id);

    // Mantener wasDragging por un breve momento para evitar activaciones
    setTimeout(() => {
      wasDraggingRef.current = false;
    }, 200);
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

  // Limpiar timeouts cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
      options.push({ label: 'common.duplicate', onClick: handleDuplicate });
      
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

  // Calcular dimensiones del contenedor
  const getContainerDimensions = () => {
    if (!item.content?.fileData) {
      const side = Math.max(minWidthPx, 110);
      // Estado inicial sin archivo: forzar contenedor cuadrado más pequeño
      return { width: side, height: side };
    }

    if (isImage && isExpanded && imageDimensions.width > 0) {
      // Si el item ya tiene dimensiones guardadas, usarlas
      if (item.width && item.height) {
        return { width: item.width, height: item.height };
      }

      const maxSize = 300; 
      const aspectRatio = imageDimensions.width / imageDimensions.height;
      
      let finalWidth, finalHeight;
      
      if (aspectRatio > 1) {
        // Imagen horizontal
        finalWidth = Math.min(imageDimensions.width, maxSize);
        finalHeight = finalWidth / aspectRatio;
      } else {
        // Imagen vertical
        finalHeight = Math.min(imageDimensions.height, maxSize);
        finalWidth = finalHeight * aspectRatio;
      }
      
      // Agregar un pequeño padding para evitar que la imagen toque los bordes
      return { 
        width: Math.round(finalWidth + 16), 
        height: Math.round(finalHeight + 16) 
      };
    }

    // En modo normal, dimensiones estándar
    // En mobile, aumentar altura para acomodar el botón de descarga
    const baseHeight = isImage ? 180 : 130;
    const mobileExtraHeight = isSmallScreen ? 30 : 0;
    return { width: Math.max(minWidthPx, 180), height: baseHeight + mobileExtraHeight };
  };

  const { width, height } = getContainerDimensions();

  // Manejador de resize que mantiene la relación de aspecto
  const handleResize = (newSize) => {
    if (!isImage || !isExpanded || imageDimensions.width === 0) return;

    const aspectRatio = imageDimensions.width / imageDimensions.height;
    
    // Calcular la diagonal del rectángulo solicitado
    const requestedDiagonal = Math.sqrt(newSize.width * newSize.width + newSize.height * newSize.height);
    const currentDiagonal = Math.sqrt(width * width + height * height);
    
    // Escalar basado en la diagonal
    const scale = requestedDiagonal / currentDiagonal;
    
    let finalWidth = width * scale;
    let finalHeight = finalWidth / aspectRatio;
    
    // Aplicar límites
    const maxSize = 600;
    const minWidth = minWidthPx;
    const minHeight = 40;
    
    if (finalWidth > maxSize) {
      finalWidth = maxSize;
      finalHeight = finalWidth / aspectRatio;
    }
    if (finalHeight > maxSize) {
      finalHeight = maxSize;
      finalWidth = finalHeight * aspectRatio;
    }
    if (finalWidth < minWidth) {
      finalWidth = minWidth;
      finalHeight = finalWidth / aspectRatio;
    }
    if (finalHeight < minHeight) {
      finalHeight = minHeight;
      finalWidth = finalHeight * aspectRatio;
    }
    
    // Actualizar las dimensiones
    onUpdate?.(
      id,
      item.content || {},
      null,
      { width: Math.round(finalWidth), height: Math.round(finalHeight) },
      { x, y }
    );
  };

  // Medir ancho mínimo basado en el nombre del archivo (o placeholder)
  useLayoutEffect(() => {
    try {
      // Si no hay archivo aún, mantener mínimo cuadrado pequeño
      if (!item.content?.fileData?.name) {
        setMinWidthPx(110);
        return;
      }
      const name = item.content?.fileData?.name || 'Subir archivo...';
      // Crear elemento temporal para medir con fuente del contenedor
      const temp = document.createElement('span');
      temp.style.visibility = 'hidden';
      temp.style.position = 'fixed';
      temp.style.whiteSpace = 'pre';
      temp.style.font = '10px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      // Nota: si hay una clase/estilo de fuente específico, podemos copiarlo del contenedor real
      temp.textContent = name;
      document.body.appendChild(temp);
      const textWidth = temp.getBoundingClientRect().width;
      document.body.removeChild(temp);

      // Aproximar paddings (container + interno)
      const padding = 8 + 8 + 16; // container L/R + extra seguridad
      const borders = 2;
      const desired = Math.ceil(textWidth + padding + borders);
      const baseMin = 110; // permitir cuadrado más pequeño
      const maxAllowed = 300;
      const minW = Math.max(baseMin, Math.min(maxAllowed, desired));
      setMinWidthPx(minW);
    } catch (_) {}
  }, [item.content?.fileData?.name]);

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
          minWidth={minWidthPx}
          maxWidth={item.content?.fileData && isImage && isExpanded ? 600 : (item.content?.fileData ? Math.max(minWidthPx, width) : width)}
          minHeight={item.content?.fileData && isImage && isExpanded ? 40 : (item.content?.fileData ? height : width)}
          maxHeight={item.content?.fileData && isImage && isExpanded ? 600 : (item.content?.fileData ? height : width)}
          disableResize={!(isImage && isExpanded)}
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
              { angle, distance }
            );
            onItemDrag?.(id, { x: newX, y: newY });
          }}
          onDrag={handleContainerDragStart}
          onDrop={handleContainerDragEnd}
          circleCenter={{ cx, cy }}
          maxRadius={maxRadius}
          isSmallScreen={isSmallScreen}
          isActive={isActive}
          onActivate={() => onActivate?.()}
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