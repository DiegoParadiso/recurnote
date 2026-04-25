import { Item } from '../models/item.model.js';
import { BUSINESS_RULES } from '../config/business.js';

class ItemService {
  /**
   * Extrae el tipo de ítem y el texto de búsqueda a partir de la información
   * polimórfica almacenada en itemData.
   */
  extractItemMetadata(itemData) {
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

  /**
   * Valida si un usuario que no es VIP puede crear más items
   */
  async checkFreeItemLimit(userId, transaction) {
    const itemCount = await Item.count({
      where: { user_id: userId },
      transaction
    });
    
    if (itemCount >= BUSINESS_RULES.MAX_FREE_ITEMS) {
      const error = new Error(`Límite alcanzado: las cuentas gratuitas pueden crear hasta ${BUSINESS_RULES.MAX_FREE_ITEMS} items.`);
      error.statusCode = 403;
      throw error;
    }
  }

  /**
   * Valida si el payload de item excede el límite de tamaño para usuarios gratuitos
   */
  checkFreeFileSizeLimit(itemData) {
    const label = itemData?.label || itemData?.type || '';
    if (label === 'Archivo' || String(label).toLowerCase() === 'archivo') {
      const sizeBytes = itemData?.content?.fileData?.size;
      if (typeof sizeBytes === 'number') {
        const sizeMB = sizeBytes / (1024 * 1024);
        if (sizeMB > BUSINESS_RULES.MAX_FREE_FILE_SIZE_MB) {
          const error = new Error(`El archivo excede el límite de ${BUSINESS_RULES.MAX_FREE_FILE_SIZE_MB}MB para cuentas gratuitas. Hazte VIP para subir archivos más grandes.`);
          error.statusCode = 413;
          throw error;
        }
      }
    }
  }

  /**
   * Prepara los datos del payload actualizando la metadata requerida (item_type, content_text)
   */
  prepareItemPayload(payload) {
    if (payload.item_data) {
      const { item_type, content_text } = this.extractItemMetadata(payload.item_data);
      if (item_type !== null) payload.item_type = item_type;
      if (content_text !== null) payload.content_text = content_text;
    }
    return payload;
  }
}

export const itemService = new ItemService();
