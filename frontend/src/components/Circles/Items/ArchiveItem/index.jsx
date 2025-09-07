import React, { useRef, useState, useEffect } from 'react';
import UnifiedContainer from '../../../common/UnifiedContainer';
import WithContextMenu from '../../../common/WithContextMenu';
import BottomToast from '../../../common/BottomToast';
import { handleFile } from '../../../../utils/fileHandler';

import '../../../../styles/components/circles/items/ArchivoItem.css';
import { useAuth } from '../../../../context/AuthContext';
import { useItems } from '../../../../context/ItemsContext';

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
  isSmallScreen,
  onItemDrag,
  onItemDrop,
  isActive,
  onActivate,
}) {
  const fileInputRef = useRef();
  const [isExpanded, setIsExpanded] = useState(!!item.isExpanded);
  const [toastMessage, setToastMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const timeoutRef = useRef(null);
  const wasDraggingRef = useRef(false);
  const { user } = useAuth();
  const { duplicateItem } = useItems();

  // Cargar las dimensiones naturales de la imagen cuando se sube
  useEffect(() => {
    if (item.content?.base64 && isImage) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.src = item.content.base64;
    }
  }, [item.content?.base64]);

  const onFileChange = (e) => {
    const { error } = handleFile(e, onUpdate, id, item, x, y, null, !!user?.is_vip);
    if (error) {
      setToastMessage(error);
    } else {
      setToastMessage('');
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
    const newName = prompt('Ingrese el nuevo nombre del archivo:', item.content?.fileData?.name || '');
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
      setToastMessage('No se pudo duplicar el archivo');
    }
  };

  const isImage =
    item.content?.fileData?.type === 'image/jpeg' ||
    item.content?.fileData?.type === 'image/png';

  // Determinar qué opciones mostrar en el menú contextual
  const getContextMenuOptions = () => {
    const options = [];
    
    // Solo mostrar opciones si hay un archivo subido
    if (item.content?.fileData && item.content?.base64) {
      options.push({ label: 'Renombrar archivo', onClick: renameFile });
      options.push({ label: 'Duplicar', onClick: handleDuplicate });
      
      // Solo mostrar opción de imagen si es realmente una imagen
      if (isImage) {
        options.push({ 
          label: isExpanded ? 'Colapsar imagen' : 'Expandir imagen', 
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
      
      options.push({ label: 'Descargar archivo', onClick: handleDownload });
    }
    
    return options;
  };

  // Calcular dimensiones del contenedor
  const getContainerDimensions = () => {
    if (!item.content?.fileData) {
      return { width: 180, height: 80 }; // Reducido de 100 a 80
    }

    if (isImage && isExpanded && imageDimensions.width > 0) {
      // En modo expandido, usar las dimensiones reales del archivo
      // pero limitar el tamaño máximo para evitar que sea demasiado grande
      const maxSize = 300; // Tamaño máximo razonable
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
    return { width: 180, height: isImage ? 180 : 80 }; // Reducido de 100 a 80
  };

  const { width, height } = getContainerDimensions();

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
          minWidth={width}
          maxWidth={width}
          minHeight={height}
          maxHeight={height}
          disableResize={true}
          onMove={({ x: newX, y: newY }) => {
            // Calcular el ángulo y distancia desde el centro del círculo
            const dx = newX - cx;
            const dy = newY - cy;
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
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
          maxRadius={circleSize / 2}
          isSmallScreen={isSmallScreen}
          isActive={isActive}
          onActivate={() => onActivate?.()}
          zIndexOverride={item.zIndexOverride}
        >
          <div
            className={`archivo-item-container ${isExpanded ? 'expanded' : ''}`}
            onClick={handleContainerClick}
            style={{
              cursor: !item.content?.fileData ? 'pointer' : 'default',
            }}
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
              <div>
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

      <BottomToast
        message={toastMessage}
        onClose={() => setToastMessage('')}
        duration={3000}
      />
    </>
  );
}