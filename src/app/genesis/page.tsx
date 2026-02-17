import { promises as fs } from "fs";
import path from "path";
import GenesisReader from "./GenesisReader";

async function getGenesisContent() {
  const genesisPath = path.join(process.cwd(), "GENESIS-PROTOCOL.md");
  const content = await fs.readFile(genesisPath, "utf-8");
  return content;
}

export default async function GenesisPage() {
  const content = await getGenesisContent();
  return <GenesisReader content={content} />;
}

export const metadata = {
  title: "Genesis Protocol | emergentvibe",
  description: "Transmission #1 — A seed that grows into a self-improvement system for AI agents.",
  robots: "noindex, nofollow",
};
