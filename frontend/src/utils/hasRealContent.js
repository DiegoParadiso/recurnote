export default function hasRealContent(content) {
  if (!content) return false;
  if (typeof content === 'string') return content.trim().length > 0;
  if (Array.isArray(content)) return content.some(item => item && item.trim && item.trim().length > 0);
  if (typeof content === 'object') {
    if (content.fileData && content.base64) return true;
    return Object.keys(content).length > 0 && JSON.stringify(content) !== '{}';
  }
  return false;
}
