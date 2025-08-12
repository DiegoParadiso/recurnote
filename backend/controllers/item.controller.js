import { Item } from '../models/item.model.js';

export async function getItems(req, res) {
  try {
    const items = await Item.findAll({ where: { user_id: req.user.id } });
    // Asegurar que item_data sea objeto (no string) en la respuesta
    const normalized = items.map((row) => {
      const plain = row.toJSON();
      if (typeof plain.item_data === 'string') {
        try { plain.item_data = JSON.parse(plain.item_data); } catch { plain.item_data = {}; }
      }
      return plain;
    });
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener items', error: err.message });
  }
}

export async function createItem(req, res) {
  try {
    const { date, x, y, rotation, rotation_enabled } = req.body;
    let { item_data } = req.body;
    if (typeof item_data === 'string') {
      try { item_data = JSON.parse(item_data); } catch { item_data = {}; }
    }

    // Restricciones para usuarios no VIP
    const isVip = !!req.user?.is_vip;
    if (!isVip) {
      // Limitar cantidad total de items del usuario
      const itemCount = await Item.count({ where: { user_id: req.user.id } });
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
    const newItem = await Item.create({
      date,
      x,
      y,
      rotation,
      rotation_enabled,
      item_data,
      user_id: req.user.id
    });
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear item', error: err.message });
  }
}

export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const item = await Item.findOne({ where: { id, user_id: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Item no encontrado' });

    let { item_data: incomingItemData, ...rest } = req.body;
    if (typeof incomingItemData === 'string') {
      try { incomingItemData = JSON.parse(incomingItemData); } catch { incomingItemData = undefined; }
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
    if (incomingItemData && typeof incomingItemData === 'object') {
      updatePayload.item_data = {
        ...(item.item_data || {}),
        ...incomingItemData,
      };
    }

    await item.update(updatePayload);
    const plain = item.toJSON();
    res.json(plain);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar item', error: err.message });
  }
}

export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Item.destroy({ where: { id, user_id: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'Item no encontrado' });
    res.json({ message: 'Item eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar item', error: err.message });
  }
}
