import {
  AttackerToolId,
  CertInsiderMetrics,
  CicIdsMetrics,
  KeystrokeMetrics,
  PortalState,
} from '../types/mirage';

export const CORRECT_VAULT_PASSWORD = 'BlueFalcon2026!';

/**
 * Calculates Shannon entropy (bits per byte, 0.00 - 8.00) of an input string.
 */
export function calculateShannonEntropy(input: string): number {
  if (!input || input.length === 0) return 3.12;
  const freq: Record<string, number> = {};
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    freq[ch] = (freq[ch] || 0) + 1;
  }
  let entropy = 0;
  const len = input.length;
  for (const ch of Object.keys(freq)) {
    const p = freq[ch] / len;
    entropy -= p * Math.log2(p);
  }
  // Normalize & scale for realistic payload entropy display
  return Number(Math.min(7.98, Math.max(1.2, entropy + 1.4)).toFixed(2));
}

/**
 * Computes CMU Keystroke Dynamics Bot Probability (0-100%)
 * from flight time (ms), hold time (ms), backspace count, and clipboard paste burst.
 */
export function computeCmuBotProbability(params: {
  flightTimeMs: number;
  holdTimeMs: number;
  backspaceCount: number;
  pasteDetected: boolean;
}): number {
  const { flightTimeMs, holdTimeMs, backspaceCount, pasteDetected } = params;

  let score = 14; // baseline human typing noise

  if (pasteDetected) {
    score += 68;
  }

  if (flightTimeMs > 0 && flightTimeMs < 28) {
    score += 65;
  } else if (flightTimeMs >= 28 && flightTimeMs < 55) {
    score += 32;
  } else if (flightTimeMs >= 80 && flightTimeMs <= 260) {
    score -= 6;
  }

  if (holdTimeMs > 0 && holdTimeMs < 22) {
    score += 24;
  } else if (holdTimeMs >= 60 && holdTimeMs <= 150) {
    score -= 4;
  }

  // Humans occasionally make typos/backspaces; natural rhythm lowers bot likelihood slightly
  if (backspaceCount > 0 && backspaceCount <= 4 && !pasteDetected && flightTimeMs >= 50) {
    score -= 8;
  }

  return Math.max(2, Math.min(99, Math.round(score)));
}

/**
 * Zero-Lockout Deceptive Routing Rule:
 * - Path A (Direct Legit): password === 'BlueFalcon2026!' AND cmuBotProbability < 70 -> 'REAL_VAULT'
 * - Path B (Silent Probation Sandbox): ANY wrong password OR cmuBotProbability >= 70 -> 'FAKE_SANDBOX'
 */
export function evaluateDeceptiveLoginRoute(
  passwordInput: string,
  cmuBotProbability: number
): {
  targetState: PortalState;
  deceptiveHttpStatus: 'HTTP 200 OK';
  reason: 'DIRECT_AUTHENTICATED_HUMAN' | 'CREDENTIAL_MISMATCH_SANDBOXED' | 'BOT_CADENCE_SANDBOXED';
} {
  const isPasswordMatch = passwordInput === CORRECT_VAULT_PASSWORD;
  const isHumanCadence = cmuBotProbability < 70;

  if (isPasswordMatch && isHumanCadence) {
    return {
      targetState: 'REAL_VAULT',
      deceptiveHttpStatus: 'HTTP 200 OK',
      reason: 'DIRECT_AUTHENTICATED_HUMAN',
    };
  }

  if (!isHumanCadence) {
    return {
      targetState: 'FAKE_SANDBOX',
      deceptiveHttpStatus: 'HTTP 200 OK',
      reason: 'BOT_CADENCE_SANDBOXED',
    };
  }

  return {
    targetState: 'FAKE_SANDBOX',
    deceptiveHttpStatus: 'HTTP 200 OK',
    reason: 'CREDENTIAL_MISMATCH_SANDBOXED',
  };
}

/**
 * Escape Hatch Rule:
 * If the user has NOT touched any malicious bait traps (sequentialFileOps === 0 and !isTrappedAttacker),
 * clicking #btn-verify-human (or performing 2 harmless navigation/inspection clicks) clears their
 * suspicion score and redirects them to REAL_VAULT.
 * If an attacker tries clicking #btn-verify-human after stealing or encrypting files, block the escape hatch.
 */
export function evaluateEscapeHatchAttempt(params: {
  sequentialFileOps: number;
  isTrappedAttacker: boolean;
}): {
  allowed: boolean;
  nextState: PortalState;
  eventCode: 'HUMAN_REVERIFIED_REDIRECT' | 'ESCAPE_HATCH_BLOCKED';
} {
  if (params.sequentialFileOps === 0 && !params.isTrappedAttacker) {
    return {
      allowed: true,
      nextState: 'REAL_VAULT',
      eventCode: 'HUMAN_REVERIFIED_REDIRECT',
    };
  }
  return {
    allowed: false,
    nextState: 'FAKE_SANDBOX',
    eventCode: 'ESCAPE_HATCH_BLOCKED',
  };
}

/**
 * Computes CIC-IDS-2017 TabNet / Random Forest Web Attack Confidence (0-100%)
 */
export function computeCicIdsAttackConfidence(params: {
  requestIatMs: number;
  exfiltrationRateMbps: number;
  shannonEntropy: number;
  sqliTriggered: boolean;
}): number {
  let confidence = 8;

  if (params.exfiltrationRateMbps > 20) {
    confidence += 65;
  } else if (params.exfiltrationRateMbps > 2) {
    confidence += 35;
  }

  if (params.requestIatMs < 90) {
    confidence += 25;
  }

  if (params.shannonEntropy > 5.2) {
    confidence += 28;
  }

  if (params.sqliTriggered) {
    confidence += 55;
  }

  return Math.max(3, Math.min(99, Math.round(confidence)));
}

/**
 * Computes CERT Insider Threat & Ransomware Mutation Score (0-100)
 */
export function computeCertThreatScore(params: {
  sequentialFileOps: number;
  extensionMutationRate: number;
  harmlessCanaryChecks: number;
}): number {
  let score = params.sequentialFileOps * 22 + params.extensionMutationRate * 0.72;
  if (params.sequentialFileOps === 0 && params.extensionMutationRate === 0) {
    score = Math.max(4, 12 - params.harmlessCanaryChecks * 4);
  }
  return Math.max(2, Math.min(100, Math.round(score)));
}

/**
 * Evaluates matched attacker tools based on telemetry signals.
 */
export function identifyAttackerTools(params: {
  keystroke: KeystrokeMetrics;
  cicIds: CicIdsMetrics;
  cert: CertInsiderMetrics;
  sqliExecuted: boolean;
  apiKeyExfiltrated: boolean;
  bulkDownloaded: boolean;
}): Record<AttackerToolId, { matched: boolean; confidence: number }> {
  const credentialStuffer =
    params.keystroke.cmuBotProbability >= 70 ||
    params.keystroke.pasteDetected ||
    (params.keystroke.flightTimeMs > 0 && params.keystroke.flightTimeMs < 28);

  const pythonExfiltrator =
    params.bulkDownloaded ||
    params.apiKeyExfiltrated ||
    params.cicIds.exfiltrationRateMbps >= 20 ||
    params.cert.sequentialFileOps >= 2;

  const ransomwareLocker = params.cert.extensionMutationRate > 0;

  const sqlmapScanner = params.sqliExecuted || params.cicIds.shannonEntropy >= 5.8;

  return {
    CREDENTIAL_STUFFER: {
      matched: credentialStuffer,
      confidence: credentialStuffer ? Math.max(82, params.keystroke.cmuBotProbability) : 8,
    },
    PYTHON_EXFILTRATOR: {
      matched: pythonExfiltrator,
      confidence: pythonExfiltrator ? 96 : 6,
    },
    RANSOMWARE_LOCKER: {
      matched: ransomwareLocker,
      confidence: ransomwareLocker ? 99 : 4,
    },
    SQLMAP_SCANNER: {
      matched: sqlmapScanner,
      confidence: sqlmapScanner ? 95 : 5,
    },
  };
}
