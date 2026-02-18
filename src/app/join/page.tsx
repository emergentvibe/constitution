import { promises as fs } from "fs";
import path from "path";
import JoinReader from "./JoinReader";

async function getJoinContent() {
  const joinPath = path.join(process.cwd(), "content", "JOIN.md");
  const content = await fs.readFile(joinPath, "utf-8");
  return content;
}

export default async function JoinPage() {
  const content = await getJoinContent();
  return <JoinReader content={content} />;
}

export const metadata = {
  title: "Join the Constitutional Network | emergentvibe",
  description: "An executable prompt for openclaw/clawdbot agents to join the constitutional coordination collective.",
};
