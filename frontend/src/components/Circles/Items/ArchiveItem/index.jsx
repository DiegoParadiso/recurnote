import React, { useRef, useState } from 'react';
import UnifiedContainer from '../../../common/UnifiedContainer';
import WithContextMenu from '../../../common/WithContextMenu';
import BottomToast from '../../../common/BottomToast';
import { handleFile } from '../../../../utils/fileHandler';
import '../../../../styles/components/circles/items/ArchivoItem.css';

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
}) {
  const fileInputRef = useRef();
  const [showOnlyImage, setShowOnlyImage] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const onFileChange = (e) => {
    const { error } = handleFile(e, onUpdate, id, item, x, y, setShowOnlyImage);
    if (error) {
      setToastMessage(error);
    } else {
      setToastMessage('');
    }
  };

  const handleContainerClick = () => {
    if (!item.content?.fileData) {
      fileInputRef.current?.click();
    }
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setShowOnlyImage((prev) => !prev);
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

  const duplicateFile = () => {
    alert('Función duplicar archivo (debes implementar)');
  };

  const toggleShowOnlyImage = () => {
    setShowOnlyImage((prev) => !prev);
  };

  const isImage =
    item.content?.fileData?.type === 'image/jpeg' ||
    item.content?.fileData?.type === 'image/png';

  const minWidth = showOnlyImage ? 120 : 120;
  const maxWidth = showOnlyImage ? 800 : 300;
  const minHeight = showOnlyImage ? 120 : isImage ? 140 : 80;
  const maxHeight = showOnlyImage ? 800 : isImage ? 220 : 140;

  return (
    <>
      <WithContextMenu
        onDelete={() => onDelete?.(id)}
        extraOptions={[
          { label: 'Renombrar archivo', onClick: renameFile },
          { label: 'Duplicar archivo', onClick: duplicateFile },
          { label: showOnlyImage ? 'Mostrar todo' : 'Mostrar solo imagen', onClick: toggleShowOnlyImage },
          { label: 'Descargar archivo', onClick: handleDownload },
        ]}
      >
        <UnifiedContainer
          x={x}
          y={y}
          rotation={rotationEnabled ? rotation : 0}
          width={item.width || (showOnlyImage ? 220 : 180)}
          height={item.height || (showOnlyImage ? 220 : isImage ? 180 : 100)}
          minWidth={minWidth}
          maxWidth={maxWidth}
          minHeight={minHeight}
          maxHeight={maxHeight}
          onMove={({ x: newX, y: newY }) => {
            onUpdate?.(
              id,
              item.content || {},
              null,
              { width: item.width || maxWidth, height: item.height || maxHeight },
              { x: newX, y: newY }
            );
            onItemDrag?.(id, { x: newX, y: newY });
          }}
          onResize={(newSize) => {
            onUpdate?.(
              id,
              item.content || {},
              null,
              { width: newSize.width, height: newSize.height },
              { x: x, y: y }
            );
          }}
          onDrop={() => {
            onItemDrop?.(id);
          }}
          circleCenter={{ cx, cy }}
          maxRadius={circleSize / 2}
          isSmallScreen={isSmallScreen}
        >
          <div
            className={`archivo-item-container ${showOnlyImage ? 'show-only-image' : ''}`}
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
                onDoubleClick={handleImageClick}
                title="Doble click para expandir/colapsar imagen"
              />
            )}

            {!showOnlyImage && item.content?.fileData && (
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