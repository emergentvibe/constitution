import { promises as fs } from "fs";
import path from "path";
import HomeClient from "./HomeClient";

// Load constitution at build time
async function getConstitutionData() {
  // Load the full constitution from root
  const constitutionPath = path.join(process.cwd(), "CONSTITUTION.md");
  const constitutionContent = await fs.readFile(constitutionPath, "utf-8");

  // Load signatories from appendix
  const signatoriesPath = path.join(process.cwd(), "appendix", "signing.md");
  let signatoriesContent = "";
  try {
    signatoriesContent = await fs.readFile(signatoriesPath, "utf-8");
  } catch {
    // Signatories might be in the constitution itself now
  }

  // Parse signatories from constitution or signatories file
  const signatories = parseSignatories(constitutionContent) || parseSignatories(signatoriesContent);

  return {
    constitutionContent,
    signatories,
    stats: {
      sections: 6,
      principles: 24,
      experts: 46,
      sources: 75,
    },
  };
}

function parseSignatories(content: string): Array<{ handle: string; type: string; date: string; statement: string }> {
  const lines = content.split("\n");
  const signatories: Array<{ handle: string; type: string; date: string; statement: string }> = [];

  let inTable = false;
  for (const line of lines) {
    if (line.startsWith("| #")) {
      inTable = true;
      continue;
    }
    if (line.startsWith("|---")) continue;
    if (inTable && line.startsWith("|") && !line.startsWith("| #")) {
      const parts = line.split("|").map(p => p.trim()).filter(Boolean);
      if (parts.length >= 5 && parts[0].match(/^\d+$/)) {
        // New format: # | Identity | Type | Signed | Statement
        signatories.push({
          handle: parts[1],
          type: parts[2],
          date: parts[3],
          statement: parts[4].replace(/^\*"/, "").replace(/"\*$/, ""),
        });
      } else if (parts.length >= 4 && parts[0].match(/^\d+$/)) {
        // Old format: # | Identity | Signed | Statement
        signatories.push({
          handle: parts[1],
          type: "Individual",
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
