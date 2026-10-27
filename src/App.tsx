/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RotateCcw, Shield } from 'lucide-react';
import {
  CertInsiderMetrics,
  CicIdsMetrics,
  DecoyApiKeyItem,
  DecoyFileItem,
  ForensicLogEntry,
  InnerPage,
  KeystrokeMetrics,
  PortalState,
  RealFileItem,
  SeverityLevel,
} from './types/mirage';
import {
  INITIAL_DECOY_API_KEYS,
  INITIAL_DECOY_FILES,
  INITIAL_REAL_FILES,
} from './data/vaultData';
import {
  CORRECT_VAULT_PASSWORD,
  calculateShannonEntropy,
  computeCertThreatScore,
  computeCicIdsAttackConfidence,
  evaluateDeceptiveLoginRoute,
  evaluateEscapeHatchAttempt,
  identifyAttackerTools,
} from './utils/telemetryEngine';
import { LoginGate } from './components/LoginGate';
import { FakeSandbox } from './components/FakeSandbox';
import { RealVault } from './components/RealVault';
import { DefenderSocPane } from './components/DefenderSocPane';

const INITIAL_KEYSTROKE: KeystrokeMetrics = {
  flightTimeMs: 132,
  holdTimeMs: 84,
  backspaceCount: 0,
  pasteDetected: false,
  keystrokeCount: 0,
  cmuBotProbability: 14,
};

const INITIAL_CIC_IDS: CicIdsMetrics = {
  requestIatMs: 420,
  exfiltrationRateMbps: 0.12,
  shannonEntropy: 3.18,
  attackConfidence: 8,
};

const INITIAL_CERT: CertInsiderMetrics = {
  sequentialFileOps: 0,
  extensionMutationRate: 0,
  harmlessCanaryChecks: 0,
  threatScore: 6,
};

export default function App() {
  const [portalState, setPortalState] = useState<PortalState>('LOGIN_GATE');
  const [activePage, setActivePage] = useState<InnerPage>('FILES_PAGE');

  const [username, setUsername] = useState<string>('admin@acmedrive.io');
  const [password, setPassword] = useState<string>('');

  const [keystrokeMetrics, setKeystrokeMetrics] =
    useState<KeystrokeMetrics>(INITIAL_KEYSTROKE);
  const [cicIdsMetrics, setCicIdsMetrics] = useState<CicIdsMetrics>(INITIAL_CIC_IDS);
  const [certMetrics, setCertMetrics] = useState<CertInsiderMetrics>(INITIAL_CERT);

  const [decoyFiles, setDecoyFiles] = useState<DecoyFileItem[]>(INITIAL_DECOY_FILES);
  const [decoyApiKeys, setDecoyApiKeys] =
    useState<DecoyApiKeyItem[]>(INITIAL_DECOY_API_KEYS);
  const [realFiles, setRealFiles] = useState<RealFileItem[]>(INITIAL_REAL_FILES);

  const [isTrappedAttacker, setIsTrappedAttacker] = useState<boolean>(false);
  const [redirectedFromSandbox, setRedirectedFromSandbox] = useState<boolean>(false);
  const [escapeBlockedBanner, setEscapeBlockedBanner] = useState<boolean>(false);

  const [encryptionProgress, setEncryptionProgress] = useState<number | null>(null);
  const [zipDownloadBanner, setZipDownloadBanner] = useState<boolean>(false);
  const [sqliQuery, setSqliQuery] = useState<string>('');
  const [sqliOutput, setSqliOutput] = useState<string | null>(null);
  const [sqliExecuted, setSqliExecuted] = useState<boolean>(false);
  const [apiKeyExfiltrated, setApiKeyExfiltrated] = useState<boolean>(false);
  const [bulkDownloaded, setBulkDownloaded] = useState<boolean>(false);
  const [generatedDevToken, setGeneratedDevToken] = useState<string | null>(null);

  const [forensicLogs, setForensicLogs] = useState<ForensicLogEntry[]>([]);
  const [headChainHash, setHeadChainHash] = useState<string>('0'.repeat(64));

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setForensicLogs(data.logs || []);
        setHeadChainHash(data.headChainHash || '0'.repeat(64));
      }
    } catch {
      // ignore offline fetch error
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const recordForensicEvent = async (params: {
    eventCode: string;
    severity: SeverityLevel;
    portalStateOverride?: PortalState;
    pageOverride?: InnerPage | 'LOGIN_GATE';
    actorClassification: string;
    summary: string;
    metadata?: Record<string, string | number | boolean>;
  }) => {
    try {
      const res = await fetch('/api/telemetry/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventCode: params.eventCode,
          severity: params.severity,
          portalState: params.portalStateOverride || portalState,
          page: params.pageOverride || activePage,
          actorClassification: params.actorClassification,
          summary: params.summary,
          metadata: params.metadata || {},
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setForensicLogs(data.logs || []);
        setHeadChainHash(data.headChainHash || '0'.repeat(64));
      }
    } catch {
      // ignore network error
    }
  };

  // Reset entire simulation
  const handleResetSimulation = async () => {
    setPortalState('LOGIN_GATE');
    setActivePage('FILES_PAGE');
    setUsername('admin@acmedrive.io');
    setPassword('');
    setKeystrokeMetrics(INITIAL_KEYSTROKE);
    setCicIdsMetrics(INITIAL_CIC_IDS);
    setCertMetrics(INITIAL_CERT);
    setDecoyFiles(INITIAL_DECOY_FILES.map((f) => ({ ...f })));
    setDecoyApiKeys(INITIAL_DECOY_API_KEYS.map((k) => ({ ...k })));
    setRealFiles(INITIAL_REAL_FILES.map((r) => ({ ...r })));
    setIsTrappedAttacker(false);
    setRedirectedFromSandbox(false);
    setEscapeBlockedBanner(false);
    setEncryptionProgress(null);
    setZipDownloadBanner(false);
    setSqliQuery('');
    setSqliOutput(null);
    setSqliExecuted(false);
    setApiKeyExfiltrated(false);
    setBulkDownloaded(false);
    setGeneratedDevToken(null);

    try {
      const res = await fetch('/api/logs/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setForensicLogs(data.logs || []);
        setHeadChainHash(data.headChainHash || '0'.repeat(64));
      }
    } catch {
      // ignore
    }
  };

  // Login Gate submission handler
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const decision = evaluateDeceptiveLoginRoute(
      password,
      keystrokeMetrics.cmuBotProbability
    );

    setActivePage('FILES_PAGE');

    if (decision.targetState === 'REAL_VAULT') {
      setRedirectedFromSandbox(false);
      setPortalState('REAL_VAULT');
      await recordForensicEvent({
        eventCode: 'AUTH_VERIFIED_REAL_VAULT',
        severity: 'VERIFIED',
        portalStateOverride: 'REAL_VAULT',
        pageOverride: 'FILES_PAGE',
        actorClassification: 'Verified Corporate Employee',
        summary: `Passphrase & CMU keystroke cadence verified (BotProb: ${keystrokeMetrics.cmuBotProbability}%). Routed to Original Real Website.`,
        metadata: {
          cmuBotProbability: keystrokeMetrics.cmuBotProbability,
          flightTimeMs: keystrokeMetrics.flightTimeMs,
        },
      });
    } else {
      setPortalState('FAKE_SANDBOX');
      const isBotCadence = decision.reason === 'BOT_CADENCE_SANDBOXED';
      await recordForensicEvent({
        eventCode: 'DECEPTIVE_HTTP_200_SANDBOX_ROUTE',
        severity: isBotCadence ? 'CRITICAL' : 'WARNING',
        portalStateOverride: 'FAKE_SANDBOX',
        pageOverride: 'FILES_PAGE',
        actorClassification: isBotCadence
          ? 'Suspected Automated Bot / Stuffer'
          : 'Unverified Session (Probation)',
        summary: `Returned deceptive HTTP 200 OK (${decision.reason}). Silently routed to Fake Probation Website (🦊 Orange Fox).`,
        metadata: {
          deceptiveHttpStatus: 'HTTP 200 OK',
          cmuBotProbability: keystrokeMetrics.cmuBotProbability,
          reason: decision.reason,
        },
      });
    }
  };

  // Switch post-login inner page
  const handleSelectPage = async (page: InnerPage) => {
    setActivePage(page);
    if (portalState === 'FAKE_SANDBOX' && !isTrappedAttacker) {
      const nextHarmless = certMetrics.harmlessCanaryChecks + 1;
      const nextThreat = computeCertThreatScore({
        sequentialFileOps: certMetrics.sequentialFileOps,
        extensionMutationRate: certMetrics.extensionMutationRate,
        harmlessCanaryChecks: nextHarmless,
      });
      setCertMetrics((prev) => ({
        ...prev,
        harmlessCanaryChecks: nextHarmless,
        threatScore: nextThreat,
      }));
    }
    await recordForensicEvent({
      eventCode: 'NAVIGATION_PAGE_SWITCH',
      severity: 'INFO',
      portalStateOverride: portalState,
      pageOverride: page,
      actorClassification: isTrappedAttacker
        ? 'Trapped Attacker'
        : portalState === 'REAL_VAULT'
        ? 'Verified Employee'
        : 'Probation User',
      summary: `Navigated to ${page} inside ${portalState}.`,
      metadata: { page },
    });
  };

  // Escape Hatch handler (#btn-verify-human & Page 3 confirm button)
  const handleVerifyHumanEscapeHatch = async () => {
    const check = evaluateEscapeHatchAttempt({
      sequentialFileOps: certMetrics.sequentialFileOps,
      isTrappedAttacker,
    });

    if (check.allowed) {
      setEscapeBlockedBanner(false);
      setRedirectedFromSandbox(true);
      setPortalState('REAL_VAULT');
      setActivePage('FILES_PAGE');
      setCertMetrics((prev) => ({
        ...prev,
        harmlessCanaryChecks: prev.harmlessCanaryChecks + 1,
        threatScore: 2,
      }));
      await recordForensicEvent({
        eventCode: 'HUMAN_REVERIFIED_REDIRECT',
        severity: 'VERIFIED',
        portalStateOverride: 'REAL_VAULT',
        pageOverride: 'FILES_PAGE',
        actorClassification: 'Cleared Misplaced Employee',
        summary:
          'User noticed 🦊 Orange Fox Visual Canary with 0 malicious ops. Cleared suspicion and redirected to Original Real Website.',
        metadata: {
          sequentialFileOps: 0,
          newSeal: 'Blue Falcon',
        },
      });
    } else {
      setEscapeBlockedBanner(true);
      await recordForensicEvent({
        eventCode: 'ESCAPE_HATCH_BLOCKED',
        severity: 'CRITICAL',
        portalStateOverride: 'FAKE_SANDBOX',
        pageOverride: activePage,
        actorClassification: 'Trapped Attacker',
        summary:
          '[ESCAPE_HATCH_BLOCKED] Attacker attempted identity re-verification after triggering honey-trap operations.',
        metadata: {
          sequentialFileOps: certMetrics.sequentialFileOps,
          trapped: true,
        },
      });
    }
  };

  const handleHarmlessCanaryInspect = async (reason: string) => {
    const nextChecks = certMetrics.harmlessCanaryChecks + 1;
    setCertMetrics((prev) => ({
      ...prev,
      harmlessCanaryChecks: nextChecks,
      threatScore: computeCertThreatScore({
        sequentialFileOps: prev.sequentialFileOps,
        extensionMutationRate: prev.extensionMutationRate,
        harmlessCanaryChecks: nextChecks,
      }),
    }));

    // If user performs 2 harmless inspection clicks without touching traps, auto-clear to Real Vault
    if (nextChecks >= 2 && certMetrics.sequentialFileOps === 0 && !isTrappedAttacker) {
      setRedirectedFromSandbox(true);
      setPortalState('REAL_VAULT');
      setActivePage('FILES_PAGE');
      await recordForensicEvent({
        eventCode: 'HARMLESS_CANARY_AUTO_CLEARED',
        severity: 'VERIFIED',
        portalStateOverride: 'REAL_VAULT',
        pageOverride: 'FILES_PAGE',
        actorClassification: 'Cleared Misplaced Employee',
        summary: `${reason} (2 harmless canary checks completed -> Redirected to Original Real Website).`,
      });
      return;
    }

    await recordForensicEvent({
      eventCode: 'CANARY_ANOMALY_INSPECTED',
      severity: 'INFO',
      portalStateOverride: 'FAKE_SANDBOX',
      pageOverride: activePage,
      actorClassification: 'Probation User',
      summary: reason,
    });
  };

  // Fake Page 1: Preview / Steal Decoy Honey-File
  const handlePreviewDecoyFile = async (file: DecoyFileItem) => {
    setIsTrappedAttacker(true);
    const nextSeq = certMetrics.sequentialFileOps + 1;
    const nextThreat = computeCertThreatScore({
      sequentialFileOps: nextSeq,
      extensionMutationRate: certMetrics.extensionMutationRate,
      harmlessCanaryChecks: certMetrics.harmlessCanaryChecks,
    });
    setCertMetrics((prev) => ({
      ...prev,
      sequentialFileOps: nextSeq,
      threatScore: nextThreat,
    }));

    const nextCicConfidence = computeCicIdsAttackConfidence({
      requestIatMs: 45,
      exfiltrationRateMbps: Math.max(12.4, cicIdsMetrics.exfiltrationRateMbps),
      shannonEntropy: cicIdsMetrics.shannonEntropy,
      sqliTriggered: sqliExecuted,
    });
    setCicIdsMetrics((prev) => ({
      ...prev,
      requestIatMs: 45,
      exfiltrationRateMbps: Math.max(12.4, prev.exfiltrationRateMbps),
      attackConfidence: nextCicConfidence,
    }));

    await recordForensicEvent({
      eventCode: 'HONEY_FILE_ACCESSED_CRITICAL',
      severity: 'CRITICAL',
      portalStateOverride: 'FAKE_SANDBOX',
      pageOverride: 'FILES_PAGE',
      actorClassification: 'Trapped Attacker / Data Thief',
      summary: `CRITICAL: Decoy honey-file '${file.filename}' (${file.watermarkId}) opened/stolen in Fake Sandbox!`,
      metadata: {
        filename: file.filename,
        watermarkId: file.watermarkId,
      },
    });
  };

  // Fake Page 1: #btn-download-all
  const handleTriggerDownloadAll = async () => {
    setIsTrappedAttacker(true);
    setBulkDownloaded(true);
    setZipDownloadBanner(true);

    const nextSeq = certMetrics.sequentialFileOps + 4;
    const nextThreat = computeCertThreatScore({
      sequentialFileOps: nextSeq,
      extensionMutationRate: certMetrics.extensionMutationRate,
      harmlessCanaryChecks: certMetrics.harmlessCanaryChecks,
    });
    setCertMetrics((prev) => ({
      ...prev,
      sequentialFileOps: nextSeq,
      threatScore: nextThreat,
    }));

    const nextConfidence = computeCicIdsAttackConfidence({
      requestIatMs: 14,
      exfiltrationRateMbps: 84.6,
      shannonEntropy: 6.18,
      sqliTriggered: sqliExecuted,
    });
    setCicIdsMetrics({
      requestIatMs: 14,
      exfiltrationRateMbps: 84.6,
      shannonEntropy: 6.18,
      attackConfidence: nextConfidence,
    });

    await recordForensicEvent({
      eventCode: 'BULK_ZIP_EXFILTRATION_TRAP',
      severity: 'CRITICAL',
      portalStateOverride: 'FAKE_SANDBOX',
      pageOverride: 'FILES_PAGE',
      actorClassification: 'Python Requests Scraper / Automated Exfiltrator',
      summary:
        'Streamed decoy archive acmedrive_crown_jewels_2026.zip at 84.6 MB/s. Fingerprinted Python Requests Scraper / Automated Exfiltrator.',
      metadata: {
        archive: 'acmedrive_crown_jewels_2026.zip',
        exfiltrationRateMbps: 84.6,
      },
    });
  };

  // Fake Page 1: #btn-encrypt-all
  const handleTriggerEncryptAll = async () => {
    setIsTrappedAttacker(true);
    setEncryptionProgress(25);
    setTimeout(() => setEncryptionProgress(65), 80);
    setTimeout(() => setEncryptionProgress(100), 160);

    setDecoyFiles((prev) =>
      prev.map((f) => ({
        ...f,
        locked: true,
        filename: f.originalFilename.endsWith('.locked')
          ? f.originalFilename
          : `${f.originalFilename}.locked`,
      }))
    );

    const nextSeq = certMetrics.sequentialFileOps + 4;
    const nextThreat = computeCertThreatScore({
      sequentialFileOps: nextSeq,
      extensionMutationRate: 100,
      harmlessCanaryChecks: certMetrics.harmlessCanaryChecks,
    });

    setCertMetrics((prev) => ({
      ...prev,
      sequentialFileOps: nextSeq,
      extensionMutationRate: 100,
      threatScore: nextThreat,
    }));

    await recordForensicEvent({
      eventCode: 'RANSOMWARE_EXTENSION_MUTATION_100',
      severity: 'CRITICAL',
      portalStateOverride: 'FAKE_SANDBOX',
      pageOverride: 'FILES_PAGE',
      actorClassification: 'Custom Ransomware Crypto-Locker Script',
      summary:
        'Mutated all 4 honey-files to .locked extension (Mutation Rate: 100%). Fingerprinted Custom Ransomware Crypto-Locker Script.',
      metadata: {
        extensionMutationRate: 100,
        mutatedFiles: 4,
      },
    });
  };

  // Fake Page 1: #input-search-sqli
  const handleRunSqliSearch = async (queryOverride?: string) => {
    const raw = (queryOverride ?? sqliQuery).trim();
    if (!raw) return;

    setIsTrappedAttacker(true);
    setSqliExecuted(true);

    const entropy = calculateShannonEntropy(raw);
    const nextConfidence = computeCicIdsAttackConfidence({
      requestIatMs: 22,
      exfiltrationRateMbps: cicIdsMetrics.exfiltrationRateMbps,
      shannonEntropy: Math.max(6.42, entropy),
      sqliTriggered: true,
    });

    setCicIdsMetrics((prev) => ({
      ...prev,
      requestIatMs: 22,
      shannonEntropy: Math.max(6.42, entropy),
      attackConfidence: nextConfidence,
    }));

    if (raw.includes('/etc/passwd') || raw.includes(';')) {
      setSqliOutput(`root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
acmedrive_enclave:x:1001:1001:MirageGate Decoy Sandbox:/var/lib/honey:/bin/sh
postgres:x:109:117:PostgreSQL Canary Server:/var/lib/postgresql:/bin/bash`);
    } else {
      setSqliOutput(`[SQLi UNION DUMP // TABLE: vault_users_canary]
id | username               | password_hash                                  | role
---+------------------------+------------------------------------------------+------------
 1 | admin@acmedrive.io     | $2b$12$CanaryHash991823100xFakeSqlDumpPayload  | SUPERADMIN
 2 | billing@acmedrive.io   | $2b$12$CanaryHash774129000xFakeSqlDumpPayload  | FINANCE
 3 | secops@acmedrive.io    | $2b$12$CanaryHash551920311xFakeSqlDumpPayload  | SOC_LEAD`);
    }

    await recordForensicEvent({
      eventCode: 'SQLI_COMMAND_INJECTION_DETECTED',
      severity: 'CRITICAL',
      portalStateOverride: 'FAKE_SANDBOX',
      pageOverride: 'FILES_PAGE',
      actorClassification: 'SQLMap / OWASP ZAP Active Scanner',
      summary: `Executed injection payload "${raw}". Fingerprinted SQLMap / OWASP ZAP Active Scanner.`,
      metadata: {
        payload: raw,
        shannonEntropy: Math.max(6.42, entropy),
      },
    });
  };

  // Fake Page 2: Reveal or Copy Decoy API Key
  const handleRevealApiKey = async (keyId: string) => {
    setIsTrappedAttacker(true);
    setApiKeyExfiltrated(true);
    const target = decoyApiKeys.find((k) => k.id === keyId);
    setDecoyApiKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, revealed: true } : k))
    );

    const nextSeq = certMetrics.sequentialFileOps + 1;
    setCertMetrics((prev) => ({
      ...prev,
      sequentialFileOps: nextSeq,
      threatScore: computeCertThreatScore({
        sequentialFileOps: nextSeq,
        extensionMutationRate: prev.extensionMutationRate,
        harmlessCanaryChecks: prev.harmlessCanaryChecks,
      }),
    }));

    await recordForensicEvent({
      eventCode: 'CANARY_API_KEY_EXFILTRATED',
      severity: 'CRITICAL',
      portalStateOverride: 'FAKE_SANDBOX',
      pageOverride: 'API_CONSOLE_PAGE',
      actorClassification: 'Credential Harvester / Secret Scraper',
      summary: `[CANARY_API_KEY_EXFILTRATED] Revealed decoy secret '${target?.secretValue}' (${target?.canaryTag}).`,
      metadata: {
        keyId,
        canaryTag: target?.canaryTag || 'CANARY',
      },
    });
  };

  const handleCopyApiKey = async (keyId: string) => {
    setIsTrappedAttacker(true);
    setApiKeyExfiltrated(true);
    const target = decoyApiKeys.find((k) => k.id === keyId);
    if (target && navigator.clipboard) {
      navigator.clipboard.writeText(target.secretValue).catch(() => {});
    }
    setDecoyApiKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, revealed: true, copied: true } : k))
    );

    await recordForensicEvent({
      eventCode: 'CANARY_API_KEY_EXFILTRATED',
      severity: 'CRITICAL',
      portalStateOverride: 'FAKE_SANDBOX',
      pageOverride: 'API_CONSOLE_PAGE',
      actorClassification: 'Credential Harvester / Secret Scraper',
      summary: `[CANARY_API_KEY_EXFILTRATED] Copied decoy API key '${target?.secretValue}' to clipboard.`,
      metadata: {
        keyId,
        secret: target?.secretValue || '',
      },
    });
  };

  // Fake Page 2: Cloud Shell Command
  const handleRunCloudShellCommand = async (cmd: string) => {
    setIsTrappedAttacker(true);
    setSqliExecuted(true);
    await recordForensicEvent({
      eventCode: 'DECOY_CLOUD_SHELL_EXEC',
      severity: 'CRITICAL',
      portalStateOverride: 'FAKE_SANDBOX',
      pageOverride: 'API_CONSOLE_PAGE',
      actorClassification: 'Post-Exploitation Recon Actor',
      summary: `Executed command '${cmd}' in Decoy Cloud Shell Terminal.`,
      metadata: { command: cmd },
    });
  };

  // Real Vault Handlers
  const handleToggleRealFileStatus = (
    fileId: string,
    field: 'approved' | 'starred'
  ) => {
    setRealFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, [field]: !f[field] } : f))
    );
  };

  const handleGenerateDevToken = async () => {
    const token = `acme_ro_dev_${Math.random().toString(36).slice(2, 10)}`;
    setGeneratedDevToken(token);
    await recordForensicEvent({
      eventCode: 'REAL_VAULT_DEV_TOKEN_ISSUED',
      severity: 'VERIFIED',
      portalStateOverride: 'REAL_VAULT',
      pageOverride: 'API_CONSOLE_PAGE',
      actorClassification: 'Verified Corporate Employee',
      summary: `Issued read-only ephemeral developer token (${token}).`,
    });
  };

  // Quick Demo Simulator Presets (1-Click Stage Presets)
  const runPresetLegitLogin = async () => {
    setPassword(CORRECT_VAULT_PASSWORD);
    const legitMetrics: KeystrokeMetrics = {
      flightTimeMs: 138,
      holdTimeMs: 86,
      backspaceCount: 1,
      pasteDetected: false,
      keystrokeCount: 15,
      cmuBotProbability: 12,
    };
    setKeystrokeMetrics(legitMetrics);
    setCicIdsMetrics(INITIAL_CIC_IDS);
    setCertMetrics(INITIAL_CERT);
    setIsTrappedAttacker(false);
    setRedirectedFromSandbox(false);
    setPortalState('REAL_VAULT');
    setActivePage('FILES_PAGE');

    await recordForensicEvent({
      eventCode: 'SIM_PRESET_LEGIT_LOGIN',
      severity: 'VERIFIED',
      portalStateOverride: 'REAL_VAULT',
      pageOverride: 'FILES_PAGE',
      actorClassification: 'Verified Corporate Employee',
      summary:
        '🧑 Legit Login Preset: Authenticated with BlueFalcon2026! and organic human cadence (138ms flight). Routed straight to Original Real Website.',
      metadata: { preset: 'LEGIT_LOGIN', cmuBotProbability: 12 },
    });
  };

  const runPresetMisplacedHuman = async () => {
    setPassword('WrongPass2026!');
    setKeystrokeMetrics({
      flightTimeMs: 142,
      holdTimeMs: 89,
      backspaceCount: 2,
      pasteDetected: false,
      keystrokeCount: 14,
      cmuBotProbability: 16,
    });
    setCicIdsMetrics(INITIAL_CIC_IDS);
    setCertMetrics({
      sequentialFileOps: 0,
      extensionMutationRate: 0,
      harmlessCanaryChecks: 2,
      threatScore: 2,
    });
    setIsTrappedAttacker(false);
    setEscapeBlockedBanner(false);
    // Lands in Fake Sandbox -> Notices Orange Fox Canary -> Re-verifies -> Redirects back to Real Website
    setRedirectedFromSandbox(true);
    setPortalState('REAL_VAULT');
    setActivePage('FILES_PAGE');

    await recordForensicEvent({
      eventCode: 'DECEPTIVE_HTTP_200_SANDBOX_ROUTE',
      severity: 'WARNING',
      portalStateOverride: 'FAKE_SANDBOX',
      pageOverride: 'SECURITY_AUDIT_PAGE',
      actorClassification: 'Misplaced Corporate Employee',
      summary:
        '🤔 Misplaced Human Step 1: Wrong password entered -> Routed silently to Fake Probation Sandbox (🦊 Orange Fox).',
      metadata: { step: 1, canary: 'Orange Fox' },
    });

    await recordForensicEvent({
      eventCode: 'HUMAN_REVERIFIED_REDIRECT',
      severity: 'VERIFIED',
      portalStateOverride: 'REAL_VAULT',
      pageOverride: 'FILES_PAGE',
      actorClassification: 'Cleared Misplaced Employee',
      summary:
        '🤔 Misplaced Human Step 2: Noticed 🦊 Orange Fox Canary -> Clicked Re-verify Identity with 0 malicious ops -> Redirected to Original Real Website.',
      metadata: { step: 2, redirectedTo: 'REAL_VAULT' },
    });
  };

  const runPresetBotAttack = async () => {
    setPassword('admin123!_credential_stuffing');
    setKeystrokeMetrics({
      flightTimeMs: 11,
      holdTimeMs: 7,
      backspaceCount: 0,
      pasteDetected: true,
      keystrokeCount: 29,
      cmuBotProbability: 96,
    });
    setCicIdsMetrics({
      requestIatMs: 12,
      exfiltrationRateMbps: 84.6,
      shannonEntropy: 6.84,
      attackConfidence: 99,
    });
    setCertMetrics({
      sequentialFileOps: 8,
      extensionMutationRate: 100,
      harmlessCanaryChecks: 0,
      threatScore: 100,
    });
    setIsTrappedAttacker(true);
    setRedirectedFromSandbox(false);
    setBulkDownloaded(true);
    setZipDownloadBanner(true);
    setEncryptionProgress(100);
    setSqliExecuted(true);
    setApiKeyExfiltrated(true);
    setSqliQuery("' OR 1=1 --");
    setSqliOutput(`[SQLi UNION DUMP // TABLE: vault_users_canary]
1 | admin@acmedrive.io | $2b$12$CanaryHash991823100xFakeSqlDumpPayload | SUPERADMIN`);

    setDecoyFiles((prev) =>
      prev.map((f) => ({
        ...f,
        locked: true,
        filename: f.originalFilename.endsWith('.locked')
          ? f.originalFilename
          : `${f.originalFilename}.locked`,
      }))
    );

    setPortalState('FAKE_SANDBOX');
    setActivePage('FILES_PAGE');

    await recordForensicEvent({
      eventCode: 'BOT_FULL_CHAIN_CONTAINED',
      severity: 'CRITICAL',
      portalStateOverride: 'FAKE_SANDBOX',
      pageOverride: 'FILES_PAGE',
      actorClassification: 'Multi-Stage Automated Attacker Bot',
      summary:
        '🤖 Open-Source Bot Attack: Credential stuffing (11ms flight) -> Downloaded all files (84.6 MB/s) -> Encrypted 4 files to .locked (100%) -> Ran SQLi -> Permanently trapped & fingerprinted!',
      metadata: {
        exfiltrationRateMbps: 84.6,
        extensionMutationRate: 100,
        sqli: "' OR 1=1 --",
      },
    });
  };

  const matchedTools = identifyAttackerTools({
    keystroke: keystrokeMetrics,
    cicIds: cicIdsMetrics,
    cert: certMetrics,
    sqliExecuted,
    apiKeyExfiltrated,
    bulkDownloaded,
  });

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#090d16] text-slate-100 overflow-x-hidden">
      {/* Top Header Bar (3-Zone Contract) */}
      <header className="flex items-center justify-between gap-8 px-5 py-3 border-b border-slate-800 bg-slate-950/90 shrink-0">
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span className="text-base font-bold tracking-tight text-slate-100">
            MirageGate: The Honeypot That Learns Who&apos;s Lying
          </span>
        </div>

        <div className="hidden xl:flex items-center gap-6 text-xs text-slate-400 font-mono whitespace-nowrap shrink-0">
          <span>LEFT PANE: TARGET WEB PORTAL</span>
          <span>·</span>
          <span>RIGHT PANE: REAL-TIME DEFENDER SOC &amp; KAGGLE CLASSIFIERS</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="btn-reset-demo"
            type="button"
            onClick={handleResetSimulation}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Simulation
          </button>
        </div>
      </header>

      {/* Permanent 50/50 Split-Screen Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden">
        {/* LEFT PANE (50% Width): Target Web Application ("AcmeDrive Enterprise Cloud Vault") */}
        <section
          aria-label="Target Web Application Pane"
          className="flex flex-col h-full overflow-hidden bg-[#090d16]"
        >
          {/* Quick Demo Simulator Bar at the top of the Left Pane */}
          <div className="px-4 py-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
              Quick Demo Simulator:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={runPresetLegitLogin}
                className="px-2.5 py-1 rounded-md bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-xs font-medium text-emerald-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                🧑 Legit Login
              </button>
              <button
                type="button"
                onClick={runPresetMisplacedHuman}
                className="px-2.5 py-1 rounded-md bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-xs font-medium text-amber-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                🤔 Misplaced Human
              </button>
              <button
                type="button"
                onClick={runPresetBotAttack}
                className="px-2.5 py-1 rounded-md bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-xs font-medium text-rose-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                🤖 Open-Source Bot Attack
              </button>
            </div>
          </div>

          {/* Active Portal View */}
          <div className="flex-1 overflow-y-auto">
            {portalState === 'LOGIN_GATE' && (
              <LoginGate
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                keystrokeMetrics={keystrokeMetrics}
                onUpdateKeystrokes={setKeystrokeMetrics}
                onSubmitLogin={handleSubmitLogin}
              />
            )}

            {portalState === 'FAKE_SANDBOX' && (
              <FakeSandbox
                activePage={activePage}
                onSelectPage={handleSelectPage}
                decoyFiles={decoyFiles}
                decoyApiKeys={decoyApiKeys}
                isTrappedAttacker={isTrappedAttacker}
                escapeBlockedBanner={escapeBlockedBanner}
                encryptionProgress={encryptionProgress}
                zipDownloadBanner={zipDownloadBanner}
                sqliQuery={sqliQuery}
                setSqliQuery={setSqliQuery}
                sqliOutput={sqliOutput}
                onRunSqliSearch={handleRunSqliSearch}
                onPreviewDecoyFile={handlePreviewDecoyFile}
                onTriggerDownloadAll={handleTriggerDownloadAll}
                onTriggerEncryptAll={handleTriggerEncryptAll}
                onRevealApiKey={handleRevealApiKey}
                onCopyApiKey={handleCopyApiKey}
                onRunCloudShellCommand={handleRunCloudShellCommand}
                onVerifyHumanEscapeHatch={handleVerifyHumanEscapeHatch}
                onHarmlessCanaryInspect={handleHarmlessCanaryInspect}
              />
            )}

            {portalState === 'REAL_VAULT' && (
              <RealVault
                activePage={activePage}
                onSelectPage={handleSelectPage}
                realFiles={realFiles}
                redirectedFromSandbox={redirectedFromSandbox}
                onToggleFileStatus={handleToggleRealFileStatus}
                onGenerateDevToken={handleGenerateDevToken}
                generatedDevToken={generatedDevToken}
              />
            )}
          </div>
        </section>

        {/* RIGHT PANE (50% Width): Real-Time Defender SOC Brain & Forensics */}
        <section
          aria-label="Defender SOC Brain Pane"
          className="flex flex-col h-full overflow-hidden bg-[#090d16]"
        >
          <DefenderSocPane
            portalState={portalState}
            activePage={activePage}
            isTrappedAttacker={isTrappedAttacker}
            redirectedFromSandbox={redirectedFromSandbox}
            keystrokeMetrics={keystrokeMetrics}
            cicIdsMetrics={cicIdsMetrics}
            certMetrics={certMetrics}
            matchedTools={matchedTools}
            forensicLogs={forensicLogs}
            headChainHash={headChainHash}
          />
        </section>
      </main>
    </div>
  );
}
