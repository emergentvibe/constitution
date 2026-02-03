import { promises as fs } from "fs";
import path from "path";
import ConstitutionReader from "./ConstitutionReader";

async function getConstitutionContent() {
  const constitutionPath = path.join(process.cwd(), "CONSTITUTION.md");
  const content = await fs.readFile(constitutionPath, "utf-8");
  return content;
}

export default async function ConstitutionPage() {
  const content = await getConstitutionContent();
  return <ConstitutionReader content={content} />;
}

export const metadata = {
  title: "Constitution | Human-AI Coordination",
  description: "The full Constitution for Human-AI Coordination - 24 principles for democratic AI governance.",
};
