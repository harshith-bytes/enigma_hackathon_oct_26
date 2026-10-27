import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  GENESIS_CHAIN_HASH,
  type RawForensicEventInput,
  createEncryptedForensicEntry,
  verifyAndDecryptForensicEntry,
} from './src/utils/cryptoChain.ts';
import type { ForensicLogEntry } from './src/types/mirage.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

let forensicLedger: ForensicLogEntry[] = [];

function seedInitialGenesisLog() {
  forensicLedger = [];
  const genesisEvent = createEncryptedForensicEntry(
    {
      eventCode: 'SOC_ENCLAVE_INITIALIZED',
      severity: 'INFO',
      portalState: 'LOGIN_GATE',
      page: 'LOGIN_GATE',
      actorClassification: 'MirageGate Enclave',
      summary:
        'MirageGate Zero-Lockout Deception Gateway active. CMU Keystroke, CIC-IDS-2017 & CERT detectors armed.',
      metadata: {
        cipher: 'AES-256-GCM',
        chainDigest: 'SHA-256',
        canaryNode: 'Orange-Fox-Trap-01',
      },
    },
    GENESIS_CHAIN_HASH,
    1
  );
  forensicLedger.push(genesisEvent);
}

seedInitialGenesisLog();

// GET /api/logs — Returns full AES-256-GCM encrypted forensic ledger
app.get('/api/logs', (_req, res) => {
  res.json({
    status: 'ok',
    count: forensicLedger.length,
    headChainHash:
      forensicLedger.length > 0
        ? forensicLedger[forensicLedger.length - 1].crypto.chainHash
        : GENESIS_CHAIN_HASH,
    logs: forensicLedger,
  });
});

// POST /api/telemetry/event — Seals a new telemetry event with AES-256-GCM and appends to SHA-256 hash chain
app.post('/api/telemetry/event', (req, res) => {
  try {
    const body = req.body as Partial<RawForensicEventInput>;
    const prevHash =
      forensicLedger.length > 0
        ? forensicLedger[forensicLedger.length - 1].crypto.chainHash
        : GENESIS_CHAIN_HASH;

    const newEntry = createEncryptedForensicEntry(
      {
        eventCode: body.eventCode || 'TELEMETRY_SIGNAL',
        severity: body.severity || 'INFO',
        portalState: body.portalState || 'LOGIN_GATE',
        page: body.page || 'LOGIN_GATE',
        actorClassification: body.actorClassification || 'Unclassified Session',
        summary: body.summary || 'Telemetry event recorded by MirageGate SOC.',
        metadata: body.metadata || {},
      },
      prevHash,
      forensicLedger.length + 1
    );

    forensicLedger.push(newEntry);

    res.status(201).json({
      status: 'sealed',
      entry: newEntry,
      headChainHash: newEntry.crypto.chainHash,
      logs: forensicLedger,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Failed to seal forensic event',
    });
  }
});

// POST /api/logs/reset — Resets simulation forensic ledger back to Genesis block
app.post('/api/logs/reset', (_req, res) => {
  seedInitialGenesisLog();
  res.json({
    status: 'reset',
    count: forensicLedger.length,
    headChainHash: forensicLedger[0].crypto.chainHash,
    logs: forensicLedger,
  });
});

// GET /api/forensics/export — Exports verified cryptographic chain + decrypted audit bundle
app.get('/api/forensics/export', (_req, res) => {
  const verifiedEntries = forensicLedger.map((entry) => {
    const check = verifyAndDecryptForensicEntry(entry);
    return {
      ...entry,
      chainIntegrityVerified: check.validHashChain,
    };
  });

  const bundle = {
    reportTitle: 'MirageGate AES-256-GCM Threat Intelligence & Attacker Forensics Export',
    exportedAt: new Date().toISOString(),
    cryptographicSpec: {
      cipher: 'AES-256-GCM (96-bit IV, 128-bit AuthTag)',
      hashChain: 'SHA-256 Sequential Ledger',
      genesisHash: GENESIS_CHAIN_HASH,
      headChainHash:
        forensicLedger.length > 0
          ? forensicLedger[forensicLedger.length - 1].crypto.chainHash
          : GENESIS_CHAIN_HASH,
      totalEvents: forensicLedger.length,
    },
    events: verifiedEntries,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="miragegate_forensics_export.json"'
  );
  res.send(JSON.stringify(bundle, null, 2));
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MirageGate SOC Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
