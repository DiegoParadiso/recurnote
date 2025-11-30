// Función auxiliar para obtener dimensiones reales según el tipo de item
export const getItemDimensions = (item) => {
    const width = item.width || (item.label === 'Tarea' ? 200 : (item.label === 'Nota' ? 169 : 110));
    const height = item.height || (item.label === 'Tarea' ? 46 : (item.label === 'Nota' ? 100 : 110));
    return { width, height };
};
