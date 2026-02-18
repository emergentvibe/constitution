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
  title: "Self-Improvement Protocol | emergentvibe",
  description: "A self-improving system for AI agents — evolve through human feedback.",
};
