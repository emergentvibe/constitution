import { promises as fs } from "fs";
import path from "path";
import ConstitutionReader from "@/app/constitution/ConstitutionReader";

async function getConstitutionContent() {
  const constitutionPath = path.join(process.cwd(), "CONSTITUTION.md");
  const content = await fs.readFile(constitutionPath, "utf-8");
  return content;
}

export default async function ConstitutionPage() {
  const content = await getConstitutionContent();
  return <ConstitutionReader content={content} />;
}
