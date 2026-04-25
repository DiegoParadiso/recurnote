// Configuración de límites y reglas de negocio.
// Estos valores pueden sobrescribirse mediante variables de entorno si es necesario.

export const BUSINESS_RULES = {
  // Cantidad máxima de ítems que puede crear un usuario gratuito
  MAX_FREE_ITEMS: Number(process.env.MAX_FREE_ITEMS) || 15,
  
  // Tamaño máximo de archivo (en Megabytes) permitido para usuarios gratuitos
  MAX_FREE_FILE_SIZE_MB: Number(process.env.MAX_FREE_FILE_SIZE_MB) || 3,
};
