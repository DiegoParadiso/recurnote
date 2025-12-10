import React from 'react';
import { formatText } from '@utils/textFormatter';
import { useTranslation } from 'react-i18next';
import hasRealContent from '@utils/hasRealContent';

export default function NotePreview({ item }) {
  const { t } = useTranslation();

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
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.2', margin: 0, display: 'flex', alignItems: 'center', width: '100%' }}>
        {JSON.stringify(item.content, null, 2)}
      </pre>
    );
  }

  return (
    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.5', margin: 0, display: 'block', width: '100%', fontSize: '11.5px', color: 'var(--color-text-primary)' }}>
      {formatText(item.content)}
    </div>
  );
}
