'use client';

import { useEffect, useState } from 'react';
import { seedDossierDemo } from '@/lib/dossier/seed';

/**
 * Side-effect component: seeds the demo dossier into localStorage on mount,
 * then renders its children once seeding is done so downstream reads see data.
 */
export default function DossierSeeder({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    seedDossierDemo();
    setReady(true);
  }, []);
  if (!ready) return null;
  return <>{children}</>;
}
