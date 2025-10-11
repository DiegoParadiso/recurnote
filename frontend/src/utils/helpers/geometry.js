// Geometry utility functions

export function isColliding(x1, y1, w1, h1, x2, y2, w2, h2, margin = 8) {
  return !(
    x1 + w1 / 2 + margin < x2 - w2 / 2 ||
    x1 - w1 / 2 - margin > x2 + w2 / 2 ||
    y1 + h1 / 2 + margin < y2 - h2 / 2 ||
    y1 - h1 / 2 - margin > y2 + h2 / 2
  );
}

export function getAngleFromCenter(x, y, containerRef) {
  if (!containerRef.current) return 0;
  const rect = containerRef.current.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = x - cx;  
  const dy = y - cy;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return angle;
}

export function limitPositionInsideCircle(newX, newY, w, h, circleCenter, maxRadius, isSmallScreen = false) {
  // Usar la misma lógica que limitPositionInsideCircleSimple para consistencia
  return limitPositionInsideCircleSimple(newX, newY, w, h, circleCenter, maxRadius, isSmallScreen);
}

// Función más precisa para limitar la posición dentro del círculo
export function limitPositionInsideCirclePrecise(newX, newY, w, h, circleCenter, maxRadius, isSmallScreen = false) {
  if (isSmallScreen) {
    return limitPositionInsideScreen(newX, newY, w, h);
  }

  const { cx, cy } = circleCenter;
  const halfWidth = w / 2;
  const halfHeight = h / 2;
  
  // Verificar si la nueva posición está completamente dentro del círculo
  if (isItemInsideCircle(newX, newY, w, h, circleCenter, maxRadius)) {
    return { x: newX, y: newY };
  }
  
  // Si no está dentro, usar un enfoque más suave y gradual
  const dx = newX - cx;
  const dy = newY - cy;
  const distanceCenter = Math.sqrt(dx * dx + dy * dy);
  
  // Calcular la distancia máxima permitida para que el item esté completamente dentro
  const itemCornerDistance = Math.sqrt(halfWidth * halfWidth + halfHeight * halfHeight);
  const maxDistance = maxRadius - itemCornerDistance;
  
  // Si está muy fuera del límite, usar la función original más suave
  if (distanceCenter > maxDistance + 50) {
    const angle = Math.atan2(dy, dx);
    const limitedX = cx + maxDistance * Math.cos(angle);
    const limitedY = cy + maxDistance * Math.sin(angle);
    return { x: limitedX, y: limitedY };
  }
  
  // Si está cerca del límite, hacer una corrección más suave
  // Encontrar la posición más cercana que esté dentro
  let bestX = newX;
  let bestY = newY;
  let bestDistance = Infinity;
  
  // Probar con menos precisión para movimientos más suaves
  for (let angle = 0; angle < 360; angle += 15) { // 15 grados en lugar de 5
    const rad = (angle * Math.PI) / 180;
    
    // Probar con menos precisión para movimientos más suaves
    for (let distance = maxDistance - 20; distance <= maxDistance; distance += 10) { // Solo cerca del límite
      const testX = cx + distance * Math.cos(rad);
      const testY = cy + distance * Math.sin(rad);
      
      if (isItemInsideCircle(testX, testY, w, h, circleCenter, maxRadius)) {
        const distToOriginal = Math.sqrt((testX - newX) ** 2 + (testY - newY) ** 2);
        if (distToOriginal < bestDistance) {
          bestDistance = distToOriginal;
          bestX = testX;
          bestY = testY;
        }
      }
    }
  }
  
  return { x: bestX, y: bestY };
}

// Función híbrida que combina suavidad y precisión
export function limitPositionInsideCircleSmooth(newX, newY, w, h, circleCenter, maxRadius, isSmallScreen = false) {
  if (isSmallScreen) {
    return limitPositionInsideScreen(newX, newY, w, h);
  }

  const { cx, cy } = circleCenter;
  const dx = newX - cx;
  const dy = newY - cy;
  const distanceCenter = Math.sqrt(dx * dx + dy * dy);
  
  // Calcular la distancia máxima permitida
  const halfWidth = w / 2;
  const halfHeight = h / 2;
  const itemCornerDistance = Math.sqrt(halfWidth * halfWidth + halfHeight * halfHeight);
  const maxDistance = maxRadius - itemCornerDistance;
  
  // Si está dentro del límite, permitir el movimiento
  if (distanceCenter <= maxDistance) {
    return { x: newX, y: newY };
  }
  
  // Si está fuera, hacer una corrección suave pero precisa
  const angle = Math.atan2(dy, dx);
  
  // Zona de amortiguación más pequeña para mejor precisión
  const bufferZone = 15; // Reducir de 30 a 15px
  const overLimit = distanceCenter - maxDistance;
  
  if (overLimit <= bufferZone) {
    // En la zona de amortiguación, hacer corrección más precisa
    const correctionFactor = overLimit / bufferZone; // 0 a 1
    // Usar una corrección más directa para llegar al límite
    const correctedDistance = maxDistance + (overLimit * correctionFactor * 0.1); // Reducir más la corrección
    
    const limitedX = cx + correctedDistance * Math.cos(angle);
    const limitedY = cy + correctedDistance * Math.sin(angle);
    return { x: limitedX, y: limitedY };
  } else {
    // Fuera de la zona de amortiguación, usar límite estricto
    const limitedX = cx + maxDistance * Math.cos(angle);
    const limitedY = cy + maxDistance * Math.sin(angle);
    return { x: limitedX, y: limitedY };
  }
}

// Función para validar que un item esté completamente dentro del círculo
export function isItemInsideCircle(x, y, w, h, circleCenter, maxRadius) {
  const { cx, cy } = circleCenter;
  const halfWidth = w / 2;
  const halfHeight = h / 2;
  
  // Verificar que todas las esquinas del item estén dentro del círculo
  const corners = [
    { x: x - halfWidth, y: y - halfHeight }, // Esquina superior izquierda
    { x: x + halfWidth, y: y - halfHeight }, // Esquina superior derecha
    { x: x - halfWidth, y: y + halfHeight }, // Esquina inferior izquierda
    { x: x + halfWidth, y: y + halfHeight }  // Esquina inferior derecha
  ];
  
  for (const corner of corners) {
    const dx = corner.x - cx;
    const dy = corner.y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRadius) {
      return false;
    }
  }
  
  return true;
}

// Función balanceada que prioriza la precisión pero mantiene algo de suavidad
export function limitPositionInsideCircleBalanced(newX, newY, w, h, circleCenter, maxRadius, isSmallScreen = false) {
  if (isSmallScreen) {
    return limitPositionInsideScreen(newX, newY, w, h);
  }

  const { cx, cy } = circleCenter;
  const dx = newX - cx;
  const dy = newY - cy;
  const distanceCenter = Math.sqrt(dx * dx + dy * dy);
  
  // Calcular la distancia máxima permitida
  const halfWidth = w / 2;
  const halfHeight = h / 2;
  const itemCornerDistance = Math.sqrt(halfWidth * halfWidth + halfHeight * halfHeight);
  const maxDistance = maxRadius - itemCornerDistance;
  
  // Si está dentro del límite, permitir el movimiento
  if (distanceCenter <= maxDistance) {
    return { x: newX, y: newY };
  }
  
  // Si está fuera, usar la función original más directa pero con pequeña amortiguación
  const angle = Math.atan2(dy, dx);
  
  // Zona de amortiguación muy pequeña para máxima precisión
  const bufferZone = 8; // Solo 8px de amortiguación
  const overLimit = distanceCenter - maxDistance;
  
  if (overLimit <= bufferZone) {
    // En la zona de amortiguación, hacer corrección mínima
    const correctionFactor = overLimit / bufferZone;
    const correctedDistance = maxDistance + (overLimit * correctionFactor * 0.05); // Corrección muy pequeña
    
    const limitedX = cx + correctedDistance * Math.cos(angle);
    const limitedY = cy + correctedDistance * Math.sin(angle);
    return { x: limitedX, y: limitedY };
  } else {
    // Fuera de la zona de amortiguación, usar límite estricto
    const limitedX = cx + maxDistance * Math.cos(angle);
    const limitedY = cy + maxDistance * Math.sin(angle);
    return { x: limitedX, y: limitedY };
  }
}

// Función específica para manejar mejor los 90 grados
export function limitPositionInsideCircle90Degrees(newX, newY, w, h, circleCenter, maxRadius, isSmallScreen = false) {
  if (isSmallScreen) {
    return limitPositionInsideScreen(newX, newY, w, h);
  }

  const { cx, cy } = circleCenter;
  const dx = newX - cx;
  const dy = newY - cy;
  const distanceCenter = Math.sqrt(dx * dx + dy * dy);
  
  // Calcular la distancia máxima permitida
  const halfWidth = w / 2;
  const halfHeight = h / 2;
  
  // Para los 90 grados, usar un cálculo más preciso
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const normalizedAngle = ((angle + 360) % 360);
  
  // Detectar si está cerca de los 90 grados (0°, 90°, 180°, 270°)
  const isNear90Degrees = 
    (normalizedAngle >= 85 && normalizedAngle <= 95) ||    // 90°
    (normalizedAngle >= 175 && normalizedAngle <= 185) ||  // 180°
    (normalizedAngle >= 265 && normalizedAngle <= 275) ||  // 270°
    (normalizedAngle >= 355 || normalizedAngle <= 5);      // 0°/360°
  
  if (isNear90Degrees) {
    // En los 90 grados, usar límites más precisos
    let maxDistance;
    
    if (normalizedAngle >= 85 && normalizedAngle <= 95) {
      // Arriba (90°) - considerar solo la altura
      maxDistance = maxRadius - halfHeight;
    } else if (normalizedAngle >= 175 && normalizedAngle <= 185) {
      // Izquierda (180°) - considerar solo el ancho
      maxDistance = maxRadius - halfWidth;
    } else if (normalizedAngle >= 265 && normalizedAngle <= 275) {
      // Abajo (270°) - considerar solo la altura
      maxDistance = maxRadius - halfHeight;
    } else {
      // Derecha (0°/360°) - considerar solo el ancho
      maxDistance = maxRadius - halfWidth;
    }
    
    // Debug para los 90 grados
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 90 grados detectado:', {
        angle: normalizedAngle,
        direction: normalizedAngle >= 85 && normalizedAngle <= 95 ? 'arriba' : 
                  normalizedAngle >= 175 && normalizedAngle <= 185 ? 'izquierda' :
                  normalizedAngle >= 265 && normalizedAngle <= 275 ? 'abajo' : 'derecha',
        maxRadius,
        halfWidth,
        halfHeight,
        maxDistance,
        distanceCenter,
        willLimit: distanceCenter > maxDistance
      });
    }
    
    if (distanceCenter <= maxDistance) {
      return { x: newX, y: newY };
    }
    
    // Aplicar límite estricto para los 90 grados
    const rad = (normalizedAngle * Math.PI) / 180;
    const limitedX = cx + maxDistance * Math.cos(rad);
    const limitedY = cy + maxDistance * Math.sin(rad);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📍 90 grados limitado:', { 
        from: { x: newX, y: newY }, 
        to: { x: limitedX, y: limitedY } 
      });
    }
    
    return { x: limitedX, y: limitedY };
  }
  
  // Para otras posiciones, usar la función balanceada
  return limitPositionInsideCircleBalanced(newX, newY, w, h, circleCenter, maxRadius, isSmallScreen);
}

// Función para limitar posición dentro de los límites de la pantalla (mobile)
export function limitPositionInsideScreen(newX, newY, w, h) {
  const halfWidth = w / 2;
  const halfHeight = h / 2;

  // Obtener dimensiones de la pantalla
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Márgenes asimétricos: menos margen arriba/izquierda para permitir acceso a la basura
  // La basura está en top:5, left:25, con zona de ~100x100px
  const marginLeft = 0;   // Sin margen izquierdo para llegar a la basura
  const marginTop = 0;    // Sin margen superior para llegar a la basura
  const marginRight = 8;  // Margen normal en el lado derecho
  const marginBottom = 8; // Margen normal en el lado inferior

  // Calcular límites con márgenes asimétricos
  const minX = halfWidth + marginLeft;
  const maxX = screenWidth - halfWidth - marginRight;
  const minY = halfHeight + marginTop;
  const maxY = screenHeight - halfHeight - marginBottom;

  // Limitar la posición dentro de los bordes de la pantalla
  const limitedX = Math.max(minX, Math.min(maxX, newX));
  const limitedY = Math.max(minY, Math.min(maxY, newY));

  return { x: limitedX, y: limitedY };
}

// Función para calcular la máxima distancia que puede estar el centro del item
// del centro del círculo, asegurando que todas las esquinas estén dentro
function calculateMaxDistanceForAngle(angle, halfWidth, halfHeight, maxRadius) {
  // Convertir ángulo a radianes
  const angleRad = (angle * Math.PI) / 180;

  // Calcular las 4 esquinas del rectángulo relativas al centro del item
  const corners = [
    { x: -halfWidth, y: -halfHeight }, // Superior izquierda
    { x: halfWidth, y: -halfHeight },  // Superior derecha
    { x: -halfWidth, y: halfHeight },  // Inferior izquierda
    { x: halfWidth, y: halfHeight }    // Inferior derecha
  ];

  // Para cada esquina, calcular qué tan lejos puede estar el centro del item
  // de modo que esa esquina específica esté justo en el borde del círculo
  let minMaxDistance = maxRadius;

  for (const corner of corners) {
    // Rotar la esquina según el ángulo del item (si estuviera rotado)
    // En este caso no hay rotación del item, así que las esquinas están alineadas

    // Distancia de esta esquina al centro del item
    const cornerDist = Math.sqrt(corner.x * corner.x + corner.y * corner.y);

    // Ángulo de esta esquina relativa al centro del item
    const cornerAngle = Math.atan2(corner.y, corner.x);

    // Ángulo absoluto de esta esquina cuando el item está en 'angle'
    const absoluteCornerAngle = angleRad + cornerAngle;

    // Posición de esta esquina si el centro del item está a distancia 'd' del centro del círculo
    // corner_x = d * cos(angleRad) + corner.x
    // corner_y = d * sin(angleRad) + corner.y
    // Queremos: corner_x^2 + corner_y^2 <= maxRadius^2

    // Simplificando: queremos encontrar la máxima distancia 'd' tal que
    // (d * cos(angleRad) + corner.x)^2 + (d * sin(angleRad) + corner.y)^2 = maxRadius^2

    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);

    // Expandiendo: d^2 + 2*d*(corner.x*cosA + corner.y*sinA) + (corner.x^2 + corner.y^2) = maxRadius^2
    // d^2 + 2*d*b + c - maxRadius^2 = 0
    const b = corner.x * cosA + corner.y * sinA;
    const c = corner.x * corner.x + corner.y * corner.y;

    // Resolver ecuación cuadrática: d^2 + 2*b*d + (c - maxRadius^2) = 0
    const discriminant = 4 * b * b - 4 * (c - maxRadius * maxRadius);

    if (discriminant >= 0) {
      const d = (-2 * b + Math.sqrt(discriminant)) / 2;
      minMaxDistance = Math.min(minMaxDistance, d);
    }
  }

  return minMaxDistance;
}

// Función simple y directa que verifica que todas las esquinas estén dentro del círculo
export function limitPositionInsideCircleSimple(newX, newY, w, h, circleCenter, maxRadius, isSmallScreen = false) {
  if (isSmallScreen) {
    return limitPositionInsideScreen(newX, newY, w, h);
  }

  const { cx, cy } = circleCenter;
  const halfWidth = w / 2;
  const halfHeight = h / 2;

  // Verificar si todas las esquinas están dentro del círculo
  if (isItemInsideCircle(newX, newY, w, h, circleCenter, maxRadius)) {
    return { x: newX, y: newY };
  }

  // Si no está dentro, proyectar la posición deseada hacia el límite válido
  // Buscar la posición más cercana en la dirección del movimiento
  const dx = newX - cx;
  const dy = newY - cy;
  const angle = Math.atan2(dy, dx);

  // Calcular las 4 esquinas en la nueva posición
  const corners = [
    { x: newX - halfWidth, y: newY - halfHeight },
    { x: newX + halfWidth, y: newY - halfHeight },
    { x: newX - halfWidth, y: newY + halfHeight },
    { x: newX + halfWidth, y: newY + halfHeight }
  ];

  // Encontrar cuánto excede cada esquina del límite
  let maxExcess = 0;
  for (const corner of corners) {
    const cornerDx = corner.x - cx;
    const cornerDy = corner.y - cy;
    const cornerDist = Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy);
    const excess = cornerDist - maxRadius;
    if (excess > maxExcess) {
      maxExcess = excess;
    }
  }

  // Si hay exceso, mover el item hacia el centro para compensar
  if (maxExcess > 0) {
    const currentDist = Math.sqrt(dx * dx + dy * dy);
    const adjustedDist = currentDist - maxExcess;
    const limitedX = cx + adjustedDist * Math.cos(angle);
    const limitedY = cy + adjustedDist * Math.sin(angle);
    return { x: limitedX, y: limitedY };
  }

  return { x: newX, y: newY };
}
