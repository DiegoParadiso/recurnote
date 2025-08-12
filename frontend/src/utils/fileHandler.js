export const MAX_MB = 3; // Para cuentas gratuitas; VIP se valida en backend

export function handleFile(e, onUpdate, id, item, x, y, showOnlyImageSetter, isVip = false) {
  const file = e.target.files[0];
  if (!file) return { error: null };

  const sizeMB = file.size / (1024 * 1024);
  if (!isVip && sizeMB > MAX_MB) {
    return { error: `El archivo excede el límite de ${MAX_MB} MB` };
  }

  const fileData = {
    name: file.name,
    size: file.size,
    type: file.type,
  };

  const reader = new FileReader();
  reader.onload = (event) => {
    const base64 = event.target.result;

    if (fileData.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        const maxW = 300;
        const maxH = 220;
        let { width, height } = img;

        const aspect = width / height;
        if (width > maxW) {
          width = maxW;
          height = width / aspect;
        }
        if (height > maxH) {
          height = maxH;
          width = height * aspect;
        }

        onUpdate?.(
          id,
          { ...item.content, fileData, base64 },
          null,
          { width, height },
          { x, y }
        );
        showOnlyImageSetter(false);
      };
      img.src = base64;
    } else {
      onUpdate?.(
        id,
        { ...item.content, fileData, base64 },
        null,
        { width: 180, height: 100 },
        { x, y }
      );
      showOnlyImageSetter(false);
    }
  };
  reader.readAsDataURL(file);

  return { error: null };
}
