#!/usr/bin/env node
// Puxa os workflows do n8n para workflows/*.json
// Precisa de: N8N_URL e N8N_API_KEY no ambiente (nunca no repositório).
//   export N8N_URL=https://o-teu-n8n
//   export N8N_API_KEY=...        (Definições → n8n API → criar chave)

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const URL_BASE = process.env.N8N_URL;
const CHAVE = process.env.N8N_API_KEY;
if (!URL_BASE || !CHAVE) {
  console.error('Define N8N_URL e N8N_API_KEY no ambiente.');
  process.exit(1);
}

const api = async (caminho) => {
  const r = await fetch(`${URL_BASE}/api/v1${caminho}`, { headers: { 'X-N8N-API-KEY': CHAVE } });
  if (!r.ok) throw new Error(`${caminho} → HTTP ${r.status}`);
  return r.json();
};

const slug = (s) =>
  String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

const lista = await api('/workflows?limit=250');
mkdirSync('workflows', { recursive: true });

for (const w of lista.data) {
  const full = await api(`/workflows/${w.id}`);
  const corpo = {
    id: full.id, name: full.name, active: full.active,
    settings: full.settings ?? {}, nodes: full.nodes ?? [], connections: full.connections ?? {},
  };
  writeFileSync(join('workflows', `${slug(full.name)}.${full.id}.json`), JSON.stringify(corpo, null, 2) + '\n');
  console.log(`puxado  ${full.name}`);
}
