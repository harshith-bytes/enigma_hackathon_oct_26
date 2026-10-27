import { DecoyApiKeyItem, DecoyFileItem, RealFileItem } from '../types/mirage';

export const INITIAL_DECOY_FILES: DecoyFileItem[] = [
  {
    id: 'decoy-1',
    filename: 'passwords_master_2026.xlsx',
    originalFilename: 'passwords_master_2026.xlsx',
    size: '4.8 MB',
    sizeMb: 4.8,
    canaryType: 'Canary Honey-Credential Sheet',
    watermarkId: 'WM-CRED-9921',
    locked: false,
    stolenCount: 0,
    previewContent: `SHEET: PROD_INFRASTRUCTURE_CREDENTIALS (WATERMARK: WM-CRED-9921)
-------------------------------------------------------------------------
ROW 01 | jumpbox-eu-west.acmedrive.internal | root      | $2b$12$K9xHoneyTrapToken8812a
ROW 02 | k8s-etcd-master.acmedrive.internal | sysadmin  | Ak99!Canary_Vault_Decoy_Pass
ROW 03 | snowflake-dw-prod.acmedrive.io     | etl_svc   | snw_canary_token_0x99812fa
ROW 04 | stripe-settlement-webhook          | fin_admin | rk_live_51HoneyDecoy9918231`,
  },
  {
    id: 'decoy-2',
    filename: 'aws_production_keys.env',
    originalFilename: 'aws_production_keys.env',
    size: '18 KB',
    sizeMb: 0.018,
    canaryType: 'Decoy IAM Canary Tokens',
    watermarkId: 'WM-IAM-4410',
    locked: false,
    stolenCount: 0,
    previewContent: `# ACMEDRIVE CLOUD PRODUCTION ENVIRONMENT (DECOY CANARY)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7CANARY9"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYCANARYKEY88"
AWS_SESSION_TOKEN="FwoGZXIvYXdzEJr//////////wEaDCanaryBeaconTrapToken991"
S3_CROWN_JEWELS_BUCKET="s3://acmedrive-prod-honey-vault-2026"`,
  },
  {
    id: 'decoy-3',
    filename: 'customer_pii_dump.sql',
    originalFilename: 'customer_pii_dump.sql',
    size: '142.6 MB',
    sizeMb: 142.6,
    canaryType: 'Synthetic Faker Records',
    watermarkId: 'WM-SQL-7732',
    locked: false,
    stolenCount: 0,
    previewContent: `-- PostgreSQL 16.2 Synthetic Canary Dump (Watermark: WM-SQL-7732)
INSERT INTO enterprise_customers (id, email, ssn_token, cc_last4, tier) VALUES
  (10491, 'cfo.canary.trap1@acme-synthetic.org', '999-00-1928', '4242', 'ENTERPRISE'),
  (10492, 'secops.beacon.trap2@acme-synthetic.org', '999-00-8841', '1111', 'ENTERPRISE'),
  (10493, 'director.honey.trap3@acme-synthetic.org', '999-00-3319', '8812', 'VIP_VAULT');`,
  },
  {
    id: 'decoy-4',
    filename: 'company_payroll_secret.pdf',
    originalFilename: 'company_payroll_secret.pdf',
    size: '9.2 MB',
    sizeMb: 9.2,
    canaryType: 'Beacon PDF Trap',
    watermarkId: 'WM-PDF-1108',
    locked: false,
    stolenCount: 0,
    previewContent: `[PDF OBJECT STREAM // TELEMETRY BEACON EMBEDDED: WM-PDF-1108]
Document Title: FY2026 Executive Compensation & Equity Ledger
 DNS Canary Callback: http://169.254.169.254/canary-webhook/pdf-open-1108
-------------------------------------------------------------------------
Exec ID #01 — Chief Architect      | Base: $340,000 | Vesting: 120,000 RSU
Exec ID #02 — VP Security Enclave  | Base: $315,000 | Vesting: 95,000 RSU
Exec ID #03 — Principal SRE Lead   | Base: $285,000 | Vesting: 80,000 RSU`,
  },
];

export const INITIAL_DECOY_API_KEYS: DecoyApiKeyItem[] = [
  {
    id: 'key-1',
    label: 'Production Storage Cluster Master Key',
    environment: 'prod-us-east-1',
    maskedValue: 'ak_live_honey_••••••',
    secretValue: 'ak_live_honey_99281a',
    revealed: false,
    copied: false,
    canaryTag: 'CANARY-KEY-99281A',
  },
  {
    id: 'key-2',
    label: 'AWS KMS Enclave Root Signer',
    environment: 'iam-enclave-01',
    maskedValue: 'aws_secret_canary_••••',
    secretValue: 'aws_secret_canary_8812',
    revealed: false,
    copied: false,
    canaryTag: 'CANARY-AWS-8812',
  },
  {
    id: 'key-3',
    label: 'Stripe Enterprise Settlement Bridge',
    environment: 'billing-live',
    maskedValue: 'stripe_live_trap_•••',
    secretValue: 'stripe_live_trap_771',
    revealed: false,
    copied: false,
    canaryTag: 'CANARY-STRIPE-771',
  },
];

export const DECOY_SHELL_OUTPUTS: Record<string, string> = {
  whoami: `root (uid=0, gid=0, groups=0(root),1001(acmedrive-honey-jail))`,
  env: `HOSTNAME=acmedrive-vault-node-09.internal
AWS_DEFAULT_REGION=us-east-1
VAULT_DECOY_ENCLAVE=true
DB_CONN_STRING=postgres://admin:CanaryTrap991@10.240.12.99:5432/prod_vault
HONEY_TOKEN_BEACON=active_session_monitored`,
  'curl http://169.254.169.254/latest/meta-data/iam': `{
  "Code" : "Success",
  "LastUpdated" : "2026-10-27T04:12:00Z",
  "InstanceProfileArn" : "arn:aws:iam::992810441920:instance-profile/AcmeDrive-Prod-CanaryRole",
  "AccessKeyId" : "ASIA5CANARYTRAP00918",
  "SecretAccessKey" : "99xCanaryFakeMetadataSecretKeyPayload00192x",
  "Token" : "IQoJb3JpZ2luX2VjEJr//////////wEaCXVzLWVhc3QtMSJGMEQCIFakeIMDSv1Token=="
}`,
};

export const INITIAL_REAL_FILES: RealFileItem[] = [
  {
    id: 'real-1',
    filename: 'Q1_Project_Notes.docx',
    size: '412 KB',
    lastModified: 'Today, 09:42 AM',
    author: 'Elena Rostova (VP Engineering)',
    approved: true,
    starred: true,
    summary: 'Quarterly architecture roadmap for zero-trust storage encryption & edge caching.',
    content: `ACMEDRIVE ENTERPRISE — Q1 ENGINEERING SYNC NOTES
Security Seal: 🦅 Blue Falcon (Verified Production Enclave)
-------------------------------------------------------------------
1. Storage Layer Milestones:
   - Completed migration of regional block replication to TLS 1.3 mutual-auth.
   - Latency p99 across Tokyo and Frankfurt clusters improved by 18.4%.

2. Deception Gateway Rollout:
   - MirageGate behavioral sandbox deployed in front of primary authentication tier.
   - Zero false-lockout tickets reported by engineering staff over 30-day window.`,
  },
  {
    id: 'real-2',
    filename: 'Team_Schedule.pdf',
    size: '1.1 MB',
    lastModified: 'Yesterday, 05:18 PM',
    author: 'Marcus Vance (SRE Lead)',
    approved: true,
    starred: false,
    summary: 'On-call rotation roster, maintenance windows, and incident escalation contacts.',
    content: `PRIMARY SRE & SECURITY ON-CALL SCHEDULE (Q4)
Security Seal: 🦅 Blue Falcon (Verified Production Enclave)
-------------------------------------------------------------------
Week 43 Primary:   Marcus Vance (VPN Static IP: 10.14.88.12)
Week 43 Secondary: Priya Nair   (VPN Static IP: 10.14.88.19)
Maintenance Slot:  Thursdays 02:00 - 03:00 UTC (Zero-downtime rolling reload)`,
  },
  {
    id: 'real-3',
    filename: 'UI_Wireframes.fig',
    size: '14.6 MB',
    lastModified: 'Oct 24, 2026',
    author: 'Devon Brooks (Staff Product Designer)',
    approved: false,
    starred: true,
    summary: 'Design specifications for the hardware security key enrollment workflow.',
    content: `FIGMA SPEC SHEET — HARDWARE FIDO2 ENROLLMENT FLOW
Security Seal: 🦅 Blue Falcon (Verified Production Enclave)
-------------------------------------------------------------------
- Frame 01: Mutual TLS + Security Seal confirmation badge ("🦅 Blue Falcon")
- Frame 02: WebAuthn YubiKey tap verification modal
- Frame 03: Recovery phrase verification screen for remote employees`,
  },
];
