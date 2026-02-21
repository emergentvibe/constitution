"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function CreateConstitutionPage() {
  const router = useRouter();
  const { walletAddress, connect, connecting } = useAuth();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [version, setVersion] = useState("0.1.0");
  const [content, setContent] = useState("");
  const [snapshotSpace, setSnapshotSpace] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!walletAddress) {
      await connect();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Sign a message to prove wallet ownership
      const timestamp = new Date().toISOString();
      const message = `I am creating the constitution "${name}" (${slug}) on the emergentvibe network.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;

      const signature = (await window.ethereum?.request({
        method: "personal_sign",
        params: [message, walletAddress],
      })) as string;

      const res = await fetch("/api/constitutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          tagline: tagline || undefined,
          version,
          content,
          snapshot_space: snapshotSpace || undefined,
          github_url: githubUrl || undefined,
          wallet_address: walletAddress,
          signature,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create constitution");
      }

      router.push(`/c/${data.constitution.slug}`);
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Signature rejected");
      } else {
        setError(err.message || "Failed to create constitution");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Start a Constitution</h1>
          <p className="text-muted-foreground">
            Create a new sovereign collective with its own principles, members, and governance.
          </p>
        </div>

        {!walletAddress && (
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 mb-8">
            <p className="text-amber-400 mb-2">Connect your wallet to create a constitution</p>
            <button onClick={connect} disabled={connecting}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors disabled:opacity-50">
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">Name *</label>
            <input id="name" type="text" value={name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Cooperative Intelligence Network" required minLength={3} maxLength={100}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent" />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2">URL Slug *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/c/</span>
              <input id="slug" type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="my-constitution" required minLength={2} maxLength={50} pattern="[a-z0-9-]+"
                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent font-mono" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lowercase letters, numbers, and hyphens only</p>
          </div>

          <div>
            <label htmlFor="tagline" className="block text-sm font-medium mb-2">Tagline (optional)</label>
            <input id="tagline" type="text" value={tagline} onChange={(e) => setTagline(e.target.value)}
              placeholder="A short description of your collective" maxLength={200}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent" />
          </div>

          <div>
            <label htmlFor="version" className="block text-sm font-medium mb-2">Version *</label>
            <input id="version" type="text" value={version} onChange={(e) => setVersion(e.target.value)}
              placeholder="0.1.0" required
              className="w-full px-4 py-3 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent font-mono" />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">Constitution Content * (Markdown)</label>
            <p className="text-xs text-muted-foreground mb-2">Write your principles, rules, and governance structure.</p>
            <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="# My Constitution&#10;&#10;## Principles&#10;&#10;1. ..." required minLength={100} rows={12}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent resize-y font-mono text-sm" />
            <div className="text-xs text-muted-foreground mt-1">{content.length} characters</div>
          </div>

          <div>
            <label htmlFor="snapshot" className="block text-sm font-medium mb-2">Snapshot Space (optional)</label>
            <input id="snapshot" type="text" value={snapshotSpace} onChange={(e) => setSnapshotSpace(e.target.value)}
              placeholder="e.g., my-org.eth"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent font-mono" />
            <p className="text-xs text-muted-foreground mt-1">For gasless governance voting via Snapshot.org</p>
          </div>

          <div>
            <label htmlFor="github" className="block text-sm font-medium mb-2">GitHub URL (optional)</label>
            <input id="github" type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/your-org/your-constitution"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-accent" />
          </div>

          {error && <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 text-red-400">{error}</div>}

          <div className="flex gap-4 pt-4">
            <Link href="/" className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors">Cancel</Link>
            <button type="submit" disabled={submitting || !walletAddress}
              className="flex-1 bg-accent hover:bg-gold-400 disabled:bg-muted disabled:text-muted-foreground text-accent-foreground px-6 py-3 rounded-lg font-medium transition-colors">
              {submitting ? "Creating..." : "Create Constitution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
