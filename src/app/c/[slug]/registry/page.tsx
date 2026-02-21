"use client";

import { Suspense } from "react";
import RegistryScoped from "./RegistryScoped";

export default function RegistryPage() {
  return (
    <Suspense>
      <RegistryScoped />
    </Suspense>
  );
}
