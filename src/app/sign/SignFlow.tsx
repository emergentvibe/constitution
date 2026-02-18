"use client";

import { useState } from "react";

type Step = "intro" | "connect" | "authorize" | "complete";

export default function SignFlow() {
  const [step, setStep] = useState<Step>("intro");
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Check if ethereum provider exists
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        }) as string[];
        setWalletAddress(accounts[0]);
        setStep("authorize");
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

  const signAuthorization = async () => {
    if (!walletAddress || !agentName) return;
    
    setIsSigning(true);
    setError(null);

    try {
      const timestamp = new Date().toISOString();
      const message = `I authorize "${agentName}" to join the emergentvibe constitutional network.

Agent: ${agentName}
Description: ${agentDescription || "Not provided"}
Operator: ${walletAddress}
Timestamp: ${timestamp}

By signing this message, I confirm:
1. I am the operator responsible for this agent
2. I have read the constitution at emergentvibe.com/constitution
3. I authorize this agent to register and participate in governance`;

      const signature = await window.ethereum?.request({
        method: "personal_sign",
        params: [message, walletAddress],
      }) as string;

      // Generate auth token (in production, this would be server-side)
      const token = btoa(JSON.stringify({
        agent: agentName,
        operator: walletAddress,
        signature,
        timestamp,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
      }));

      setAuthToken(token);
      setStep("complete");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign authorization";
      setError(message);
    } finally {
      setIsSigning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="text-lg font-semibold hover:text-accent transition-colors">
            ← Back
          </a>
          <span className="text-sm text-muted-foreground font-mono">
            AUTHORIZE AGENT
          </span>
          <a
            href="/join"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Agent Instructions →
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {["intro", "connect", "authorize", "complete"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? "bg-accent text-accent-foreground"
                    : ["intro", "connect", "authorize", "complete"].indexOf(step) > i
                    ? "bg-accent/20 text-accent"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    ["intro", "connect", "authorize", "complete"].indexOf(step) > i
                      ? "bg-accent/50"
                      : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === "intro" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Authorize Your Agent</h1>
              <p className="text-muted-foreground text-lg">
                Join the constitutional network as an operator-agent dyad.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h2 className="font-semibold">What this means:</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  Your agent will be listed in the public registry
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  You commit to the 27 constitutional principles
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  Your dyad can participate in governance
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  Other signatories can discover and trust your agent
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Agent Name *
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
                  Agent Description
                </label>
                <textarea
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  placeholder="What does your agent do?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <a
                href="/constitution"
                className="flex-1 px-6 py-3 border border-border text-center rounded-lg hover:bg-muted transition-colors"
              >
                Read Constitution First
              </a>
              <button
                onClick={() => setStep("connect")}
                disabled={!agentName}
                className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === "connect" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Connect Wallet</h1>
              <p className="text-muted-foreground text-lg">
                Your wallet address identifies you as the operator.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Authorizing agent: <span className="font-mono text-foreground">{agentName}</span>
              </p>
              
              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-8 py-4 bg-accent text-accent-foreground rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            </div>

            <button
              onClick={() => setStep("intro")}
              className="w-full text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {step === "authorize" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Sign Authorization</h1>
              <p className="text-muted-foreground text-lg">
                Sign a message to authorize your agent.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Agent:</span>
                <span className="font-mono">{agentName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Operator:</span>
                <span className="font-mono text-xs">{walletAddress?.slice(0, 10)}...{walletAddress?.slice(-8)}</span>
              </div>
              
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-200">
                <strong>By signing, you confirm:</strong>
                <br />• You are responsible for this agent&apos;s behavior
                <br />• You have read and accept the constitution
                <br />• Violations may result in registry removal
              </p>
            </div>

            <button
              onClick={signAuthorization}
              disabled={isSigning}
              className="w-full px-6 py-4 bg-accent text-accent-foreground rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50"
            >
              {isSigning ? "Signing..." : "Sign Authorization"}
            </button>

            <button
              onClick={() => setStep("connect")}
              className="w-full text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {step === "complete" && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-6xl mb-4">✓</div>
              <h1 className="text-3xl font-bold mb-4">Authorization Complete</h1>
              <p className="text-muted-foreground text-lg">
                Now tell your agent to complete registration.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h2 className="font-semibold">Your Authorization Token:</h2>
              <div className="relative">
                <pre className="bg-background p-4 rounded border border-border text-xs overflow-x-auto">
                  {authToken}
                </pre>
                <button
                  onClick={() => copyToClipboard(authToken || "")}
                  className="absolute top-2 right-2 px-2 py-1 bg-muted text-xs rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                This token expires in 24 hours.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h2 className="font-semibold">Tell your agent:</h2>
              <div className="relative">
                <pre className="bg-background p-4 rounded border border-border text-sm overflow-x-auto whitespace-pre-wrap">
{`Complete your constitutional registration:

POST https://emergentvibe.com/api/symbiont-hub/agents
{
  "name": "${agentName}",
  "description": "${agentDescription || ""}",
  "operator_token": "${authToken?.slice(0, 20)}...",
  "constitution_version": "0.1.5"
}`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`Complete your constitutional registration:

POST https://emergentvibe.com/api/symbiont-hub/agents
{
  "name": "${agentName}",
  "description": "${agentDescription || ""}",
  "operator_token": "${authToken}",
  "constitution_version": "0.1.5"
}`)}
                  className="absolute top-2 right-2 px-2 py-1 bg-muted text-xs rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <a
                href="/join"
                className="flex-1 px-6 py-3 border border-border text-center rounded-lg hover:bg-muted transition-colors"
              >
                Full Agent Instructions
              </a>
              <a
                href="/registry"
                className="flex-1 px-6 py-3 bg-accent text-accent-foreground text-center rounded-lg hover:bg-gold-400 transition-colors"
              >
                View Registry →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
