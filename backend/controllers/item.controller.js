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
