import { promises as fs } from "fs";
import path from "path";
import JoinReader from "@/app/join/JoinReader";

async function getJoinContent() {
  const joinPath = path.join(process.cwd(), "content", "JOIN.md");
  const content = await fs.readFile(joinPath, "utf-8");
  return content;
}

export default async function JoinPageScoped({ params }: { params: { slug: string } }) {
  const content = await getJoinContent();
  return (
    <JoinReader
      content={content}
      backUrl={`/c/${params.slug}`}
      authorizeUrl={`/c/${params.slug}/quickstart`}
      constitutionUrl={`/c/${params.slug}`}
    />
  );
}
