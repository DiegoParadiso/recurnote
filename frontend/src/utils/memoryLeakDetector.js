// Detector de memory leaks en tiempo real
let componentRenderCounts = new Map();
let eventListenerCounts = new Map();
let timeoutCounts = new Map();

// Interceptar addEventListener
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

window.addEventListener = function(type, listener, options) {
  const stack = new Error().stack;
  const key = `${type}_${listener.toString().substring(0, 50)}`;
  
  eventListenerCounts.set(key, (eventListenerCounts.get(key) || 0) + 1);
  
  if (eventListenerCounts.get(key) > 10) {
    console.warn(`🚨 MEMORY LEAK DETECTADO: Event listener "${type}" agregado ${eventListenerCounts.get(key)} veces`);
    console.warn('Stack trace:', stack);
  }
  
  return originalAddEventListener.call(this, type, listener, options);
};

window.removeEventListener = function(type, listener, options) {
  const key = `${type}_${listener.toString().substring(0, 50)}`;
  eventListenerCounts.set(key, Math.max(0, (eventListenerCounts.get(key) || 0) - 1));
  
  return originalRemoveEventListener.call(this, type, listener, options);
};

// Interceptar setTimeout
const originalSetTimeout = window.setTimeout;
const originalClearTimeout = window.clearTimeout;

window.setTimeout = function(callback, delay) {
  const stack = new Error().stack;
  const timeoutId = originalSetTimeout.call(this, callback, delay);
  
  timeoutCounts.set(timeoutId, { stack, created: Date.now() });
  
  if (timeoutCounts.size > 50) {
    console.warn(`🚨 MEMORY LEAK DETECTADO: ${timeoutCounts.size} timeouts activos`);
    console.warn('Timeouts más antiguos:', Array.from(timeoutCounts.entries())
      .filter(([id, data]) => Date.now() - data.created > 5000)
      .slice(0, 5)
    );
  }
  
  return timeoutId;
};

window.clearTimeout = function(timeoutId) {
  timeoutCounts.delete(timeoutId);
  return originalClearTimeout.call(this, timeoutId);
};

// Monitor de renders de componentes
export const trackComponentRender = (componentName) => {
  const count = componentRenderCounts.get(componentName) || 0;
  componentRenderCounts.set(componentName, count + 1);
  
  if (count > 100 && count % 10 === 0) {
    console.warn(`🚨 POSIBLE RE-RENDER INFINITO: ${componentName} ha renderizado ${count} veces`);
  }
};

// Función para obtener estadísticas
export const getMemoryStats = () => {
  console.log('📊 ESTADÍSTICAS DE MEMORY LEAKS:');
  console.log('Event Listeners activos:', Object.fromEntries(eventListenerCounts));
  console.log('Timeouts activos:', timeoutCounts.size);
  console.log('Renders por componente:', Object.fromEntries(componentRenderCounts));
  
  // Detectar componentes problemáticos
  const problematicComponents = Array.from(componentRenderCounts.entries())
    .filter(([name, count]) => count > 50)
    .sort((a, b) => b[1] - a[1]);
    
  if (problematicComponents.length > 0) {
    console.warn('🚨 COMPONENTES CON DEMASIADOS RENDERS:', problematicComponents);
  }
  
  return {
    eventListeners: Object.fromEntries(eventListenerCounts),
    timeouts: timeoutCounts.size,
    componentRenders: Object.fromEntries(componentRenderCounts),
    problematicComponents
  };
};

// Limpiar estadísticas
export const resetMemoryStats = () => {
  componentRenderCounts.clear();
  eventListenerCounts.clear();
  timeoutCounts.clear();
  console.log('✅ Estadísticas de memory leak limpiadas');
};

// Función para iniciar el detector manual (no automático)
export const startMemoryDetector = (intervalMs = 30000) => {
  if (detectorInterval) {
    clearInterval(detectorInterval);
  }
  
  detectorInterval = setInterval(() => {
    const stats = getMemoryStats();
    
    if (stats.timeouts > 20 || stats.problematicComponents.length > 0) {
      console.warn('🚨 MEMORY LEAK DETECTADO - Ejecuta resetMemoryStats() para limpiar');
    }
  }, intervalMs);
  
  console.log(`🔍 Memory Leak Detector iniciado cada ${intervalMs}ms`);
};

// Función para detener el detector
export const stopMemoryDetector = () => {
  if (detectorInterval) {
    clearInterval(detectorInterval);
    detectorInterval = null;
    console.log('🛑 Memory Leak Detector detenido');
  }
};

let detectorInterval = null;

console.log('🔍 Memory Leak Detector activado. Usa getMemoryStats() para ver estadísticas.');
