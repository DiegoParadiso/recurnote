#!/usr/bin/env node

/**
 * Script para migrar imports relativos a path aliases
 * Uso: node migrate-aliases.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src');

// Mapeo de aliases
const ALIAS_MAP = {
  '@components': '/components',
  '@hooks': '/hooks',
  '@utils': '/utils',
  '@styles': '/styles',
  '@context': '/context',
  '@pages': '/pages',
};

// Función para obtener todos los archivos JS/JSX
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.match(/\.(jsx?|tsx?)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Función para convertir import relativo a alias
function convertToAlias(importPath, currentFilePath) {
  if (!importPath.startsWith('.')) return importPath;

  const currentDir = path.dirname(currentFilePath);
  const absolutePath = path.resolve(currentDir, importPath);
  const relativeToCwd = path.relative(SRC_DIR, absolutePath);

  // Intentar match con cada alias
  for (const [alias, aliasPath] of Object.entries(ALIAS_MAP)) {
    const cleanAliasPath = aliasPath.slice(1); // Remover /
    if (relativeToCwd.startsWith(cleanAliasPath)) {
      const newPath = relativeToCwd.replace(cleanAliasPath, alias);
      return newPath.replace(/\\/g, '/'); // Windows fix
    }
  }

  return importPath;
}

// Función para procesar un archivo
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Regex para capturar imports
  const importRegex = /import\s+(?:(?:{[^}]+}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:{[^}]+}|\w+))?\s+from\s+)?['"]([^'"]+)['"]/g;

  content = content.replace(importRegex, (match, importPath) => {
    const newPath = convertToAlias(importPath, filePath);
    if (newPath !== importPath) {
      modified = true;
      return match.replace(importPath, newPath);
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Migrado: ${path.relative(SRC_DIR, filePath)}`);
    return 1;
  }

  return 0;
}

// Ejecutar migración
console.log('🚀 Iniciando migración de path aliases...\n');

const allFiles = getAllFiles(SRC_DIR);
let migratedCount = 0;

allFiles.forEach(file => {
  migratedCount += processFile(file);
});

console.log(`\n✨ Migración completada!`);
console.log(`📊 Archivos procesados: ${allFiles.length}`);
console.log(`📝 Archivos migrados: ${migratedCount}`);
