#!/usr/bin/env node
/**
 * dev.js — sobe back-end (3001) + front-end (3000).
 *
 * Uso: npm run dev   (qualquer Node instalado funciona — o script localiza o Node 22 sozinho)
 */
'use strict';

const { spawn, execSync, spawnSync } = require('child_process');
const path = require('path');
const http = require('http');
const fs   = require('fs');
const os   = require('os');

const ROOT   = __dirname;
const SERVER = path.join(ROOT, 'server');
const IS_WIN = os.platform() === 'win32';

// ─── Localiza Node 22 ─────────────────────────────────────────────────────────

function findNode22() {
  // 1. Se o node atual já for 22+, usa ele mesmo
  const current = process.version;
  if (parseInt(current.slice(1)) >= 22) return process.execPath;

  // 2. Procura no nvs (Windows padrão)
  const nvsBase = path.join(process.env.LOCALAPPDATA ?? '', 'nvs', 'node');
  if (fs.existsSync(nvsBase)) {
    const versions = fs.readdirSync(nvsBase).filter(v => v.startsWith('22.'));
    for (const ver of versions.sort().reverse()) {
      const candidate = path.join(nvsBase, ver, 'x64', IS_WIN ? 'node.exe' : 'node');
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  // 3. Procura no nvm (Linux/Mac)
  const nvmBase = path.join(process.env.HOME ?? '', '.nvm', 'versions', 'node');
  if (fs.existsSync(nvmBase)) {
    const versions = fs.readdirSync(nvmBase).filter(v => v.startsWith('v22.'));
    for (const ver of versions.sort().reverse()) {
      const candidate = path.join(nvmBase, ver, 'bin', 'node');
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  // 4. Tenta no PATH
  const result = spawnSync(IS_WIN ? 'where' : 'which', ['node'], { encoding: 'utf8' });
  if (result.stdout) {
    const nodePath = result.stdout.trim().split('\n')[0];
    if (nodePath && fs.existsSync(nodePath)) return nodePath;
  }

  return null;
}

// ─── ANSI ──────────────────────────────────────────────────────────────────────
const C = { reset: '\x1b[0m', bold: '\x1b[1m', cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m' };
const tag = (l, c) => `${c}${C.bold}[${l}]${C.reset} `;

function pipe(label, color, proc) {
  const pfx = tag(label, color);
  const out = d => String(d).split('\n').filter(Boolean).forEach(l => process.stdout.write(pfx + l + '\n'));
  proc.stdout?.on('data', out);
  proc.stderr?.on('data', out);
}

// ─── Compilação TypeScript ────────────────────────────────────────────────────

function buildBackend(nodePath) {
  process.stdout.write(`${tag('BUILD', C.yellow)}Compilando backend TypeScript...\n`);
  // Usa o tsc local do servidor
  const tsc = path.join(SERVER, 'node_modules', '.bin', IS_WIN ? 'tsc.cmd' : 'tsc');
  const result = spawnSync(tsc, [], { cwd: SERVER, stdio: 'inherit', shell: IS_WIN });
  if (result.status !== 0) {
    process.stdout.write(`${tag('BUILD', C.red)}Falha na compilação. Verifique os erros acima.\n`);
    process.exit(1);
  }
  process.stdout.write(`${tag('BUILD', C.yellow)}OK.\n\n`);
}

// ─── Aguarda porta ────────────────────────────────────────────────────────────

function waitForPort(port, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeout;
    const check = () => {
      const req = http.get(`http://127.0.0.1:${port}/health`, res => { res.destroy(); resolve(); });
      req.on('error', () => Date.now() < deadline ? setTimeout(check, 400) : reject(new Error(`Porta ${port} não respondeu em ${timeout}ms`)));
      req.setTimeout(500, () => { req.destroy(); setTimeout(check, 400); });
    };
    check();
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  process.stdout.write(`\n${C.bold}${C.cyan}🎵  Espalhe Melodias — Dev${C.reset}\n`);
  process.stdout.write(`   Node atual: ${process.version} (${process.execPath})\n\n`);

  // Localiza Node 22
  const node22 = findNode22();
  if (!node22) {
    process.stdout.write(`${tag('ERRO', C.red)}Node 22 não encontrado.\nInstale com: nvs add 22 && nvs use 22\n`);
    process.exit(1);
  }

  const nodeVer = spawnSync(node22, ['--version'], { encoding: 'utf8' }).stdout?.trim();
  process.stdout.write(`${tag('NODE', C.yellow)}Usando Node ${nodeVer} → ${node22}\n\n`);

  // Se estamos rodando com Node < 18, relança com Node 22
  if (parseInt(process.version.slice(1)) < 18) {
    process.stdout.write(`${tag('RELAY', C.yellow)}Relançando com Node 22...\n`);
    const child = spawn(node22, [__filename, ...process.argv.slice(2)], {
      stdio: 'inherit',
      env: { ...process.env, PATH: `${path.dirname(node22)}${IS_WIN ? ';' : ':'}${process.env.PATH}` },
    });
    child.on('exit', code => process.exit(code ?? 0));
    return;
  }

  // 1. Compila o backend
  buildBackend(node22);

  // 2. Sobe o backend
  const back = spawn(node22, ['start.js'], {
    cwd: SERVER,
    env: { ...process.env, PATH: `${path.dirname(node22)}${IS_WIN ? ';' : ':'}${process.env.PATH}` },
  });
  pipe('API  :3001', C.green, back);

  process.stdout.write(`${tag('API  :3001', C.green)}Aguardando API...\n`);
  try {
    await waitForPort(3001);
    process.stdout.write(`${tag('API  :3001', C.green)}Pronta em http://localhost:3001\n`);
  } catch (e) {
    process.stdout.write(`${tag('API  :3001', C.red)}${e.message}\n`);
    back.kill();
    process.exit(1);
  }

  // 3. Sobe o frontend (Vite)
  const viteEntry = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
  const front = spawn(node22, [viteEntry, '--port=3000', '--host=0.0.0.0'], {
    cwd: ROOT,
    env: { ...process.env, PATH: `${path.dirname(node22)}${IS_WIN ? ';' : ':'}${process.env.PATH}` },
    shell: false,
  });
  pipe('VITE :3000', C.cyan, front);

  process.stdout.write(`\n${C.bold}${C.green}✅  Servidores no ar!${C.reset}\n`);
  process.stdout.write(`   Front: ${C.cyan}http://localhost:3000${C.reset}\n`);
  process.stdout.write(`   API  : ${C.green}http://localhost:3001/api${C.reset}\n\n`);

  const shutdown = () => {
    process.stdout.write('\n🛑  Encerrando...\n');
    back.kill();
    front.kill();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  back.on('exit',  c => { if (c != null && c !== 0) { process.stdout.write(`${tag('API', C.red)}Encerrou (${c})\n`); front.kill(); process.exit(1); } });
  front.on('exit', c => { if (c != null && c !== 0) { process.stdout.write(`${tag('VITE', C.red)}Encerrou (${c})\n`); back.kill(); process.exit(1); } });
}

main().catch(e => { console.error(e); process.exit(1); });
