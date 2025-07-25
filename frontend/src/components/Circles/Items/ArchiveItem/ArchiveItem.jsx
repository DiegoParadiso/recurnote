import React, { useRef, useState } from 'react';
import UnifiedContainer from '../../../common/UnifiedContainer';
import WithContextMenu from '../../../common/WithContextMenu';
import BottomToast from '../../../common/BottomToast'; 

import { handleFile } from '../../../../utils/fileHandler';

export default function ArchivoItem({
  id,
  x,
  y,
  rotation,
  item,
  onUpdate,
  onDelete,
  cx,
  cy,
  circleSize,
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

  const isImage =
    item.content?.fileData?.type === 'image/jpeg' ||
    item.content?.fileData?.type === 'image/png';

  const minWidth = showOnlyImage ? 120 : 120;
  const maxWidth = showOnlyImage ? 800 : 300;
  const minHeight = showOnlyImage ? 120 : isImage ? 140 : 80;
  const maxHeight = showOnlyImage ? 800 : isImage ? 220 : 140;

  return (
    <>
      <WithContextMenu onDelete={() => onDelete?.(id)}>
        <UnifiedContainer
          x={x}
          y={y}
          rotation={rotation}
          width={item.width || (showOnlyImage ? 220 : 180)}
          height={item.height || (showOnlyImage ? 220 : isImage ? 180 : 100)}
          minWidth={minWidth}
          maxWidth={maxWidth}
          minHeight={minHeight}
          maxHeight={maxHeight}
          onMove={({ x: newX, y: newY }) =>
            onUpdate?.(
              id,
              item.content || {},
              null,
              { width: item.width || maxWidth, height: item.height || maxHeight },
              { x: newX, y: newY }
            )
          }
          onResize={(newSize) =>
            onUpdate?.(
              id,
              item.content || {},
              null,
              { width: newSize.width, height: newSize.height },
              { x: x, y: y }
            )
          }
          circleCenter={{ cx, cy }}
          maxRadius={circleSize / 2}
        >
          <div
            className={`archivo-item-container ${showOnlyImage ? 'show-only-image' : ''}`}
            onClick={handleContainerClick}
            style={{
              height: '100%',
              width: '100%',
              overflow: 'hidden',
              color: 'var(--color-text-primary)',
              cursor: !item.content?.fileData ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: showOnlyImage ? 'center' : 'flex-start',
              padding: showOnlyImage ? 0 : '8px 4px',
              position: 'relative',
            }}
          >
            {isImage && (
              <img
                src={item.content.base64}
                alt={item.content.fileData.name}
                className="archivo-image"
                onDoubleClick={handleImageClick}
                style={{
                  maxHeight: showOnlyImage ? '100%' : 100,
                  maxWidth: showOnlyImage ? '100%' : '100%',
                  objectFit: 'contain',
                  borderRadius: 4,
                  userSelect: 'none',
                  cursor: 'pointer',
                  marginBottom: showOnlyImage ? 0 : 6,
                }}
                title="Doble click para expandir/colapsar imagen"
              />
            )}

            {!showOnlyImage && item.content?.fileData && (
              <>
                <p
                  className="truncate w-full"
                  style={{
                    marginTop: isImage ? 6 : 0,
                    fontSize: '10px',
                    textAlign: 'center',
                    userSelect: 'text',
                  }}
                  title={item.content.fileData.name}
                >
                  {item.content.fileData.name}
                </p>
                <p
                  className="text-[8px] text-gray-500"
                  style={{ marginTop: 2, marginBottom: 4, textAlign: 'center' }}
                >
                  {(item.content.fileData.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <button
                  onClick={handleDownload}
                  className="btn-download"
                  type="button"
                  title="Descargar archivo"
                >
                  Descargar
                </button>
              </>
            )}

            {!item.content?.fileData && (
              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: 0.6,
                }}
              >
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

      <style>{`
        .btn-download {
          background-color: var(--color-bg);
          border: 1px solid var(--color-text-secondary);
          color: var(--color-text-primary);
          padding: 2px 6px;
          font-size: 9px;
          border-radius: 3px;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s ease;
        }
        .btn-download:hover {
          background-color: var(--color-bg-2);
        }
        html.dark .btn-download {
          background-color: var(--color-bg-2);
          border-color: var(--color-text-secondary);
          color: var(--color-text-primary);
        }
        html.dark .btn-download:hover {
          background-color: var(--color-bg);
        }
      `}</style>
    </>
  );
}
