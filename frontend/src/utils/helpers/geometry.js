export function isColliding(x1, y1, w1, h1, x2, y2, w2, h2, margin = 8) {
  return !(
    x1 + w1 / 2 + margin < x2 - w2 / 2 ||
    x1 - w1 / 2 - margin > x2 + w2 / 2 ||
    y1 + h1 / 2 + margin < y2 - h2 / 2 ||
    y1 - h1 / 2 - margin > y2 + h2 / 2
  );
}

export function computePolarFromXY(x, y, cx, cy) {
  const dx = x - cx;
  const dy = y - cy;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return { angle, distance };
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

export function getRotatedCorners(x, y, w, h, rotation = 0) {
  const halfW = w / 2;
  const halfH = h / 2;
  const rotRad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rotRad);
  const sin = Math.sin(rotRad);

  const corners = [
    { dx: -halfW, dy: -halfH },
    { dx: halfW, dy: -halfH },
    { dx: -halfW, dy: halfH },
    { dx: halfW, dy: halfH }
  ];

  return corners.map(c => ({
    x: x + c.dx * cos - c.dy * sin,
    y: y + c.dx * sin + c.dy * cos
  }));
}

export function limitPositionInsideCircle(newX, newY, w, h, circleCenter, maxRadius, isSmallScreen = false, rotation = 0) {
  if (isSmallScreen) {
    return limitPositionInsideScreen(newX, newY, w, h, rotation);
  }

  const { cx, cy } = circleCenter;
  const safetyMargin = 3;
  const safeRadius = maxRadius - safetyMargin;

  // Si ya está adentro, devolver la misma posición
  if (isItemInsideCircle(newX, newY, w, h, circleCenter, safeRadius, rotation)) {
    return { x: newX, y: newY };
  }

  // Búsqueda binaria sobre la línea que une el centro con (newX, newY)
  const vx = newX - cx;
  const vy = newY - cy;
  const dist = Math.sqrt(vx * vx + vy * vy);

  if (dist === 0) return { x: cx, y: cy };

  let lo = 0;
  let hi = dist;
  let best = { x: cx, y: cy };

  for (let i = 0; i < 15; i++) {
    const m = (lo + hi) / 2;
    const testX = cx + (vx / dist) * m;
    const testY = cy + (vy / dist) * m;
    if (isItemInsideCircle(testX, testY, w, h, circleCenter, safeRadius, rotation)) {
      best = { x: testX, y: testY };
      lo = m;
    } else {
      hi = m;
    }
  }

  return best;
}

export function isItemInsideCircle(x, y, w, h, circleCenter, maxRadius, rotation = 0) {
  const { cx, cy } = circleCenter;
  const corners = getRotatedCorners(x, y, w, h, rotation);

  for (const corner of corners) {
    const dx = corner.x - cx;
    const dy = corner.y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRadius + 0.05) {
      return false;
    }
  }

  return true;
}

export function limitPositionInsideScreen(newX, newY, w, h, rotation = 0) {
  const corners = getRotatedCorners(newX, newY, w, h, rotation);
  const minCx = Math.min(...corners.map(c => c.x));
  const maxCx = Math.max(...corners.map(c => c.x));
  const minCy = Math.min(...corners.map(c => c.y));
  const maxCy = Math.max(...corners.map(c => c.y));

  const boxHalfWidth = Math.max(Math.abs(minCx - newX), Math.abs(maxCx - newX));
  const boxHalfHeight = Math.max(Math.abs(minCy - newY), Math.abs(maxCy - newY));

  const screenWidth = document.documentElement.clientWidth;
  const screenHeight = document.documentElement.clientHeight;

  const minX = boxHalfWidth + 12;
  const maxX = screenWidth - boxHalfWidth - 20;

  const topOffset = screenHeight * 0.12;

  const minY = Math.max(boxHalfHeight + 16, topOffset + boxHalfHeight);
  const maxY = screenHeight - boxHalfHeight - 64;

  return {
    x: Math.max(minX, Math.min(maxX, newX)),
    y: Math.max(minY, Math.min(maxY, newY)),
  };
}
