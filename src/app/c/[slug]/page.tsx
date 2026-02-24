import ConstitutionReader from "@/app/constitution/ConstitutionReader";
import { getConstitutionFull } from "@/lib/constitution";
import { notFound } from "next/navigation";

export default async function ConstitutionPage({ params }: { params: { slug: string } }) {
  const constitution = await getConstitutionFull(params.slug);

  if (!constitution || !constitution.content) {
    notFound();
  }

  return (
    <ConstitutionReader
      content={constitution.content}
      version={constitution.version}
      githubUrl={constitution.github_url || undefined}
      signUrl={`/c/${params.slug}/quickstart`}
      joinUrl={`/c/${params.slug}/join`}
      amendUrl={`/c/${params.slug}/governance/new`}
    />
  );
}
