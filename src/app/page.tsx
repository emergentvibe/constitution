import { promises as fs } from "fs";
import path from "path";
import HomeClient from "./HomeClient";

// Load constitution at build time
async function getConstitutionData() {
  // Load the full constitution from root
  const constitutionPath = path.join(process.cwd(), "CONSTITUTION.md");
  const constitutionContent = await fs.readFile(constitutionPath, "utf-8");

  // Extract teaser: Preamble + Scope and Status sections
  const teaserContent = extractTeaser(constitutionContent);

  // Parse signatories from constitution
  const signatories = parseSignatories(constitutionContent);

  return {
    teaserContent,
    signatories,
    stats: {
      sections: 6,
      principles: 24,
      sources: 75,
    },
  };
}

function extractTeaser(content: string): string {
  // Find the start of Preamble and end of Scope and Status
  const lines = content.split("\n");
  const teaserLines: string[] = [];
  
  let capturing = false;
  let foundScopeEnd = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Start capturing at Preamble
    if (line.startsWith("## Preamble")) {
      capturing = true;
    }
    
    // Stop capturing at I. Foundations (the next major section after Scope)
    if (line.startsWith("## I. Foundations")) {
      foundScopeEnd = true;
      break;
    }
    
    if (capturing) {
      teaserLines.push(line);
    }
  }
  
  // Remove the title line if present at start
  let teaser = teaserLines.join("\n");
  
  // Add a note that this is a teaser
  teaser += "\n\n---\n\n*This is the beginning of the constitution. Continue reading for the full 24 principles across 6 sections.*";
  
  return teaser;
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
