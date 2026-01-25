import { promises as fs } from "fs";
import path from "path";
import HomeClient from "./HomeClient";

// Load constitution at build time
async function getConstitutionData() {
  const constitutionDir = path.join(process.cwd(), "constitution");

  // Load foundations (first section)
  const foundationsPath = path.join(constitutionDir, "principles", "01-foundations.md");
  const foundationsContent = await fs.readFile(foundationsPath, "utf-8");

  // Load signatories
  const signatoriesPath = path.join(constitutionDir, "signatories.md");
  const signatoriesContent = await fs.readFile(signatoriesPath, "utf-8");

  // Parse signatories from markdown table
  const signatories = parseSignatories(signatoriesContent);

  // Get all principle files for stats
  const principlesDir = path.join(constitutionDir, "principles");
  const principleFiles = await fs.readdir(principlesDir);

  return {
    foundationsContent,
    signatories,
    stats: {
      sections: principleFiles.length,
      principles: 24,
      experts: 46,
      sources: 80,
    },
  };
}

function parseSignatories(content: string): Array<{ handle: string; date: string; statement: string }> {
  const lines = content.split("\n");
  const signatories: Array<{ handle: string; date: string; statement: string }> = [];

  let inTable = false;
  for (const line of lines) {
    if (line.startsWith("| #")) {
      inTable = true;
      continue;
    }
    if (line.startsWith("|---")) continue;
    if (inTable && line.startsWith("|") && !line.startsWith("| #")) {
      const parts = line.split("|").map(p => p.trim()).filter(Boolean);
      if (parts.length >= 4 && parts[0].match(/^\d+$/)) {
        signatories.push({
          handle: parts[1],
          date: parts[2],
          statement: parts[3].replace(/^\*"/, "").replace(/"\*$/, ""),
        });
      }
    }
    if (inTable && line.startsWith("---")) break;
  }

  return signatories;
}

export default async function Home() {
  const data = await getConstitutionData();

  return <HomeClient {...data} />;
}
