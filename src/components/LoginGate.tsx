import React, { useRef, useState } from 'react';
import {
  Activity,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';
import { KeystrokeMetrics } from '../types/mirage';
import {
  CORRECT_VAULT_PASSWORD,
  computeCmuBotProbability,
} from '../utils/telemetryEngine';

interface LoginGateProps {
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  keystrokeMetrics: KeystrokeMetrics;
  onUpdateKeystrokes: (metrics: KeystrokeMetrics) => void;
  onSubmitLogin: (e: React.FormEvent) => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({
  username,
  setUsername,
  password,
  setPassword,
  keystrokeMetrics,
  onUpdateKeystrokes,
  onSubmitLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const lastKeyUpTimeRef = useRef<number | null>(null);
  const keyDownTimeMapRef = useRef<Record<string, number>>({});
  const flightTimesRef = useRef<number[]>([]);
  const holdTimesRef = useRef<number[]>([]);

  const isBotSpike =
    keystrokeMetrics.pasteDetected ||
    (keystrokeMetrics.flightTimeMs > 0 && keystrokeMetrics.flightTimeMs < 28) ||
    keystrokeMetrics.cmuBotProbability >= 70;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = performance.now();
    keyDownTimeMapRef.current[e.code] = now;

    let nextFlightAvg = keystrokeMetrics.flightTimeMs;
    if (lastKeyUpTimeRef.current !== null) {
      const flight = Math.max(4, Math.round(now - lastKeyUpTimeRef.current));
      flightTimesRef.current = [...flightTimesRef.current.slice(-8), flight];
      nextFlightAvg = Math.round(
        flightTimesRef.current.reduce((a, b) => a + b, 0) / flightTimesRef.current.length
      );
    } else {
      nextFlightAvg = 128;
    }

    const nextBackspaces =
      e.key === 'Backspace'
        ? keystrokeMetrics.backspaceCount + 1
        : keystrokeMetrics.backspaceCount;

    const nextCount = keystrokeMetrics.keystrokeCount + 1;
    const nextProb = computeCmuBotProbability({
      flightTimeMs: nextFlightAvg,
      holdTimeMs: keystrokeMetrics.holdTimeMs || 84,
      backspaceCount: nextBackspaces,
      pasteDetected: keystrokeMetrics.pasteDetected,
    });

    onUpdateKeystrokes({
      flightTimeMs: nextFlightAvg,
      holdTimeMs: keystrokeMetrics.holdTimeMs || 84,
      backspaceCount: nextBackspaces,
      pasteDetected: keystrokeMetrics.pasteDetected,
      keystrokeCount: nextCount,
      cmuBotProbability: nextProb,
    });
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = performance.now();
    lastKeyUpTimeRef.current = now;
    const downTime = keyDownTimeMapRef.current[e.code];

    let nextHoldAvg = keystrokeMetrics.holdTimeMs || 84;
    if (downTime !== undefined) {
      const hold = Math.max(5, Math.round(now - downTime));
      holdTimesRef.current = [...holdTimesRef.current.slice(-8), hold];
      nextHoldAvg = Math.round(
        holdTimesRef.current.reduce((a, b) => a + b, 0) / holdTimesRef.current.length
      );
    }

    const nextProb = computeCmuBotProbability({
      flightTimeMs: keystrokeMetrics.flightTimeMs || 124,
      holdTimeMs: nextHoldAvg,
      backspaceCount: keystrokeMetrics.backspaceCount,
      pasteDetected: keystrokeMetrics.pasteDetected,
    });

    onUpdateKeystrokes({
      ...keystrokeMetrics,
      holdTimeMs: nextHoldAvg,
      cmuBotProbability: nextProb,
    });
  };

  const handlePaste = () => {
    const nextProb = computeCmuBotProbability({
      flightTimeMs: 9,
      holdTimeMs: 6,
      backspaceCount: keystrokeMetrics.backspaceCount,
      pasteDetected: true,
    });

    onUpdateKeystrokes({
      flightTimeMs: 9,
      holdTimeMs: 6,
      backspaceCount: keystrokeMetrics.backspaceCount,
      pasteDetected: true,
      keystrokeCount: keystrokeMetrics.keystrokeCount + 14,
      cmuBotProbability: nextProb,
    });
  };

  const fillHumanCorrectPassword = () => {
    lastKeyUpTimeRef.current = null;
    flightTimesRef.current = [134, 148, 122, 139];
    holdTimesRef.current = [82, 91, 79, 88];
    setPassword(CORRECT_VAULT_PASSWORD);
    const prob = computeCmuBotProbability({
      flightTimeMs: 136,
      holdTimeMs: 85,
      backspaceCount: 1,
      pasteDetected: false,
    });
    onUpdateKeystrokes({
      flightTimeMs: 136,
      holdTimeMs: 85,
      backspaceCount: 1,
      pasteDetected: false,
      keystrokeCount: 15,
      cmuBotProbability: prob,
    });
  };

  const fillWrongPassword = () => {
    lastKeyUpTimeRef.current = null;
    flightTimesRef.current = [128, 152, 119];
    holdTimesRef.current = [84, 78, 90];
    setPassword('SummerVault2025!');
    const prob = computeCmuBotProbability({
      flightTimeMs: 133,
      holdTimeMs: 84,
      backspaceCount: 2,
      pasteDetected: false,
    });
    onUpdateKeystrokes({
      flightTimeMs: 133,
      holdTimeMs: 84,
      backspaceCount: 2,
      pasteDetected: false,
      keystrokeCount: 16,
      cmuBotProbability: prob,
    });
  };

  const fillBotBurstPassword = () => {
    setPassword('admin123!_hydra_payload_99');
    const prob = computeCmuBotProbability({
      flightTimeMs: 11,
      holdTimeMs: 8,
      backspaceCount: 0,
      pasteDetected: true,
    });
    onUpdateKeystrokes({
      flightTimeMs: 11,
      holdTimeMs: 8,
      backspaceCount: 0,
      pasteDetected: true,
      keystrokeCount: 26,
      cmuBotProbability: prob,
    });
  };

  return (
    <div className="flex flex-col justify-between h-full p-6">
      <div className="max-w-xl mx-auto w-full my-auto space-y-5">
        {/* Enterprise Brand Header */}
        <div className="border border-slate-800 bg-slate-900/70 rounded-xl p-5">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
                  AcmeDrive Enterprise Cloud Vault
                </h2>
                <p className="text-xs text-slate-400">
                  Zero-Lockout Mutual-Auth Gateway · TLS 1.3 Enclave
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-slate-400 tabular-nums">
              <div>NODE: US-EAST-VAULT-01</div>
              <div className="text-emerald-400">GATEWAY: ARMED</div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={onSubmitLogin} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="login-user"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Corporate Identity Email
              </label>
              <input
                id="login-user"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#090d16] border border-slate-800 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="admin@acmedrive.io"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-pass"
                  className="block text-xs font-medium text-slate-300"
                >
                  Vault Master Passphrase
                </label>
                <span className="text-xs text-slate-400 font-mono">
                  Expected Seal: 🦅 Blue Falcon
                </span>
              </div>

              <div className="relative">
                <input
                  id="login-pass"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    const delta = nextVal.length - password.length;
                    setPassword(nextVal);
                    if (delta > 1) {
                      const prob = computeCmuBotProbability({
                        flightTimeMs: 11,
                        holdTimeMs: 7,
                        backspaceCount: keystrokeMetrics.backspaceCount,
                        pasteDetected: true,
                      });
                      onUpdateKeystrokes({
                        flightTimeMs: 11,
                        holdTimeMs: 7,
                        backspaceCount: keystrokeMetrics.backspaceCount,
                        pasteDetected: true,
                        keystrokeCount: nextVal.length,
                        cmuBotProbability: prob,
                      });
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  onPaste={handlePaste}
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-[#090d16] border border-slate-800 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Enter vault passphrase or use quick-fill below..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Password Helper Buttons */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={fillHumanCorrectPassword}
                  className="px-2.5 py-1.5 rounded-md bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/50 text-xs font-medium text-emerald-300 transition-colors whitespace-nowrap"
                >
                  <KeyRound className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  Fill Correct Password: BlueFalcon2026!
                </button>
                <button
                  type="button"
                  onClick={fillWrongPassword}
                  className="px-2.5 py-1.5 rounded-md bg-amber-950/60 hover:bg-amber-900/70 border border-amber-700/50 text-xs font-medium text-amber-300 transition-colors whitespace-nowrap"
                >
                  Fill Wrong Password
                </button>
                <button
                  type="button"
                  onClick={fillBotBurstPassword}
                  className="px-2.5 py-1.5 rounded-md bg-rose-950/60 hover:bg-rose-900/70 border border-rose-700/50 text-xs font-medium text-rose-300 transition-colors whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                  Simulate Fast Paste / Bot Burst
                </button>
              </div>
            </div>

            {/* Interactive Live Keystroke Rhythm Pulse Bar */}
            <div
              className={`p-3.5 rounded-lg border transition-colors ${
                isBotSpike
                  ? 'bg-rose-950/30 border-rose-700/60'
                  : 'bg-emerald-950/20 border-emerald-800/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium flex items-center gap-1.5 text-slate-200">
                  <Activity
                    className={`w-3.5 h-3.5 ${
                      isBotSpike ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  />
                  Live Keystroke Rhythm Pulse Bar
                </span>
                <span
                  className={`font-mono font-semibold tabular-nums ${
                    isBotSpike ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {isBotSpike
                    ? 'BOT / PASTE BURST DETECTED (<28ms)'
                    : 'ORGANIC HUMAN CADENCE'}
                </span>
              </div>

              {/* Visual Rhythm Bar */}
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-150 ${
                    isBotSpike ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.max(
                      12,
                      Math.min(100, keystrokeMetrics.cmuBotProbability)
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-2.5 grid grid-cols-4 gap-2 text-xs font-mono tabular-nums text-slate-400">
                <div>
                  Flight:{' '}
                  <span className="text-slate-200 font-semibold">
                    {keystrokeMetrics.flightTimeMs} ms
                  </span>
                </div>
                <div>
                  Hold:{' '}
                  <span className="text-slate-200 font-semibold">
                    {keystrokeMetrics.holdTimeMs} ms
                  </span>
                </div>
                <div>
                  Backspaces:{' '}
                  <span className="text-slate-200 font-semibold">
                    {keystrokeMetrics.backspaceCount}
                  </span>
                </div>
                <div>
                  Paste Burst:{' '}
                  <span
                    className={
                      keystrokeMetrics.pasteDetected
                        ? 'text-rose-400 font-semibold'
                        : 'text-emerald-400 font-semibold'
                    }
                  >
                    {keystrokeMetrics.pasteDetected ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              Authenticate to Vault
            </button>
          </form>
        </div>

        {/* Deceptive Routing Policy Explainer Card */}
        <div className="border border-slate-800/90 bg-slate-900/40 rounded-xl p-4 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between text-slate-200 font-medium">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Zero-Lockout Deceptive Routing Policy
            </span>
            <span className="font-mono text-emerald-400">HTTP 200 OK ALWAYS</span>
          </div>
          <p className="leading-relaxed">
            <strong className="text-slate-200">Path A (Direct Legit):</strong> Passphrase{' '}
            <code className="text-emerald-300 font-mono">BlueFalcon2026!</code> + Human
            Cadence (<code className="font-mono">cmuBotProbability &lt; 70%</code>) routes
            directly to the <strong className="text-emerald-300">Original Real Website</strong>.
          </p>
          <p className="leading-relaxed">
            <strong className="text-slate-200">Path B (Silent Probation Sandbox):</strong> Any{' '}
            <strong className="text-amber-300">wrong password</strong> OR{' '}
            <strong className="text-rose-300">bot typing/paste burst</strong> returns a
            deceptive <code className="font-mono text-amber-300">HTTP 200 OK</code> and
            silently routes into the{' '}
            <strong className="text-amber-300">Fake Probation Sandbox</strong> to observe
            post-login intent.
          </p>
        </div>
      </div>
    </div>
  );
};
