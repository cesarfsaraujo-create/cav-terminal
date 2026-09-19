#!/usr/bin/env node
// Empurra UM workflow do repositório para o n8n.
// Uso:  node scripts/empurrar.mjs workflows/nome.ID.json
//
// Só escreve nodes/connections/settings/name. Não activa nem desactiva nada —
// isso fica a teu cargo no n8n, de propósito.

import { readFileSync } from 'node:fs';

const URL_BASE = process.env.N8N_URL;
const CHAVE = process.env.N8N_API_KEY;
const ficheiro = process.argv[2];
if (!URL_BASE || !CHAVE || !ficheiro) {
  console.error('Uso: N8N_URL=… N8N_API_KEY=… node scripts/empurrar.mjs workflows/ficheiro.json');
  process.exit(1);
}

const w = JSON.parse(readFileSync(ficheiro, 'utf8'));
if (!w.id) { console.error('O ficheiro não tem id.'); process.exit(1); }

const r = await fetch(`${URL_BASE}/api/v1/workflows/${w.id}`, {
  method: 'PUT',
  headers: { 'X-N8N-API-KEY': CHAVE, 'content-type': 'application/json' },
  body: JSON.stringify({
    name: w.name,
    nodes: w.nodes,
    connections: w.connections,
    settings: w.settings ?? {},
  }),
});

if (!r.ok) {
  console.error(`falhou: HTTP ${r.status}`, (await r.text()).slice(0, 400));
  process.exit(1);
}
console.log(`empurrado  ${w.name}  (${w.nodes.length} nós)`);
console.log('Confirma no n8n e publica a versão, se for caso disso.');
