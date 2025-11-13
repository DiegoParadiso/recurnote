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

export function limitPositionInsideCircle(newX, newY, w, h, circleCenter, maxRadius, isSmallScreen = false) {
  if (isSmallScreen) {
    return limitPositionInsideScreen(newX, newY, w, h);
  }

  const { cx, cy } = circleCenter;
  const halfWidth = w / 2;
  const halfHeight = h / 2;
  const safetyMargin = 3;

  if (isItemInsideCircle(newX, newY, w, h, circleCenter, maxRadius - safetyMargin)) {
    return { x: newX, y: newY };
  }

  const dx = newX - cx;
  const dy = newY - cy;
  const angle = Math.atan2(dy, dx);

  const corners = [
    { x: newX - halfWidth, y: newY - halfHeight },
    { x: newX + halfWidth, y: newY - halfHeight },
    { x: newX - halfWidth, y: newY + halfHeight },
    { x: newX + halfWidth, y: newY + halfHeight },
  ];

  let maxExcess = 0;

  for (const corner of corners) {
    const cornerDx = corner.x - cx;
    const cornerDy = corner.y - cy;
    const cornerDist = Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy);
    const excess = cornerDist - (maxRadius - safetyMargin);
    if (excess > maxExcess) {
      maxExcess = excess;
    }
  }

  if (maxExcess <= 0) {
    return { x: newX, y: newY };
  }

  const currentDist = Math.sqrt(dx * dx + dy * dy);
  const adjustedDist = Math.max(0, currentDist - maxExcess);

  return {
    x: cx + adjustedDist * Math.cos(angle),
    y: cy + adjustedDist * Math.sin(angle),
  };
}

export function isItemInsideCircle(x, y, w, h, circleCenter, maxRadius) {
  const { cx, cy } = circleCenter;
  const halfWidth = w / 2;
  const halfHeight = h / 2;

  const corners = [
    { x: x - halfWidth, y: y - halfHeight },
    { x: x + halfWidth, y: y - halfHeight },
    { x: x - halfWidth, y: y + halfHeight },
    { x: x + halfWidth, y: y + halfHeight },
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

export function limitPositionInsideScreen(newX, newY, w, h) {
  const halfWidth = w / 2;
  const halfHeight = h / 2;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const safetyMargin = 3;
  const marginLeft = 4 + safetyMargin;
  const marginRight = 4 + safetyMargin;
  const marginTop = 4 + safetyMargin;
  const marginBottom = 4 + safetyMargin;
  const minX = halfWidth + marginLeft;
  const maxX = screenWidth - halfWidth - marginRight;
  const minY = halfHeight + marginTop;
  const maxY = screenHeight - halfHeight - marginBottom;
  const limitedX = Math.max(minX, Math.min(maxX, newX));
  const limitedY = Math.max(minY, Math.min(maxY, newY));

  return { x: limitedX, y: limitedY };
}
