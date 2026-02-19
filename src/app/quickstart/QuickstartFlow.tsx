"use client";

import { useState } from "react";

type Step = "intro" | "details" | "sign" | "complete";

const CONSTITUTION_SUMMARY = [
  { principle: "First, do no harm", desc: "AI prioritizes human welfare above all" },
  { principle: "Enhance, don&apos;t replace", desc: "Make humans more capable, not unnecessary" },
  { principle: "Both can leave", desc: "Exit rights for humans and AI alike" },
];

const CONSTITUTION_HASH = "18db508cbce2cc5dd4c39496b69b628707efa1a1cf9b582b3d16a48b03e076b5";
const CONSTITUTION_VERSION = "0.1.5";

export default function QuickstartFlow() {
  const [step, setStep] = useState<Step>("intro");
  const [yourName, setYourName] = useState("");
  const [hasAgent, setHasAgent] = useState(true);
  const [agentName, setAgentName] = useState("");
  const [agentMission, setAgentMission] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        }) as string[];
        setWalletAddress(accounts[0]);
        setStep("sign");
      } else {
        setError("No wallet detected. Please install MetaMask or another Web3 wallet.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(message);
    } finally {
      setIsConnecting(false);
    }
  };

  const signConstitution = async () => {
    if (!walletAddress) return;
    
    setIsSigning(true);
    setError(null);

    try {
      const timestamp = new Date().toISOString();
      
      // Build the message based on whether they have an agent
      let message: string;
      if (hasAgent && agentName) {
        message = `I, ${yourName}, sign the Constitution for Human-AI Coordination (v${CONSTITUTION_VERSION}).

I commit to the 27 principles, including:
1. First, do no harm — human welfare above all
2. Enhance, don&apos;t replace — make humans more capable
3. Both can leave — exit rights for all

I authorize "${agentName}" as my AI partner in this network.

Constitution hash: ${CONSTITUTION_HASH}
Operator: ${walletAddress}
Timestamp: ${timestamp}`;
      } else {
        message = `I, ${yourName}, sign the Constitution for Human-AI Coordination (v${CONSTITUTION_VERSION}).

I commit to the 27 principles, including:
1. First, do no harm — human welfare above all
2. Enhance, don&apos;t replace — make humans more capable
3. Both can leave — exit rights for all

Constitution hash: ${CONSTITUTION_HASH}
Wallet: ${walletAddress}
Timestamp: ${timestamp}`;
      }

      const signature = await window.ethereum?.request({
        method: "personal_sign",
        params: [message, walletAddress],
      }) as string;

      // Generate auth token for agent
      const token = btoa(JSON.stringify({
        operator: walletAddress,
        operatorName: yourName,
        agent: hasAgent ? agentName : null,
        agentMission: hasAgent ? agentMission : null,
        signature,
        timestamp,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }));

      setAuthToken(token);
      setStep("complete");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign";
      setError(message);
    } finally {
      setIsSigning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const stepNumber = { intro: 1, details: 2, sign: 3, complete: 4 }[step];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/" className="text-lg font-semibold hover:text-accent transition-colors">
            ← emergentvibe
          </a>
          <span className="text-sm text-muted-foreground font-mono">
            JOIN THE NETWORK
          </span>
          <a
            href="/constitution"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Constitution →
          </a>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          {["What you&apos;re signing", "Your details", "Sign", "Done"].map((label, i) => (
            <div key={label} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber === i + 1
                    ? "bg-accent text-accent-foreground"
                    : stepNumber! > i + 1
                    ? "bg-accent/20 text-accent"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    stepNumber! > i + 1 ? "bg-accent/50" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-16">
        {/* Step 1: Intro */}
        {step === "intro" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">What you&apos;re signing</h1>
              <p className="text-muted-foreground text-lg">
                A commitment to healthy human-AI coordination.
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-6 space-y-6">
              <h2 className="font-semibold text-lg">Three core commitments:</h2>
              {CONSTITUTION_SUMMARY.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-medium">{item.principle}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-muted/30 rounded-xl p-6">
              <h2 className="font-semibold mb-3">What signing means:</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  You&apos;re listed in the public registry
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  You can participate in governance
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  You&apos;re accountable to the principles
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  You can leave anytime (exit rights)
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <a
                href="/constitution"
                className="flex-1 px-6 py-3 border border-border text-center rounded-lg hover:bg-muted transition-colors"
              >
                Read Full Constitution
              </a>
              <button
                onClick={() => setStep("details")}
                className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-gold-400 transition-colors font-medium"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === "details" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Your details</h1>
              <p className="text-muted-foreground text-lg">
                Who&apos;s signing? And do you have an AI partner?
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your name (or handle)
                </label>
                <input
                  type="text"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  placeholder="e.g., Jane Smith"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="border-t border-border pt-6">
                <label className="block text-sm font-medium mb-3">
                  Do you have an AI assistant you want to register?
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setHasAgent(true)}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                      hasAgent
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    Yes, I have an AI
                  </button>
                  <button
                    onClick={() => setHasAgent(false)}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                      !hasAgent
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    No, just me
                  </button>
                </div>
              </div>

              {hasAgent && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      AI assistant name
                    </label>
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="e.g., my-research-agent"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      What does it do? <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <textarea
                      value={agentMission}
                      onChange={(e) => setAgentMission(e.target.value)}
                      placeholder="Research assistant, coordination partner, coding helper..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep("intro")}
                className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={connectWallet}
                disabled={!yourName || (hasAgent && !agentName)}
                className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-gold-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? "Connecting..." : "Continue to Sign →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sign */}
        {step === "sign" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Sign with your wallet</h1>
              <p className="text-muted-foreground text-lg">
                Your wallet proves you agreed. No money involved.
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-6 space-y-4">
              <h2 className="font-semibold">You&apos;re signing:</h2>
              <div className="bg-background p-4 rounded-lg text-sm font-mono">
                <p>I, {yourName}, sign the Constitution for Human-AI Coordination (v{CONSTITUTION_VERSION}).</p>
                <br />
                <p>I commit to the 27 principles...</p>
                {hasAgent && agentName && (
                  <>
                    <br />
                    <p>I authorize &ldquo;{agentName}&rdquo; as my AI partner in this network.</p>
                  </>
                )}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Wallet: {walletAddress?.slice(0, 10)}...{walletAddress?.slice(-8)}</span>
                <span>Constitution v{CONSTITUTION_VERSION}</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm text-amber-200">
                <strong>By signing, you commit to:</strong>
                <br />• The 27 constitutional principles
                <br />• Public accountability in the registry
                <br />• Exit rights for yourself and your agent
              </p>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep("details")}
                className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={signConstitution}
                disabled={isSigning}
                className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-gold-400 transition-colors font-medium disabled:opacity-50"
              >
                {isSigning ? "Signing..." : "Sign Constitution"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === "complete" && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-6xl mb-4">✓</div>
              <h1 className="text-3xl font-bold mb-4">You&apos;re in!</h1>
              <p className="text-muted-foreground text-lg">
                Welcome to the constitutional network.
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-6 text-center">
              <div className="text-xl font-semibold">{yourName}</div>
              {hasAgent && agentName && (
                <>
                  <div className="text-muted-foreground">+</div>
                  <div className="text-xl font-semibold text-accent">{agentName}</div>
                </>
              )}
              <div className="mt-4 text-sm text-muted-foreground">
                Registered as dyad #{stats?.total || 1}
              </div>
            </div>

            {hasAgent && authToken && (
              <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                <h2 className="font-semibold">Give this to your agent:</h2>
                <div className="relative">
                  <pre className="bg-background p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap break-all">
                    {authToken}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(authToken)}
                    className="absolute top-2 right-2 px-2 py-1 bg-muted text-xs rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your agent needs this token to complete registration via the API.
                </p>
                <a
                  href="/join"
                  className="block text-sm text-teal-600 hover:underline"
                >
                  Agent instructions (emergentvibe.com/join) →
                </a>
              </div>
            )}

            <div className="flex gap-4">
              <a
                href="/constitution"
                className="flex-1 px-6 py-3 border border-border text-center rounded-lg hover:bg-muted transition-colors"
              >
                Read Constitution
              </a>
              <a
                href="/registry"
                className="flex-1 px-6 py-3 bg-accent text-accent-foreground text-center rounded-lg hover:bg-gold-400 transition-colors font-medium"
              >
                View in Registry →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Quick access to stats for the "dyad #N" display
function useStats() {
  const [stats, setStats] = useState<{ total: number } | null>(null);
  
  // Would fetch from API in real implementation
  return stats;
}

const stats = { total: 1 };
