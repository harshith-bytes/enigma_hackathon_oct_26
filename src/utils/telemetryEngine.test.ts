import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CORRECT_VAULT_PASSWORD,
  calculateShannonEntropy,
  computeCertThreatScore,
  computeCicIdsAttackConfidence,
  computeCmuBotProbability,
  evaluateDeceptiveLoginRoute,
  evaluateEscapeHatchAttempt,
  identifyAttackerTools,
} from './telemetryEngine';
import {
  GENESIS_CHAIN_HASH,
  createEncryptedForensicEntry,
  verifyAndDecryptForensicEntry,
} from './cryptoChain';

test('CMU Keystroke Dynamics classifies human cadence vs fast bot burst or clipboard paste', () => {
  const humanProb = computeCmuBotProbability({
    flightTimeMs: 142,
    holdTimeMs: 88,
    backspaceCount: 1,
    pasteDetected: false,
  });
  assert.equal(humanProb < 30, true, `Expected human probability < 30, got ${humanProb}`);

  const botBurstProb = computeCmuBotProbability({
    flightTimeMs: 14,
    holdTimeMs: 11,
    backspaceCount: 0,
    pasteDetected: true,
  });
  assert.equal(botBurstProb >= 90, true, `Expected bot probability >= 90, got ${botBurstProb}`);
});

test('Zero-Lockout Deceptive Routing sends legit human to REAL_VAULT and wrong password/bot to FAKE_SANDBOX with HTTP 200 OK', () => {
  const legitRoute = evaluateDeceptiveLoginRoute(CORRECT_VAULT_PASSWORD, 12);
  assert.equal(legitRoute.targetState, 'REAL_VAULT');
  assert.equal(legitRoute.deceptiveHttpStatus, 'HTTP 200 OK');
  assert.equal(legitRoute.reason, 'DIRECT_AUTHENTICATED_HUMAN');

  const misplacedHumanRoute = evaluateDeceptiveLoginRoute('WrongPass2026!', 18);
  assert.equal(misplacedHumanRoute.targetState, 'FAKE_SANDBOX');
  assert.equal(misplacedHumanRoute.deceptiveHttpStatus, 'HTTP 200 OK');
  assert.equal(misplacedHumanRoute.reason, 'CREDENTIAL_MISMATCH_SANDBOXED');

  const botWithRightPasswordRoute = evaluateDeceptiveLoginRoute(CORRECT_VAULT_PASSWORD, 88);
  assert.equal(botWithRightPasswordRoute.targetState, 'FAKE_SANDBOX');
  assert.equal(botWithRightPasswordRoute.reason, 'BOT_CADENCE_SANDBOXED');
});

test('Escape Hatch allows innocent misplaced human and permanently blocks trapped attackers', () => {
  const innocentCheck = evaluateEscapeHatchAttempt({
    sequentialFileOps: 0,
    isTrappedAttacker: false,
  });
  assert.equal(innocentCheck.allowed, true);
  assert.equal(innocentCheck.nextState, 'REAL_VAULT');
  assert.equal(innocentCheck.eventCode, 'HUMAN_REVERIFIED_REDIRECT');

  const trappedCheck = evaluateEscapeHatchAttempt({
    sequentialFileOps: 1,
    isTrappedAttacker: true,
  });
  assert.equal(trappedCheck.allowed, false);
  assert.equal(trappedCheck.nextState, 'FAKE_SANDBOX');
  assert.equal(trappedCheck.eventCode, 'ESCAPE_HATCH_BLOCKED');
});

test('Attacker Tool Fingerprinter identifies Exfiltrator, Ransomware, and SQLMap accurately', () => {
  const tools = identifyAttackerTools({
    keystroke: {
      flightTimeMs: 12,
      holdTimeMs: 9,
      backspaceCount: 0,
      pasteDetected: true,
      keystrokeCount: 16,
      cmuBotProbability: 96,
    },
    cicIds: {
      requestIatMs: 18,
      exfiltrationRateMbps: 84.6,
      shannonEntropy: 6.42,
      attackConfidence: 98,
    },
    cert: {
      sequentialFileOps: 4,
      extensionMutationRate: 100,
      harmlessCanaryChecks: 0,
      threatScore: 100,
    },
    sqliExecuted: true,
    apiKeyExfiltrated: true,
    bulkDownloaded: true,
  });

  assert.equal(tools.CREDENTIAL_STUFFER.matched, true);
  assert.equal(tools.PYTHON_EXFILTRATOR.matched, true);
  assert.equal(tools.RANSOMWARE_LOCKER.matched, true);
  assert.equal(tools.SQLMAP_SCANNER.matched, true);
  assert.equal(
    computeCicIdsAttackConfidence({
      requestIatMs: 18,
      exfiltrationRateMbps: 84.6,
      shannonEntropy: calculateShannonEntropy("' OR 1=1 -- ; cat /etc/passwd"),
      sqliTriggered: true,
    }) >= 90,
    true
  );
  assert.equal(
    computeCertThreatScore({
      sequentialFileOps: 4,
      extensionMutationRate: 100,
      harmlessCanaryChecks: 0,
    }),
    100
  );
});

test('AES-256-GCM encryption and SHA-256 hash chain link and verify forensic logs cleanly', () => {
  const entry1 = createEncryptedForensicEntry(
    {
      eventCode: 'DECEPTIVE_AUTH_200_SANDBOX',
      severity: 'WARNING',
      portalState: 'FAKE_SANDBOX',
      page: 'FILES_PAGE',
      actorClassification: 'Unverified Session',
      summary: 'Routed login attempt into Fake Probation Sandbox',
      metadata: { ip: '91.240.118.44' },
    },
    GENESIS_CHAIN_HASH,
    1
  );

  const entry2 = createEncryptedForensicEntry(
    {
      eventCode: 'RANSOMWARE_LOCK_DETECTED',
      severity: 'CRITICAL',
      portalState: 'FAKE_SANDBOX',
      page: 'FILES_PAGE',
      actorClassification: 'Custom Ransomware Crypto-Locker Script',
      summary: 'Mutated 4 decoy files to .locked extension',
      metadata: { mutationRate: 100 },
    },
    entry1.crypto.chainHash,
    2
  );

  assert.equal(entry1.crypto.prevChainHash, GENESIS_CHAIN_HASH);
  assert.equal(entry2.crypto.prevChainHash, entry1.crypto.chainHash);
  assert.notEqual(entry1.crypto.chainHash, entry2.crypto.chainHash);

  const verified1 = verifyAndDecryptForensicEntry(entry1);
  const verified2 = verifyAndDecryptForensicEntry(entry2);

  assert.equal(verified1.validHashChain, true);
  assert.equal(verified2.validHashChain, true);
  assert.equal(verified2.decryptedPayload.eventCode, 'RANSOMWARE_LOCK_DETECTED');
});
