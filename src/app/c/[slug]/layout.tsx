import { notFound } from "next/navigation";
import { getConstitution } from "@/lib/constitution";
import ConstitutionShell from "./ConstitutionShell";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const constitution = await getConstitution(params.slug);
  if (!constitution) return { title: "Not Found" };
  return {
    title: `${constitution.name} | emergentvibe`,
    description: `Governance and registry for ${constitution.name}`,
  };
}

export default async function ConstitutionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const constitution = await getConstitution(params.slug);
  if (!constitution) notFound();

  return (
    <ConstitutionShell constitution={constitution}>
      {children}
    </ConstitutionShell>
  );
}
