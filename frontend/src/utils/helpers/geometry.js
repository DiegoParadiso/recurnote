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
  const halfDiagonal = Math.sqrt(w * w + h * h) / 2;
  const maxDistance = maxRadius - halfDiagonal;

  if (distanceCenter > maxDistance) {
    const angle = Math.atan2(dy, dx);
    const limitedX = cx + maxDistance * Math.cos(angle);
    const limitedY = cy + maxDistance * Math.sin(angle);
    return { x: limitedX, y: limitedY };
  }

  return { x: newX, y: newY };
}
