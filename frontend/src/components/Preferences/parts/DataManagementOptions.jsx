import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import BottomToast from '@components/common/BottomToast';
import { useAuth } from '@context/AuthContext';
import { useItems } from '@context/ItemsContext';
import { useTranslation } from 'react-i18next';

export default function DataManagementOptions() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { itemsByDate, deleteItem, setItemsByDate } = useItems();

  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isDeletingPast, setIsDeletingPast] = useState(false);
  const [showConfirmAll, setShowConfirmAll] = useState(false);
  const [showConfirmPast, setShowConfirmPast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const getItemLimit = () => {
    if (!user) return 5; // Usuario local: límite 5
    if (user.is_vip) return null; // Usuario premium: sin límite
    return 15; // Usuario registrado normal: límite 15
  };

  const itemLimit = getItemLimit();
  const totalItems = Object.values(itemsByDate).reduce((acc, items) => acc + items.length, 0);
  const progressPercentage = itemLimit ? Math.min((totalItems / itemLimit) * 100, 100) : 0;
  const isAtLimit = itemLimit ? totalItems >= itemLimit : false;
  const pastItems = Object.entries(itemsByDate).reduce((acc, [dateKey, items]) => {
    try {
      let date;
      if (dateKey.includes('-')) {
        date = new Date(dateKey);
      } else {
        const parts = dateKey.split('/');
        if (parts.length === 3) {
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
          date = new Date(dateKey);
        }
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today && !isNaN(date.getTime())) {
        acc.count += items.length;
        acc.dates.push({ dateKey, items });
      }
    } catch { }
    return acc;
  }, { count: 0, dates: [] });

  const handleDeleteAllItems = async () => {
    setIsDeletingAll(true);
    setShowConfirmAll(false);
    try {
      if (user && token) {
        const deletePromises = Object.values(itemsByDate).flat().map(item =>
          deleteItem(item.id).catch(() => null)
        );
        await Promise.all(deletePromises);
        setToastMsg(t('data.allDeletedServer'));
      } else {
        setItemsByDate({});
        localStorage.removeItem('localItems');
        setToastMsg(t('data.allDeletedLocal'));
      }
    } catch {
      setToastMsg(t('data.deleteAllError'));
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleDeletePastItems = async () => {
    setIsDeletingPast(true);
    setShowConfirmPast(false);
    try {
      if (user && token) {
        const deletePromises = pastItems.dates.flatMap(({ items }) =>
          items.map(item => deleteItem(item.id).catch(() => null))
        );
        await Promise.all(deletePromises);
        setToastMsg(t('data.pastDeletedServer', { count: pastItems.count }));
      } else {
        const updatedItemsByDate = { ...itemsByDate };
        pastItems.dates.forEach(({ dateKey }) => { delete updatedItemsByDate[dateKey]; });
        setItemsByDate(updatedItemsByDate);
        try {
          const localItems = JSON.parse(localStorage.getItem('localItems') || '{}');
          const updatedLocalItems = {};
          Object.entries(localItems).forEach(([dateKey, items]) => {
            const date = new Date(dateKey);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date >= today) updatedLocalItems[dateKey] = items;
          });
          localStorage.setItem('localItems', JSON.stringify(updatedLocalItems));
        } catch { }
        setToastMsg(t('data.pastDeleted', { count: pastItems.count }));
      }
    } catch {
      setToastMsg(t('data.deletePastError'));
    } finally {
      setIsDeletingPast(false);
    }
  };

  return (
    <div className="data-management-options">
      <div className="data-stats">
        <div className="stat-item">
          <span className="stat-label">{t('data.total')}:</span>
          <span className="stat-value">{totalItems}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t('data.past')}:</span>
          <span className="stat-value">{pastItems.count}</span>
        </div>
        {!user && (
          <div className="stat-item full-width">
            <span className="stat-label">{t('data.mode')}:</span>
            <span className="stat-value">{t('data.local')}</span>
          </div>
        )}

        {itemLimit && (
          <div className="stat-item full-width progress-item">
            <div className="progress-header">
            </div>
            <div className="progress-bar-container">
              <div
                className={`progress-bar ${isAtLimit ? 'at-limit' : ''}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            {isAtLimit && (
              <div className="limit-warning">
                <AlertTriangle size={14} />
                <span>{t('data.limitReached')}</span>
              </div>
            )}
          </div>
        )}

        {!itemLimit && user?.is_vip && (
          <div className="stat-item full-width premium-info">
            <span className="stat-label">{t('data.plan')}:</span>
            <span className="stat-value premium-badge">{t('data.premiumUnlimited')}</span>
          </div>
        )}
      </div>

      <div className="danger-zone">
        <h4>{t('data.deletion')}</h4>
        <div className="danger-actions">
          <button
            className="danger-button"
            onClick={() => setShowConfirmPast(true)}
            disabled={isDeletingPast || pastItems.count === 0}
          >
            <Trash2 size={16} />
            {isDeletingPast ? t('data.deleting') : t('data.deletePast')}
          </button>

          <button
            className="danger-button"
            onClick={() => setShowConfirmAll(true)}
            disabled={isDeletingAll || totalItems === 0}
          >
            <Trash2 size={16} />
            {isDeletingAll ? t('data.deleting') : t('data.deleteAll')}
          </button>
        </div>
      </div>

      {showConfirmPast && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h4>{t('data.confirmDeletion')}</h4>
            <p>{t('data.confirmPastQuestion', { count: pastItems.count })}</p>
            <div className="info-container">
              <div className="info-item">{t('data.noUndo')}</div>
              {!user && (<div className="info-item">{t('data.localWarning')}</div>)}
            </div>
            <div className="confirmation-buttons">
              <button className="confirm-button" onClick={handleDeletePastItems} disabled={isDeletingPast}>
                {isDeletingPast ? t('data.deleting') : t('data.yesDelete')}
              </button>
              <button className="cancel-button" onClick={() => setShowConfirmPast(false)} disabled={isDeletingPast}>
                {t('data.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmAll && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h4>{t('data.confirmTotalDeletion')}</h4>
            <div className="info-container">
              <div className="info-item">{t('data.noUndo')}</div>
              {!user && (<div className="info-item">{t('data.localWarning')}</div>)}
            </div>
            <div className="confirmation-buttons">
              <button className="confirm-button" onClick={handleDeleteAllItems} disabled={isDeletingAll}>
                {isDeletingAll ? t('data.deleting') : t('data.yesDeleteAll')}
              </button>
              <button className="cancel-button" onClick={() => setShowConfirmAll(false)} disabled={isDeletingAll}>
                {t('data.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomToast message={toastMsg} onClose={() => setToastMsg('')} duration={5000} />
    </div>
  );
}


