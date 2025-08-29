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
  if (isSmallScreen) {
    return { x: newX, y: newY };
  }

  const { cx, cy } = circleCenter;
  const dx = newX - cx;
  const dy = newY - cy;
  const distanceCenter = Math.sqrt(dx * dx + dy * dy);
  
  // Calcular el radio efectivo considerando el tamaño del item
  // Para items rectangulares, necesitamos considerar la esquina más lejana
  const halfWidth = w / 2;
  const halfHeight = h / 2;
  
  // Calcular la distancia máxima permitida para que el item esté completamente dentro
  // Usar la distancia desde el centro hasta la esquina más lejana del item
  const itemCornerDistance = Math.sqrt(halfWidth * halfWidth + halfHeight * halfHeight);
  const maxDistance = maxRadius - itemCornerDistance;
  
  // Debug: mostrar información sobre la limitación
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 Limitando posición:', {
      newPos: { x: newX, y: newY },
      itemSize: { w, h },
      circleCenter: { cx, cy },
      maxRadius,
      itemCornerDistance,
      maxDistance,
      distanceCenter,
      willLimit: distanceCenter > maxDistance
    });
  }
  
  if (distanceCenter > maxDistance) {
    const angle = Math.atan2(dy, dx);
    const limitedX = cx + maxDistance * Math.cos(angle);
    const limitedY = cy + maxDistance * Math.sin(angle);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📍 Posición limitada:', { from: { x: newX, y: newY }, to: { x: limitedX, y: limitedY } });
    }
    
    return { x: limitedX, y: limitedY };
  }

  return { x: newX, y: newY };
}

// Función más precisa para limitar la posición dentro del círculo
export function limitPositionInsideCirclePrecise(newX, newY, w, h, circleCenter, maxRadius, isSmallScreen = false) {
  if (isSmallScreen) {
    return { x: newX, y: newY };
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
    return { x: newX, y: newY };
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
    return { x: newX, y: newY };
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
    return { x: newX, y: newY };
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

// Función simple y directa que permite llegar más cerca del borde
export function limitPositionInsideCircleSimple(newX, newY, w, h, circleCenter, maxRadius, isSmallScreen = false) {
  if (isSmallScreen) {
    return { x: newX, y: newY };
  }

  const { cx, cy } = circleCenter;
  const dx = newX - cx;
  const dy = newY - cy;
  const distanceCenter = Math.sqrt(dx * dx + dy * dy);
  
  // Calcular la distancia máxima permitida de manera inteligente
  const halfWidth = w / 2;
  const halfHeight = h / 2;
  
  // Calcular el ángulo para determinar qué dimensión considerar
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const normalizedAngle = ((angle + 360) % 360);
  
  let maxDistance;
  
  // En los 90 grados, considerar solo la dimensión relevante
  if (normalizedAngle >= 85 && normalizedAngle <= 95) {
    // Arriba (90°) - considerar solo la altura
    maxDistance = maxRadius - halfHeight;
  } else if (normalizedAngle >= 175 && normalizedAngle <= 185) {
    // Izquierda (180°) - considerar solo el ancho
    maxDistance = maxRadius - halfWidth;
  } else if (normalizedAngle >= 265 && normalizedAngle <= 275) {
    // Abajo (270°) - considerar solo la altura
    maxDistance = maxRadius - halfHeight;
  } else if (normalizedAngle >= 355 || normalizedAngle <= 5) {
    // Derecha (0°/360°) - considerar solo el ancho
    maxDistance = maxRadius - halfWidth;
  } else {
    // Para otras posiciones (ángulos diagonales), ser más estricto
    // Usar la diagonal completa para asegurar que el item esté completamente dentro
    const diagonal = Math.sqrt(halfWidth * halfWidth + halfHeight * halfHeight);
    maxDistance = maxRadius - diagonal;
  }
  
  // Debug
  if (process.env.NODE_ENV === 'development') {
    console.log('🔓 Función simple inteligente:', {
      newPos: { x: newX, y: newY },
      itemSize: { w, h },
      angle: normalizedAngle,
      direction: normalizedAngle >= 85 && normalizedAngle <= 95 ? 'arriba' : 
                normalizedAngle >= 175 && normalizedAngle <= 185 ? 'izquierda' :
                normalizedAngle >= 265 && normalizedAngle <= 275 ? 'abajo' :
                normalizedAngle >= 355 || normalizedAngle <= 5 ? 'derecha' : 'diagonal',
      maxRadius,
      maxDistance,
      distanceCenter,
      willLimit: distanceCenter > maxDistance,
      margin: maxRadius - maxDistance
    });
  }
  
  if (distanceCenter <= maxDistance) {
    return { x: newX, y: newY };
  }
  
  // Aplicar límite directo
  const rad = (normalizedAngle * Math.PI) / 180;
  const limitedX = cx + maxDistance * Math.cos(rad);
  const limitedY = cy + maxDistance * Math.sin(rad);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📍 Función simple limitada:', { 
      from: { x: newX, y: newY }, 
      to: { x: limitedX, y: limitedY } 
    });
  }
  
  return { x: limitedX, y: limitedY };
}
