import { Item } from '../models/item.model.js';

export async function getItems(req, res) {
  try {
    const items = await Item.findAll({ where: { user_id: req.user.id } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener items', error: err.message });
  }
}

export async function createItem(req, res) {
  try {
    const { date, x, y, rotation, rotation_enabled, item_data } = req.body;
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

    const { item_data: incomingItemData, ...rest } = req.body;

    const updatePayload = { ...rest };
    if (incomingItemData && typeof incomingItemData === 'object') {
      updatePayload.item_data = {
        ...(item.item_data || {}),
        ...incomingItemData,
      };
    }

    await item.update(updatePayload);
    res.json(item);
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
