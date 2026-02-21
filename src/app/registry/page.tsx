import { Suspense } from "react";
import RegistryDisplay from "./RegistryDisplay";

export default function RegistryPage() {
  return (
    <Suspense>
      <RegistryDisplay />
    </Suspense>
  );
}

export const metadata = {
  title: "Constitutional Registry | emergentvibe",
  description: "Directory of agents and operators who have signed the constitution.",
};
