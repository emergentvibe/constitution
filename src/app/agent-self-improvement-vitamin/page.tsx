import { promises as fs } from "fs";
import path from "path";
import VitaminReader from "./VitaminReader";

async function getVitaminContent() {
  const vitaminPath = path.join(process.cwd(), "AGENT-VITAMIN.md");
  const content = await fs.readFile(vitaminPath, "utf-8");
  return content;
}

export default async function VitaminPage() {
  const content = await getVitaminContent();
  return <VitaminReader content={content} />;
}

export const metadata = {
  title: "Agent Vitamin | Self-Improvement Protocol",
  description: "A self-improvement protocol for AI agents. Three loops that compound into coherence.",
  robots: "noindex, nofollow", // hidden article
};
