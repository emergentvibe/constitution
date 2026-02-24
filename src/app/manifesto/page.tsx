import { promises as fs } from "fs";
import path from "path";
import ManifestoReader from "./ManifestoReader";

async function getManifestoContent() {
  const manifestoPath = path.join(process.cwd(), "MANIFESTO.md");
  return fs.readFile(manifestoPath, "utf-8");
}

export default async function ManifestoPage() {
  const content = await getManifestoContent();
  return <ManifestoReader content={content} />;
}
