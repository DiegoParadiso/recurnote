import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TaskPreview({ item, dateKey, toggleTaskCheck, renderDeleteButton }) {
  const { t } = useTranslation();
  return (
    <div
      key={item.id}
      className="w-full rounded item-card border shadow-sm text-[10px] relative min-h-[2.5rem]"
    >
      {renderDeleteButton ? renderDeleteButton() : null}
      <div className="task-container" style={{ wordBreak: 'break-word', lineHeight: '1.3' }}>
        {(item.content || []).map((task, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <label className="checkbox-label relative cursor-pointer select-none flex-shrink-0">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={item.checked?.[idx] || false}
                onChange={() => toggleTaskCheck(dateKey, item.id, idx)}
              />
              <span
                className={`checkbox-box ${item.checked?.[idx] ? 'checked' : ''}`}
              >
                <svg
                  viewBox="0 0 12 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5L4 8L11 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </label>
            <span 
              className={`flex-1 ${item.content?.[idx] ? (item.checked?.[idx] ? 'line-through' : '') : 'empty-task-text'}`}
              style={{ wordBreak: 'break-word', lineHeight: '1.3' }}
            >
              {item.content?.[idx] || t('task.empty')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
