import React from 'react';
import { useTranslation } from 'react-i18next';

export default function NotePreview({ item }) {
  const { t } = useTranslation();

  const hasRealContent = (content) => {
    if (!content) return false;
    if (typeof content === 'string') return content.trim().length > 0;
    if (Array.isArray(content)) return content.some(it => it && it.trim && it.trim().length > 0);
    if (typeof content === 'object') {
      if (content.fileData && content.base64) return true;
      return Object.keys(content).length > 0 && JSON.stringify(content) !== '{}';
    }
    return false;
  };

  if (typeof item.content === 'object' && item.content.fileData && item.content.base64) {
    return (
      <a
        href={item.content.base64}
        download={item.content.fileData.name}
        className="file-download-link"
        title={t('file.download')}
        style={{ display: 'flex', alignItems: 'center', width: '100%' }}
      >
        {item.content.fileData.name}
      </a>
    );
  }

  if (!hasRealContent(item.content)) {
    return (
      <div className="empty-content-placeholder">
        <span className="text-gray-400 italic">{t('sidebar.noContent')}</span>
      </div>
    );
  }

  if (typeof item.content === 'object') {
    return (
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '9px', lineHeight: '1.2', margin: 0, display: 'flex', alignItems: 'center', width: '100%' }}>
        {JSON.stringify(item.content, null, 2)}
      </pre>
    );
  }

  return (
    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '10px', lineHeight: '1.3', margin: 0, display: 'flex', alignItems: 'center', width: '100%' }}>
      {item.content}
    </pre>
  );
}
