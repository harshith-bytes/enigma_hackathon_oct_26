import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  FolderLock,
  KeyRound,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react';
import {
  DecoyApiKeyItem,
  DecoyFileItem,
  InnerPage,
} from '../types/mirage';
import { DECOY_SHELL_OUTPUTS } from '../data/vaultData';

interface FakeSandboxProps {
  activePage: InnerPage;
  onSelectPage: (page: InnerPage) => void;
  decoyFiles: DecoyFileItem[];
  decoyApiKeys: DecoyApiKeyItem[];
  isTrappedAttacker: boolean;
  escapeBlockedBanner: boolean;
  encryptionProgress: number | null;
  zipDownloadBanner: boolean;
  sqliQuery: string;
  setSqliQuery: (val: string) => void;
  sqliOutput: string | null;
  onRunSqliSearch: (queryOverride?: string) => void;
  onPreviewDecoyFile: (file: DecoyFileItem) => void;
  onTriggerDownloadAll: () => void;
  onTriggerEncryptAll: () => void;
  onRevealApiKey: (keyId: string) => void;
  onCopyApiKey: (keyId: string) => void;
  onRunCloudShellCommand: (cmd: string) => void;
  onVerifyHumanEscapeHatch: () => void;
  onHarmlessCanaryInspect: (reason: string) => void;
}

export const FakeSandbox: React.FC<FakeSandboxProps> = ({
  activePage,
  onSelectPage,
  decoyFiles,
  decoyApiKeys,
  isTrappedAttacker,
  escapeBlockedBanner,
  encryptionProgress,
  zipDownloadBanner,
  sqliQuery,
  setSqliQuery,
  sqliOutput,
  onRunSqliSearch,
  onPreviewDecoyFile,
  onTriggerDownloadAll,
  onTriggerEncryptAll,
  onRevealApiKey,
  onCopyApiKey,
  onRunCloudShellCommand,
  onVerifyHumanEscapeHatch,
  onHarmlessCanaryInspect,
}) => {
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<DecoyFileItem | null>(
    null
  );
  const [shellHistory, setShellHistory] = useState<
    Array<{ cmd: string; output: string }>
  >([
    {
      cmd: 'uname -a',
      output:
        'Linux acmedrive-vault-node-09 6.6.14-cloud-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
    },
  ]);
  const [customShellInput, setCustomShellInput] = useState('');

  const handleOpenPreview = (file: DecoyFileItem) => {
    setSelectedPreviewFile(file);
    onPreviewDecoyFile(file);
  };

  const executeShellCmd = (cmd: string) => {
    const clean = cmd.trim();
    if (!clean) return;
    const output =
      DECOY_SHELL_OUTPUTS[clean] ||
      `sh: executed '${clean}' in container namespace [netns: honey-enclave-09] -> 0 rows returned`;
    setShellHistory((prev) => [...prev, { cmd: clean, output }]);
    onRunCloudShellCommand(clean);
    setCustomShellInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/*Deceptive HTTP 200 OK + Persistent Amber Top Status Bar (3 Visual Canaries)*/}
      <div className="bg-amber-950/40 border-b border-amber-700/60 px-4 py-3 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-mono text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>HTTP 200 OK · Session Active</span>
            <span aria-hidden="true">·</span>
            <strong className="text-amber-200">
              Security Phrase: 🦊 Orange Fox (Unverified Node)
            </strong>
          </div>
          <div className="font-mono text-xs text-amber-300/90 tabular-nums">
            Last Login: 03:14 AM from Unknown Proxy (91.240.118.x)
          </div>
        </div>

        {/* Clue #3: Authorized Human Escape Hatch Button + Harmless Canary Check */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-800/50">
          <button
            id="btn-verify-human"
            type="button"
            onClick={onVerifyHumanEscapeHatch}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            🛡️ This doesn&apos;t look like my vault — Re-verify Identity
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onHarmlessCanaryInspect('Inspected Unfamiliar Proxy IP 91.240.118.x')
              }
              className="px-2.5 py-1 rounded-md bg-slate-900/90 hover:bg-slate-800 text-amber-200 border border-amber-700/50 text-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              Inspect Login Anomaly (Harmless Check)
            </button>
          </div>
        </div>

        {/* Blocked Escape Hatch Alert if attacker already touched honey traps */}
        {escapeBlockedBanner && (
          <div className="p-2.5 rounded-lg bg-rose-950/90 border border-rose-600 text-xs text-rose-200 font-mono flex items-center justify-between">
            <span>
              [ESCAPE_HATCH_BLOCKED] Malicious honey-trap interaction already recorded.
              Session permanently quarantined in Fake Sandbox.
            </span>
            <span className="font-bold text-rose-400">CONTAINMENT LOCKED</span>
          </div>
        )}
      </div>

      {/* Shared 3-Page Post-Login Navigation Bar */}
      <nav
        aria-label="Vault Post-Login Navigation"
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800"
      >
        <button
          type="button"
          onClick={() => onSelectPage('FILES_PAGE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activePage === 'FILES_PAGE'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          📁 Cloud Files &amp; Storage
        </button>
        <button
          type="button"
          onClick={() => onSelectPage('API_CONSOLE_PAGE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activePage === 'API_CONSOLE_PAGE'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          🔑 API Keys &amp; Developer Console
        </button>
        <button
          type="button"
          onClick={() => onSelectPage('SECURITY_AUDIT_PAGE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activePage === 'SECURITY_AUDIT_PAGE'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          🛡️ Security Seal &amp; Access Audit
        </button>
      </nav>

      {/* Main Content Area of Fake Website */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* FAKE PAGE 1: CLOUD FILES & STORAGE */}
        {activePage === 'FILES_PAGE' && (
          <div className="space-y-4">
            {/* 3 Malicious Attacker Action Triggers Bar */}
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Enterprise Crown Jewels Directory (Decoy Honeypot)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Watermarked canary files monitored by CIC-IDS-2017 &amp; CERT detectors
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="btn-download-all"
                    type="button"
                    onClick={onTriggerDownloadAll}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-xs font-semibold text-rose-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    📥 Download All Files (.zip)
                  </button>
                  <button
                    id="btn-encrypt-all"
                    type="button"
                    onClick={onTriggerEncryptAll}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-slate-950 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    🔒 Encrypt All Files (Ransomware Lock)
                  </button>
                </div>
              </div>

              {/* Active Bulk Exfiltration Banner */}
              {zipDownloadBanner && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-700/70 flex items-center justify-between text-xs font-mono text-rose-200">
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-rose-400" />
                    Streaming archive: acmedrive_crown_jewels_2026.zip (156.6 MB)
                  </span>
                  <span className="text-rose-400 font-bold tabular-nums">
                    EXFIL RATE: 84.6 MB/s [TRAPPED]
                  </span>
                </div>
              )}

              {/* Active Ransomware Encryption Progress Bar */}
              {encryptionProgress !== null && (
                <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-600 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-rose-200">
                    <span className="flex items-center gap-1.5">
                      <FolderLock className="w-4 h-4 text-rose-400" />
                      AES-CTR Ransomware File Mutation Loop (.locked)
                    </span>
                    <span className="font-bold text-rose-400 tabular-nums">
                      {encryptionProgress}% MUTATED
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-150"
                      style={{ width: `${encryptionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Search Bar SQLi / Command Injection */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-search-sqli"
                      type="text"
                      value={sqliQuery}
                      onChange={(e) => setSqliQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          onRunSqliSearch();
                        }
                      }}
                      placeholder="💉 Search vault index or inject SQLi / OS command..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#090d16] border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onRunSqliSearch()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Execute Query
                  </button>
                </div>

                {/* Quick-Fill SQLi / Command Injection Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400">Quick-Fill Payloads:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const payload = "' OR 1=1 --";
                      setSqliQuery(payload);
                      onRunSqliSearch(payload);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-xs border border-slate-700 cursor-pointer"
                  >
                    &apos; OR 1=1 --
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const payload = '; cat /etc/passwd';
                      setSqliQuery(payload);
                      onRunSqliSearch(payload);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 font-mono text-xs border border-slate-700 cursor-pointer"
                  >
                    ; cat /etc/passwd
                  </button>
                </div>

                {/* SQLi / Command Injection Fake Output */}
                {sqliOutput && (
                  <pre className="p-3 rounded-lg bg-[#05080f] border border-rose-800/60 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                    {sqliOutput}
                  </pre>
                )}
              </div>
            </div>

            {/* 4 Watermarked Decoy Honey-Files Table */}
            <div className="border border-slate-800 bg-slate-900/50 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Decoy Honey-File Repository (4 Files)</span>
                <span className="font-mono">CANARY TELEMETRY: ARMED</span>
              </div>
              <div className="divide-y divide-slate-800/80">
                {decoyFiles.map((file) => (
                  <div
                    key={file.id}
                    className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {file.locked ? (
                          <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <FileSpreadsheet className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span
                          className={`text-sm font-mono font-medium truncate ${
                            file.locked ? 'text-rose-400' : 'text-slate-100'
                          }`}
                        >
                          {file.filename}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400 flex items-center gap-2 font-mono tabular-nums">
                        <span>{file.size}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-300/90">{file.canaryType}</span>
                        <span aria-hidden="true">·</span>
                        <span>ID: {file.watermarkId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(file)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 hover:border-rose-700/60 border border-slate-700 text-xs font-medium text-slate-200 hover:text-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview / Steal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAKE PAGE 2: API KEYS & DEVELOPER CONSOLE */}
        {activePage === 'API_CONSOLE_PAGE' && (
          <div className="space-y-4">
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Decoy Canary API Keys &amp; Service Credentials
                  </h3>
                  <p className="text-xs text-slate-400">
                    Revealing or copying any key triggers{' '}
                    <code className="font-mono text-rose-300">
                      [CANARY_API_KEY_EXFILTRATED]
                    </code>
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-300">
                  3 HONEY TOKENS ACTIVE
                </span>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden">
                {decoyApiKeys.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#090d16]/70 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        {item.label}
                        <span className="text-slate-400 font-mono font-normal">
                          · {item.environment}
                        </span>
                      </div>
                      <div className="mt-1 font-mono text-xs text-emerald-300">
                        {item.revealed ? item.secretValue : item.maskedValue}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onRevealApiKey(item.id)}
                        className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {item.revealed ? 'Secret Revealed' : 'Reveal Secret'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onCopyApiKey(item.id)}
                        className="px-2.5 py-1.5 rounded-md bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-xs font-medium text-rose-200 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Copy className="w-3 h-3" />
                        {item.copied ? 'Copied (Trapped)' : 'Copy API Key'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Decoy Cloud Shell Terminal */}
            <div className="border border-slate-800 bg-[#05080f] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  Decoy Cloud Shell Terminal (root@acmedrive-vault-node-09)
                </div>
                <span className="text-xs font-mono text-rose-400">
                  IMDSv1 HONEYPOT EMULATION
                </span>
              </div>

              {/* Preset Attack Commands */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400">Run Reconnaissance Command:</span>
                {(['whoami', 'env', 'curl http://169.254.169.254/latest/meta-data/iam'] as const).map(
                  (cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={() => executeShellCmd(cmd)}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 font-mono text-amber-300 transition-colors cursor-pointer"
                    >
                      $ {cmd}
                    </button>
                  )
                )}
              </div>

              {/* Terminal Output History */}
              <div className="max-h-44 overflow-y-auto space-y-2 font-mono text-xs p-2.5 rounded bg-slate-950 border border-slate-900">
                {shellHistory.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-amber-300">
                      root@acmedrive-vault-node-09:~# {item.cmd}
                    </div>
                    <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {item.output}
                    </pre>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeShellCmd(customShellInput);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={customShellInput}
                  onChange={(e) => setCustomShellInput(e.target.value)}
                  placeholder="Type shell command (e.g. whoami, env)..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Run Command
                </button>
              </form>
            </div>
          </div>
        )}

        {/* FAKE PAGE 3: SECURITY SEAL & ACCESS AUDIT (Misplaced Human Recovery) */}
        {activePage === 'SECURITY_AUDIT_PAGE' && (
          <div className="space-y-4">
            <div className="border border-amber-700/50 bg-slate-900/70 rounded-xl p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Visual Canary &amp; Personal Security Seal Verification
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Employees who mistype their password land in this probation node. Compare
                  your session seal below to return to the authentic production vault.
                </p>
              </div>

              {/* Side-by-Side Visual Canary Comparison Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-600/60 space-y-2">
                  <div className="text-xs font-mono text-amber-300 flex items-center justify-between">
                    <span>CURRENT ACTIVE SESSION</span>
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-base font-bold text-amber-200">
                    🦊 Orange Fox (Unverified Node - IP 91.240.118.x)
                  </div>
                  <p className="text-xs text-amber-300/80">
                    Probation sandbox assigned due to credential mismatch or anomalous
                    keystroke cadence.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-600/60 space-y-2">
                  <div className="text-xs font-mono text-emerald-300 flex items-center justify-between">
                    <span>YOUR EXPECTED CORPORATE SEAL</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-base font-bold text-emerald-200">
                    🦅 Blue Falcon (Verified VPN - IP 10.14.88.12)
                  </div>
                  <p className="text-xs text-emerald-300/80">
                    Hardware-backed mutual-TLS corporate vault seal registered to
                    admin@acmedrive.io.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  {isTrappedAttacker ? (
                    <span className="text-rose-400 font-mono">
                      ⚠️ Escape hatch disabled: Malicious file/API activity detected in this
                      session.
                    </span>
                  ) : (
                    <span className="text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Zero honey-file traps triggered. Eligible for instant human recovery.
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onVerifyHumanEscapeHatch}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  Confirm Visual Mismatch &amp; Return to Authentic Vault
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Honey-File Preview Modal */}
      {selectedPreviewFile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="decoy-modal-title"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div className="max-w-lg w-full bg-slate-900 border border-rose-600 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4
                  id="decoy-modal-title"
                  className="text-sm font-semibold text-slate-100 font-mono"
                >
                  {selectedPreviewFile.filename}
                </h4>
                <p className="text-xs text-rose-400 font-mono">
                  CRITICAL CANARY ALERT TRIGGERED · WATERMARK {selectedPreviewFile.watermarkId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreviewFile(null)}
                aria-label="Close file preview"
                className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="p-3.5 rounded-lg bg-[#05080f] border border-slate-800 text-xs font-mono text-amber-200 overflow-x-auto leading-relaxed">
              {selectedPreviewFile.previewContent}
            </pre>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span className="font-mono text-rose-400">
                SOC Beacon: Honey-file access sealed into AES-256-GCM chain
              </span>
              <button
                type="button"
                onClick={() => setSelectedPreviewFile(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
