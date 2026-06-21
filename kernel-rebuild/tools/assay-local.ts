import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendJudgment, isStrong, isUseful, latestJudgments, readJudgments, relativeLedgerPath } from './judgments.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const assayDir = path.join(root, 'out', 'assay');
const reviewDir = path.join(root, 'out', 'assay-review');
const microscopeDir = path.join(root, 'out', 'microscope');

type Args = {
  port: number;
  host: string;
  reviewer: string;
  ledgerPath: string | undefined;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    port: 4317,
    host: '127.0.0.1',
    reviewer: process.env.USER || 'local',
    ledgerPath: undefined,
  };

  for (const arg of argv) {
    if (arg === '--') {
      continue;
    } else if (arg.startsWith('--port=')) {
      const port = Number(arg.slice('--port='.length));
      if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`Bad --port value: ${arg}`);
      args.port = port;
    } else if (arg.startsWith('--host=')) {
      args.host = arg.slice('--host='.length) || args.host;
    } else if (arg.startsWith('--reviewer=')) {
      args.reviewer = arg.slice('--reviewer='.length).trim() || args.reviewer;
    } else if (arg.startsWith('--ledger-path=')) {
      args.ledgerPath = path.resolve(root, arg.slice('--ledger-path='.length));
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function runTool(label: string, scriptPath: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--experimental-strip-types', scriptPath, ...args], {
      cwd: root,
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} failed with exit code ${code}`));
    });
  });
}

function runAssay(): Promise<void> {
  return runTool('assay generation', path.join(root, 'tools', 'assay.ts'));
}

function runMicroscope(): Promise<void> {
  return runTool('microscope generation', path.join(root, 'tools', 'microscope', 'view.ts'));
}

function runArchitecture(): Promise<void> {
  return runTool('architecture generation', path.join(root, 'tools', 'microscope', 'architecture.ts'));
}

function runReport(args: Args): Promise<void> {
  const reportArgs = args.ledgerPath ? [`--ledger-path=${args.ledgerPath}`] : [];
  return runTool('assay review generation', path.join(root, 'tools', 'assay-report.ts'), reportArgs);
}

function sendJson(res: ServerResponse, status: number, value: unknown): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(value));
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function contentType(filePath: string): string {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.png')) return 'image/png';
  return 'text/plain; charset=utf-8';
}

async function serveFile(res: ServerResponse, filePath: string, baseDir: string): Promise<void> {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(baseDir)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  try {
    const fileStat = await stat(resolved);
    if (!fileStat.isFile()) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }
    res.writeHead(200, { 'content-type': contentType(resolved), 'cache-control': 'no-store' });
    res.end(await readFile(resolved));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') sendJson(res, 404, { error: 'Not found' });
    else throw error;
  }
}

function judgmentStatus(events: Awaited<ReturnType<typeof readJudgments>>, args: Args): Record<string, unknown> {
  const latest = latestJudgments(events);
  const reviewers = new Set(latest.map((event) => event.reviewer || 'local'));
  return {
    connected: true,
    reviewer: args.reviewer,
    ledgerPath: relativeLedgerPath(args.ledgerPath),
    reviewUrl: '/review/',
    eventCount: events.length,
    latestCount: latest.length,
    reviewerCount: reviewers.size,
    usefulCount: latest.filter((event) => isUseful(event.verdict)).length,
    strongCount: latest.filter((event) => isStrong(event.verdict)).length,
  };
}

async function handleApi(req: IncomingMessage, res: ServerResponse, args: Args, url: URL): Promise<void> {
  if (req.method === 'GET' && url.pathname === '/api/judgments/status') {
    const events = await readJudgments(args.ledgerPath);
    sendJson(res, 200, judgmentStatus(events, args));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/judgments/latest') {
    const runId = url.searchParams.get('runId');
    const events = latestJudgments(await readJudgments(args.ledgerPath)).filter((event) => !runId || event.runId === runId);
    sendJson(res, 200, { events });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/judgments') {
    const event = await appendJudgment(await readBody(req), { reviewer: args.reviewer, ledgerPath: args.ledgerPath });
    const events = await readJudgments(args.ledgerPath);
    sendJson(res, 200, { ok: true, event, ...judgmentStatus(events, args) });
    return;
  }

  sendJson(res, 404, { error: 'Unknown API route' });
}

async function handleRequest(req: IncomingMessage, res: ServerResponse, args: Args): Promise<void> {
  try {
    const url = new URL(req.url || '/', `http://${args.host}:${args.port}`);
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, args, url);
      return;
    }

    if (url.pathname === '/' || url.pathname === '/assay') {
      res.writeHead(302, { location: '/assay/' });
      res.end();
      return;
    }

    if (url.pathname === '/assay/' || url.pathname === '/assay/index.html') {
      await serveFile(res, path.join(assayDir, 'index.html'), assayDir);
      return;
    }

    if (url.pathname.startsWith('/assay/')) {
      await serveFile(res, path.join(assayDir, decodeURIComponent(url.pathname.slice('/assay/'.length))), assayDir);
      return;
    }

    if (url.pathname === '/review' || url.pathname === '/review/index.html') {
      res.writeHead(302, { location: '/review/' });
      res.end();
      return;
    }

    if (url.pathname === '/review/') {
      await runReport(args);
      await serveFile(res, path.join(reviewDir, 'index.html'), reviewDir);
      return;
    }

    if (url.pathname.startsWith('/review/')) {
      await serveFile(res, path.join(reviewDir, decodeURIComponent(url.pathname.slice('/review/'.length))), reviewDir);
      return;
    }

    if (url.pathname === '/microscope' || url.pathname === '/microscope/index.html') {
      res.writeHead(302, { location: '/microscope/' });
      res.end();
      return;
    }

    if (url.pathname === '/microscope/') {
      await serveFile(res, path.join(microscopeDir, 'index.html'), microscopeDir);
      return;
    }

    if (url.pathname === '/architecture') {
      res.writeHead(302, { location: '/microscope/architecture.html' });
      res.end();
      return;
    }

    if (url.pathname.startsWith('/microscope/')) {
      await serveFile(res, path.join(microscopeDir, decodeURIComponent(url.pathname.slice('/microscope/'.length))), microscopeDir);
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  await runAssay();
  await runMicroscope();
  await runArchitecture();
  await runReport(args);

  const server = createServer((req, res) => {
    void handleRequest(req, res, args);
  });

  server.listen(args.port, args.host, () => {
    console.log(`kernel local: http://${args.host}:${args.port}/assay/`);
    console.log(`review digest: http://${args.host}:${args.port}/review/`);
    console.log(`architecture: http://${args.host}:${args.port}/microscope/architecture.html`);
    console.log(`judgments: ${relativeLedgerPath(args.ledgerPath)}`);
    console.log('press Ctrl-C to stop');
  });
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
