import crypto from 'node:crypto';
import type {
  ForensicLogEntry,
  InnerPage,
  PortalState,
  SeverityLevel,
} from '../types/mirage.ts';

// Deterministic 32-byte key for AES-256-GCM forensic sealing in runtime memory
const FORENSIC_MASTER_KEY = crypto
  .createHash('sha256')
  .update('miragegate-soc-aes-256-gcm-enclave-key-2026')
  .digest();

export const GENESIS_CHAIN_HASH =
  '0000000000000000000000000000000000000000000000000000000000000000';

export interface RawForensicEventInput {
  eventCode: string;
  severity: SeverityLevel;
  portalState: PortalState;
  page: InnerPage | 'LOGIN_GATE';
  actorClassification: string;
  summary: string;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Encrypts a forensic event payload with Node crypto `aes-256-gcm`
 * and links it to `prevChainHash` using a `sha256` cryptographic hash chain.
 */
export function createEncryptedForensicEntry(
  input: RawForensicEventInput,
  prevChainHash: string = GENESIS_CHAIN_HASH,
  index: number = 1
): ForensicLogEntry {
  const id = `MG-${String(index).padStart(4, '0')}`;
  const timestamp = new Date().toISOString();
  const metadata = input.metadata || {};

  const plaintextObject = {
    id,
    timestamp,
    eventCode: input.eventCode,
    severity: input.severity,
    portalState: input.portalState,
    page: input.page,
    actorClassification: input.actorClassification,
    summary: input.summary,
    metadata,
  };

  const plaintextJson = JSON.stringify(plaintextObject);
  const ivBuffer = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', FORENSIC_MASTER_KEY, ivBuffer);

  const encryptedBuffer = Buffer.concat([
    cipher.update(plaintextJson, 'utf8'),
    cipher.final(),
  ]);
  const authTagBuffer = cipher.getAuthTag();

  const ivHex = ivBuffer.toString('hex');
  const authTagHex = authTagBuffer.toString('hex');
  const ciphertextHex = encryptedBuffer.toString('hex');

  const chainHash = crypto
    .createHash('sha256')
    .update(`${prevChainHash}:${ivHex}:${authTagHex}:${ciphertextHex}`)
    .digest('hex');

  return {
    id,
    timestamp,
    eventCode: input.eventCode,
    severity: input.severity,
    portalState: input.portalState,
    page: input.page,
    actorClassification: input.actorClassification,
    summary: input.summary,
    metadata,
    crypto: {
      algorithm: 'AES-256-GCM',
      iv: ivHex,
      authTag: authTagHex,
      ciphertext: ciphertextHex,
      prevChainHash,
      chainHash,
    },
  };
}

/**
 * Decrypts and verifies an AES-256-GCM ForensicLogEntry for integrity auditing.
 */
export function verifyAndDecryptForensicEntry(entry: ForensicLogEntry): {
  validHashChain: boolean;
  decryptedPayload: Record<string, unknown>;
} {
  const expectedChainHash = crypto
    .createHash('sha256')
    .update(
      `${entry.crypto.prevChainHash}:${entry.crypto.iv}:${entry.crypto.authTag}:${entry.crypto.ciphertext}`
    )
    .digest('hex');

  const validHashChain = expectedChainHash === entry.crypto.chainHash;

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    FORENSIC_MASTER_KEY,
    Buffer.from(entry.crypto.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(entry.crypto.authTag, 'hex'));

  const decryptedBuffer = Buffer.concat([
    decipher.update(Buffer.from(entry.crypto.ciphertext, 'hex')),
    decipher.final(),
  ]);

  return {
    validHashChain,
    decryptedPayload: JSON.parse(decryptedBuffer.toString('utf8')),
  };
}
