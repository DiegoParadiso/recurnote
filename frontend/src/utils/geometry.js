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
