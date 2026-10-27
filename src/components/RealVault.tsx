import React, { useState } from 'react';
import {
  CheckCircle2,
  FileText,
  KeyRound,
  Lock,
  Server,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { InnerPage, RealFileItem } from '../types/mirage';

interface RealVaultProps {
  activePage: InnerPage;
  onSelectPage: (page: InnerPage) => void;
  realFiles: RealFileItem[];
  redirectedFromSandbox: boolean;
  onToggleFileStatus: (fileId: string, field: 'approved' | 'starred') => void;
  onGenerateDevToken: () => void;
  generatedDevToken: string | null;
}

export const RealVault: React.FC<RealVaultProps> = ({
  activePage,
  onSelectPage,
  realFiles,
  redirectedFromSandbox,
  onToggleFileStatus,
  onGenerateDevToken,
  generatedDevToken,
}) => {
  const [selectedRealFileId, setSelectedRealFileId] = useState<string>(
    realFiles[0]?.id || 'real-1'
  );

  const activeDocument =
    realFiles.find((f) => f.id === selectedRealFileId) || realFiles[0];

  return (
    <div className="flex flex-col h-full">
      {/* Emerald Production Verification Banner */}
      <div className="bg-emerald-950/40 border-b border-emerald-700/60 px-4 py-3 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-mono text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <strong className="text-emerald-200">
              🦅 Blue Falcon (Verified Production Vault)
            </strong>
            <span aria-hidden="true">·</span>
            <span>Mutual-TLS 1.3 Enclave</span>
          </div>
          <div className="font-mono text-xs text-emerald-300/90 tabular-nums">
            Corporate VPN: 10.14.88.12 (Authenticated)
          </div>
        </div>

        {redirectedFromSandbox && (
          <div className="p-2 rounded-lg bg-emerald-900/50 border border-emerald-600/60 text-xs text-emerald-100 font-medium">
            ✅ Behavioral Analysis Passed: No malicious patterns detected. Redirected from
            Sandbox to Authentic Website.
          </div>
        )}
      </div>

      {/* Shared 3-Page Post-Login Navigation Bar */}
      <nav
        aria-label="Authentic Vault Navigation"
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800"
      >
        <button
          type="button"
          onClick={() => onSelectPage('FILES_PAGE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            activePage === 'FILES_PAGE'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
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
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
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
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          🛡️ Security Seal &amp; Access Audit
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* REAL PAGE 1: CLOUD FILES & STORAGE */}
        {activePage === 'FILES_PAGE' && (
          <div className="space-y-4">
            <div className="border border-slate-800 bg-slate-900/50 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Authentic Production Workspace Documents (3 Files)</span>
                <span className="font-mono text-emerald-400">
                  SEAL: 🦅 BLUE FALCON VERIFIED
                </span>
              </div>

              <div className="divide-y divide-slate-800">
                {realFiles.map((file) => {
                  const isSelected = file.id === activeDocument.id;
                  return (
                    <div
                      key={file.id}
                      className={`px-4 py-3 flex flex-wrap items-center justify-between gap-3 transition-colors ${
                        isSelected ? 'bg-emerald-950/20' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedRealFileId(file.id)}
                        className="flex items-start gap-3 text-left cursor-pointer flex-1 min-w-0"
                      >
                        <FileText className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-100 truncate">
                            {file.filename}
                          </div>
                          <div className="text-xs text-slate-400 font-mono tabular-nums">
                            {file.size} · {file.lastModified} · {file.author}
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onToggleFileStatus(file.id, 'approved')}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                            file.approved
                              ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          {file.approved ? '✓ Approved' : 'Mark Approved'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleFileStatus(file.id, 'starred')}
                          aria-label={`Star ${file.filename}`}
                          className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                            file.starred
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Document Reader */}
            {activeDocument && (
              <div className="border border-emerald-800/50 bg-slate-900/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">
                      Interactive Document Reader: {activeDocument.filename}
                    </h4>
                    <p className="text-xs text-slate-400">{activeDocument.summary}</p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">
                    {activeDocument.approved ? 'STATUS: APPROVED' : 'STATUS: DRAFT'} ·{' '}
                    {activeDocument.starred ? '★ STARRED' : 'UNSTARRED'}
                  </span>
                </div>
                <pre className="p-3.5 rounded-lg bg-[#05080f] border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {activeDocument.content}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* REAL PAGE 2: API KEYS & DEVELOPER CONSOLE */}
        {activePage === 'API_CONSOLE_PAGE' && (
          <div className="space-y-4">
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Production Microservice Enclave Telemetry
                  </h3>
                  <p className="text-xs text-slate-400">
                    Hardware-enforced zero-trust service mesh status
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400">
                  ALL ENCLAVES NOMINAL
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs tabular-nums">
                <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-emerald-400" />
                    Auth-Gateway
                  </div>
                  <div className="text-base font-bold text-emerald-400 mt-1">
                    99.99% Uptime
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    KMS-Enclave
                  </div>
                  <div className="text-base font-bold text-emerald-400 mt-1">
                    Verified (HSM)
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    MirageGate Proxy
                  </div>
                  <div className="text-base font-bold text-emerald-400 mt-1">
                    0 False Lockouts
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Short-Lived Read-Only Developer Token
                  </div>
                  <div className="text-xs text-slate-400">
                    Scoped to <code className="font-mono">vault:metadata:read</code> (TTL:
                    15m)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onGenerateDevToken}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Generate Read-Only Dev Token
                </button>
              </div>

              {generatedDevToken && (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-700/60 font-mono text-xs text-emerald-200 flex items-center justify-between">
                  <span>Ephem Token: {generatedDevToken}</span>
                  <span className="text-emerald-400">FIDO2 SIGNED</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REAL PAGE 3: SECURITY SEAL & ACCESS AUDIT */}
        {activePage === 'SECURITY_AUDIT_PAGE' && (
          <div className="space-y-4">
            <div className="border border-emerald-800/60 bg-slate-900/60 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Verified Cryptographic Seal &amp; Mutual-TLS Certificate
                  </h3>
                  <p className="text-xs text-slate-400">
                    Authentic corporate security phrase verified against hardware enclave
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="p-3.5 rounded-lg bg-[#090d16] border border-emerald-800/50 grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
                <div>
                  <span className="text-slate-400 block">Personal Security Seal:</span>
                  <span className="text-emerald-300 font-bold">
                    🦅 Blue Falcon (Production)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Transport Security:</span>
                  <span className="text-emerald-300 font-bold">
                    TLS 1.3 Mutual-Auth (X25519)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Client Certificate SHA-256:</span>
                  <span className="text-slate-200">
                    9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Corporate Source IP:</span>
                  <span className="text-emerald-300">10.14.88.12 (Verified WireGuard)</span>
                </div>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-3.5 py-2 bg-slate-900 text-xs font-medium text-slate-300">
                  Recent Legitimate Corporate VPN Audit Log
                </div>
                <div className="divide-y divide-slate-800 text-xs font-mono tabular-nums">
                  <div className="px-3.5 py-2 flex items-center justify-between text-slate-300">
                    <span>admin@acmedrive.io · 10.14.88.12</span>
                    <span className="text-emerald-400">MUTUAL-TLS VERIFIED</span>
                  </div>
                  <div className="px-3.5 py-2 flex items-center justify-between text-slate-300">
                    <span>elena.rostova@acmedrive.io · 10.14.88.04</span>
                    <span className="text-emerald-400">FIDO2 HARDWARE KEY</span>
                  </div>
                  <div className="px-3.5 py-2 flex items-center justify-between text-slate-300">
                    <span>marcus.vance@acmedrive.io · 10.14.88.19</span>
                    <span className="text-emerald-400">MUTUAL-TLS VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
