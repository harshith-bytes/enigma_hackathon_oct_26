export type PortalState = 'LOGIN_GATE' | 'FAKE_SANDBOX' | 'REAL_VAULT';

export type InnerPage = 'FILES_PAGE' | 'API_CONSOLE_PAGE' | 'SECURITY_AUDIT_PAGE';

export type SeverityLevel = 'INFO' | 'WARNING' | 'CRITICAL' | 'VERIFIED';

export interface ForensicLogEntry {
  id: string;
  timestamp: string;
  eventCode: string;
  severity: SeverityLevel;
  portalState: PortalState;
  page: InnerPage | 'LOGIN_GATE';
  actorClassification: string;
  summary: string;
  metadata: Record<string, string | number | boolean>;
  crypto: {
    algorithm: 'AES-256-GCM';
    iv: string;
    authTag: string;
    ciphertext: string;
    prevChainHash: string;
    chainHash: string;
  };
}

export interface KeystrokeMetrics {
  flightTimeMs: number;
  holdTimeMs: number;
  backspaceCount: number;
  pasteDetected: boolean;
  keystrokeCount: number;
  cmuBotProbability: number;
}

export interface CicIdsMetrics {
  requestIatMs: number;
  exfiltrationRateMbps: number;
  shannonEntropy: number;
  attackConfidence: number;
}

export interface CertInsiderMetrics {
  sequentialFileOps: number;
  extensionMutationRate: number;
  harmlessCanaryChecks: number;
  threatScore: number;
}

export type AttackerToolId =
  | 'CREDENTIAL_STUFFER'
  | 'PYTHON_EXFILTRATOR'
  | 'RANSOMWARE_LOCKER'
  | 'SQLMAP_SCANNER';

export interface AttackerToolFingerprint {
  id: AttackerToolId;
  name: string;
  signature: string;
  matched: boolean;
  confidence: number;
  evidence: string;
}

export interface DecoyFileItem {
  id: string;
  filename: string;
  originalFilename: string;
  size: string;
  sizeMb: number;
  canaryType: string;
  watermarkId: string;
  locked: boolean;
  stolenCount: number;
  previewContent: string;
}

export interface RealFileItem {
  id: string;
  filename: string;
  size: string;
  lastModified: string;
  author: string;
  approved: boolean;
  starred: boolean;
  summary: string;
  content: string;
}

export interface DecoyApiKeyItem {
  id: string;
  label: string;
  environment: string;
  maskedValue: string;
  secretValue: string;
  revealed: boolean;
  copied: boolean;
  canaryTag: string;
}
