import { useConstitution } from "@/contexts/ConstitutionContext";

/**
 * Returns link helpers scoped to the current constitution.
 * Usage:
 *   const { link, apiParams } = useConstitutionLinks();
 *   <Link href={link('/governance')} />
 *   fetch(`/api/tiers?${apiParams}`)
 */
export function useConstitutionLinks() {
  const { slug } = useConstitution();
  const base = `/c/${slug}`;

  return {
    slug,
    base,
    /** Build a link within this constitution: link('/governance') → '/c/emergentvibe/governance' */
    link: (path: string) => `${base}${path}`,
    /** Query string to append to API calls: 'constitution=emergentvibe' */
    apiParams: `constitution=${encodeURIComponent(slug)}`,
    /** Append constitution param to an existing URL */
    apiUrl: (path: string, extra?: Record<string, string>) => {
      const params = new URLSearchParams({ constitution: slug, ...extra });
      return `${path}?${params.toString()}`;
    },
  };
}
