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
    // Flip the gate once the one-time localStorage seed (an external system)
    // has run — the synchronous state sync is intended here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);
  if (!ready) return null;
  return <>{children}</>;
}
