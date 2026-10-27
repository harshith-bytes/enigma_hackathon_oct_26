import React, { useState } from 'react';
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Cpu,
  Download,
  Fingerprint,
  GitBranch,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import {
  AttackerToolId,
  CertInsiderMetrics,
  CicIdsMetrics,
  ForensicLogEntry,
  InnerPage,
  KeystrokeMetrics,
  PortalState,
} from '../types/mirage';

interface DefenderSocPaneProps {
  portalState: PortalState;
  activePage: InnerPage;
  isTrappedAttacker: boolean;
  redirectedFromSandbox: boolean;
  keystrokeMetrics: KeystrokeMetrics;
  cicIdsMetrics: CicIdsMetrics;
  certMetrics: CertInsiderMetrics;
  matchedTools: Record<AttackerToolId, { matched: boolean; confidence: number }>;
  forensicLogs: ForensicLogEntry[];
  headChainHash: string;
}

const TOOL_CATALOG: Array<{
  id: AttackerToolId;
  name: string;
  triggerDesc: string;
}> = [
  {
    id: 'CREDENTIAL_STUFFER',
    name: 'THC-Hydra / Burp Intruder / Playwright Bot',
    triggerDesc: 'Fast login stuffing / sub-28ms flight cadence / clipboard burst',
  },
  {
    id: 'PYTHON_EXFILTRATOR',
    name: 'Python Requests Scraper / Automated Exfiltrator',
    triggerDesc: 'Bulk .zip archive download / canary API key theft',
  },
  {
    id: 'RANSOMWARE_LOCKER',
    name: 'Custom Ransomware Crypto-Locker Script',
    triggerDesc: 'Sequential honey-file encryption loop (.locked mutation)',
  },
  {
    id: 'SQLMAP_SCANNER',
    name: 'SQLMap / OWASP ZAP Active Scanner',
    triggerDesc: 'Search bar SQLi payload / OS command injection probe',
  },
];

export const DefenderSocPane: React.FC<DefenderSocPaneProps> = ({
  portalState,
  activePage,
  isTrappedAttacker,
  redirectedFromSandbox,
  keystrokeMetrics,
  cicIdsMetrics,
  certMetrics,
  matchedTools,
  forensicLogs,
  headChainHash,
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const currentViewLabel =
    portalState === 'LOGIN_GATE'
      ? 'PAGE 1: LOGIN_GATE'
      : `${portalState} -> ${activePage}`;

  const handleExportForensicsJson = async () => {
    try {
      const response = await fetch('/api/forensics/export');
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `miragegate_forensics_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback export from client state if needed
      const blob = new Blob([JSON.stringify(forensicLogs, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'miragegate_forensics_export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 bg-[#090d16]">
      {/* 1. Interactive State Pipeline Visualizer */}
      <section className="border border-slate-800 bg-slate-900/60 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span>Interactive Deception State Pipeline</span>
          </div>
          <span className="font-mono text-xs text-emerald-300 tabular-nums">
            ACTIVE VIEW: {currentViewLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs font-mono">
          {/* Step 1 */}
          <div
            className={`p-2.5 rounded-lg border transition-colors ${
              portalState === 'LOGIN_GATE'
                ? 'bg-sky-950/50 border-sky-500 text-sky-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="font-bold">[Step 1: Login Attempt]</div>
            <div className="text-[11px] mt-0.5 opacity-80">
              CMU Keystroke + Passphrase Gate
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`p-2.5 rounded-lg border transition-colors ${
              portalState === 'FAKE_SANDBOX' && !isTrappedAttacker
                ? 'bg-amber-950/50 border-amber-500 text-amber-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="font-bold">[Step 2: Fake Website]</div>
            <div className="text-[11px] mt-0.5 opacity-80">
              Pattern Analysis &amp; Canary Check
            </div>
          </div>

          {/* Branch A: Cleared */}
          <div
            className={`p-2.5 rounded-lg border transition-colors ${
              portalState === 'REAL_VAULT'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="font-bold">[✅ Cleared -&gt; Real Website]</div>
            <div className="text-[11px] mt-0.5 opacity-80">
              {redirectedFromSandbox
                ? 'Re-verified from Sandbox'
                : 'Authentic 🦅 Blue Falcon'}
            </div>
          </div>

          {/* Branch B: Trapped */}
          <div
            className={`p-2.5 rounded-lg border transition-colors ${
              portalState === 'FAKE_SANDBOX' && isTrappedAttacker
                ? 'bg-rose-950/70 border-rose-500 text-rose-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="font-bold">[🚨 Trapped in Fake Site]</div>
            <div className="text-[11px] mt-0.5 opacity-80">
              Tool Fingerprinting &amp; Containment
            </div>
          </div>
        </div>
      </section>

      {/* 2. Kaggle Pre-Trained Model Inference Panel (3 Live Cards) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Kaggle Pre-Trained Behavioral Classifier Ensemble
          </span>
          <span className="font-mono text-slate-400">REAL-TIME TELEMETRY INFERENCE</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
          {/* Card 1: CMU Keystroke Dynamics */}
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-slate-200 truncate">
                CMU Keystroke Dynamics
              </span>
              <Activity className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            </div>
            <div className="space-y-1 text-[11px] font-mono tabular-nums">
              <div className="flex justify-between gap-2 text-slate-400 whitespace-nowrap">
                <span>Flight Time:</span>
                <span className="text-slate-200">{keystrokeMetrics.flightTimeMs} ms</span>
              </div>
              <div className="flex justify-between gap-2 text-slate-400 whitespace-nowrap">
                <span>Hold Time:</span>
                <span className="text-slate-200">{keystrokeMetrics.holdTimeMs} ms</span>
              </div>
              <div className="flex justify-between gap-2 text-slate-400 whitespace-nowrap">
                <span>Backspaces/Paste:</span>
                <span className="text-slate-200">
                  {keystrokeMetrics.backspaceCount} /{' '}
                  {keystrokeMetrics.pasteDetected ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs tabular-nums whitespace-nowrap">
              <span className="text-slate-400">Bot Prob:</span>
              <span
                className={`font-bold ${
                  keystrokeMetrics.cmuBotProbability >= 70
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {keystrokeMetrics.cmuBotProbability}%
              </span>
            </div>
          </div>

          {/* Card 2: CIC-IDS-2017 Web Attack Classifier */}
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-slate-200 truncate">
                CIC-IDS-2017 TabNet / RF
              </span>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
            <div className="space-y-1 text-[11px] font-mono tabular-nums">
              <div className="flex justify-between gap-2 text-slate-400 whitespace-nowrap">
                <span>Request IAT:</span>
                <span className="text-slate-200">{cicIdsMetrics.requestIatMs} ms</span>
              </div>
              <div className="flex justify-between gap-2 text-slate-400 whitespace-nowrap">
                <span>Exfil Rate:</span>
                <span
                  className={
                    cicIdsMetrics.exfiltrationRateMbps > 20
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-200'
                  }
                >
                  {cicIdsMetrics.exfiltrationRateMbps} MB/s
                </span>
              </div>
              <div className="flex justify-between gap-2 text-slate-400 whitespace-nowrap">
                <span>Payload Entropy:</span>
                <span className="text-slate-200">
                  {cicIdsMetrics.shannonEntropy} b/B
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs tabular-nums whitespace-nowrap">
              <span className="text-slate-400">Attack Conf:</span>
              <span
                className={`font-bold ${
                  cicIdsMetrics.attackConfidence >= 60
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {cicIdsMetrics.attackConfidence}%
              </span>
            </div>
          </div>

          {/* Card 3: CERT Insider Threat & Ransomware Mutation Detector */}
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-slate-200 truncate">
                CERT Insider &amp; Ransomware
              </span>
              <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            </div>
            <div className="space-y-1 text-[11px] font-mono tabular-nums">
              <div className="flex justify-between gap-2 text-slate-400 whitespace-nowrap">
                <span>Honey-File Ops:</span>
                <span className="text-slate-200">{certMetrics.sequentialFileOps}</span>
              </div>
              <div className="flex justify-between gap-2 text-slate-400 whitespace-nowrap">
                <span>.locked Mutation:</span>
                <span
                  className={
                    certMetrics.extensionMutationRate > 0
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-200'
                  }
                >
                  {certMetrics.extensionMutationRate}%
                </span>
              </div>
              <div className="flex justify-between gap-2 text-slate-400 whitespace-nowrap">
                <span>Canary Checks:</span>
                <span className="text-emerald-300">
                  {certMetrics.harmlessCanaryChecks}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs tabular-nums whitespace-nowrap">
              <span className="text-slate-400">Threat Score:</span>
              <span
                className={`font-bold ${
                  certMetrics.threatScore >= 50 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {certMetrics.threatScore}/100
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Attacker Tool & Strategy Identifier Card */}
      <section className="border border-slate-800 bg-slate-900/60 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Fingerprint className="w-4 h-4 text-rose-400" />
            Attacker Tool &amp; Strategy Identifier
          </span>
          <span className="font-mono text-slate-400">BEHAVIORAL SIGNATURE MATCHING</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TOOL_CATALOG.map((tool) => {
            const status = matchedTools[tool.id];
            return (
              <div
                key={tool.id}
                className={`p-2.5 rounded-lg border transition-colors ${
                  status.matched
                    ? 'bg-rose-950/50 border-rose-500/80 text-rose-100'
                    : 'bg-[#090d16] border-slate-800/90 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                  <span className="truncate">{tool.name}</span>
                  <span
                    className={`font-mono tabular-nums shrink-0 ${
                      status.matched ? 'text-rose-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {status.matched ? `MATCH ${status.confidence}%` : 'IDLE'}
                  </span>
                </div>
                <div className="text-[11px] mt-1 opacity-80 truncate">
                  {tool.triggerDesc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Live AES-256-GCM Encrypted Threat Intel Terminal & JSON Export */}
      <section className="flex-1 flex flex-col border border-slate-800 bg-[#05080f] rounded-xl overflow-hidden min-h-[250px]">
        <div className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-100">
              AES-256-GCM Encrypted Threat Intel Terminal
            </span>
            <span className="font-mono text-slate-400 tabular-nums">
              ({forensicLogs.length} blocks · SHA-256 Chain:{' '}
              {headChainHash.slice(0, 10)}...)
            </span>
          </div>

          <button
            id="btn-export-forensics"
            type="button"
            onClick={handleExportForensicsJson}
            className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Download Attacker Forensics JSON
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-900 font-mono text-xs">
          {forensicLogs
            .slice()
            .reverse()
            .map((entry, idx) => {
              const isExpanded =
                expandedLogId === null ? idx === 0 : expandedLogId === entry.id;
              const sevColor =
                entry.severity === 'CRITICAL'
                  ? 'text-rose-400'
                  : entry.severity === 'WARNING'
                  ? 'text-amber-300'
                  : entry.severity === 'VERIFIED'
                  ? 'text-emerald-400'
                  : 'text-sky-300';

              return (
                <div key={entry.id} className="bg-[#05080f] hover:bg-slate-900/40">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedLogId(isExpanded ? '__NONE__' : entry.id)
                    }
                    className="w-full px-3.5 py-2.5 text-left flex items-start justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-slate-500 tabular-nums">
                            {entry.id}
                          </span>
                          <span className={`font-bold ${sevColor}`}>
                            [{entry.eventCode}]
                          </span>
                          <span className="text-slate-200 truncate">
                            {entry.summary}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                          Actor: {entry.actorClassification} · State: {entry.portalState}{' '}
                          ({entry.page}) · SHA256: {entry.crypto.chainHash.slice(0, 14)}…
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-8 pb-3 pt-1 space-y-1 text-[11px] text-slate-300 bg-slate-950/90 border-t border-slate-900 break-all">
                      <div>
                        <span className="text-slate-500">Algorithm: </span>
                        <span className="text-emerald-400">
                          {entry.crypto.algorithm} (Node crypto Verified)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">IV (96-bit Hex): </span>
                        <span className="text-amber-300">{entry.crypto.iv}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">AuthTag (128-bit Hex): </span>
                        <span className="text-rose-300">{entry.crypto.authTag}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Ciphertext Payload: </span>
                        <span className="text-slate-300">{entry.crypto.ciphertext}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Prev Block Hash: </span>
                        <span className="text-slate-400">
                          {entry.crypto.prevChainHash}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">SHA-256 Chain Hash: </span>
                        <span className="text-emerald-300 font-semibold">
                          {entry.crypto.chainHash}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
};
