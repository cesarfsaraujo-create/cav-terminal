#!/usr/bin/env node
// Parte o ficheiro exportado do n8n em um JSON por workflow, dentro de workflows/.
// Uso:  node scripts/explodir.mjs caminho/para/cav-workflows-AAAA-MM-DD.json

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const origem = process.argv[2];
if (!origem) {
  console.error('Falta o caminho do ficheiro exportado.');
  process.exit(1);
}

const slug = (s) =>
  String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

const bundle = JSON.parse(readFileSync(origem, 'utf8'));
mkdirSync('workflows', { recursive: true });

const indice = [];
for (const w of bundle.workflows) {
  const nome = `${slug(w.name)}.${w.id}.json`;
  // ordenamos as chaves para o diff ser estável entre exportações
  const corpo = {
    id: w.id,
    name: w.name,
    active: w.active,
    settings: w.settings ?? {},
    nodes: w.nodes ?? [],
    connections: w.connections ?? {},
  };
  writeFileSync(join('workflows', nome), JSON.stringify(corpo, null, 2) + '\n');
  indice.push({ ficheiro: nome, id: w.id, nome: w.name, activo: w.active, nos: (w.nodes ?? []).length });
}

writeFileSync('workflows/INDICE.json', JSON.stringify(indice, null, 2) + '\n');
console.log(`${indice.length} workflows escritos em workflows/`);
for (const i of indice) console.log(`  ${i.activo ? '▶' : ' '} ${i.ficheiro}  (${i.nos} nós)`);
