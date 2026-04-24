import { Item } from '../models/item.model.js';
import { withRLS } from '../utils/rls.utils.js';

function extractItemMetadata(itemData) {
  if (!itemData) return { item_type: null, content_text: null };
  const item_type = itemData.type || itemData.label || null;
  
  let content_text = null;
  if (itemData.content) {
     if (typeof itemData.content.text === 'string') {
        content_text = itemData.content.text;
     } else if (typeof itemData.content.title === 'string') {
        content_text = itemData.content.title + (itemData.content.description ? ' ' + itemData.content.description : '');
     } else if (typeof itemData.content === 'string') {
        content_text = itemData.content;
     }
  }
  if (!content_text && itemData.text) {
     content_text = itemData.text;
  }
  
  return { item_type, content_text };
}

export async function getItems(req, res) {
  try {
    await withRLS(req.user.id, async (t) => {
      const items = await Item.findAll({
        where: { user_id: req.user.id },
        transaction: t
      });
      // Asegurar que item_data sea objeto (no string) en la respuesta
      const normalized = items.map((row) => {
        const plain = row.toJSON();
        if (typeof plain.item_data === 'string') {
          try { plain.item_data = JSON.parse(plain.item_data); } catch { plain.item_data = {}; }
        }
        return plain;
      });
      res.json(normalized);
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener items', error: err.message });
  }
}

export async function createItem(req, res) {
  try {
    await withRLS(req.user.id, async (t) => {
      const { client_id, date, x, y, rotation, rotation_enabled } = req.body;
      let { item_data } = req.body;
      if (typeof item_data === 'string') {
        try { item_data = JSON.parse(item_data); } catch { item_data = {}; }
      }

      // Restricciones para usuarios no VIP
      const isVip = !!req.user?.is_vip;
      if (!isVip) {
        // Limitar cantidad total de items del usuario
        const itemCount = await Item.count({
          where: { user_id: req.user.id },
          transaction: t
        });
        if (itemCount >= 15) {
          return res.status(403).json({
            message: 'Límite alcanzado: las cuentas gratuitas pueden crear hasta 15 items.'
          });
        }

        // Si es un item tipo Archivo, validar tamaño máximo de 3MB
        const label = item_data?.label || item_data?.type || '';
        if (label === 'Archivo' || label.toLowerCase() === 'archivo') {
          const sizeBytes = item_data?.content?.fileData?.size;
          if (typeof sizeBytes === 'number') {
            const sizeMB = sizeBytes / (1024 * 1024);
            if (sizeMB > 3) {
              return res.status(413).json({
                message: 'El archivo excede el límite de 3MB para cuentas gratuitas.'
              });
            }
          }
        }
      }
      console.log('📝 Creando item en base de datos con:', {
        date, x, y, rotation, rotation_enabled, item_data, user_id: req.user.id
      });

      const { item_type, content_text } = extractItemMetadata(item_data);

      const newItem = await Item.create({
        date,
        x,
        y,
        rotation,
        rotation_enabled,
        item_data,
        item_type,
        content_text,
        user_id: req.user.id
      }, { transaction: t });

      res.json({
        client_id: client_id || null,
        item: newItem
      });
    });
  } catch (err) {
    console.error('Error en createItem:', err);
    res.status(500).json({ message: 'Error al crear item', error: err.message });
  }
}

export async function updateItem(req, res) {
  try {
    await withRLS(req.user.id, async (t) => {
      const { id } = req.params;
      const item = await Item.findOne({
        where: { id, user_id: req.user.id },
        transaction: t
      });
      if (!item) return res.status(404).json({ message: 'Item no encontrado' });

      let { item_data: incomingItemData, version: incomingVersion, ...rest } = req.body;
      if (typeof incomingItemData === 'string') {
        try { incomingItemData = JSON.parse(incomingItemData); } catch { incomingItemData = undefined; }
      }

      const parsedIncomingVersion = Number(incomingVersion);
      if (incomingVersion && !isNaN(parsedIncomingVersion)) {
        if (Number(item.version) !== parsedIncomingVersion) {
          return res.status(409).json({ 
            message: 'Conflicto de sincronización. El ítem fue modificado y guardado por otra sesión.', 
            current_item: item.toJSON() 
          });
        }
      }

      // Restricción de tamaño de archivo para cuentas gratuitas al actualizar un Archivo
      const isVip = !!req.user?.is_vip;
      if (!isVip && incomingItemData && typeof incomingItemData === 'object') {
        const effectiveLabel = incomingItemData?.label || item.item_data?.label || '';
        if (effectiveLabel === 'Archivo' || String(effectiveLabel).toLowerCase() === 'archivo') {
          const sizeBytes = incomingItemData?.content?.fileData?.size;
          if (typeof sizeBytes === 'number') {
            const sizeMB = sizeBytes / (1024 * 1024);
            if (sizeMB > 3) {
              return res.status(413).json({
                message: 'El archivo excede el límite de 3MB para cuentas gratuitas. Hazte VIP para subir archivos más grandes.'
              });
            }
          }
        }
      }

      const updatePayload = { ...rest };

      // Optimistic concurrency for geometry updates using position_ts in item_data
      const geometryKeys = new Set([
        'x', 'y', 'angle', 'distance', 'width', 'height', 'rotation', 'rotation_enabled'
      ]);
      const hasGeomInRest = Object.keys(rest || {}).some(k => geometryKeys.has(k));
      const currentItemData = item.item_data || {};
      const incomingItemDataObj = (incomingItemData && typeof incomingItemData === 'object') ? incomingItemData : {};

      // Determine incoming vs current position_ts
      const incomingTs = Number(incomingItemDataObj.position_ts || 0);
      const currentTs = Number(currentItemData.position_ts || 0);

      // If there are geometry fields in request but ts is stale, drop geometry fields
      if (hasGeomInRest && incomingTs && currentTs && incomingTs < currentTs) {
        for (const k of Object.keys(updatePayload)) {
          if (geometryKeys.has(k)) delete updatePayload[k];
        }
      }

      // Merge item_data, and update stored position_ts only if newer
      if (incomingItemData && typeof incomingItemData === 'object') {
        const mergedItemData = {
          ...currentItemData,
          ...incomingItemDataObj,
        };
        if (incomingTs && (!currentTs || incomingTs >= currentTs)) {
          mergedItemData.position_ts = incomingTs;
        } else if (currentTs && incomingTs && incomingTs < currentTs) {
          // keep current position_ts on stale update
          mergedItemData.position_ts = currentTs;
        }
        updatePayload.item_data = mergedItemData;
      }

      if (incomingVersion && !isNaN(parsedIncomingVersion)) {
        updatePayload.version = Number(item.version) + 1;
      }

      if (updatePayload.item_data) {
        const { item_type, content_text } = extractItemMetadata(updatePayload.item_data);
        if (item_type !== null) updatePayload.item_type = item_type;
        if (content_text !== null) updatePayload.content_text = content_text;
      }

      await item.update(updatePayload, { transaction: t });

      const plain = item.toJSON();
      res.json(plain);
    });
  } catch (err) {
    console.error('Error en updateItem:', err);
    res.status(500).json({ message: 'Error al actualizar item', error: err.message });
  }
}

export async function deleteItem(req, res) {
  try {
    await withRLS(req.user.id, async (t) => {
      const { id } = req.params;
      const deleted = await Item.destroy({
        where: { id, user_id: req.user.id },
        transaction: t
      });
      if (!deleted) return res.status(404).json({ message: 'Item no encontrado' });
      res.json({ message: 'Item eliminado' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar item', error: err.message });
  }
}

export async function syncItems(req, res) {
  try {
    await withRLS(req.user.id, async (t) => {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: 'Se esperaba un array de items' });
      }

      const syncedItems = [];
      const isVip = !!req.user?.is_vip;

      let currentItemCount = 0;
      if (!isVip) {
        currentItemCount = await Item.count({ where: { user_id: req.user.id }, transaction: t });
      }

      for (const item of items) {
        if (!isVip && currentItemCount >= 15) {
          continue;
        }

        const { client_id, date, x, y, rotation, rotation_enabled } = item;
        let { item_data } = item;
        if (typeof item_data === 'string') {
          try { item_data = JSON.parse(item_data); } catch { item_data = {}; }
        }

        const label = item_data?.label || item_data?.type || '';
        if (!isVip && (label === 'Archivo' || label.toLowerCase() === 'archivo')) {
          const sizeBytes = item_data?.content?.fileData?.size;
          if (typeof sizeBytes === 'number' && (sizeBytes / (1024 * 1024) > 3)) {
            continue;
          }
        }

        const newItem = await Item.create({
          date, x, y, rotation, rotation_enabled, item_data, user_id: req.user.id
        }, { transaction: t });

        syncedItems.push({
          client_id,
          item: newItem
        });

        if (!isVip) currentItemCount++;
      }

      res.json({ synced_items: syncedItems });
    });
  } catch (err) {
    console.error('Error en syncItems:', err);
    res.status(500).json({ message: 'Error al sincronizar items', error: err.message });
  }
}
