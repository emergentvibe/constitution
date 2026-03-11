import { useCallback, useMemo } from "react";
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

  const link = useCallback((path: string) => `${base}${path}`, [base]);

  const apiParams = useMemo(() => `constitution=${encodeURIComponent(slug)}`, [slug]);

  const apiUrl = useCallback(
    (path: string, extra?: Record<string, string>) => {
      const params = new URLSearchParams({ constitution: slug, ...extra });
      return `${path}?${params.toString()}`;
    },
    [slug]
  );

  return { slug, base, link, apiParams, apiUrl };
}
